/* Configuración del servidor. Todo lo que cambia entre pruebas y producción viene de variables de entorno. */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'))
export const PROD = process.env.NODE_ENV === 'production'

/* Correo. Mientras MAIL_MODE no sea exactamente "produccion", todo se envía a EMAIL_PRUEBAS. */
const modo = String(process.env.MAIL_MODE || 'pruebas').trim().toLowerCase()
export const MAIL = {
  modo: modo === 'produccion' ? 'produccion' : 'pruebas',
  pruebas: process.env.EMAIL_PRUEBAS || 'analistapromotres@gstionyservicios.com.co',
  produccion: process.env.EMAIL_PRODUCCION || 'gerenciaadmin@gestionyservicios.com.co',
  /* Préstamos de equipos: en producción los recibe TI. */
  prestamos: process.env.EMAIL_PRESTAMOS || process.env.EMAIL_PRODUCCION || 'gerenciaadmin@gestionyservicios.com.co',
  from: process.env.MAIL_FROM || 'Intranet Gestión y Servicios <no-responder@gestionyservicios.com.co>',
  smtp: process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || '') === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
      }
    : null,
}

/* Destinatario según el tipo de solicitud y el modo. */
export function destinatario(tipo) {
  if (MAIL.modo !== 'produccion') return MAIL.pruebas
  return tipo === 'prestamo_equipos' ? MAIL.prestamos : MAIL.produccion
}

export const URL_GLPI = process.env.URL_GLPI || 'https://glpi.gestionyservicios.com.co/'
