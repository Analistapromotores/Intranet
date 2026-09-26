/* Servidor de la intranet: sirve el build de Vite y la API (Cumpleaños y Solicitudes).
   Datos en archivos JSON y archivos en disco, dentro de DATA_DIR (en Railway, un volumen). */
import express from 'express'
import compression from 'compression'
import crypto from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR, PROD, ROOT } from './config.js'
import { dbListo, deleteBlob, readBlob, readJson, saveBlob, usaPostgres, writeJson } from './store.js'
import { solicitudesRouter } from './solicitudes/routes.js'
import { salasRouter } from './salas/routes.js'
import { noticiasRouter } from './noticias/routes.js'
import { tiRouter, programarResumenDiario } from './ti/routes.js'
import { cabeceras, errorGlobal, firmaDeImagen, forzarHttps, limitador, mismoOrigen } from './seguridad.js'

const PEOPLE_FILE = path.join(DATA_DIR, 'people.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001)
const COOKIE = 'gys_session'
const SESSION_HOURS = 12
/* Sin SESSION_SECRET las sesiones se invalidan al reiniciar: seguro, solo pide volver a entrar. */
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')

/* ---------- Contraseñas y sesiones ---------- */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}
function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const a = Buffer.from(hash, 'hex')
  const b = crypto.scryptSync(password, salt, 64)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
const sign = (v) => crypto.createHmac('sha256', SECRET).update(v).digest('base64url')
function makeToken(username) {
  const body = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600e3 })).toString('base64url')
  return `${body}.${sign(body)}`
}
function readToken(token) {
  const [body, sig] = String(token || '').split('.')
  if (!body || !sig) return null
  const expected = sign(body)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString())
    return data.exp > Date.now() ? data.u : null
  } catch {
    return null
  }
}
function getCookie(req, name) {
  const found = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='))
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null
}
function setSession(res, value, maxAgeSec) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`]
  if (PROD) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

/* Roles: 'gestor' (cumpleaños, solicitudes y noticias), 'ti' (además, alertas y seguimiento de TI)
   y 'admin' (todo, más el control de accesos).
   Los usuarios iniciales salen de variables de entorno; en desarrollo hay unos por defecto. */
const ROLES = ['gestor', 'ti', 'admin']
const rolDe = (u) => (ROLES.includes(u?.role) ? u.role : 'gestor')
const sesion = (u) => ({ username: u.username, name: u.name, role: rolDe(u) })

async function ensureUsers() {
  const users = await readJson(USERS_FILE, [])
  let cambios = false
  const asegurar = (username, password, name, role) => {
    if (!username || !password) return false
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return false
    users.push({ username, name, role, password: hashPassword(password) })
    cambios = true
    if (!PROD) console.log(`[usuarios] ${role} de desarrollo: ${username} / ${password}`)
    return true
  }
  asegurar(process.env.GESTOR_USER || (PROD ? null : 'gestor'), process.env.GESTOR_PASSWORD || (PROD ? null : 'cumple2026'), 'Gestor de la intranet', 'gestor')
  asegurar(process.env.TI_USER || (PROD ? null : 'ti'), process.env.TI_PASSWORD || (PROD ? null : 'ti12345'), 'Equipo de TI', 'ti')
  asegurar(process.env.ADMIN_USER || (PROD ? null : 'admin'), process.env.ADMIN_PASSWORD || (PROD ? null : 'admin'), 'Administrador de la intranet', 'admin')
  if (cambios) await writeJson(USERS_FILE, users)
  if (!users.length) console.warn('[usuarios] Sin GESTOR_USER/GESTOR_PASSWORD ni ADMIN_USER/ADMIN_PASSWORD: nadie podrá iniciar sesión hasta definirlos.')
}

/* Freno a la fuerza bruta: 8 intentos fallidos por usuario y IP, y 40 por IP, cada 15 minutos.
   Contar por usuario evita que una persona que se equivoca bloquee a toda la oficina (misma IP pública). */
const VENTANA_LOGIN = 15 * 60e3
const fallos = new Map()
const vigentes = (k) => {
  const lista = (fallos.get(k) || []).filter((t) => Date.now() - t < VENTANA_LOGIN)
  fallos.set(k, lista)
  return lista
}
const bloqueadoLogin = (ip, user) => vigentes(`${ip}|${user}`).length >= 8 || vigentes(ip).length >= 40
const anotarFallo = (ip, user) => { vigentes(`${ip}|${user}`).push(Date.now()); vigentes(ip).push(Date.now()) }
setInterval(() => { for (const k of fallos.keys()) if (!vigentes(k).length) fallos.delete(k) }, 5 * 60e3).unref()
/* Contraseña falsa para gastar el mismo tiempo cuando el usuario no existe (no revelar quién existe). */
const HASH_FALSO = hashPassword(crypto.randomBytes(12).toString('hex'))

/* ---------- Validación de personas ---------- */
const clean = (v, max) => String(v ?? '').trim().slice(0, max)
function parsePerson(body) {
  const name = clean(body.name, 90)
  const month = Number(body.month)
  const day = Number(body.day)
  const year = body.year ? Number(body.year) : null
  const errors = {}
  if (name.length < 3) errors.name = 'Escribe el nombre completo.'
  if (!Number.isInteger(month) || month < 1 || month > 12) errors.month = 'Elige el mes.'
  const maxDay = new Date(2024, month, 0).getDate() || 31
  if (!Number.isInteger(day) || day < 1 || day > maxDay) errors.day = 'Día no válido para ese mes.'
  if (year !== null && (!Number.isInteger(year) || year < 1930 || year > new Date().getFullYear())) errors.year = 'Año no válido.'
  return {
    errors,
    value: {
      name,
      cargo: clean(body.cargo, 80),
      area: clean(body.area, 80),
      message: clean(body.message, 240),
      month,
      day,
      year,
      published: body.published !== false,
    },
  }
}

/* Foto enviada como data URL (el navegador ya la redimensiona a WebP). */
async function savePhoto(dataUrl) {
  const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl))
  if (!m) return null
  const buf = Buffer.from(m[2], 'base64')
  if (buf.length > 2.5 * 1024 * 1024) throw new Error('La foto supera 2.5 MB.')
  if (firmaDeImagen(buf) !== m[1]) throw new Error('El archivo no es una imagen válida.')
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
  const file = `${crypto.randomUUID()}.${ext}`
  await saveBlob(`uploads/${file}`, buf, `image/${m[1] === 'jpeg' ? 'jpeg' : m[1]}`)
  return file
}
async function removePhoto(file) {
  if (file) await deleteBlob(`uploads/${path.basename(file)}`)
}

/* ---------- Felicitaciones ---------- */
/* Fecha de hoy en Colombia, sin importar la zona horaria del servidor. */
function hoyBogota() {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()).split('-').map(Number)
  return { y, m, d }
}
/* Se puede felicitar desde el día anterior hasta el día siguiente al cumpleaños. */
function enVentana(p) {
  const { y, m, d } = hoyBogota()
  const hoy = Date.UTC(y, m - 1, d)
  return [y - 1, y, y + 1].some((yy) => Math.abs(Date.UTC(yy, p.month - 1, p.day) - hoy) <= 86400e3)
}
const wishCount = (wishes, personId, year) => wishes.filter((w) => w.personId === personId && w.year === year).length
const wishView = (w) => ({ id: w.id, name: w.name, message: w.message, createdAt: w.createdAt })

const publicView = (p) => ({
  id: p.id,
  name: p.name,
  cargo: p.cargo,
  area: p.area,
  message: p.message,
  month: p.month,
  day: p.day,
  photo: p.photo ? `/uploads/${p.photo}` : null,
})
const adminView = (p) => ({ ...publicView(p), year: p.year, published: p.published, updatedAt: p.updatedAt })

/* ---------- App ---------- */
const app = express()
app.disable('x-powered-by')
/* En Railway, X-Forwarded-For llega como «cliente, proxy-de-borde» y el proxy de borde cambia entre peticiones.
   Confiando en 2 saltos, req.ip es la IP real del cliente (y no se puede falsificar desde fuera). Sin esto los
   límites por IP verían un valor distinto en cada petición y nunca se activarían. En local no hay proxy: se usa la conexión directa. */
app.set('trust proxy', PROD ? 2 : false)
app.use(forzarHttps)
app.use(cabeceras)
app.use(compression())

/* Tamaño máximo del cuerpo según el tipo de ruta: solo donde llegan imágenes se admiten cuerpos grandes. */
app.use(['/api/admin/noticias', '/api/admin/people', '/api/admin/import'], express.json({ limit: '25mb' }))
app.use('/api/ti', express.json({ limit: '5mb' }))
app.use(['/api/solicitudes', '/api/documentos'], express.json({ limit: '2mb' }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', mismoOrigen)
/* Tope general por IP: solo frena automatismos; una oficina completa detrás de una IP no lo alcanza. */
const lecturas = limitador({ ventana: 60e3, max: 2400 })
const escrituras = limitador({ ventana: 60e3, max: 300 })
app.use('/api', (req, res, next) => (req.method === 'GET' || req.method === 'HEAD' ? lecturas(req, res, next) : escrituras(req, res, next)))
/* Imágenes subidas. Los nombres son UUID y nunca cambian de contenido, así que se pueden cachear un año. */
const MIME = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png' }
app.get('/uploads/:file', async (req, res) => {
  const file = path.basename(req.params.file)
  const ext = file.split('.').pop().toLowerCase()
  if (!MIME[ext]) return res.status(404).end()
  const blob = await readBlob(`uploads/${file}`)
  if (!blob) return res.status(404).end()
  res.set({ 'Content-Type': blob.mime || MIME[ext], 'Cache-Control': 'public, max-age=31536000, immutable', ETag: `"${file}"` })
  if (req.headers['if-none-match'] === `"${file}"`) return res.status(304).end()
  res.send(blob.data)
})

/* Comprobación de salud para Railway: responde solo si la base de datos contesta. */
app.get('/api/health', async (_req, res) => {
  try {
    await dbListo()
    res.json({ ok: true, db: usaPostgres ? 'postgres' : 'archivos' })
  } catch {
    res.status(503).json({ ok: false })
  }
})

const api = express.Router()

api.get('/birthdays', async (_req, res) => {
  const people = await readJson(PEOPLE_FILE, [])
  const wishes = await readJson(WISHES_FILE, [])
  const { y } = hoyBogota()
  res.set('Cache-Control', 'no-store')
  res.json(people.filter((p) => p.published).map((p) => ({ ...publicView(p), wishes: wishCount(wishes, p.id, y) })))
})

/* Mensajes del muro de felicitaciones de este año. */
api.get('/birthdays/:id/wishes', async (req, res) => {
  const wishes = await readJson(WISHES_FILE, [])
  const { y } = hoyBogota()
  const mine = wishes.filter((w) => w.personId === req.params.id && w.year === y)
  res.set('Cache-Control', 'no-store')
  res.json({ count: mine.length, messages: mine.filter((w) => w.message).slice(-40).reverse().map(wishView) })
})

/* Freno a abusos: máximo 40 felicitaciones por IP cada 10 minutos (la oficina comparte IP). */
const wishHits = new Map()
function wishLimited(ip) {
  const now = Date.now()
  const list = (wishHits.get(ip) || []).filter((t) => now - t < 10 * 60e3)
  list.push(now)
  wishHits.set(ip, list)
  return list.length > 40
}

api.post('/birthdays/:id/wishes', async (req, res) => {
  if (wishLimited(req.ip)) return res.status(429).json({ error: 'Muchas felicitaciones seguidas. Intenta en unos minutos.' })
  const people = await readJson(PEOPLE_FILE, [])
  const person = people.find((p) => p.id === req.params.id && p.published)
  if (!person) return res.status(404).json({ error: 'Esta persona no está publicada.' })
  if (!enVentana(person)) return res.status(400).json({ error: 'Las felicitaciones se abren el día del cumpleaños.' })
  const { y } = hoyBogota()
  const wish = {
    id: crypto.randomUUID(),
    key: crypto.randomBytes(16).toString('hex'),
    personId: person.id,
    year: y,
    name: clean(req.body?.name, 40),
    message: clean(req.body?.message, 160),
    createdAt: new Date().toISOString(),
  }
  const wishes = await readJson(WISHES_FILE, [])
  wishes.push(wish)
  await writeJson(WISHES_FILE, wishes)
  res.status(201).json({ id: wish.id, key: wish.key, count: wishCount(wishes, person.id, y) })
})

/* Quien felicitó puede añadir o cambiar su mensaje con la llave que recibió. */
api.patch('/birthdays/:id/wishes/:wid', limitador({ ventana: 10 * 60e3, max: 40 }), async (req, res) => {
  const wishes = await readJson(WISHES_FILE, [])
  const wish = wishes.find((w) => w.id === req.params.wid && w.personId === req.params.id)
  const key = String(req.body?.key || '')
  if (!wish || key.length !== wish.key.length || !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(wish.key))) {
    return res.status(403).json({ error: 'No se pudo actualizar la felicitación.' })
  }
  wish.name = clean(req.body?.name, 40)
  wish.message = clean(req.body?.message, 160)
  await writeJson(WISHES_FILE, wishes)
  res.json(wishView(wish))
})

api.post('/auth/login', async (req, res) => {
  const ip = req.ip
  const { username, password } = req.body || {}
  const nombre = String(username || '').trim().toLowerCase().slice(0, 64)
  if (bloqueadoLogin(ip, nombre)) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' })
  const users = await readJson(USERS_FILE, [])
  const user = users.find((u) => u.username.toLowerCase() === nombre)
  const correcta = checkPassword(String(password || '').slice(0, 200), user ? user.password : HASH_FALSO)
  if (!user || !correcta) {
    anotarFallo(ip, nombre)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
  }
  fallos.delete(`${ip}|${nombre}`)
  setSession(res, makeToken(user.username), SESSION_HOURS * 3600)
  res.json(sesion(user))
})

api.post('/auth/logout', (_req, res) => {
  setSession(res, '', 0)
  res.json({ ok: true })
})

async function requireAuth(req, res, next) {
  const username = readToken(getCookie(req, COOKIE))
  const users = username ? await readJson(USERS_FILE, []) : []
  const user = users.find((u) => u.username === username)
  if (!user) return res.status(401).json({ error: 'Tu sesión terminó. Inicia sesión de nuevo.' })
  req.user = user
  next()
}

/* Adjunta el usuario si hay sesión, sin exigirla. */
async function sesionOpcional(req, _res, next) {
  const username = readToken(getCookie(req, COOKIE))
  if (username) {
    const users = await readJson(USERS_FILE, [])
    req.user = users.find((u) => u.username === username) || null
  }
  next()
}

/* Sin sesión responde 200 con null (no es un error): así la consola de cada visitante no se llena de 401. */
api.get('/auth/me', sesionOpcional, (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json(req.user ? sesion(req.user) : null)
})

/* Solo TI y administradores. Se usa encadenado después de requireAuth. */
function requireTi(req, res, next) {
  if (!['ti', 'admin'].includes(rolDe(req.user))) return res.status(403).json({ error: 'Esta sección es solo para el equipo de TI.' })
  next()
}

/* Solo administradores. Se usa encadenado después de requireAuth. */
function requireAdmin(req, res, next) {
  if (rolDe(req.user) !== 'admin') return res.status(403).json({ error: 'Esta sección es solo para administradores.' })
  next()
}

/* ---------- Control de accesos: usuarios y roles (solo admin) ---------- */
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/i
const userView = (u) => ({ username: u.username, name: u.name, role: rolDe(u) })
const esUltimoAdmin = (users, u) => rolDe(u) === 'admin' && users.filter((x) => rolDe(x) === 'admin').length <= 1

api.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await readJson(USERS_FILE, [])
  res.json(users.map(userView))
})

api.post('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const username = clean(req.body?.username, 32)
  const name = clean(req.body?.name, 80)
  const role = ROLES.includes(req.body?.role) ? req.body.role : 'gestor'
  const password = String(req.body?.password || '')
  const fields = {}
  if (!USERNAME_RE.test(username)) fields.username = 'Usa de 3 a 32 letras, números, punto, guion o guion bajo.'
  if (name.length < 3) fields.name = 'Escribe el nombre completo.'
  if (password.length < 8) fields.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields })
  const users = await readJson(USERS_FILE, [])
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Ese usuario ya existe.', fields: { username: 'Ese usuario ya existe.' } })
  }
  const user = { username, name, role, password: hashPassword(password) }
  users.push(user)
  await writeJson(USERS_FILE, users)
  res.status(201).json(userView(user))
})

api.patch('/admin/users/:username', requireAuth, requireAdmin, async (req, res) => {
  const users = await readJson(USERS_FILE, [])
  const user = users.find((u) => u.username === req.params.username)
  if (!user) return res.status(404).json({ error: 'El usuario ya no existe.' })
  if (req.body?.name !== undefined) {
    const name = clean(req.body.name, 80)
    if (name.length < 3) return res.status(400).json({ error: 'Escribe el nombre completo.' })
    user.name = name
  }
  if (req.body?.role !== undefined) {
    if (!ROLES.includes(req.body.role)) return res.status(400).json({ error: 'Rol no válido.' })
    if (req.body.role !== rolDe(user) && esUltimoAdmin(users, user)) return res.status(400).json({ error: 'Debe quedar al menos un administrador.' })
    user.role = req.body.role
  }
  if (req.body?.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
    user.password = hashPassword(String(req.body.password))
  }
  await writeJson(USERS_FILE, users)
  res.json(userView(user))
})

api.delete('/admin/users/:username', requireAuth, requireAdmin, async (req, res) => {
  const users = await readJson(USERS_FILE, [])
  const idx = users.findIndex((u) => u.username === req.params.username)
  if (idx === -1) return res.status(404).json({ error: 'El usuario ya no existe.' })
  if (users[idx].username === req.user.username) return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' })
  if (esUltimoAdmin(users, users[idx])) return res.status(400).json({ error: 'Debe quedar al menos un administrador.' })
  users.splice(idx, 1)
  await writeJson(USERS_FILE, users)
  res.json({ ok: true })
})

api.put('/auth/password', requireAuth, async (req, res) => {
  const { current, next: nueva } = req.body || {}
  if (!checkPassword(String(current || ''), req.user.password)) return res.status(400).json({ error: 'La contraseña actual no coincide.' })
  if (String(nueva || '').length < 8) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  const users = await readJson(USERS_FILE, [])
  const u = users.find((x) => x.username === req.user.username)
  u.password = hashPassword(String(nueva))
  await writeJson(USERS_FILE, users)
  res.json({ ok: true })
})

api.get('/admin/people', requireAuth, async (_req, res) => {
  const people = await readJson(PEOPLE_FILE, [])
  const wishes = await readJson(WISHES_FILE, [])
  const { y } = hoyBogota()
  res.json(people.map((p) => ({ ...adminView(p), wishes: wishCount(wishes, p.id, y) })))
})

/* Moderación del muro: el gestor ve todas las felicitaciones del año y puede borrar las que no correspondan. */
api.get('/admin/people/:id/wishes', requireAuth, async (req, res) => {
  const wishes = await readJson(WISHES_FILE, [])
  const { y } = hoyBogota()
  res.json(wishes.filter((w) => w.personId === req.params.id && w.year === y).reverse().map(wishView))
})

api.delete('/admin/wishes/:wid', requireAuth, async (req, res) => {
  const wishes = await readJson(WISHES_FILE, [])
  const idx = wishes.findIndex((w) => w.id === req.params.wid)
  if (idx === -1) return res.status(404).json({ error: 'La felicitación ya no existe.' })
  wishes.splice(idx, 1)
  await writeJson(WISHES_FILE, wishes)
  res.json({ ok: true })
})

api.post('/admin/people', requireAuth, async (req, res) => {
  const { errors, value } = parsePerson(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errors })
  try {
    const photo = req.body.photo ? await savePhoto(req.body.photo) : null
    const person = { id: crypto.randomUUID(), ...value, photo, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const people = await readJson(PEOPLE_FILE, [])
    people.push(person)
    await writeJson(PEOPLE_FILE, people)
    res.status(201).json(adminView(person))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

api.put('/admin/people/:id', requireAuth, async (req, res) => {
  const people = await readJson(PEOPLE_FILE, [])
  const person = people.find((p) => p.id === req.params.id)
  if (!person) return res.status(404).json({ error: 'La persona ya no existe.' })
  const { errors, value } = parsePerson(req.body)
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errors })
  try {
    if (req.body.photo) {
      const photo = await savePhoto(req.body.photo)
      await removePhoto(person.photo)
      person.photo = photo
    } else if (req.body.removePhoto) {
      await removePhoto(person.photo)
      person.photo = null
    }
    Object.assign(person, value, { updatedAt: new Date().toISOString() })
    await writeJson(PEOPLE_FILE, people)
    res.json(adminView(person))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

api.patch('/admin/people/:id/published', requireAuth, async (req, res) => {
  const people = await readJson(PEOPLE_FILE, [])
  const person = people.find((p) => p.id === req.params.id)
  if (!person) return res.status(404).json({ error: 'La persona ya no existe.' })
  person.published = Boolean(req.body?.published)
  person.updatedAt = new Date().toISOString()
  await writeJson(PEOPLE_FILE, people)
  res.json(adminView(person))
})

api.delete('/admin/people/:id', requireAuth, async (req, res) => {
  const people = await readJson(PEOPLE_FILE, [])
  const idx = people.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'La persona ya no existe.' })
  const [gone] = people.splice(idx, 1)
  await removePhoto(gone.photo)
  await writeJson(PEOPLE_FILE, people)
  const wishes = await readJson(WISHES_FILE, [])
  await writeJson(WISHES_FILE, wishes.filter((w) => w.personId !== gone.id))
  res.json({ ok: true })
})

/* Carga masiva: filas ya interpretadas desde un CSV en el navegador. */
api.post('/admin/import', requireAuth, async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows.slice(0, 2000) : []
  const people = await readJson(PEOPLE_FILE, [])
  const key = (p) => `${p.name.toLowerCase()}|${p.month}|${p.day}`
  const seen = new Set(people.map(key))
  const result = { added: 0, skipped: 0, errors: [] }
  rows.forEach((row, i) => {
    const { errors, value } = parsePerson({ ...row, published: row.published !== false && row.published !== 'no' })
    if (Object.keys(errors).length) return result.errors.push({ row: i + 2, error: Object.values(errors).join(' ') })
    if (seen.has(key(value))) return result.skipped++
    seen.add(key(value))
    const now = new Date().toISOString()
    people.push({ id: crypto.randomUUID(), ...value, photo: null, createdAt: now, updatedAt: now })
    result.added++
  })
  await writeJson(PEOPLE_FILE, people)
  res.json(result)
})

app.use('/api', api)
app.use('/api', solicitudesRouter({ requireAuth }))
app.use('/api', salasRouter({ sesionOpcional }))
app.use('/api', noticiasRouter({ requireAuth, sesionOpcional }))
app.use('/api', tiRouter({ requireAuth, requireTi }))
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))

/* Build de Vite (en desarrollo lo sirve Vite y este bloque no aplica). */
if (existsSync(DIST)) {
  /* Dirección pública del sitio, para el enlace canónico, la imagen social y el sitemap.
     SITE_URL manda; si no está, se usa el host de la petición solo cuando tiene forma de dominio. */
  const sitioUrl = (req) => {
    if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '')
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim()
    if (!/^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) return ''
    return `${PROD ? 'https' : req.protocol}://${host}`
  }
  const INDEX = readFileSync(path.join(DIST, 'index.html'), 'utf8')
  const servirIndex = (req, res) => {
    res.set({ 'Cache-Control': 'no-cache', 'Content-Type': 'text/html; charset=utf-8' })
    res.send(INDEX.replaceAll('__SITE_URL__', sitioUrl(req)))
  }
  app.get(['/', '/index.html'], servirIndex)

  /* Solo se rastrea la portada pública; la API queda fuera. Las secciones usan #, que los buscadores no tratan como páginas. */
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitioUrl(req)}/sitemap.xml\n`)
  })
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${sitioUrl(req)}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`)
  })

  app.use(express.static(DIST, {
    index: false,
    setHeaders: (res, file) => {
      /* Lo de /assets lleva el hash en el nombre: se puede guardar un año. El resto, una hora. */
      res.setHeader('Cache-Control', /[\\/]assets[\\/]/.test(file) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600')
    },
  }))
  app.get('/{*splat}', (req, res) => {
    /* Un archivo que no existe responde 404 de verdad, no la portada. */
    if (/\.[a-z0-9]{2,5}$/i.test(req.path)) return res.status(404).type('text/plain').send('No encontrado')
    servirIndex(req, res)
  })
}

app.use(errorGlobal)
process.on('unhandledRejection', (e) => console.error('[error] promesa sin manejar:', e?.stack || e))

await ensureUsers()
programarResumenDiario()
app.listen(PORT, () => console.log(`[intranet] http://localhost:${PORT} · datos en ${usaPostgres ? 'PostgreSQL' : DATA_DIR}`))
