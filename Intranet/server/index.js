/* Servidor de la intranet: sirve el build de Vite y la API (Cumpleaños y Solicitudes).
   Datos en archivos JSON y archivos en disco, dentro de DATA_DIR (en Railway, un volumen). */
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR, PROD, ROOT } from './config.js'
import { readJson, writeJson } from './store.js'
import { solicitudesRouter } from './solicitudes/routes.js'

const UPLOADS = path.join(DATA_DIR, 'uploads')
const PEOPLE_FILE = path.join(DATA_DIR, 'people.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001)
const COOKIE = 'gys_session'
const SESSION_HOURS = 12
/* Sin SESSION_SECRET las sesiones se invalidan al reiniciar: seguro, solo pide volver a entrar. */
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')

mkdirSync(UPLOADS, { recursive: true })

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

/* Roles: 'gestor' (cumpleaños y solicitudes) y 'admin' (además, la administración).
   Los usuarios iniciales salen de variables de entorno; en desarrollo hay unos por defecto. */
const ROLES = ['gestor', 'admin']
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
  asegurar(process.env.ADMIN_USER || (PROD ? null : 'admin'), process.env.ADMIN_PASSWORD || (PROD ? null : 'admin2026'), 'Administrador de la intranet', 'admin')
  if (cambios) await writeJson(USERS_FILE, users)
  if (!users.length) console.warn('[usuarios] Sin GESTOR_USER/GESTOR_PASSWORD ni ADMIN_USER/ADMIN_PASSWORD: nadie podrá iniciar sesión hasta definirlos.')
}

/* Freno simple a la fuerza bruta: 8 intentos fallidos por IP cada 15 minutos. */
const attempts = new Map()
function tooManyAttempts(ip) {
  const now = Date.now()
  const list = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60e3)
  attempts.set(ip, list)
  return list.length >= 8
}

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
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
  const file = `${crypto.randomUUID()}.${ext}`
  await fs.writeFile(path.join(UPLOADS, file), buf)
  return file
}
async function removePhoto(file) {
  if (file) await fs.rm(path.join(UPLOADS, path.basename(file)), { force: true })
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
app.use(express.json({ limit: '4mb' }))
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d', immutable: true }))

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
api.patch('/birthdays/:id/wishes/:wid', async (req, res) => {
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
  if (tooManyAttempts(ip)) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' })
  const { username, password } = req.body || {}
  const users = await readJson(USERS_FILE, [])
  const user = users.find((u) => u.username.toLowerCase() === String(username || '').trim().toLowerCase())
  if (!user || !checkPassword(String(password || ''), user.password)) {
    attempts.get(ip).push(Date.now())
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
  }
  attempts.delete(ip)
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

api.get('/auth/me', requireAuth, (req, res) => res.json(sesion(req.user)))

/* Solo administradores. Se usa encadenado después de requireAuth. */
function requireAdmin(req, res, next) {
  if (rolDe(req.user) !== 'admin') return res.status(403).json({ error: 'Esta sección es solo para administradores.' })
  next()
}

/* Panel de administración: por ahora solo confirma el acceso; aquí irán sus funciones. */
api.get('/admin/panel', requireAuth, requireAdmin, (req, res) => res.json({ ok: true, user: sesion(req.user), modulos: [] }))

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
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))

/* Build de Vite (en desarrollo lo sirve Vite y este bloque no aplica). */
if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }))
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))
}

await ensureUsers()
app.listen(PORT, () => console.log(`[intranet] http://localhost:${PORT} · datos en ${DATA_DIR}`))
