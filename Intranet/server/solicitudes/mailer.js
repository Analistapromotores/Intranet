/* Envío de correos de las solicitudes.
   - Con SMTP configurado (SMTP_HOST...) envía de verdad al destinatario que indique config.destinatario().
   - Sin SMTP no sale nada: el correo completo (con adjunto) se guarda como .eml en DATA_DIR/outbox
     para revisarlo durante las pruebas. */
import nodemailer from 'nodemailer'
import fs from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { MAIL } from '../config.js'
import { dataPath } from '../store.js'

const OUTBOX = dataPath('outbox')
mkdirSync(OUTBOX, { recursive: true })

const transporte = MAIL.smtp
  ? nodemailer.createTransport(MAIL.smtp)
  : nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' })

export const smtpActivo = Boolean(MAIL.smtp)

export async function enviar({ to, replyTo, subject, text, html, attachments = [], id }) {
  const mensaje = { from: MAIL.from, to, replyTo, subject, text, html, attachments }
  try {
    const info = await transporte.sendMail(mensaje)
    if (smtpActivo) return { estado: 'enviado', to, messageId: info.messageId, fecha: new Date().toISOString() }
    const archivo = `${id || Date.now()}-${Date.now()}.eml`
    await fs.writeFile(`${OUTBOX}/${archivo}`, info.message)
    return { estado: 'simulado', to, archivo, fecha: new Date().toISOString(), detalle: 'SMTP sin configurar: el correo se guardó en la bandeja local y no se envió.' }
  } catch (e) {
    return { estado: 'error', to, fecha: new Date().toISOString(), detalle: e.message }
  }
}
