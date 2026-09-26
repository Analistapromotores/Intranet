/* Seguridad HTTP, límites de uso, validación de archivos y manejo de errores.
   Todo lo transversal vive aquí para que las rutas de cada módulo solo se ocupen de su negocio. */
import { PROD } from './config.js'

/* ---------- Cabeceras de seguridad ---------- */
/* Servicios externos legítimos de la intranet: fuentes de Google, mapa de OpenStreetMap y contenidos
   incrustados de redes sociales y video (YouTube, Vimeo, Instagram, Facebook, LinkedIn, TikTok). */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://www.instagram.com https://www.facebook.com https://www.linkedin.com https://www.tiktok.com https://drive.google.com https://docs.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

export function cabeceras(_req, res, next) {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  })
  if (PROD) res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  next()
}

/* Railway termina el HTTPS y avisa con X-Forwarded-Proto. Sin la cabecera (chequeo de salud interno) no se redirige. */
export function forzarHttps(req, res, next) {
  if (PROD && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`)
  }
  next()
}

/* Defensa adicional contra CSRF: una petición que modifica datos y trae Origin debe venir de este mismo sitio.
   (La cookie ya es SameSite=Lax; esto cubre además navegadores y casos límite.) */
export function mismoOrigen(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const origen = req.headers.origin
  if (origen) {
    let host = ''
    try { host = new URL(origen).host } catch { /* origen inválido */ }
    if (host !== req.headers.host) return res.status(403).json({ error: 'Solicitud no permitida desde otro sitio.' })
  }
  next()
}

/* ---------- Límites de uso ---------- */
/* Contadores en memoria por clave; se limpian solos para no crecer sin fin.
   Con varias instancias cada una cuenta por separado, por eso los topes son holgados. */
const contadores = new Set()
export function limitador({ ventana, max, mensaje = 'Demasiadas solicitudes seguidas. Intenta de nuevo en unos minutos.', clave = (req) => req.ip }) {
  const golpes = new Map()
  contadores.add({ golpes, ventana })
  return (req, res, next) => {
    const k = clave(req)
    const ahora = Date.now()
    const lista = (golpes.get(k) || []).filter((t) => ahora - t < ventana)
    lista.push(ahora)
    golpes.set(k, lista)
    if (lista.length > max) {
      console.warn(`[limite] ${req.method} ${req.path} bloqueado para ${k}`)
      res.set('Retry-After', String(Math.ceil(ventana / 1000)))
      return res.status(429).json({ error: mensaje })
    }
    next()
  }
}
setInterval(() => {
  const ahora = Date.now()
  for (const { golpes, ventana } of contadores) {
    for (const [k, lista] of golpes) if (!lista.length || ahora - lista[lista.length - 1] > ventana) golpes.delete(k)
  }
}, 60_000).unref()

/* ---------- Imágenes subidas ---------- */
/* Comprueba la firma real del archivo, no solo lo que declara el navegador. */
export function firmaDeImagen(buf) {
  if (buf.length > 12 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg'
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

/* ---------- Errores ---------- */
/* Nunca se envía al usuario la traza ni el mensaje técnico: se registra en el servidor y se responde algo comprensible. */
export function errorGlobal(err, req, res, next) {
  if (res.headersSent) return next(err)
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'El contenido es demasiado grande. Reduce el tamaño de las imágenes e inténtalo de nuevo.' })
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) return res.status(400).json({ error: 'La solicitud no es válida.' })
  console.error(`[error] ${req.method} ${req.originalUrl}`, err?.stack || err)
  res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo en unos minutos.' })
}
