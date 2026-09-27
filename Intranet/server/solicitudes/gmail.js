/* Envío por la API de Gmail con una cuenta de servicio de Google (delegación de todo el dominio).
   Va por HTTPS (443), así que funciona aunque el hosting bloquee los puertos SMTP, y no necesita librerías extra.

   Configuración (variables de entorno, solo en el servidor):
   - GOOGLE_SERVICE_ACCOUNT_JSON  el JSON de la cuenta de servicio (texto completo).
   - GMAIL_SENDER                 buzón de Workspace en cuyo nombre se envía (debe estar autorizado en la delegación). */
import crypto from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const SCOPE = 'https://www.googleapis.com/auth/gmail.send'

const b64u = (v) => Buffer.from(v).toString('base64url')

/* Lee la cuenta de servicio una sola vez; nunca se registra en logs ni se devuelve por la API. */
function leerCuenta() {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!bruto) return null
  try {
    const c = JSON.parse(bruto.trim().startsWith('{') ? bruto : Buffer.from(bruto, 'base64').toString('utf8'))
    return c.client_email && c.private_key ? { email: c.client_email, clave: c.private_key } : null
  } catch {
    console.error('[gmail] GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON válido.')
    return null
  }
}

const cuenta = leerCuenta()
export const gmailRemitente = process.env.GMAIL_SENDER || ''
export const gmailActivo = Boolean(cuenta && gmailRemitente)

let token = { valor: '', vence: 0 }

async function accessToken() {
  if (token.valor && Date.now() < token.vence - 60_000) return token.valor
  const ahora = Math.floor(Date.now() / 1000)
  const cabecera = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const cuerpo = b64u(JSON.stringify({ iss: cuenta.email, sub: gmailRemitente, scope: SCOPE, aud: TOKEN_URL, iat: ahora, exp: ahora + 3600 }))
  const firma = crypto.createSign('RSA-SHA256').update(`${cabecera}.${cuerpo}`).sign(cuenta.clave).toString('base64url')
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${cabecera}.${cuerpo}.${firma}` }),
    signal: AbortSignal.timeout(15_000),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok || !d.access_token) {
    const causa = d.error || `HTTP ${r.status}`
    const e = new Error(causa === 'unauthorized_client'
      ? `Google no autorizó a la cuenta de servicio para enviar como ${gmailRemitente}. Falta activar la delegación en todo el dominio con el permiso de Gmail.`
      : `No se pudo autenticar con Google (${causa}).`)
    e.registro = `[gmail] token: ${causa} ${d.error_description || ''}`
    throw e
  }
  token = { valor: d.access_token, vence: Date.now() + (d.expires_in || 3600) * 1000 }
  return token.valor
}

/* Envía un mensaje MIME ya armado (Buffer). Devuelve el id del mensaje en Gmail. */
export async function enviarPorGmail(mime) {
  const t = await accessToken()
  const r = await fetch(SEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(mime).toString('base64url') }),
    signal: AbortSignal.timeout(30_000),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) {
    if (r.status === 401) token = { valor: '', vence: 0 }
    const e = new Error(`Gmail rechazó el envío (${d.error?.status || r.status}).`)
    e.registro = `[gmail] envío: ${r.status} ${d.error?.message || ''}`
    throw e
  }
  return d.id
}
