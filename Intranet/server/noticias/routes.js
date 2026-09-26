/* API de Noticias y comunicados, y de las Redes sociales de Gestión y Servicios.
   Lectura pública; publicar y editar exige sesión (gestores y administradores, los mismos de Cumpleaños). */
import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { dataPath, deleteBlob, readJson, saveBlob, update } from '../store.js'
import { firmaDeImagen } from '../seguridad.js'

const POSTS = dataPath('noticias.json')
const REDES = dataPath('redes.json')

const TIPOS = ['noticia', 'comunicado']
const BLOQUES = ['titulo', 'texto', 'imagen', 'enlace', 'cita', 'video', 'separador']
const MAX_BLOQUES = 60
const clean = (v, max) => String(v ?? '').trim().slice(0, max)

/* Solo http(s) y mailto: nunca javascript: ni data: en enlaces. */
function url(v) {
  const s = clean(v, 600)
  if (!s) return ''
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(s)) return s
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}

/* ---------- Imágenes: llegan como data URL (el navegador las comprime) o ya son /uploads/... ---------- */
async function guardarImagen(valor) {
  const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(String(valor || ''))
  if (!m) {
    const previa = /^\/uploads\/([\w-]+\.(?:webp|jpg|png))$/.exec(String(valor || ''))
    return previa ? previa[1] : null
  }
  const buf = Buffer.from(m[2], 'base64')
  if (buf.length > 8 * 1024 * 1024) throw new Error('Una imagen supera 8 MB. Redúcela un poco e inténtalo de nuevo.')
  const file = `${crypto.randomUUID()}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`
  if (firmaDeImagen(buf) !== m[1]) throw new Error('Uno de los archivos no es una imagen válida.')
  await saveBlob(`uploads/${file}`, buf, `image/${m[1] === 'jpeg' ? 'jpeg' : m[1]}`)
  return file
}
const enUploads = (f) => (f ? `/uploads/${f}` : null)
const borrar = (files) => Promise.all([...files].filter(Boolean).map((f) => deleteBlob(`uploads/${path.basename(f)}`)))
const archivosDe = (p) => new Set([p.portada, ...(p.bloques || []).filter((b) => b.type === 'imagen').map((b) => b.archivo)].filter(Boolean))

/* Normaliza los bloques del editor. Devuelve los guardables; las imágenes nuevas se suben aquí. */
async function limpiarBloques(lista) {
  const out = []
  for (const b of (Array.isArray(lista) ? lista : []).slice(0, MAX_BLOQUES)) {
    if (!BLOQUES.includes(b?.type)) continue
    const base = { id: clean(b.id, 40) || crypto.randomUUID(), type: b.type }
    switch (b.type) {
      case 'titulo':
        out.push({ ...base, texto: clean(b.texto, 160), nivel: b.nivel === 3 ? 3 : 2 })
        break
      case 'texto':
        out.push({ ...base, texto: clean(b.texto, 6000) })
        break
      case 'cita':
        out.push({ ...base, texto: clean(b.texto, 500), autor: clean(b.autor, 80) })
        break
      case 'enlace':
        out.push({ ...base, texto: clean(b.texto, 80) || 'Abrir enlace', url: url(b.url), estilo: b.estilo === 'secundario' ? 'secundario' : 'primario' })
        break
      case 'video':
        out.push({ ...base, url: url(b.url), pie: clean(b.pie, 160) })
        break
      case 'imagen': {
        const archivo = await guardarImagen(b.src)
        out.push({ ...base, archivo, pie: clean(b.pie, 200), ancho: b.ancho === 'medio' ? 'medio' : 'completo' })
        break
      }
      case 'separador':
        out.push(base)
        break
    }
  }
  return out.filter((b) => b.type === 'separador' || (b.type === 'imagen' ? b.archivo : b.type === 'enlace' || b.type === 'video' ? b.url : b.texto))
}

const bloqueVista = (b) => (b.type === 'imagen' ? { id: b.id, type: b.type, src: enUploads(b.archivo), pie: b.pie, ancho: b.ancho } : b)
const resumenVista = (p) => ({
  id: p.id,
  tipo: p.tipo,
  titulo: p.titulo,
  resumen: p.resumen,
  portada: enUploads(p.portada),
  destacado: p.destacado,
  publicadoEn: p.publicadoEn,
  autor: p.autor,
})
const completaVista = (p) => ({
  ...resumenVista(p),
  bloques: (p.bloques || []).map(bloqueVista),
  publicado: p.publicado,
  actualizada: p.actualizada,
})

const ordenar = (lista) =>
  [...lista].sort((a, b) => Number(b.destacado) - Number(a.destacado) || String(b.publicadoEn || b.creada).localeCompare(String(a.publicadoEn || a.creada)))

/* ---------- Redes sociales ---------- */
const RED_IDS = ['instagram', 'facebook', 'linkedin', 'youtube']
const PERFILES = {
  instagram: 'https://www.instagram.com/gestion_gys/',
  facebook: 'https://www.facebook.com/GestionGYS/',
  linkedin: 'https://www.linkedin.com/in/gestion-y-servicios-apoyo-en-talento-humano-b7b829257',
  youtube: 'https://www.youtube.com/channel/UCEbbLOy-HFe6OmWVAIAhGMg',
}
const REDES_BASE = RED_IDS.map((id) => ({ id, perfil: PERFILES[id] || '', publicacion: '' }))
function sinRastreo(u) {
  if (!u) return u
  try {
    const f = new URL(u)
    for (const k of [...f.searchParams.keys()]) if (/^(utm_|mibextid|igsh|igshid|stkn|fbclid|rdid|share_url|si$)/i.test(k)) f.searchParams.delete(k)
    return f.href
  } catch {
    return u
  }
}

/* Los enlaces «compartir» de Facebook (facebook.com/share/…) redirigen al enlace real; se guarda ese, sin rastreadores. */
async function resolverFacebook(u) {
  if (!/^https?:\/\/(www\.|m\.)?facebook\.com\/share\//i.test(u)) return u
  try {
    const r = await fetch(u, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) })
    const f = new URL(r.url)
    if (!/(^|\.)facebook\.com$/.test(f.hostname) || /\/(login|checkpoint)/.test(f.pathname)) return u
    f.search = ''
    return f.href
  } catch {
    return u
  }
}
const HOSTS = {
  instagram: /(^|\.)instagram\.com$/,
  facebook: /(^|\.)(facebook\.com|fb\.watch|fb\.com)$/,
  linkedin: /(^|\.)linkedin\.com$/,
  youtube: /(^|\.)(youtube\.com|youtu\.be)$/,
}
const hostOk = (id, u) => {
  try {
    return HOSTS[id].test(new URL(u).hostname)
  } catch {
    return false
  }
}
const redesCompletas = (guardadas) => REDES_BASE.map((b) => ({ ...b, ...(guardadas?.items || []).find((x) => x.id === b.id) }))

export function noticiasRouter({ requireAuth, sesionOpcional }) {
  const r = express.Router()
  const items = async () => (await readJson(POSTS, { items: [] })).items || []

  /* ----- Público ----- */
  r.get('/noticias', async (req, res) => {
    const tipo = TIPOS.includes(req.query.tipo) ? req.query.tipo : null
    const limite = Math.min(Math.max(Number(req.query.limit) || 24, 1), 100)
    const lista = (await items()).filter((p) => p.publicado && (!tipo || p.tipo === tipo))
    res.set('Cache-Control', 'no-store')
    res.json(ordenar(lista).slice(0, limite).map(resumenVista))
  })

  r.get('/noticias/:id', sesionOpcional, async (req, res) => {
    const post = (await items()).find((p) => p.id === req.params.id)
    if (!post || (!post.publicado && !req.user)) return res.status(404).json({ error: 'Esta publicación ya no está disponible.' })
    res.set('Cache-Control', 'no-store')
    res.json(completaVista(post))
  })

  r.get('/redes', async (_req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json(redesCompletas(await readJson(REDES, { items: [] })))
  })

  /* ----- Gestión (gestores y administradores) ----- */
  r.get('/admin/noticias', requireAuth, async (_req, res) => {
    res.json(ordenar(await items()).map(completaVista))
  })

  async function leerCuerpo(body) {
    const tipo = TIPOS.includes(body?.tipo) ? body.tipo : 'noticia'
    const titulo = clean(body?.titulo, 140)
    const fields = {}
    if (titulo.length < 4) fields.titulo = 'Escribe un título de al menos 4 letras.'
    if (Object.keys(fields).length) return { fields }
    const bloques = await limpiarBloques(body.bloques)
    const portada = body.portada ? await guardarImagen(body.portada) : null
    return {
      value: {
        tipo,
        titulo,
        resumen: clean(body?.resumen, 280),
        portada,
        bloques,
        destacado: Boolean(body?.destacado),
        publicado: body?.publicado !== false,
      },
    }
  }

  r.post('/admin/noticias', requireAuth, async (req, res) => {
    try {
      const { fields, value } = await leerCuerpo(req.body)
      if (fields) return res.status(400).json({ error: 'Revisa los campos marcados.', fields })
      const ahora = new Date().toISOString()
      const post = { id: crypto.randomUUID(), ...value, autor: req.user.name || req.user.username, publicadoEn: value.publicado ? ahora : null, creada: ahora, actualizada: ahora }
      await update(POSTS, { items: [] }, (d) => { (d.items ||= []).push(post) })
      res.status(201).json(completaVista(post))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  r.put('/admin/noticias/:id', requireAuth, async (req, res) => {
    try {
      const actual = (await items()).find((p) => p.id === req.params.id)
      if (!actual) return res.status(404).json({ error: 'La publicación ya no existe.' })
      const { fields, value } = await leerCuerpo(req.body)
      if (fields) return res.status(400).json({ error: 'Revisa los campos marcados.', fields })
      const ahora = new Date().toISOString()
      let guardada
      await update(POSTS, { items: [] }, (d) => {
        const p = d.items.find((x) => x.id === req.params.id)
        if (!p) return
        const antes = archivosDe(p)
        Object.assign(p, value, { actualizada: ahora })
        /* La fecha de publicación es la del primer momento en que se hizo visible. */
        if (value.publicado && !p.publicadoEn) p.publicadoEn = ahora
        if (!value.publicado) p.publicadoEn = p.publicadoEn || null
        const despues = archivosDe(p)
        guardada = { p, huerfanas: [...antes].filter((f) => !despues.has(f)) }
      })
      if (!guardada) return res.status(404).json({ error: 'La publicación ya no existe.' })
      await borrar(guardada.huerfanas)
      res.json(completaVista(guardada.p))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  r.patch('/admin/noticias/:id', requireAuth, async (req, res) => {
    let post
    await update(POSTS, { items: [] }, (d) => {
      post = d.items.find((x) => x.id === req.params.id)
      if (!post) return
      if (req.body?.publicado !== undefined) {
        post.publicado = Boolean(req.body.publicado)
        if (post.publicado && !post.publicadoEn) post.publicadoEn = new Date().toISOString()
      }
      if (req.body?.destacado !== undefined) post.destacado = Boolean(req.body.destacado)
      post.actualizada = new Date().toISOString()
    })
    if (!post) return res.status(404).json({ error: 'La publicación ya no existe.' })
    res.json(completaVista(post))
  })

  r.delete('/admin/noticias/:id', requireAuth, async (req, res) => {
    let quitada
    await update(POSTS, { items: [] }, (d) => {
      const i = d.items.findIndex((x) => x.id === req.params.id)
      if (i !== -1) [quitada] = d.items.splice(i, 1)
    })
    if (!quitada) return res.status(404).json({ error: 'La publicación ya no existe.' })
    await borrar(archivosDe(quitada))
    res.json({ ok: true })
  })

  /* Redes: el gestor pega el enlace del perfil y el de la última publicación. */
  r.put('/admin/redes', requireAuth, async (req, res) => {
    const recibidas = Array.isArray(req.body?.items) ? req.body.items : []
    const fields = {}
    const items = await Promise.all(REDES_BASE.map(async (b) => {
      const x = recibidas.find((y) => y?.id === b.id) || {}
      let perfil = sinRastreo(url(x.perfil))
      let publicacion = sinRastreo(url(x.publicacion))
      if (b.id === 'facebook') { perfil = await resolverFacebook(perfil); publicacion = await resolverFacebook(publicacion) }
      if (perfil && !hostOk(b.id, perfil)) fields[`${b.id}.perfil`] = 'Este enlace no es de esa red social.'
      if (publicacion && !hostOk(b.id, publicacion)) fields[`${b.id}.publicacion`] = 'Este enlace no es de esa red social.'
      return { id: b.id, perfil, publicacion }
    }))
    if (Object.keys(fields).length) return res.status(400).json({ error: 'Revisa los enlaces marcados.', fields })
    await update(REDES, { items: [] }, (d) => { d.items = items })
    res.json(redesCompletas({ items }))
  })

  return r
}
