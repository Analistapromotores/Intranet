import { MESES, iniciales } from './dates.js'

/* Foto estilo polaroid: marco blanco, cinta adhesiva y un leve giro.
   Debajo, el nombre en cursiva y la fecha en letra manuscrita. */
const FONDOS = ['#1769e8', '#e51d2a', '#0a4f9e', '#ff7a45', '#23b5d3', '#7c5cff']

export default function Polaroid({ person, size = 'md', tilt = 0, caption = true, sticker, loading = 'lazy' }) {
  const fondo = FONDOS[[...person.name].reduce((a, c) => a + c.charCodeAt(0), 0) % FONDOS.length]
  const mes = MESES[person.month - 1]
  return (
    <figure className={`cb-polaroid cb-polaroid--${size}`} style={{ '--tilt': `${tilt}deg` }}>
      <span className="cb-polaroid__tape" aria-hidden="true" />
      <div className="cb-polaroid__photo" style={{ '--fondo': fondo }}>
        {person.photo ? <img src={person.photo} alt={`Foto de ${person.name}`} loading={loading} /> : <span aria-hidden="true">{iniciales(person.name)}</span>}
      </div>
      {sticker && <span className="cb-polaroid__sticker">{sticker}</span>}
      {caption && (
        <figcaption>
          <b>{person.name}</b>
          <span>{person.day} de {mes[0].toUpperCase() + mes.slice(1)}</span>
        </figcaption>
      )}
    </figure>
  )
}
