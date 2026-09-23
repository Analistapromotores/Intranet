/* Definición compartida de las solicitudes (navegador y servidor).
   Un solo lugar para tipos, estados, catálogos y reglas de validación:
   el formulario valida en tiempo real y el servidor vuelve a validar al recibir. */

export const ESTADOS = {
  borrador: { label: 'Borrador', tono: 'gris' },
  enviada: { label: 'Enviada', tono: 'azul' },
  en_proceso: { label: 'En proceso', tono: 'violeta' },
  pendiente: { label: 'Pendiente', tono: 'ambar' },
  aprobada: { label: 'Aprobada', tono: 'verde' },
  rechazada: { label: 'Rechazada', tono: 'rojo' },
  cerrada: { label: 'Cerrada', tono: 'gris' },
}

export const TIPOS = {
  informe_ingreso: {
    prefijo: 'II',
    nombre: 'Informe de Ingreso',
    categoria: 'Búsqueda de personal',
    asunto: 'Solicitud de Informe de Ingreso',
    documento: true,
  },
  orden_servicio: {
    prefijo: 'OS',
    nombre: 'Petición de Orden de Servicio',
    categoria: 'Búsqueda de personal',
    asunto: 'Solicitud de Orden de Servicio',
    documento: true,
  },
  prestamo_equipos: {
    prefijo: 'PE',
    nombre: 'Préstamo de equipos',
    categoria: 'Préstamo de equipos',
    asunto: 'Solicitud de Préstamo de Equipos',
    documento: false,
  },
}

export const PERIODICIDADES = ['Mensual', 'Quincenal', 'Semanal', 'Anual', 'Única', 'Otro']

export const TIPOS_CONTRATO = [
  'Término fijo',
  'Término indefinido',
  'Obra o labor',
  'Prestación de servicios',
  'Contrato de aprendizaje',
  'Otro',
]

export const SERVICIOS = [
  ['reclutamiento', 'Reclutamiento'],
  ['assessment', 'Assessment Center'],
  ['entrevista', 'Entrevista'],
  ['visita', 'Visita domiciliaria'],
  ['psicotecnicas', 'Pruebas psicotécnicas'],
  ['conocimiento', 'Pruebas de conocimiento'],
  ['especificas', 'Pruebas específicas'],
  ['otras', 'Otras'],
]

export const PORCENTAJES = [
  ['estudios', 'Estudios'],
  ['pruebas', 'Pruebas'],
  ['experiencia', 'Experiencia'],
  ['entrevista', 'Entrevista'],
]

export const EQUIPOS = [
  'Portátil',
  'Video Beam',
  'Tablet',
  'Parlante + micrófono + cava 30 litros',
  'Pendón',
  'Porta pendón araña',
  'Router',
  'Silla Rimax',
  'Extensión',
  'Llaves',
  'Bolsas',
  'Resma',
  'Otro',
]

/* Límites que impone la plantilla de Excel (filas disponibles). */
export const MAX_BENEFICIOS = 3
export const N_COMPETENCIAS = 4
export const N_DOCUMENTOS = 3
export const N_FUNCIONES = 5
export const MAX_EQUIPOS = 10

/* ---------- Reglas ---------- */
const texto = (v) => String(v ?? '').trim()
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

export function hoyISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function fechaValida(v) {
  if (!FECHA.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  const f = new Date(y, m - 1, d)
  return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d
}

const r = {
  req: (msg = 'Este campo es obligatorio.') => (v) => (texto(v) ? null : msg),
  min: (n) => (v) => (!texto(v) || texto(v).length >= n ? null : `Escribe al menos ${n} caracteres.`),
  max: (n) => (v) => (texto(v).length <= n ? null : `Máximo ${n} caracteres.`),
  email: (v) => (!texto(v) || EMAIL.test(texto(v)) ? null : 'Escribe un correo válido, por ejemplo nombre@empresa.com.'),
  tel: (v) => (!texto(v) || /^\+?\d{7,13}$/.test(texto(v).replace(/[\s-]/g, '')) ? null : 'Escribe un número de 7 a 13 dígitos.'),
  doc: (v) => (!texto(v) || /^[0-9A-Za-z]{5,15}$/.test(texto(v).replace(/[.\s-]/g, '')) ? null : 'Escribe un documento válido (5 a 15 caracteres, sin puntos).'),
  fecha: (v) => (!texto(v) || fechaValida(texto(v)) ? null : 'Fecha no válida.'),
  dinero: (v) => (v === '' || v === null || v === undefined || (Number.isInteger(Number(v)) && Number(v) >= 0) ? null : 'Escribe un valor en pesos.'),
  dineroReq: (v) => (v === '' || v === null || v === undefined ? 'Este campo es obligatorio.' : null),
  positivo: (v) => (Number(v) > 0 ? null : 'Debe ser mayor que cero.'),
  entero: (v) => (texto(v) === '' || (Number.isInteger(Number(v)) && Number(v) > 0) ? null : 'Escribe un número entero mayor que cero.'),
  firma: (v) => (/^data:image\/png;base64,/.test(String(v || '')) ? null : 'Firma en el recuadro para continuar.'),
}

function check(errors, path, value, ...rules) {
  for (const rule of rules) {
    const e = rule(value)
    if (e) {
      errors[path] = e
      return
    }
  }
}

function comunes(errors, d) {
  check(errors, 'mensajeCorreo', d.mensajeCorreo, r.req('Escribe el mensaje que recibirá gerencia.'), r.min(10), r.max(3000))
}

/* ---------- Informe de Ingreso ---------- */
function validarInforme(d) {
  const e = {}
  check(e, 'fechaSolicitud', d.fechaSolicitud, r.req(), r.fecha)
  check(e, 'nombre', d.nombre, r.req(), r.min(5), r.max(90))
  check(e, 'identificacion', d.identificacion, r.req(), r.doc)
  check(e, 'centroCosto', d.centroCosto, r.req(), r.max(80))
  check(e, 'cargo', d.cargo, r.req(), r.max(80))
  check(e, 'telefono', d.telefono, r.req(), r.tel)
  check(e, 'barrio', d.barrio, r.req(), r.max(60))
  check(e, 'correo', d.correo, r.req(), r.email)
  check(e, 'direccion', d.direccion, r.req(), r.max(120))
  check(e, 'fechaIngreso', d.fechaIngreso, r.req(), r.fecha)
  check(e, 'salario', d.salario, r.dineroReq, r.dinero, r.positivo)
  check(e, 'auxilioTransporte', d.auxilioTransporte, r.dineroReq, r.dinero)
  const ben = Array.isArray(d.beneficios) ? d.beneficios : []
  if (ben.length > MAX_BENEFICIOS) e.beneficios = `Máximo ${MAX_BENEFICIOS} beneficios (espacio del formato).`
  ben.forEach((b, i) => {
    check(e, `beneficios.${i}.descripcion`, b.descripcion, r.req(), r.max(80))
    check(e, `beneficios.${i}.valor`, b.valor, r.dineroReq, r.dinero, r.positivo)
    check(e, `beneficios.${i}.periodicidad`, b.periodicidad, r.req('Elige la periodicidad.'))
    if (b.periodicidad === 'Otro') check(e, `beneficios.${i}.periodicidadOtra`, b.periodicidadOtra, r.req('Especifica la periodicidad.'), r.max(30))
  })
  check(e, 'solicitanteNombre', d.solicitanteNombre, r.req(), r.min(5), r.max(90))
  check(e, 'solicitanteCargo', d.solicitanteCargo, r.req(), r.max(80))
  check(e, 'solicitanteCorreo', d.solicitanteCorreo, r.req('Lo usamos para que puedas consultar tu solicitud.'), r.email)
  check(e, 'firma', d.firma, r.firma)
  check(e, 'responsableNombre', d.responsableNombre, r.req(), r.min(5), r.max(90))
  check(e, 'responsableCargo', d.responsableCargo, r.req(), r.max(80))
  comunes(e, d)
  return e
}

/* ---------- Petición de Orden de Servicio ---------- */
function validarOrden(d) {
  const e = {}
  check(e, 'fechaSolicitud', d.fechaSolicitud, r.req(), r.fecha)
  check(e, 'fechaIngreso', d.fechaIngreso, r.req(), r.fecha)
  if (!e.fechaIngreso && !e.fechaSolicitud && d.fechaIngreso < d.fechaSolicitud) e.fechaIngreso = 'La fecha de ingreso no puede ser anterior a la fecha de solicitud.'
  check(e, 'correo', d.correo, r.req(), r.email)
  check(e, 'centroCosto', d.centroCosto, r.req(), r.max(80))
  check(e, 'justificacion', d.justificacion, r.req(), r.min(20), r.max(600))
  check(e, 'cargo', d.cargo, r.req(), r.max(80))
  check(e, 'ciudadSede', d.ciudadSede, r.req(), r.max(80))
  check(e, 'cantidad', d.cantidad, r.req(), r.entero)
  check(e, 'salario', d.salario, r.dineroReq, r.dinero, r.positivo)
  check(e, 'tipoContratacion', d.tipoContratacion, r.req('Elige el tipo de contratación.'))
  if (d.tipoContratacion === 'Otro') check(e, 'tipoContratacionOtro', d.tipoContratacionOtro, r.req('Especifica el tipo de contratación.'), r.max(60))
  check(e, 'adicionales', d.adicionales, r.max(300))
  check(e, 'horario', d.horario, r.req(), r.max(160))
  check(e, 'formacion', d.formacion, r.req(), r.max(160))
  check(e, 'experiencia', d.experiencia, r.req(), r.max(80))
  check(e, 'habilidades', d.habilidades, r.req(), r.max(200))
  for (let i = 0; i < N_COMPETENCIAS; i++) check(e, `competencias.${i}`, d.competencias?.[i], r.req('Relaciona al menos 4 competencias.'), r.max(90))
  for (let i = 0; i < N_DOCUMENTOS; i++) check(e, `documentos.${i}`, d.documentos?.[i], r.max(90))
  for (let i = 0; i < N_FUNCIONES; i++) {
    const rules = i < 4 ? [r.req('Relaciona al menos 4 responsabilidades.'), r.max(200)] : [r.max(200)]
    check(e, `funciones.${i}`, d.funciones?.[i], ...rules)
  }
  const total = PORCENTAJES.reduce((s, [k]) => s + (Number(d.porcentajes?.[k]) || 0), 0)
  PORCENTAJES.forEach(([k]) => {
    const v = d.porcentajes?.[k]
    if (v !== '' && v !== undefined && v !== null && (!Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) > 100)) e[`porcentajes.${k}`] = 'Entre 0 y 100.'
  })
  if (total !== 100) e.porcentajes = `Los porcentajes deben sumar 100 %. Ahora suman ${total} %.`
  check(e, 'observaciones', d.observaciones, r.max(600))
  check(e, 'solicitanteNombre', d.solicitanteNombre, r.req(), r.min(5), r.max(90))
  check(e, 'solicitanteCargo', d.solicitanteCargo, r.req(), r.max(80))
  check(e, 'firma', d.firma, r.firma)
  comunes(e, d)
  return e
}

/* ---------- Préstamo de equipos ---------- */
function validarPrestamo(d) {
  const e = {}
  check(e, 'nombre', d.nombre, r.req(), r.min(5), r.max(90))
  check(e, 'cargo', d.cargo, r.req(), r.max(80))
  check(e, 'documento', d.documento, r.req(), r.doc)
  check(e, 'celular', d.celular, r.req(), r.tel)
  check(e, 'correo', d.correo, r.req('Lo usamos para que puedas consultar tu solicitud.'), r.email)
  check(e, 'area', d.area, r.req(), r.max(80))
  const items = Array.isArray(d.equipos) ? d.equipos : []
  if (!items.length) e.equipos = 'Agrega al menos un equipo o elemento.'
  if (items.length > MAX_EQUIPOS) e.equipos = `Máximo ${MAX_EQUIPOS} elementos por solicitud.`
  items.forEach((it, i) => {
    check(e, `equipos.${i}.tipo`, it.tipo, r.req('Elige el equipo o elemento.'))
    if (it.tipo === 'Otro') check(e, `equipos.${i}.otro`, it.otro, r.req('Especifica el equipo o elemento.'), r.max(60))
    check(e, `equipos.${i}.cantidad`, it.cantidad, r.req(), r.entero)
  })
  check(e, 'fechaRequerida', d.fechaRequerida, r.req(), r.fecha)
  check(e, 'fechaDevolucion', d.fechaDevolucion, r.req(), r.fecha)
  if (!e.fechaRequerida && !e.fechaDevolucion && d.fechaDevolucion < d.fechaRequerida) e.fechaDevolucion = 'La devolución no puede ser anterior a la fecha en que requieres el equipo.'
  check(e, 'observacion', d.observacion, r.max(600))
  return e
}

export const VALIDADORES = {
  informe_ingreso: validarInforme,
  orden_servicio: validarOrden,
  prestamo_equipos: validarPrestamo,
}

export function validar(tipo, datos) {
  const fn = VALIDADORES[tipo]
  return fn ? fn(datos || {}) : { tipo: 'Tipo de solicitud desconocido.' }
}

/* Avisos que no bloquean el envío (por ejemplo, fechas en el pasado). */
export function advertencias(tipo, d, hoy = hoyISO()) {
  const w = {}
  if (tipo === 'prestamo_equipos' && fechaValida(String(d.fechaRequerida || '')) && d.fechaRequerida < hoy) w.fechaRequerida = 'Esta fecha ya pasó. Revisa que sea correcta.'
  if (tipo === 'informe_ingreso' && fechaValida(String(d.fechaIngreso || '')) && d.fechaIngreso < hoy) w.fechaIngreso = 'La fecha probable de ingreso ya pasó.'
  return w
}

/* Formato de pesos colombianos: $ 1.000.000 */
export function formatoPesos(n) {
  if (n === '' || n === null || n === undefined || Number.isNaN(Number(n))) return ''
  return `$ ${Math.round(Number(n)).toLocaleString('es-CO')}`
}

export function formatoFecha(iso) {
  if (!iso || !FECHA.test(iso)) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
