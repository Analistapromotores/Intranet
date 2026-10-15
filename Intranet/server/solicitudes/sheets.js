/* Registro de solicitudes en una hoja de Google Sheets (en lugar del correo).
   Usa la misma cuenta de servicio que Gmail (GOOGLE_SERVICE_ACCOUNT_JSON), pero sin delegación en el dominio:
   basta con compartir la hoja con el correo de la cuenta de servicio como «Editor».

   Configuración (variables de entorno, solo en el servidor):
   - GOOGLE_SERVICE_ACCOUNT_JSON  el JSON de la cuenta de servicio (texto completo o en base64).
   - SHEET_ID                     el identificador de la hoja: lo que va entre /d/ y /edit en su dirección.

   Cada tipo de solicitud tiene su propia pestaña (se crea sola con sus encabezados). Los valores se escriben
   como texto (RAW), así que nada de lo que escriba un solicitante se interpreta como fórmula. */
import crypto from 'node:crypto'

const API = process.env.SHEETS_API_URL || 'https://sheets.googleapis.com/v4/spreadsheets'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const b64u = (v) => Buffer.from(v).toString('base64url')

function leerCuenta() {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!bruto) return null
  try {
    const c = JSON.parse(bruto.trim().startsWith('{') ? bruto : Buffer.from(bruto, 'base64').toString('utf8'))
    return c.client_email && c.private_key ? { email: c.client_email, clave: c.private_key } : null
  } catch {
    return null
  }
}
const cuenta = leerCuenta()
const hojaId = String(process.env.SHEET_ID || '').trim().replace(/^.*\/d\//, '').replace(/\/.*$/, '')
export const hojaActiva = Boolean(cuenta && hojaId)
export const correoCuentaHoja = cuenta?.email || ''

let token = { valor: '', vence: 0 }
async function accessToken() {
  if (token.valor && Date.now() < token.vence - 60_000) return token.valor
  const ahora = Math.floor(Date.now() / 1000)
  const cabecera = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const cuerpo = b64u(JSON.stringify({ iss: cuenta.email, scope: SCOPE, aud: TOKEN_URL, iat: ahora, exp: ahora + 3600 }))
  const firma = crypto.createSign('RSA-SHA256').update(`${cabecera}.${cuerpo}`).sign(cuenta.clave).toString('base64url')
  const r = await fetch(process.env.SHEETS_TOKEN_URL || TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${cabecera}.${cuerpo}.${firma}` }),
    signal: AbortSignal.timeout(15_000),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok || !d.access_token) {
    console.error(`[hoja] token: ${d.error || r.status} ${d.error_description || ''}`)
    throw new Error(`No se pudo autenticar con Google (${d.error || r.status}).`)
  }
  token = { valor: d.access_token, vence: Date.now() + (d.expires_in || 3600) * 1000 }
  return token.valor
}

async function llamar(ruta, { method = 'GET', cuerpo } = {}) {
  const t = await accessToken()
  const r = await fetch(`${API}/${hojaId}${ruta}`, {
    method,
    headers: { Authorization: `Bearer ${t}`, ...(cuerpo ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    signal: AbortSignal.timeout(20_000),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) {
    if (r.status === 401) token = { valor: '', vence: 0 }
    console.error(`[hoja] ${method} ${ruta.split('?')[0]}: ${r.status} ${d.error?.message || ''}`)
    const e = new Error(
      r.status === 403 || r.status === 404
        ? `La hoja no está disponible: compártela como «Editor» con ${cuenta.email} y revisa SHEET_ID.`
        : `Google Sheets rechazó la operación (${d.error?.status || r.status}).`,
    )
    throw e
  }
  return d
}

/* Un solo escritor a la vez dentro de este proceso: evita crear dos veces la misma pestaña. */
let cola = Promise.resolve()
const enCola = (fn) => {
  const run = cola.then(fn)
  cola = run.catch(() => {})
  return run
}

const rango = (pestana, celdas) => encodeURIComponent(`'${pestana.replace(/'/g, "''")}'!${celdas}`)
const letra = (n) => { let s = ''; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s }
const existentes = new Set()

async function asegurarPestana(pestana, encabezados) {
  if (existentes.has(pestana)) return
  const { sheets = [] } = await llamar('?fields=sheets.properties.title')
  if (!sheets.some((s) => s.properties.title === pestana)) {
    await llamar(':batchUpdate', { method: 'POST', cuerpo: { requests: [{ addSheet: { properties: { title: pestana, gridProperties: { frozenRowCount: 1 } } } }] } })
    await llamar(`/values/${rango(pestana, `A1:${letra(encabezados.length - 1)}1`)}?valueInputOption=RAW`, { method: 'PUT', cuerpo: { values: [encabezados] } })
  }
  existentes.add(pestana)
}

/* Escribe la fila de la solicitud. Si el número ya está en la columna A (reenvío) la reemplaza; si no, la agrega.
   `encabezados` y `fila` son listas de texto; la primera columna es siempre el número de solicitud. */
export function registrarFila(pestana, encabezados, fila) {
  return enCola(async () => {
    await asegurarPestana(pestana, encabezados)
    const valores = [fila.map((v) => String(v ?? ''))]
    const { values = [] } = await llamar(`/values/${rango(pestana, 'A:A')}`)
    const i = values.findIndex((f) => f[0] === valores[0][0])
    if (i > 0) {
      await llamar(`/values/${rango(pestana, `A${i + 1}:${letra(fila.length - 1)}${i + 1}`)}?valueInputOption=RAW`, { method: 'PUT', cuerpo: { values: valores } })
      return { fila: i + 1, accion: 'actualizada' }
    }
    await llamar(`/values/${rango(pestana, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', cuerpo: { values: valores } })
    return { accion: 'agregada' }
  })
}

/* Cambia una celda de la fila de una solicitud (por ejemplo el estado). No falla si la fila no existe. */
export function actualizarCelda(pestana, numero, columna, valor) {
  return enCola(async () => {
    const { values = [] } = await llamar(`/values/${rango(pestana, 'A:A')}`)
    const i = values.findIndex((f) => f[0] === numero)
    if (i < 1) return false
    await llamar(`/values/${rango(pestana, `${letra(columna)}${i + 1}`)}?valueInputOption=RAW`, { method: 'PUT', cuerpo: { values: [[String(valor ?? '')]] } })
    return true
  })
}
