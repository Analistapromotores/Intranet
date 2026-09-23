/* API de Solicitudes: registro público, consulta por el solicitante y gestión con sesión. */
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { MAIL, URL_GLPI, destinatario } from '../config.js'
import { dataPath, readJson, update } from '../store.js'
import { ESTADOS, TIPOS, validar } from '../../shared/solicitudes.js'
import { GENERADORES } from './documents.js'
import { componerCorreo } from './email.js'
import { enviar, smtpActivo } from './mailer.js'

const FILE = dataPath('solicitudes.json')
const DIR = dataPath('solicitudes')
mkdirSync(DIR, { recursive: true })

/* Estructura en disco: { consecutivos: { 'II-2026': 3 }, items: [ solicitud ] } */
const VACIO = { consecutivos: {}, items: [] }

const correoDe = (sol) => String(sol.tipo === 'informe_ingreso' ? sol.datos.solicitanteCorreo : sol.datos.correo).toLowerCase()
const solicitanteDe = (sol) => (sol.tipo === 'prestamo_equipos' ? sol.datos.nombre : sol.datos.solicitanteNombre)

function titulo(sol) {
  const d = sol.datos
  if (sol.tipo === 'informe_ingreso') return `${d.nombre} · ${d.cargo}`
  if (sol.tipo === 'orden_servicio') return `${d.cantidad} × ${d.cargo}`
  return d.equipos.map((e) => `${e.cantidad} × ${e.tipo === 'Otro' ? e.otro : e.tipo}`).join(', ')
}

/* Vista pública: sin datos sensibles (salarios, documentos, firma). */
const vistaPublica = (s) => ({
  id: s.id,
  numero: s.numero,
  tipo: s.tipo,
  tipoNombre: TIPOS[s.tipo].nombre,
  categoria: TIPOS[s.tipo].categoria,
  titulo: titulo(s),
  estado: s.estado,
  creada: s.creada,
  actualizada: s.actualizada,
  correo: s.correo ? { estado: s.correo.estado, to: s.correo.to, fecha: s.correo.fecha } : null,
  historial: s.historial.map(({ estado, fecha, comentario }) => ({ estado, fecha, comentario })),
})

const vistaGestion = (s) => {
  const datos = { ...s.datos }
  delete datos.firma
  return { ...vistaPublica(s), solicitante: solicitanteDe(s), correoSolicitante: correoDe(s), datos, archivo: Boolean(s.archivo), correo: s.correo, historial: s.historial }
}

/* Genera documento y correo; guarda el resultado en la solicitud. */
async function procesar(id) {
  const items = (await readJson(FILE, VACIO)).items
  const sol = items.find((s) => s.id === id)
  const tipo = TIPOS[sol.tipo]
  const attachments = []
  let archivo = sol.archivo

  if (tipo.documento) {
    const gen = GENERADORES[sol.tipo]
    const buffer = await gen.fn(sol)
    archivo = { nombre: gen.nombre(sol), ruta: `${sol.id}.xlsx` }
    await fs.writeFile(`${DIR}/${archivo.ruta}`, buffer)
    attachments.push({ filename: archivo.nombre, content: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  const to = destinatario(sol.tipo)
  const correo = await enviar({ id: sol.numero, to, replyTo: correoDe(sol), attachments, ...componerCorreo(sol, { modo: MAIL.modo }) })

  return update(FILE, VACIO, (db) => {
    const s = db.items.find((x) => x.id === id)
    s.archivo = archivo
    s.correo = correo
    s.actualizada = new Date().toISOString()
    return s
  })
}

/* Límite simple contra envíos masivos: 20 solicitudes por IP cada hora. */
const envios = new Map()
function limitado(ip) {
  const now = Date.now()
  const list = (envios.get(ip) || []).filter((t) => now - t < 3600e3)
  list.push(now)
  envios.set(ip, list)
  return list.length > 20
}

export function solicitudesRouter({ requireAuth }) {
  const r = express.Router()

  r.get('/solicitudes/config', (_req, res) => {
    res.json({ glpiUrl: URL_GLPI, modoCorreo: MAIL.modo, destino: { informe_ingreso: destinatario('informe_ingreso'), orden_servicio: destinatario('orden_servicio'), prestamo_equipos: destinatario('prestamo_equipos') }, smtp: smtpActivo })
  })

  /* Registrar una solicitud */
  r.post('/solicitudes/:tipo', async (req, res) => {
    const tipo = req.params.tipo
    if (!TIPOS[tipo]) return res.status(404).json({ error: 'Tipo de solicitud desconocido.' })
    if (limitado(req.ip)) return res.status(429).json({ error: 'Has enviado muchas solicitudes seguidas. Intenta más tarde.' })
    const datos = req.body || {}
    const errores = validar(tipo, datos)
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errores })

    const ahora = new Date().toISOString()
    const sol = await update(FILE, VACIO, (db) => {
      const serie = `${TIPOS[tipo].prefijo}-${new Date().getFullYear()}`
      db.consecutivos[serie] = (db.consecutivos[serie] || 0) + 1
      const s = {
        id: crypto.randomUUID(),
        numero: `${serie}-${String(db.consecutivos[serie]).padStart(4, '0')}`,
        tipo,
        estado: 'enviada',
        creada: ahora,
        actualizada: ahora,
        datos,
        archivo: null,
        correo: null,
        historial: [{ estado: 'enviada', fecha: ahora, comentario: 'Solicitud registrada desde la intranet.', por: solicitanteDe({ tipo, datos }) }],
      }
      db.items.push(s)
      return s
    })

    try {
      const final = await procesar(sol.id)
      res.status(201).json(vistaPublica(final))
    } catch (e) {
      console.error('[solicitudes] error al procesar', sol.numero, e)
      res.status(201).json({ ...vistaPublica(sol), aviso: 'La solicitud quedó registrada, pero hubo un problema al generar el documento o el correo. Gestión lo revisará.' })
    }
  })

  /* Consulta del solicitante: número + correo con el que la registró. */
  r.get('/solicitudes/consulta', async (req, res) => {
    const numero = String(req.query.numero || '').trim().toUpperCase()
    const correo = String(req.query.correo || '').trim().toLowerCase()
    if (!numero || !correo) return res.status(400).json({ error: 'Escribe el número de solicitud y tu correo.' })
    const { items } = await readJson(FILE, VACIO)
    const sol = items.find((s) => s.numero === numero && correoDe(s) === correo)
    if (!sol) return res.status(404).json({ error: 'No encontramos una solicitud con ese número y correo.' })
    res.json(vistaPublica(sol))
  })

  /* Todas las solicitudes de un correo (historial del solicitante). */
  r.get('/solicitudes/mias', async (req, res) => {
    const correo = String(req.query.correo || '').trim().toLowerCase()
    const numeros = String(req.query.numeros || '').split(',').map((n) => n.trim().toUpperCase()).filter(Boolean)
    if (!correo || !numeros.length) return res.json([])
    const { items } = await readJson(FILE, VACIO)
    res.json(items.filter((s) => numeros.includes(s.numero) && correoDe(s) === correo).reverse().map(vistaPublica))
  })

  /* ---------- Gestión (requiere sesión) ---------- */
  r.get('/admin/solicitudes', requireAuth, async (_req, res) => {
    const { items } = await readJson(FILE, VACIO)
    res.json([...items].reverse().map(vistaGestion))
  })

  r.patch('/admin/solicitudes/:id/estado', requireAuth, async (req, res) => {
    const estado = String(req.body?.estado || '')
    if (!ESTADOS[estado]) return res.status(400).json({ error: 'Estado no válido.' })
    const comentario = String(req.body?.comentario || '').trim().slice(0, 400)
    const sol = await update(FILE, VACIO, (db) => {
      const s = db.items.find((x) => x.id === req.params.id)
      if (!s) return null
      const fecha = new Date().toISOString()
      s.estado = estado
      s.actualizada = fecha
      s.historial.push({ estado, fecha, comentario, por: req.user.name || req.user.username })
      return s
    })
    if (!sol) return res.status(404).json({ error: 'La solicitud no existe.' })
    res.json(vistaGestion(sol))
  })

  r.post('/admin/solicitudes/:id/reenviar', requireAuth, async (req, res) => {
    const { items } = await readJson(FILE, VACIO)
    if (!items.some((s) => s.id === req.params.id)) return res.status(404).json({ error: 'La solicitud no existe.' })
    try {
      res.json(vistaGestion(await procesar(req.params.id)))
    } catch (e) {
      res.status(500).json({ error: `No se pudo regenerar: ${e.message}` })
    }
  })

  r.get('/admin/solicitudes/:id/archivo', requireAuth, async (req, res) => {
    const { items } = await readJson(FILE, VACIO)
    const sol = items.find((s) => s.id === req.params.id)
    if (!sol?.archivo) return res.status(404).json({ error: 'Esta solicitud no tiene archivo.' })
    res.download(`${DIR}/${sol.archivo.ruta}`, sol.archivo.nombre)
  })

  return r
}
