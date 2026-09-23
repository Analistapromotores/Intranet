/* Utilidades de fechas de cumpleaños. Solo se usan día y mes: el año nunca se publica. */

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const bisiesto = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

/* Fecha en que se celebra este año (29 de febrero → 28 en años no bisiestos). */
function celebracion(p, year) {
  const day = p.month === 2 && p.day === 29 && !bisiesto(year) ? 28 : p.day
  return new Date(year, p.month - 1, day)
}

const soloFecha = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/* Días que faltan para el próximo cumpleaños (0 = hoy). */
export function diasPara(p, hoy = new Date()) {
  const base = soloFecha(hoy)
  let next = celebracion(p, base.getFullYear())
  if (next < base) next = celebracion(p, base.getFullYear() + 1)
  return Math.round((next - base) / 86400e3)
}

export const esHoy = (p, hoy = new Date()) => diasPara(p, hoy) === 0

export const fechaCorta = (p) => `${p.day} de ${MESES[p.month - 1]}`

export function textoFaltan(dias) {
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

export function iniciales(nombre) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export const ordenarPorProximo = (lista, hoy = new Date()) =>
  [...lista].sort((a, b) => diasPara(a, hoy) - diasPara(b, hoy) || a.name.localeCompare(b.name, 'es'))
