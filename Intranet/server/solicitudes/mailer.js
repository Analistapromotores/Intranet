/* Envío de correos de las solicitudes y del panel de TI. Por orden de preferencia:
   1. Gmail (cuenta de servicio de Google): GOOGLE_SERVICE_ACCOUNT_JSON + GMAIL_SENDER.
   2. SMTP: SMTP_HOST y demás.
   3. Sin ninguno de los dos no sale nada: el correo completo (con adjunto) se guarda como .eml
      (carpeta blobs/outbox en local, tabla blobs en Postgres) para revisarlo en pruebas. */
import nodemailer from 'nodemailer'
import { MAIL } from '../config.js'
import { saveBlob } from '../store.js'
import { enviarPorGmail, gmailActivo, gmailRemitente } from './gmail.js'

/* Arma el mensaje MIME (con adjuntos) sin enviarlo. */
const armador = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' })
const smtp = MAIL.smtp ? nodemailer.createTransport(MAIL.smtp) : null

/* «Activo» = los correos salen de verdad (por Gmail o por SMTP). */
export const smtpActivo = gmailActivo || Boolean(smtp)
export const canalCorreo = gmailActivo ? 'gmail' : smtp ? 'smtp' : 'simulado'

const NOMBRE_REMITENTE = 'Intranet Gestión y Servicios'

export async function enviar({ to, replyTo, subject, text, html, attachments = [], id }) {
  const from = gmailActivo ? `${NOMBRE_REMITENTE} <${gmailRemitente}>` : MAIL.from
  const mensaje = { from, to, replyTo, subject, text, html, attachments }
  const fecha = () => new Date().toISOString()
  try {
    if (gmailActivo) {
      const { message } = await armador.sendMail(mensaje)
      const messageId = await enviarPorGmail(message)
      return { estado: 'enviado', to, messageId, fecha: fecha(), canal: 'gmail' }
    }
    if (smtp) {
      const info = await smtp.sendMail(mensaje)
      return { estado: 'enviado', to, messageId: info.messageId, fecha: fecha(), canal: 'smtp' }
    }
    const info = await armador.sendMail(mensaje)
    const archivo = `${id || Date.now()}-${Date.now()}.eml`
    await saveBlob(`outbox/${archivo}`, info.message, 'message/rfc822')
    return { estado: 'simulado', to, archivo, fecha: fecha(), detalle: 'El servidor de correo no está configurado: el correo se guardó en la bandeja del sistema y no se envió.' }
  } catch (e) {
    console.error(e.registro || `[correo] ${e.message}`)
    return { estado: 'error', to, fecha: fecha(), detalle: e.message }
  }
}
