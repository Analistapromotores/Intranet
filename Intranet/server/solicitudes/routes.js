/* API de Solicitudes: registro público, consulta por el solicitante y gestión con sesión. */
import express from 'express'
import crypto from 'node:crypto'
import { MAIL, URL_GLPI, destinatario } from '../config.js'
import { dataPath, readBlob, readJson, saveBlob, update } from '../store.js'
import { ESTADOS, TIPOS, validar } from '../../shared/solicitudes.js'
import { GENERADORES } from './documents.js'
import { componerCorreo, resumen } from './email.js'
import { limitador } from '../seguridad.js'
import { MOTIVOS } from '../../shared/salas.js'
import { CASOS_INCAPACIDAD, MIME_POR_EXTENSION, extensionDe } from '../../shared/incapacidades.js'
import { enviar, smtpActivo } from './mailer.js'
import { actualizarCelda, hojaActiva, registrarFila } from './sheets.js'

const FILE = dataPath('solicitudes.json')

/* Estructura en disco: { consecutivos: { 'II-2026': 3 }, items: [ solicitud ] } */
const VACIO = { consecutivos: {}, items: [] }

const correoDe = (sol) => String(sol.tipo === 'informe_ingreso' ? sol.datos.solicitanteCorreo : sol.datos.correo).toLowerCase()
const solicitanteDe = (sol) => (sol.tipo === 'prestamo_equipos' || sol.tipo === 'incapacidad' ? sol.datos.nombre : sol.datos.solicitanteNombre)

/* Cédulas con las que se puede encontrar una solicitud en «Mis solicitudes»: siempre la de quien la envía.
   (En el informe de ingreso la «identificación» es la de la persona seleccionada, no la de quien solicita.) */
const cedulasDe = (sol) => {
  const d = sol.datos || {}
  if (sol.tipo === 'prestamo_equipos') return [d.documento]
  if (sol.tipo === 'incapacidad') return [d.identificacion]
  if (sol.tipo === 'ausentismo') return [d.solicitanteDocumento, ...(d.colaboradores || []).map((c) => c.identificacion)]
  return [d.solicitanteDocumento]
}

function titulo(sol) {
  const d = sol.datos
  if (sol.tipo === 'informe_ingreso') return `${d.nombre} · ${d.cargo}`
  if (sol.tipo === 'orden_servicio') return `${d.cantidad} × ${d.cargo}`
  if (sol.tipo === 'ausentismo') return `${MOTIVOS.find(([k]) => k === d.motivo)?.[1] || 'Ausentismo'} · ${(d.colaboradores || []).map((c) => c.nombre).join(', ')}`
  if (sol.tipo === 'incapacidad') return CASOS_INCAPACIDAD.find((c) => c.id === d.caso)?.titulo || 'Incapacidad o licencia'
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
  correo: s.correo ? { estado: s.correo.estado, to: s.correo.to, fecha: s.correo.fecha, canal: s.correo.canal } : null,
  historial: s.historial.map(({ estado, fecha, comentario }) => ({ estado, fecha, comentario })),
})

const vistaGestion = (s) => {
  const datos = { ...s.datos }
  delete datos.firma
  datos.anexos = (datos.anexos || []).map(({ nombre, tamano }) => ({ nombre, tamano }))
  if (!datos.anexos.length) delete datos.anexos
  return { ...vistaPublica(s), solicitante: solicitanteDe(s), correoSolicitante: correoDe(s), datos, archivo: Boolean(s.archivo), correo: s.correo, historial: s.historial }
}

/* ---------- Registro en Google Sheets (reemplaza al correo cuando hay hoja configurada) ---------- */
const PESTANA = { informe_ingreso: 'Informe de Ingreso', orden_servicio: 'Orden de Servicio', prestamo_equipos: 'Prestamo de equipos', ausentismo: 'Ausentismo', incapacidad: 'Incapacidades' }
const COL_ESTADO = 1

function filaHoja(sol) {
  const datos = resumen(sol).filter(([k]) => k !== 'Solicitud No.' && k !== 'Tipo')
  const mensaje = sol.datos.mensajeCorreo || sol.datos.cuerpo || ''
  return {
    encabezados: ['Solicitud No.', 'Estado', 'Mensaje del solicitante', 'Correo del solicitante', ...datos.map(([k]) => k), 'Formato Excel'],
    fila: [sol.numero, ESTADOS[sol.estado]?.label || sol.estado, mensaje, correoDe(sol), ...datos.map(([, v]) => v), TIPOS[sol.tipo].documento ? 'Se descarga desde Gestión de solicitudes' : ''],
  }
}

async function registrarEnHoja(sol) {
  const fecha = new Date().toISOString()
  try {
    const { encabezados, fila } = filaHoja(sol)
    await registrarFila(PESTANA[sol.tipo], encabezados, fila)
    return { estado: 'enviado', to: 'Hoja de solicitudes (Google Sheets)', fecha, canal: 'hoja' }
  } catch (e) {
    return { estado: 'error', to: 'Hoja de solicitudes (Google Sheets)', fecha, canal: 'hoja', detalle: e.message }
  }
}

/* ---------- Anexos (archivos que adjunta quien envía ausentismo o incapacidades) ---------- */
const FIRMAS = {
  pdf: (b) => b.subarray(0, 4).toString('latin1') === '%PDF',
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  zip: (b) => b[0] === 0x50 && b[1] === 0x4b, // docx y xlsx son archivos zip
  ole: (b) => b.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0])), // doc y xls antiguos
}
const FIRMA_DE = { pdf: 'pdf', png: 'png', jpg: 'jpg', jpeg: 'jpg', webp: 'webp', docx: 'zip', xlsx: 'zip', doc: 'ole', xls: 'ole' }
const nombreSeguro = (n) => String(n).normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\w.-]+/g, '_').slice(-80)

/* Comprueba la firma real de cada archivo y lo guarda; devuelve los datos sin el contenido. */
async function guardarAnexos(id, anexos) {
  const guardados = []
  for (const [i, a] of (anexos || []).entries()) {
    const ext = extensionDe(a.nombre)
    const buf = Buffer.from(String(a.datos), 'base64')
    if (!FIRMAS[FIRMA_DE[ext]]?.(buf)) {
      const e = new Error('Archivo no válido')
      e.fields = { anexos: `«${a.nombre}» no parece ser un archivo ${ext.toUpperCase()} válido.` }
      throw e
    }
    const ruta = `${id}-${i}-${nombreSeguro(a.nombre)}`
    await saveBlob(`solicitudes/anexos/${ruta}`, buf, MIME_POR_EXTENSION[ext])
    guardados.push({ nombre: String(a.nombre).slice(0, 120), tamano: buf.length, mime: MIME_POR_EXTENSION[ext], ruta })
  }
  return guardados
}

/* Genera documento y registro (hoja o correo); guarda el resultado en la solicitud. */
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
    await saveBlob(`solicitudes/${archivo.ruta}`, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    attachments.push({ filename: archivo.nombre, content: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  /* Ausentismo e incapacidades siempre van por correo al buzón de incapacidades (con anexos); si hay hoja, además se anotan allí. */
  let correo
  if (tipo.anexos) {
    for (const a of sol.datos.anexos || []) {
      const blob = await readBlob(`solicitudes/anexos/${a.ruta}`)
      if (blob) attachments.push({ filename: a.nombre, content: blob.data, contentType: a.mime })
    }
    const texto = componerCorreo(sol, { modo: MAIL.modo })
    const enlaces = (sol.datos.enlaces || []).map((u) => String(u).trim())
    if (enlaces.length) {
      texto.text += `\n\nEnlaces:\n${enlaces.join('\n')}`
      texto.html = texto.html.replace('</body>', `<p style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;padding:0 24px 24px"><b>Enlaces:</b><br>${enlaces.map((u) => `<a href="${u.replace(/"/g, '%22')}">${u.replace(/</g, '&lt;')}</a>`).join('<br>')}</p></body>`)
    }
    correo = await enviar({ id: sol.numero, to: destinatario(sol.tipo), replyTo: correoDe(sol), attachments, ...texto })
    if (hojaActiva) await registrarEnHoja(sol).catch(() => {})
  } else {
    correo = hojaActiva
      ? await registrarEnHoja(sol)
      : await enviar({ id: sol.numero, to: destinatario(sol.tipo), replyTo: correoDe(sol), attachments, ...componerCorreo(sol, { modo: MAIL.modo }) })
  }

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
    res.json({ glpiUrl: URL_GLPI, canal: hojaActiva ? 'hoja' : 'correo', modoCorreo: MAIL.modo, destino: { informe_ingreso: destinatario('informe_ingreso'), orden_servicio: destinatario('orden_servicio'), prestamo_equipos: destinatario('prestamo_equipos'), ausentismo: destinatario('ausentismo'), incapacidad: destinatario('incapacidad') }, smtp: smtpActivo })
  })

  /* Registrar una solicitud */
  r.post('/solicitudes/:tipo', async (req, res) => {
    const tipo = req.params.tipo
    if (!Object.hasOwn(TIPOS, tipo)) return res.status(404).json({ error: 'Tipo de solicitud desconocido.' })
    if (limitado(req.ip)) return res.status(429).json({ error: 'Has enviado muchas solicitudes seguidas. Intenta más tarde.' })
    let datos = req.body || {}
    const errores = validar(tipo, datos)
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa los campos marcados.', fields: errores })

    const id = crypto.randomUUID()
    if (TIPOS[tipo].anexos) {
      try {
        datos = { ...datos, anexos: await guardarAnexos(id, datos.anexos), enlaces: (datos.enlaces || []).map((u) => String(u).trim()) }
      } catch (e) {
        if (e.fields) return res.status(400).json({ error: 'Revisa los archivos anexos.', fields: e.fields })
        throw e
      }
    } else {
      delete datos.anexos
      delete datos.enlaces
    }

    const ahora = new Date().toISOString()
    const sol = await update(FILE, VACIO, (db) => {
      const serie = `${TIPOS[tipo].prefijo}-${new Date().getFullYear()}`
      db.consecutivos[serie] = (db.consecutivos[serie] || 0) + 1
      const s = {
        id,
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
  const consultas = limitador({ ventana: 10 * 60e3, max: 60 })
  r.get('/solicitudes/consulta', consultas, async (req, res) => {
    /* Búsqueda por cédula o por correo (cualquiera de los dos): devuelve todas las solicitudes de esa persona. */
    const dato = String(req.query.dato || '').trim().slice(0, 120)
    if (dato) {
      const esCorreo = dato.includes('@')
      const limpio = (v) => String(v ?? '').replace(/[^0-9a-z]/gi, '').toLowerCase()
      const buscado = esCorreo ? dato.toLowerCase() : limpio(dato)
      if (!esCorreo && buscado.length < 5) return res.status(400).json({ error: 'Escribe tu número de cédula completo o tu correo.' })
      const { items } = await readJson(FILE, VACIO)
      const propias = items.filter((s) => (esCorreo ? correoDe(s) === buscado : cedulasDe(s).some((v) => v && limpio(v) === buscado)))
      if (!propias.length) return res.status(404).json({ error: 'No encontramos solicitudes con ese dato.' })
      return res.json(propias.slice().reverse().slice(0, 50).map(vistaPublica))
    }
    const numero = String(req.query.numero || '').trim().toUpperCase()
    const correo = String(req.query.correo || '').trim().toLowerCase()
    if (!numero || !correo) return res.status(400).json({ error: 'Escribe el número de solicitud y tu correo.' })
    const { items } = await readJson(FILE, VACIO)
    const sol = items.find((s) => s.numero === numero && correoDe(s) === correo)
    if (!sol) return res.status(404).json({ error: 'No encontramos una solicitud con ese número y correo.' })
    res.json(vistaPublica(sol))
  })

  /* Todas las solicitudes de un correo (historial del solicitante). */
  r.get('/solicitudes/mias', consultas, async (req, res) => {
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
    if (hojaActiva) actualizarCelda(PESTANA[sol.tipo], sol.numero, COL_ESTADO, ESTADOS[estado].label).catch((e) => console.warn('[hoja] no se actualizó el estado:', e.message))
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

  r.get('/admin/solicitudes/:id/anexos/:n', requireAuth, async (req, res) => {
    const { items } = await readJson(FILE, VACIO)
    const a = items.find((s) => s.id === req.params.id)?.datos?.anexos?.[Number(req.params.n)]
    if (!a) return res.status(404).json({ error: 'El anexo no existe.' })
    const blob = await readBlob(`solicitudes/anexos/${a.ruta}`)
    if (!blob) return res.status(404).json({ error: 'El anexo ya no está disponible.' })
    res.set({ 'Content-Type': a.mime || 'application/octet-stream', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(a.nombre)}`, 'X-Content-Type-Options': 'nosniff' })
    res.send(blob.data)
  })

  r.get('/admin/solicitudes/:id/archivo', requireAuth, async (req, res) => {
    const { items } = await readJson(FILE, VACIO)
    const sol = items.find((s) => s.id === req.params.id)
    if (!sol?.archivo) return res.status(404).json({ error: 'Esta solicitud no tiene archivo.' })
    const blob = await readBlob(`solicitudes/${sol.archivo.ruta}`)
    if (!blob) return res.status(404).json({ error: 'El archivo ya no está disponible. Usa «reenviar» para regenerarlo.' })
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(sol.archivo.nombre)}`,
    })
    res.send(blob.data)
  })

  return r
}
