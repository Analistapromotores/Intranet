/* Festivos oficiales de Colombia — vía la librería `colombian-holidays`.
   Se usa `celebrationDate` (la fecha realmente observada, ya trasladada al lunes
   cuando aplica la Ley Emiliani). Se añade una descripción breve por festivo. */
import { getHolidaysByYear } from 'colombian-holidays/getHolidaysByYear'

const DESCRIPTIONS = {
  'Año Nuevo': 'Primer día del año.',
  'Reyes Magos': 'Epifanía del Señor: visita de los Reyes Magos al niño Jesús.',
  'San José': 'Día de San José, esposo de la Virgen María y patrono de la Iglesia.',
  'Jueves Santo': 'Jueves de la Semana Santa: última cena de Jesús.',
  'Viernes Santo': 'Viernes de la Semana Santa: pasión y muerte de Jesús.',
  'Día del Trabajo': 'Día Internacional de los Trabajadores.',
  'Ascensión del Señor': 'Ascensión de Jesús al cielo, 40 días después de la Pascua.',
  'Corpus Christi': 'Solemnidad del Cuerpo y la Sangre de Cristo.',
  'Sagrado Corazón de Jesús': 'Solemnidad del Sagrado Corazón de Jesús.',
  'San Pedro y San Pablo': 'Solemnidad de los apóstoles San Pedro y San Pablo.',
  'Día de Nuestra Señora del Rosario de Chiquinquirá':
    'Advocación mariana patrona de Colombia.',
  'Grito de la Independencia': 'Conmemora el Grito de Independencia del 20 de julio de 1810.',
  'Batalla de Boyacá': 'Conmemora la batalla del 7 de agosto de 1819 que selló la independencia.',
  'Asunción de la Virgen': 'Asunción de la Virgen María a los cielos.',
  'Día de la Raza': 'Encuentro de dos mundos y diversidad étnica y cultural de la Nación.',
  'Todos los Santos': 'Día de Todos los Santos.',
  'Independencia de Cartagena': 'Conmemora la independencia de Cartagena del 11 de noviembre de 1811.',
  'Inmaculada Concepción': 'Solemnidad de la Inmaculada Concepción de la Virgen María.',
  Navidad: 'Natividad del Señor.',
}

const cache = {}

/* { 'AAAA-MM-DD': { name, description, moved, originalDate } } para el año dado. */
export function getColombianHolidays(year) {
  if (!cache[year]) {
    cache[year] = getHolidaysByYear(year).reduce((acc, h) => {
      acc[h.celebrationDate] = {
        name: h.name,
        description: DESCRIPTIONS[h.name] || 'Festivo nacional de Colombia.',
        moved: Boolean(h.nextMonday) && h.date !== h.celebrationDate,
        originalDate: h.date,
      }
      return acc
    }, {})
  }
  return cache[year]
}
