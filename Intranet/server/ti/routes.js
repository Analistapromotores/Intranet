/* API del panel de TI: seguimiento de correos inactivos y de líneas móviles (recargas),
   con alertas calculadas al vuelo y un resumen diario por correo. Solo roles «ti» y «admin». */
import express from 'express'
import crypto from 'node:crypto'
import { MAIL } from '../config.js'
import { dataPath, readJson, update, writeJson } from '../store.js'
import { enviar } from '../solicitudes/mailer.js'

const CORREOS = dataPath('ti-correos.json')
const LINEAS = dataPath('ti-lineas.json')
const CONFIG = dataPath('ti-config.json')

const CONFIG_BASE = { diasAviso: 5, diasInactivo: 30, diasRecarga: 30, correoAuto: true, ultimoResumen: null }
const clean = (v, max) => String(v ?? '').trim().slice(0, max)

/* Fecha de hoy en Colombia (YYYY-MM-DD). */
export const hoyBogota = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
const aUtc = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const diasEntre = (desde, hasta) => Math.round((aUtc(hasta) - aUtc(desde)) / 86400e3)
const sumarDias = (iso, n) => new Date(aUtc(iso) + n * 86400e3).toISOString().slice(0, 10)

/* Acepta AAAA-MM-DD, DD/MM/AAAA, D/M/AAAA y DD-MM-AAAA. Devuelve ISO o ''. */
export function fechaIso(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  let y, m, d
  let r = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)
  if (r) [, y, m, d] = r
  else if ((r = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(s))) [, d, m, y] = r
  else return ''
  y = Number(y); m = Number(m); d = Number(d)
  const f = new Date(Date.UTC(y, m - 1, d))
  return f.getUTCFullYear() === y && f.getUTCMonth() === m - 1 && f.getUTCDate() === d ? f.toISOString().slice(0, 10) : ''
}

/* ---------- Líneas móviles ---------- */
const SEMILLA_LINEAS = [
  ['principal', '3154666218', 'SELECCION', 8500, '07/05/2026', 'minutos', '30/05/2026'],
  ['principal', '3176524986', 'SRA MARINA', 30000, '30/04/2026', 'minutos y datos', '30/05/2026'],
  ['principal', '3177971532', 'SRA. KARIM', 30000, '30/04/2026', 'minutos y datos', '30/05/2026'],
  ['principal', '3182133760', 'CONTRATACION', 8500, '07/05/2026', 'minutos', '30/05/2026'],
  ['principal', '3182593570', 'COMERCIAL', 30000, '30/04/2026', 'minutos y datos', '30/05/2026'],
  ['principal', '3152738325', 'Asistente RH 1', 8500, '17/04/2026', 'minutos', '30/05/2026'],
  ['principal', '3172177321', 'Asistente RH 2', 8500, '17/04/2026', 'minutos', '30/05/2026'],
  ['principal', '3167323326', 'Asistente RH 3', 8500, '', 'minutos', '30/05/2026'],
  ['principal', '3184109470', 'ACTIVOS', 30000, '07/05/2026', 'minutos y datos', '30/05/2026'],
  ['caja_menor', '3172183520', 'Promotores', 8500, '04/03/2026', 'minutos', '06/04/2026'],
  ['caja_menor', '3157060627', 'Infraestructura', 20000, '06/03/2026', 'minutos y datos', ''],
].map(([grupo, linea, area, plan, recarga, observacion, vence]) => ({
  id: crypto.randomUUID(),
  grupo,
  linea,
  area,
  plan,
  recarga: fechaIso(recarga),
  observacion,
  vence: fechaIso(vence) || (fechaIso(recarga) ? sumarDias(fechaIso(recarga), 30) : ''),
}))

async function leerLineas() {
  const d = await readJson(LINEAS, null)
  if (d) return d.items || []
  await writeJson(LINEAS, { items: SEMILLA_LINEAS })
  return SEMILLA_LINEAS
}

function leerLinea(b, config) {
  const fields = {}
  const linea = clean(b?.linea, 20).replace(/\D/g, '')
  const area = clean(b?.area, 80)
  const plan = Math.max(0, Math.round(Number(String(b?.plan ?? '').replace(/[^\d.]/g, '')) || 0))
  const recarga = fechaIso(b?.recarga)
  let vence = fechaIso(b?.vence)
  if (linea.length < 7) fields.linea = 'Escribe el número de la línea.'
  if (!area) fields.area = 'Indica el área o la persona.'
  if (b?.recarga && !recarga) fields.recarga = 'Fecha no válida (usa día/mes/año).'
  if (b?.vence && !vence) fields.vence = 'Fecha no válida (usa día/mes/año).'
  if (!vence && recarga) vence = sumarDias(recarga, config.diasRecarga)
  const grupo = b?.grupo === 'caja_menor' ? 'caja_menor' : 'principal'
  return { fields, value: { grupo, linea, area, plan, recarga, vence, observacion: clean(b?.observacion, 120) } }
}

export function estadoLinea(l, config, hoy = hoyBogota()) {
  if (!l.vence) return { nivel: 'sin_fecha', dias: null }
  const dias = diasEntre(hoy, l.vence)
  if (dias < 0) return { nivel: 'vencida', dias }
  if (dias <= config.diasAviso) return { nivel: 'por_vencer', dias }
  return { nivel: 'ok', dias }
}

/* ---------- Correos ---------- */
function diasInactivo(c, hoy = hoyBogota()) {
  if (c.ultimoAcceso) return Math.max(0, diasEntre(c.ultimoAcceso, hoy))
  return Number.isFinite(c.diasReportados) ? c.diasReportados : null
}
const vistaCorreo = (c, config) => {
  const dias = diasInactivo(c)
  return { ...c, dias, alerta: dias !== null && dias >= config.diasInactivo }
}

/* Separa una fila pegada desde Excel/Sheets (tabulaciones) o de un CSV (; o ,). */
function filas(texto) {
  const lineas = String(texto).split(String.fromCharCode(0xfeff)).join('').split(/\r?\n/).filter((l) => l.trim())
  if (!lineas.length) return []
  const sep = lineas[0].includes('\t') ? '\t' : (lineas[0].match(/;/g) || []).length >= (lineas[0].match(/,/g) || []).length ? ';' : ','
  return lineas.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, '')))
}
const norm = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

function leerReporteCorreos(texto) {
  const f = filas(texto)
  if (f.length < 2) return { items: [], error: 'Pega el reporte completo, con la fila de encabezados.' }
  const cab = f[0].map(norm)
  const col = (...ks) => cab.findIndex((c) => ks.some((k) => c.includes(k)))
  const iNombre = col('nombre')
  const iCorreo = col('correo', 'email')
  const iEstado = col('estado')
  const iAcceso = col('ultimo acceso', 'acceso', 'ltimo')
  const iDias = col('dias', 'inactiv')
  if (iCorreo < 0) return { items: [], error: 'No encontré la columna «Correo» en los encabezados.' }
  const items = []
  for (const c of f.slice(1)) {
    const correo = clean(c[iCorreo], 120).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+$/.test(correo)) continue
    const bruto = iAcceso >= 0 ? c[iAcceso] : ''
    const dias = iDias >= 0 ? Number(String(c[iDias] ?? '').replace(/\D/g, '')) : NaN
    items.push({
      id: crypto.randomUUID(),
      nombre: iNombre >= 0 ? clean(c[iNombre], 90) : '',
      correo,
      estado: iEstado >= 0 ? clean(c[iEstado], 40) : '',
      ultimoAcceso: fechaIso(bruto),
      ultimoAccesoTexto: fechaIso(bruto) ? '' : clean(bruto, 40),
      diasReportados: Number.isFinite(dias) && String(c[iDias] ?? '').trim() !== '' ? dias : null,
    })
  }
  return { items }
}

/* ---------- Alertas y resumen ---------- */
async function calcular() {
  const config = { ...CONFIG_BASE, ...(await readJson(CONFIG, {})) }
  const hoy = hoyBogota()
  const lineas = (await leerLineas()).map((l) => ({ ...l, ...estadoLinea(l, config, hoy) }))
  const correos = ((await readJson(CORREOS, { items: [] })).items || []).map((c) => vistaCorreo(c, config))
  const vencidas = lineas.filter((l) => l.nivel === 'vencida')
  const porVencer = lineas.filter((l) => l.nivel === 'por_vencer')
  const inactivos = correos.filter((c) => c.alerta)
  return { config, hoy, lineas, correos, vencidas, porVencer, inactivos }
}

const pesos = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function componerResumen(c) {
  const t = []
  const h = []
  if (c.vencidas.length || c.porVencer.length) {
    t.push('LÍNEAS MÓVILES')
    h.push('<h3>Líneas móviles</h3><ul>')
    for (const l of [...c.vencidas, ...c.porVencer]) {
      const txt = `${l.linea} · ${l.area} · ${l.nivel === 'vencida' ? `vencida hace ${Math.abs(l.dias)} día(s)` : `vence en ${l.dias} día(s)`} (${l.vence}) · plan ${pesos(l.plan)}`
      t.push(`- ${txt}`)
      h.push(`<li>${esc(txt)}</li>`)
    }
    h.push('</ul>')
  }
  if (c.inactivos.length) {
    t.push('', `CORREOS INACTIVOS (${c.config.diasInactivo}+ días)`)
    h.push(`<h3>Correos inactivos (${c.config.diasInactivo}+ días)</h3><ul>`)
    for (const x of c.inactivos.slice(0, 60)) {
      const txt = `${x.nombre || '—'} · ${x.correo} · ${x.dias} días sin acceso`
      t.push(`- ${txt}`)
      h.push(`<li>${esc(txt)}</li>`)
    }
    if (c.inactivos.length > 60) { t.push(`… y ${c.inactivos.length - 60} más`); h.push(`<li>… y ${c.inactivos.length - 60} más</li>`) }
    h.push('</ul>')
  }
  return { text: t.join('\n'), html: h.join('') }
}

const destinoTi = () => (MAIL.modo === 'produccion' ? process.env.EMAIL_TI || MAIL.produccion : MAIL.pruebas)

export async function enviarResumen({ forzar = false } = {}) {
  const c = await calcular()
  if (!c.vencidas.length && !c.porVencer.length && !c.inactivos.length) return { estado: 'sin_alertas' }
  if (!forzar && (!c.config.correoAuto || c.config.ultimoResumen === c.hoy)) return { estado: 'omitido' }
  const cuerpo = componerResumen(c)
  const r = await enviar({
    to: destinoTi(),
    subject: `Alertas de TI · ${c.vencidas.length + c.porVencer.length} línea(s) y ${c.inactivos.length} correo(s)`,
    text: `Resumen de alertas de TI (${c.hoy}):\n\n${cuerpo.text}\n`,
    html: `<div style="font-family:Segoe UI,Arial,sans-serif"><h2>Alertas de TI · ${c.hoy}</h2>${cuerpo.html}</div>`,
    id: 'ti-alertas',
  })
  await update(CONFIG, {}, (d) => { d.ultimoResumen = c.hoy })
  return r
}

/* Revisa cada 30 minutos; envía una sola vez al día, pasadas las 8:00 (hora de Colombia). */
export function programarResumenDiario() {
  const tic = () => {
    const hora = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Bogota', hour: '2-digit', hour12: false }).format(new Date()))
    if (hora >= 8) enviarResumen().catch((e) => console.warn('[ti] no se pudo enviar el resumen:', e.message))
  }
  setTimeout(tic, 15e3)
  setInterval(tic, 30 * 60e3).unref()
}

export function tiRouter({ requireAuth, requireTi }) {
  const r = express.Router()
  const guardia = [requireAuth, requireTi]

  r.get('/ti/resumen', ...guardia, async (_req, res) => {
    const c = await calcular()
    res.json({
      hoy: c.hoy,
      config: { diasAviso: c.config.diasAviso, diasInactivo: c.config.diasInactivo, diasRecarga: c.config.diasRecarga, correoAuto: c.config.correoAuto, ultimoResumen: c.config.ultimoResumen },
      lineas: { total: c.lineas.length, vencidas: c.vencidas.length, porVencer: c.porVencer.length },
      correos: { total: c.correos.length, inactivos: c.inactivos.length },
      destino: destinoTi(),
    })
  })

  r.put('/ti/config', ...guardia, async (req, res) => {
    const n = (v, min, max, def) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : def }
    await update(CONFIG, {}, (d) => {
      if (req.body?.diasAviso !== undefined) d.diasAviso = n(req.body.diasAviso, 0, 60, 5)
      if (req.body?.diasInactivo !== undefined) d.diasInactivo = n(req.body.diasInactivo, 1, 730, 30)
      if (req.body?.diasRecarga !== undefined) d.diasRecarga = n(req.body.diasRecarga, 1, 365, 30)
      if (req.body?.correoAuto !== undefined) d.correoAuto = Boolean(req.body.correoAuto)
    })
    res.json({ ok: true })
  })

  r.post('/ti/alertas/enviar', ...guardia, async (_req, res) => {
    res.json(await enviarResumen({ forzar: true }))
  })

  /* ----- Líneas ----- */
  r.get('/ti/lineas', ...guardia, async (_req, res) => {
    const c = await calcular()
    res.json({ config: c.config, hoy: c.hoy, items: c.lineas })
  })

  r.post('/ti/lineas', ...guardia, async (req, res) => {
    const config = { ...CONFIG_BASE, ...(await readJson(CONFIG, {})) }
    const { fields, value } = leerLinea(req.body, config)
    if (Object.keys(fields).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields })
    const item = { id: crypto.randomUUID(), ...value }
    await leerLineas()
    await update(LINEAS, { items: [] }, (d) => { d.items.push(item) })
    res.status(201).json({ ...item, ...estadoLinea(item, config) })
  })

  r.put('/ti/lineas/:id', ...guardia, async (req, res) => {
    const config = { ...CONFIG_BASE, ...(await readJson(CONFIG, {})) }
    const { fields, value } = leerLinea(req.body, config)
    if (Object.keys(fields).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields })
    let item
    await leerLineas()
    await update(LINEAS, { items: [] }, (d) => { item = d.items.find((x) => x.id === req.params.id); if (item) Object.assign(item, value) })
    if (!item) return res.status(404).json({ error: 'La línea ya no existe.' })
    res.json({ ...item, ...estadoLinea(item, config) })
  })

  /* Registra una recarga: fecha de hoy (o la indicada) y nuevo vencimiento. */
  r.post('/ti/lineas/:id/recarga', ...guardia, async (req, res) => {
    const config = { ...CONFIG_BASE, ...(await readJson(CONFIG, {})) }
    const fecha = fechaIso(req.body?.fecha) || hoyBogota()
    let item
    await leerLineas()
    await update(LINEAS, { items: [] }, (d) => {
      item = d.items.find((x) => x.id === req.params.id)
      if (!item) return
      item.recarga = fecha
      item.vence = sumarDias(fecha, config.diasRecarga)
      if (req.body?.plan) item.plan = Math.max(0, Math.round(Number(req.body.plan)) || item.plan)
    })
    if (!item) return res.status(404).json({ error: 'La línea ya no existe.' })
    res.json({ ...item, ...estadoLinea(item, config) })
  })

  r.delete('/ti/lineas/:id', ...guardia, async (req, res) => {
    let hubo = false
    await leerLineas()
    await update(LINEAS, { items: [] }, (d) => { const n = d.items.length; d.items = d.items.filter((x) => x.id !== req.params.id); hubo = d.items.length < n })
    if (!hubo) return res.status(404).json({ error: 'La línea ya no existe.' })
    res.json({ ok: true })
  })

  /* ----- Correos ----- */
  r.get('/ti/correos', ...guardia, async (_req, res) => {
    const c = await calcular()
    const d = await readJson(CORREOS, { items: [] })
    res.json({ config: c.config, hoy: c.hoy, actualizado: d.actualizado || null, items: c.correos })
  })

  /* Sube el reporte pegado desde Excel/Sheets o un CSV. modo: «reemplazar» (por defecto) o «agregar». */
  r.post('/ti/correos/importar', ...guardia, async (req, res) => {
    const { items, error } = leerReporteCorreos(req.body?.texto || '')
    if (error) return res.status(400).json({ error })
    if (!items.length) return res.status(400).json({ error: 'No encontré filas con un correo válido.' })
    const agregar = req.body?.modo === 'agregar'
    await update(CORREOS, { items: [] }, (d) => {
      if (!agregar) d.items = items
      else {
        const mapa = new Map((d.items || []).map((x) => [x.correo, x]))
        for (const n of items) mapa.set(n.correo, { ...(mapa.get(n.correo) || {}), ...n, id: mapa.get(n.correo)?.id || n.id })
        d.items = [...mapa.values()]
      }
      d.actualizado = new Date().toISOString()
    })
    res.json({ ok: true, importados: items.length })
  })

  r.delete('/ti/correos/:id', ...guardia, async (req, res) => {
    let hubo = false
    await update(CORREOS, { items: [] }, (d) => { const n = (d.items || []).length; d.items = (d.items || []).filter((x) => x.id !== req.params.id); hubo = d.items.length < n })
    if (!hubo) return res.status(404).json({ error: 'El correo ya no está en el reporte.' })
    res.json({ ok: true })
  })

  return r
}
