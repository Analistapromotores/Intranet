/* Almacenamiento de la intranet.

   Dos respaldos con la misma interfaz:
   - PostgreSQL cuando existe DATABASE_URL (producción). Los datos sobreviven a los despliegues y
     varias instancias pueden escribir a la vez, porque cada modificación va en una transacción
     con bloqueo de fila.
   - Archivos en DATA_DIR cuando no hay DATABASE_URL (desarrollo local, sin instalar nada).

   Qué se guarda:
   - Colecciones JSON (usuarios, personas, noticias, solicitudes…): tabla `kv`, una fila por colección.
   - Archivos binarios (fotos, imágenes de noticias, Excel generados, correos simulados): tabla `blobs`.

   La colección se identifica por el nombre del archivo (`people.json`), de modo que el resto del
   servidor no cambia entre un respaldo y otro. */
import fs from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import { DATA_DIR } from './config.js'

export const dataPath = (...parts) => path.join(DATA_DIR, ...parts)
export const usaPostgres = Boolean(process.env.DATABASE_URL)

const nombre = (file) => path.basename(file)
const clon = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

/* ---------- PostgreSQL ---------- */
let pool = null
if (usaPostgres) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  })
  /* Un error en una conexión ociosa no debe tumbar el proceso. */
  pool.on('error', (e) => console.error('[db] conexión ociosa:', e.message))

  const intentos = 10
  for (let i = 1; ; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS kv (
          name text PRIMARY KEY,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS blobs (
          name text PRIMARY KEY,
          mime text NOT NULL DEFAULT 'application/octet-stream',
          data bytea NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        );`)
      break
    } catch (e) {
      if (i === intentos) throw e
      console.warn(`[db] esperando a PostgreSQL (${i}/${intentos}): ${e.message}`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  console.log('[db] PostgreSQL listo')
} else {
  mkdirSync(DATA_DIR, { recursive: true })
}

export async function dbListo() {
  if (!pool) return true
  await pool.query('SELECT 1')
  return true
}

/* ---------- Colecciones JSON ---------- */
let cola = Promise.resolve() // solo para el respaldo en archivos

export async function readJson(file, fallback) {
  if (pool) {
    const { rows } = await pool.query('SELECT data FROM kv WHERE name = $1', [nombre(file)])
    return rows.length ? rows[0].data : fallback
  }
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function escribirArchivo(file, data) {
  const tmp = `${file}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2))
  await fs.rename(tmp, file)
}

export function writeJson(file, data) {
  if (pool) {
    return pool.query(
      `INSERT INTO kv (name, data) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [nombre(file), JSON.stringify(data)],
    )
  }
  cola = cola.then(() => escribirArchivo(file, data))
  return cola
}

/* Lee, modifica y guarda como una sola operación: nadie más escribe esa colección mientras tanto. */
export function update(file, fallback, fn) {
  if (pool) return actualizarPg(nombre(file), fallback, fn)
  const run = cola.then(async () => {
    const data = await readJson(file, fallback)
    const result = await fn(data)
    await escribirArchivo(file, data)
    return result
  })
  cola = run.catch(() => {})
  return run
}

async function actualizarPg(name, fallback, fn) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    /* Si la colección aún no existe se crea con el valor inicial; luego se bloquea su fila. */
    await cliente.query('INSERT INTO kv (name, data) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [name, JSON.stringify(clon(fallback))])
    const { rows } = await cliente.query('SELECT data FROM kv WHERE name = $1 FOR UPDATE', [name])
    const data = rows[0].data
    const result = await fn(data)
    await cliente.query('UPDATE kv SET data = $2, updated_at = now() WHERE name = $1', [name, JSON.stringify(data)])
    await cliente.query('COMMIT')
    return result
  } catch (e) {
    await cliente.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    cliente.release()
  }
}

/* ---------- Archivos binarios ---------- */
const rutaBlob = (name) => path.join(DATA_DIR, 'blobs', ...String(name).split('/').map((p) => path.basename(p)))

export async function saveBlob(name, buffer, mime = 'application/octet-stream') {
  if (pool) {
    await pool.query(
      `INSERT INTO blobs (name, mime, data) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data`,
      [name, mime, buffer],
    )
    return
  }
  const destino = rutaBlob(name)
  await fs.mkdir(path.dirname(destino), { recursive: true })
  await fs.writeFile(destino, buffer)
}

/* Devuelve { data, mime } o null si no existe. */
export async function readBlob(name) {
  if (pool) {
    const { rows } = await pool.query('SELECT data, mime FROM blobs WHERE name = $1', [name])
    return rows.length ? { data: rows[0].data, mime: rows[0].mime } : null
  }
  try {
    return { data: await fs.readFile(rutaBlob(name)), mime: null }
  } catch {
    return null
  }
}

export async function deleteBlob(name) {
  if (pool) {
    await pool.query('DELETE FROM blobs WHERE name = $1', [name])
    return
  }
  await fs.rm(rutaBlob(name), { force: true })
}
