/* Reserva de salas y ausentismo laboral: reglas compartidas por el navegador y el servidor. */

/* Salas disponibles. Para agregar una, suma un objeto aquí (id único y color). */
export const SALAS = [
  { id: 'piso2', nombre: 'Sala piso 2', piso: 'Piso 2', color: '#b3121c' },
]

/* Horario en que se pueden reservar las salas. */
export const HORA_APERTURA = 7
export const HORA_CIERRE = 19

const FECHA = /^\d{4}-\d{2}-\d{2}$/
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const t = (v) => String(v ?? '').trim()
export const minutos = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b }
export const seCruzan = (a, b) => a.sala === b.sala && a.fecha === b.fecha && minutos(a.inicio) < minutos(b.fin) && minutos(b.inicio) < minutos(a.fin)

export function validarReserva(d, hoy) {
  const e = {}
  if (!t(d.colaborador)) e.colaborador = 'Escribe tu correo.'
  else if (!EMAIL.test(t(d.colaborador))) e.colaborador = 'Correo no válido.'
  if (!t(d.nombre) || t(d.nombre).length < 3) e.nombre = 'Escribe tu nombre.'
  if (!SALAS.some((s) => s.id === d.sala)) e.sala = 'Elige la sala.'
  if (!FECHA.test(t(d.fecha))) e.fecha = 'Elige la fecha.'
  else if (hoy && d.fecha < hoy) e.fecha = 'La fecha ya pasó.'
  if (!HORA.test(t(d.inicio))) e.inicio = 'Elige la hora de inicio.'
  if (!HORA.test(t(d.fin))) e.fin = 'Elige la hora de fin.'
  if (!e.inicio && !e.fin) {
    if (minutos(d.fin) <= minutos(d.inicio)) e.fin = 'Debe ser posterior a la hora de inicio.'
    else if (minutos(d.inicio) < HORA_APERTURA * 60 || minutos(d.fin) > HORA_CIERRE * 60) e.fin = `Las salas se reservan entre ${HORA_APERTURA}:00 y ${HORA_CIERRE}:00.`
  }
  if (!t(d.descripcion)) e.descripcion = 'Cuéntanos para qué es la reunión.'
  else if (t(d.descripcion).length > 160) e.descripcion = 'Máximo 160 caracteres.'
  return e
}

/* ---------- Ausentismo laboral (FT-OP-76) ---------- */
export const MOTIVOS = [
  ['cita', 'Cita médica'],
  ['diligencia', 'Diligencia personal'],
  ['calamidad', 'Calamidad doméstica'],
  ['empresarial', 'Empresarial'],
  ['licencia', 'Licencia'],
]
export const MAX_COLABORADORES = 5

export function validarAusentismo(d) {
  const e = {}
  if (!FECHA.test(t(d.fechaSolicitud))) e.fechaSolicitud = 'Elige la fecha de solicitud.'
  if (!MOTIVOS.some(([k]) => k === d.motivo)) e.motivo = 'Elige el motivo del ausentismo.'
  if (!t(d.descripcion)) e.descripcion = 'Describe el ausentismo.'
  else if (t(d.descripcion).length > 250) e.descripcion = 'Máximo 250 caracteres.'
  if (d.soporte !== 'si' && d.soporte !== 'no') e.soporte = 'Indica si hay soporte.'
  if (!FECHA.test(t(d.fechaInicio))) e.fechaInicio = 'Elige la fecha de inicio.'
  if (!FECHA.test(t(d.fechaFin))) e.fechaFin = 'Elige la fecha de fin.'
  if (d.horaInicio && !HORA.test(d.horaInicio)) e.horaInicio = 'Hora no válida.'
  if (d.horaFin && !HORA.test(d.horaFin)) e.horaFin = 'Hora no válida.'
  if (!e.fechaInicio && !e.fechaFin) {
    const ini = `${d.fechaInicio} ${d.horaInicio || '00:00'}`
    const fin = `${d.fechaFin} ${d.horaFin || '23:59'}`
    if (fin < ini) e.fechaFin = 'El fin no puede ser anterior al inicio.'
  }
  if (!t(d.empresa)) e.empresa = 'Escribe la empresa usuaria.'
  const cols = Array.isArray(d.colaboradores) ? d.colaboradores : []
  if (!cols.length) e.colaboradores = 'Agrega al menos un colaborador.'
  if (cols.length > MAX_COLABORADORES) e.colaboradores = `Máximo ${MAX_COLABORADORES} colaboradores por formato.`
  cols.forEach((c, i) => {
    if (!t(c.nombre) || t(c.nombre).length < 5) e[`colaboradores.${i}.nombre`] = 'Escribe nombres y apellidos.'
    if (!/^[0-9A-Za-z]{5,15}$/.test(t(c.identificacion).replace(/[.\s-]/g, ''))) e[`colaboradores.${i}.identificacion`] = 'Identificación no válida.'
    if (!t(c.cargo)) e[`colaboradores.${i}.cargo`] = 'Escribe el cargo.'
  })
  if (t(d.observaciones).length > 400) e.observaciones = 'Máximo 400 caracteres.'
  if (!t(d.jefe)) e.jefe = 'Escribe el nombre del jefe inmediato.'
  return e
}
