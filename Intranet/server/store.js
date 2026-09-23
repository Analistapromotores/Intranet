/* Almacenamiento en archivos JSON con escritura atómica y en serie.
   Suficiente para el volumen de la intranet; si crece, este módulo es el único que cambia por una base de datos. */
import fs from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config.js'

mkdirSync(DATA_DIR, { recursive: true })

export const dataPath = (...parts) => path.join(DATA_DIR, ...parts)

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

let queue = Promise.resolve()
export function writeJson(file, data) {
  queue = queue.then(async () => {
    const tmp = `${file}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(data, null, 2))
    await fs.rename(tmp, file)
  })
  return queue
}

/* Lee, modifica y guarda dentro de la misma cola para evitar escrituras cruzadas. */
export function update(file, fallback, fn) {
  const run = queue.then(async () => {
    const data = await readJson(file, fallback)
    const result = await fn(data)
    const tmp = `${file}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(data, null, 2))
    await fs.rename(tmp, file)
    return result
  })
  queue = run.catch(() => {})
  return run
}
