import { iniciales } from './dates.js'

/* Foto de la persona o sus iniciales sobre un color estable. */
const FONDOS = ['#1769e8', '#e51d2a', '#0a4f9e', '#ff7a45', '#23b5d3', '#7c5cff']

export default function Avatar({ person, size = 64, className = '' }) {
  const fondo = FONDOS[[...person.name].reduce((a, c) => a + c.charCodeAt(0), 0) % FONDOS.length]
  return (
    <span className={`cb-avatar ${className}`} style={{ width: size, height: size, '--fondo': fondo, fontSize: size * 0.36 }}>
      {person.photo ? <img src={person.photo} alt="" width={size} height={size} loading="lazy" /> : iniciales(person.name)}
    </span>
  )
}
