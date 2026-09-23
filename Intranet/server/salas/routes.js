/* API de Reserva de salas y del formato de Ausentismo laboral (FT-OP-76). */
import express from 'express'
import crypto from 'node:crypto'
import ExcelJS from 'exceljs'
import path from 'node:path'
import { ROOT } from '../config.js'
import { dataPath, readJson, update } from '../store.js'
import { MAX_COLABORADORES, MOTIVOS, SALAS, seCruzan, validarAusentismo, validarReserva } from '../../shared/salas.js'

const FILE = dataPath('reservas.json')

/* Fecha de hoy en Colombia (YYYY-MM-DD), sin importar la zona horaria del servidor. */
const hoyBogota = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
const limpio = (v, max) => String(v ?? '').trim().slice(0, max)

const vista = (r) => ({ id: r.id, sala: r.sala, fecha: r.fecha, inicio: r.inicio, fin: r.fin, descripcion: r.descripcion, nombre: r.nombre, colaborador: r.colaborador })

/* ---------- Excel FT-OP-76: el formato trae dos copias en la misma hoja ---------- */
const COPIAS = [0, 33]
const CASILLA_MOTIVO = { cita: 'C', diligencia: 'F', calamidad: 'I', empresarial: 'K', licencia: 'M' }
const fechaExcel = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const fechaTexto = (iso) => { const [y, m, d] = String(iso).split('-'); return `${d}/${m}/${y}` }

async function excelAusentismo(d) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path.join(ROOT, 'server', 'templates', 'ausentismo.xlsx'))
  const ws = wb.worksheets[0]
  for (const o of COPIAS) {
    const set = (col, fila, valor) => { ws.getCell(`${col}${fila + o}`).value = valor }
    const fecha = (col, fila, iso) => { const c = ws.getCell(`${col}${fila + o}`); c.value = fechaExcel(iso); c.numFmt = 'dd/mm/yyyy' }
    fecha('L', 5, d.fechaSolicitud)
    set(CASILLA_MOTIVO[d.motivo], 7, 'X')
    set('C', 8, d.descripcion)
    set(d.soporte === 'si' ? 'L' : 'M', 9, 'X')
    fecha('C', 10, d.fechaInicio)
    set('G', 10, d.horaInicio || '')
    fecha('J', 10, d.fechaFin)
    set('L', 10, d.horaFin || '')
    set('C', 11, d.empresa)
    d.colaboradores.slice(0, MAX_COLABORADORES).forEach((c, i) => {
      const f = 15 + i
      set('A', f, i + 1)
      set('B', f, c.nombre)
      set('G', f, String(c.identificacion))
      set('I', f, c.cargo)
      /* K: firma del colaborador, se firma a mano al imprimir. */
    })
    set('A', 22, d.observaciones || '')
    set('A', 26, d.jefe) /* H26: Talento Humano queda en blanco para su firma. */
  }
  return Buffer.from(await wb.xlsx.writeBuffer())
}

/* Límites simples contra abusos. */
const golpes = new Map()
function limitado(ip, max) {
  const now = Date.now()
  const list = (golpes.get(ip) || []).filter((x) => now - x < 3600e3)
  list.push(now)
  golpes.set(ip, list)
  return list.length > max
}

export function salasRouter({ sesionOpcional }) {
  const r = express.Router()

  r.get('/salas', (_req, res) => res.json({ salas: SALAS, hoy: hoyBogota() }))

  /* Reservas de un rango de fechas (para el calendario). */
  r.get('/salas/reservas', async (req, res) => {
    const desde = String(req.query.desde || '')
    const hasta = String(req.query.hasta || '')
    const { items } = await readJson(FILE, { items: [] })
    res.set('Cache-Control', 'no-store')
    res.json(items.filter((x) => (!desde || x.fecha >= desde) && (!hasta || x.fecha <= hasta)).map(vista))
  })

  r.post('/salas/reservas', async (req, res) => {
    if (limitado(req.ip, 60)) return res.status(429).json({ error: 'Demasiadas reservas seguidas. Intenta más tarde.' })
    const b = req.body || {}
    const d = {
      colaborador: limpio(b.colaborador, 120).toLowerCase(),
      nombre: limpio(b.nombre, 80),
      sala: limpio(b.sala, 30),
      fecha: limpio(b.fecha, 10),
      inicio: limpio(b.inicio, 5),
      fin: limpio(b.fin, 5),
      descripcion: limpio(b.descripcion, 200),
    }
    const errores = validarReserva(d, hoyBogota())
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errores })
    const resultado = await update(FILE, { items: [] }, (db) => {
      const choque = db.items.find((x) => seCruzan(x, d))
      if (choque) return { choque }
      const nueva = { id: crypto.randomUUID(), key: crypto.randomBytes(16).toString('hex'), ...d, creada: new Date().toISOString() }
      db.items.push(nueva)
      return { nueva }
    })
    if (resultado.choque) {
      const c = resultado.choque
      return res.status(409).json({ error: `La sala ya está reservada de ${c.inicio} a ${c.fin} (${c.descripcion}).`, fields: { inicio: 'Horario ocupado.' } })
    }
    res.status(201).json({ ...vista(resultado.nueva), key: resultado.nueva.key })
  })

  /* Cancelar: quien reservó (con su llave) o un gestor/admin con sesión. */
  r.delete('/salas/reservas/:id', sesionOpcional, async (req, res) => {
    const key = String(req.body?.key || req.query.key || '')
    const ok = await update(FILE, { items: [] }, (db) => {
      const i = db.items.findIndex((x) => x.id === req.params.id)
      if (i === -1) return 'no'
      const r0 = db.items[i]
      const dueño = key && key.length === r0.key.length && crypto.timingSafeEqual(Buffer.from(key), Buffer.from(r0.key))
      if (!dueño && !req.user) return 'prohibido'
      db.items.splice(i, 1)
      return 'ok'
    })
    if (ok === 'no') return res.status(404).json({ error: 'La reserva ya no existe.' })
    if (ok === 'prohibido') return res.status(403).json({ error: 'Solo quien hizo la reserva puede cancelarla.' })
    res.json({ ok: true })
  })

  /* Ausentismo: genera el FT-OP-76 diligenciado y lo devuelve para descargar. No se guarda. */
  r.post('/documentos/ausentismo', async (req, res) => {
    if (limitado(req.ip, 120)) return res.status(429).json({ error: 'Demasiadas solicitudes seguidas. Intenta más tarde.' })
    const b = req.body || {}
    const d = {
      fechaSolicitud: limpio(b.fechaSolicitud, 10),
      motivo: limpio(b.motivo, 20),
      descripcion: limpio(b.descripcion, 250),
      soporte: limpio(b.soporte, 2),
      fechaInicio: limpio(b.fechaInicio, 10),
      horaInicio: limpio(b.horaInicio, 5),
      fechaFin: limpio(b.fechaFin, 10),
      horaFin: limpio(b.horaFin, 5),
      empresa: limpio(b.empresa, 120),
      colaboradores: (Array.isArray(b.colaboradores) ? b.colaboradores : []).slice(0, MAX_COLABORADORES + 1).map((c) => ({ nombre: limpio(c?.nombre, 90), identificacion: limpio(c?.identificacion, 20), cargo: limpio(c?.cargo, 60) })),
      observaciones: limpio(b.observaciones, 400),
      jefe: limpio(b.jefe, 90),
    }
    const errores = validarAusentismo(d)
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errores })
    const buffer = await excelAusentismo(d)
    const motivo = MOTIVOS.find(([k]) => k === d.motivo)[1]
    const nombre = `FT-OP-76 Ausentismo ${motivo} ${fechaTexto(d.fechaInicio).replace(/\//g, '-')}.xlsx`
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`,
    })
    res.send(buffer)
  })

  return r
}
