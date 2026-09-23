import { useCallback, useEffect, useRef, useState } from 'react'
import { IconCake, IconCheck } from '../../components/Icons.jsx'
import { api, deseoGuardado, guardarDeseo } from './api.js'
import Polaroid from './Polaroid.jsx'
import { deseoPara, primerNombre } from './wishes.js'
import { IconHeart, IconMessage, IconSend } from './icons.jsx'

const COLORES = ['#e51d2a', '#1769e8', '#ffb020', '#23b5d3', '#ff7a45', '#7c5cff']
const NOTAS = ['#fff4c2', '#ffe1e3', '#dff0ff', '#e6f7e9', '#f1e6ff']

/* Explosión de confeti, corazones y estrellas que sale del botón. */
function Rafaga() {
  return (
    <span className="cb-burst" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => {
        const ang = (i / 30) * 360 + (i % 3) * 7
        const dist = 90 + ((i * 37) % 90)
        const tipo = i % 5 === 0 ? 'heart' : i % 4 === 0 ? 'star' : 'bit'
        return (
          <i
            key={i}
            className={`cb-burst__p cb-burst__p--${tipo}`}
            style={{ '--a': `${ang}deg`, '--d': `${dist}px`, '--c': COLORES[i % COLORES.length], '--r': `${(i * 53) % 360}deg`, '--t': `${0.7 + (i % 4) * 0.12}s` }}
          />
        )
      })}
      <b className="cb-burst__plus">+1</b>
    </span>
  )
}

function textoConteo(n, nombre) {
  if (!n) return `Sé la primera persona en felicitar a ${nombre}`
  return n === 1 ? '1 felicitación' : `${n} felicitaciones`
}

export default function BirthdayPost({ person, reverse = false, index = 0, onCelebrate }) {
  const nombre = primerNombre(person.name)
  const [count, setCount] = useState(person.wishes || 0)
  const [mio, setMio] = useState(() => deseoGuardado(person.id))
  const [rafagas, setRafagas] = useState([])
  const [muro, setMuro] = useState([])
  const [firma, setFirma] = useState({ name: '', message: '' })
  const [estado, setEstado] = useState('') // '', 'enviando', 'firmado', error
  const [enviando, setEnviando] = useState(false)
  const timers = useRef([])

  const cargarMuro = useCallback(() => {
    api.deseos(person.id).then((r) => { setMuro(r.messages); setCount(r.count) }).catch(() => {})
  }, [person.id])
  useEffect(() => {
    cargarMuro()
    const t = setInterval(cargarMuro, 30000)
    return () => clearInterval(t)
  }, [cargarMuro])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function explotar() {
    const id = Date.now()
    setRafagas((r) => [...r, id])
    timers.current.push(setTimeout(() => setRafagas((r) => r.filter((x) => x !== id)), 1500))
    onCelebrate?.()
  }

  async function felicitar() {
    explotar()
    if (mio || enviando) return
    setEnviando(true)
    setCount((c) => c + 1)
    try {
      const r = await api.felicitar(person.id)
      const datos = { id: r.id, key: r.key }
      guardarDeseo(person.id, datos)
      setMio(datos)
      setCount(r.count)
    } catch (e) {
      setCount((c) => c - 1)
      setEstado(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function firmar(e) {
    e.preventDefault()
    if (!firma.message.trim()) return setEstado('Escribe un mensaje corto para el muro.')
    setEstado('enviando')
    try {
      await api.firmarDeseo(person.id, mio.id, { ...firma, key: mio.key })
      const datos = { ...mio, firmado: true }
      guardarDeseo(person.id, datos)
      setMio(datos)
      setEstado('firmado')
      explotar()
      cargarMuro()
    } catch (err) {
      setEstado(err.message)
    }
  }

  return (
    <article className={`cb-post ${reverse ? 'cb-post--reverse' : ''}`} style={{ '--i': index }} aria-labelledby={`cb-post-${person.id}`}>
      <div className="cb-post__media">
        <span className="cb-post__glow" aria-hidden="true" />
        <Polaroid person={person} size="xl" tilt={reverse ? 3 : -3} caption={false} sticker="¡Hoy!" loading="eager" />
      </div>

      <div className="cb-post__body">
        <p className="cb-post__kicker"><IconCake width={18} height={18} /> Gestión y Servicios celebra</p>
        <h2 id={`cb-post-${person.id}`} className="cb-post__title">
          ¡Feliz cumpleaños, <span>{nombre}!</span>
        </h2>
        <p className="cb-post__who">
          <b>{person.name}</b>
          {(person.cargo || person.area) && <> · {[person.cargo, person.area].filter(Boolean).join(' · ')}</>}
        </p>
        <blockquote className="cb-post__wish">{deseoPara(person)}</blockquote>

        <div className="cb-wish">
          <button type="button" className={`cb-wish__btn ${mio ? 'is-sent' : ''}`} onClick={felicitar} aria-live="polite">
            {rafagas.map((id) => <Rafaga key={id} />)}
            <span className="cb-wish__icon">{mio ? <IconCheck width={24} height={24} /> : <IconHeart width={24} height={24} />}</span>
            <span className="cb-wish__label">
              {mio ? <>¡Felicitación enviada!<small>Toca otra vez para más confeti</small></> : <>Toca para felicitar a {nombre}<small>Tu saludo le llega al instante</small></>}
            </span>
          </button>
          <p className="cb-wish__count" key={count}><IconHeart width={16} height={16} /> {textoConteo(count, nombre)}</p>
        </div>

        {estado && estado !== 'enviando' && estado !== 'firmado' && <p className="cb-alert cb-alert--error" role="alert">{estado}</p>}

        {mio && !mio.firmado && (
          <form className="cb-sign" onSubmit={firmar}>
            <p className="cb-sign__title"><IconMessage width={18} height={18} /> Déjale un mensaje en su muro <small>(opcional)</small></p>
            <div className="cb-sign__row">
              <label className="cb-field">
                <span className="cb-sr">Tu nombre</span>
                <input value={firma.name} onChange={(e) => setFirma((f) => ({ ...f, name: e.target.value }))} placeholder="Tu nombre" maxLength={40} autoComplete="name" />
              </label>
              <label className="cb-field cb-sign__msg">
                <span className="cb-sr">Mensaje</span>
                <input value={firma.message} onChange={(e) => setFirma((f) => ({ ...f, message: e.target.value }))} placeholder={`¡Feliz día, ${nombre}!`} maxLength={160} />
              </label>
              <button type="submit" className="cb-btn" disabled={estado === 'enviando'}><IconSend width={18} height={18} /> {estado === 'enviando' ? 'Enviando…' : 'Enviar'}</button>
            </div>
          </form>
        )}
        {mio?.firmado && <p className="cb-sign__done" role="status"><IconCheck width={18} height={18} /> Tu mensaje ya está en el muro de {nombre}.</p>}
      </div>

      {muro.length > 0 && (
        <section className="cb-wall" aria-label={`Muro de felicitaciones de ${nombre}`}>
          <p className="cb-wall__title">Muro de felicitaciones</p>
          <ul>
            {muro.map((w, i) => (
              <li key={w.id} style={{ '--nota': NOTAS[i % NOTAS.length], '--rot': `${((i * 7) % 5) - 2}deg`, '--i': i }}>
                <p>{w.message}</p>
                <span>— {w.name || 'Alguien del equipo G&S'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
