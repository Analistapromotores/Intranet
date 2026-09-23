/* Deseos de cumpleaños por defecto, cuando el gestor no escribió un mensaje propio. */
const DESEOS = [
  'Que este nuevo año llegue lleno de salud, alegría y muchos motivos para sonreír. Gracias por todo lo que aportas cada día al equipo.',
  'Hoy celebramos tu vida y tu energía. Que cada meta que te propongas se cumpla y que nunca falten las buenas noticias.',
  'Gracias por hacer más fácil y más alegre el trabajo de todos. Que este año te devuelva multiplicado todo lo bueno que das.',
  'Un año más de aprendizajes, logros y momentos compartidos. ¡Que lo disfrutes en grande con quienes más quieres!',
]

export function deseoPara(person) {
  if (person.message) return person.message
  const n = [...person.name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return DESEOS[n % DESEOS.length]
}

export const primerNombre = (nombre) => nombre.trim().split(/\s+/)[0]
