/* Copia los datos locales (carpeta data/) a la base PostgreSQL.
   Uso:  DATABASE_URL=postgres://... node scripts/migrar-a-postgres.mjs [carpeta-de-datos]
   No borra nada: las colecciones y archivos con el mismo nombre se sobrescriben. */
import fs from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Define DATABASE_URL (la cadena de conexión de PostgreSQL).')
  process.exit(1)
}
const origen = path.resolve(process.argv[2] || 'data')
const pool = new pg.Pool({ connectionString: url, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined })

await pool.query(`
  CREATE TABLE IF NOT EXISTS kv (name text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
  CREATE TABLE IF NOT EXISTS blobs (name text PRIMARY KEY, mime text NOT NULL DEFAULT 'application/octet-stream', data bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now());`)

const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.eml': 'message/rfc822' }
let colecciones = 0
let archivos = 0

for (const f of await fs.readdir(origen, { withFileTypes: true })) {
  if (f.isFile() && f.name.endsWith('.json')) {
    const datos = JSON.parse(await fs.readFile(path.join(origen, f.name), 'utf8'))
    await pool.query('INSERT INTO kv (name, data) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()', [f.name, JSON.stringify(datos)])
    colecciones++
    console.log('colección', f.name)
  }
}
/* Carpetas con archivos binarios: uploads, solicitudes (xlsx) y outbox (eml). */
for (const dir of ['uploads', 'solicitudes', 'outbox']) {
  const ruta = path.join(origen, dir)
  const lista = await fs.readdir(ruta).catch(() => [])
  for (const nombre of lista) {
    const ext = path.extname(nombre).toLowerCase()
    if (!MIME[ext]) continue
    await pool.query(
      'INSERT INTO blobs (name, mime, data) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data',
      [`${dir}/${nombre}`, MIME[ext], await fs.readFile(path.join(ruta, nombre))],
    )
    archivos++
  }
}
console.log(`Listo: ${colecciones} colecciones y ${archivos} archivos copiados a PostgreSQL.`)
await pool.end()
