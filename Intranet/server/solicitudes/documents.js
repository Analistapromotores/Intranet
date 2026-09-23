/* Generación de documentos: copia la plantilla oficial de Excel y escribe cada dato en su celda.
   Se conservan formatos, encabezados, logos, celdas combinadas y configuración de impresión.
   Si la empresa actualiza un formato, basta con reemplazar el archivo en server/templates/
   y revisar este mapa de celdas. */
import ExcelJS from 'exceljs'
import path from 'node:path'
import { ROOT } from '../config.js'
import { MAX_BENEFICIOS, N_COMPETENCIAS, N_DOCUMENTOS, N_FUNCIONES, PORCENTAJES, SERVICIOS } from '../../shared/solicitudes.js'

const TEMPLATES = path.join(ROOT, 'server', 'templates')

/* Fecha ISO → Date en UTC para que Excel no la corra un día por la zona horaria. */
const fecha = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))

async function abrir(nombre) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path.join(TEMPLATES, nombre))
  return { wb, ws: wb.worksheets[0] }
}

/* Inserta la firma (PNG) dentro del rango de celdas indicado, sin deformarla. */
function firmar(wb, ws, dataUrl, { col, row, widthPx, heightPx }) {
  const base64 = String(dataUrl).replace(/^data:image\/png;base64,/, '')
  const id = wb.addImage({ base64, extension: 'png' })
  ws.addImage(id, { tl: { col, row }, ext: { width: widthPx, height: heightPx }, editAs: 'oneCell' })
}

/* ---------- FT-OP-10 Informe de Ingreso ---------- */
export async function informeIngreso(sol) {
  const d = sol.datos
  const { wb, ws } = await abrir('informe-ingreso.xlsx')
  const set = (celda, valor) => { ws.getCell(celda).value = valor }

  set('B6', fecha(d.fechaSolicitud))
  set('D6', sol.numero)
  set('D9', d.centroCosto)
  set('B10', d.nombre)
  set('D10', String(d.identificacion))
  set('B11', d.cargo)
  set('B12', String(d.telefono))
  set('D12', d.barrio)
  set('B13', d.correo)
  set('B14', d.direccion)
  set('B15', fecha(d.fechaIngreso))
  set('B18', num(d.salario))
  set('B19', num(d.auxilioTransporte))

  /* Beneficios: filas 23 a 25 (descripción en A:B combinadas, valor en C, periodicidad en D). */
  ;(d.beneficios || []).slice(0, MAX_BENEFICIOS).forEach((b, i) => {
    const fila = 23 + i
    set(`A${fila}`, b.descripcion)
    set(`C${fila}`, num(b.valor))
    set(`D${fila}`, b.periodicidad === 'Otro' ? b.periodicidadOtra : b.periodicidad)
  })

  set('C28', d.solicitanteNombre)
  set('C29', d.solicitanteCargo)
  /* C30:D30 firma · C31:D31 "Autorización GYS" queda vacío para quien autoriza. */
  /* Única concesión al formato: la fila de la firma crece para que la firma sea legible. */
  ws.getRow(30).height = 38
  if (d.firma) firmar(wb, ws, d.firma, { col: 2.3, row: 29.06, widthPx: 150, heightPx: 46 })
  set('B33', d.responsableNombre)
  set('B34', d.responsableCargo)

  return Buffer.from(await wb.xlsx.writeBuffer())
}

/* ---------- FT-OP-03 Orden de Servicio ---------- */
export async function ordenServicio(sol) {
  const d = sol.datos
  const { wb, ws } = await abrir('orden-servicio.xlsx')
  const set = (celda, valor) => { ws.getCell(celda).value = valor }

  set('D5', sol.numero)
  set('B8', fecha(d.fechaSolicitud))
  set('D8', fecha(d.fechaIngreso))
  set('B9', d.correo)
  set('B10', d.justificacion)

  set('B12', d.cargo)
  set('B13', d.ciudadSede)
  set('B14', num(d.cantidad))
  set('D14', num(d.salario))
  set('B15', d.tipoContratacion === 'Otro' ? d.tipoContratacionOtro : d.tipoContratacion)
  set('A17', d.adicionales || '')
  set('C18', d.horario)
  set('C19', d.formacion)
  set('C20', d.experiencia)
  set('C21', d.habilidades)
  for (let i = 0; i < N_COMPETENCIAS; i++) set(`C${22 + i}`, d.competencias?.[i] || '')
  for (let i = 0; i < N_DOCUMENTOS; i++) set(`C${26 + i}`, d.documentos?.[i] || '')
  for (let i = 0; i < N_FUNCIONES; i++) set(`A${30 + i}`, d.funciones?.[i] ? `${i + 1}. ${d.funciones[i]}` : '')

  /* Servicios complementarios: se marca con X en la celda junto a cada opción. */
  const celdaServicio = { reclutamiento: 'B36', assessment: 'D36', entrevista: 'B37', visita: 'D37', psicotecnicas: 'B38', conocimiento: 'D38', especificas: 'B39', otras: 'D39' }
  SERVICIOS.forEach(([k]) => {
    const c = ws.getCell(celdaServicio[k])
    c.value = d.servicios?.[k] ? 'X' : ''
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  /* Porcentajes: las celdas tienen formato 0 %, se guardan como fracción. */
  const celdaPct = { estudios: 'B41', pruebas: 'D41', experiencia: 'B42', entrevista: 'D42' }
  PORCENTAJES.forEach(([k]) => set(celdaPct[k], (Number(d.porcentajes?.[k]) || 0) / 100))

  /* El formato no tiene casilla de centro de costo: se deja al inicio de las observaciones. */
  const obs = [`Centro de costo: ${d.centroCosto}`, d.observaciones].filter(Boolean).join('\n')
  set('A45', obs)

  ws.getRow(49).height = 38
  if (d.firma) firmar(wb, ws, d.firma, { col: 1.15, row: 48.06, widthPx: 150, heightPx: 46 })
  set('B50', d.solicitanteNombre)
  set('B51', d.solicitanteCargo)
  /* B52 "Autorización GYS" queda vacío. */

  return Buffer.from(await wb.xlsx.writeBuffer())
}

export const GENERADORES = {
  informe_ingreso: { fn: informeIngreso, nombre: (s) => `FT-OP-10 Informe de Ingreso ${s.numero}.xlsx` },
  orden_servicio: { fn: ordenServicio, nombre: (s) => `FT-OP-03 Orden de Servicio ${s.numero}.xlsx` },
}
