import { useCallback, useEffect, useRef, useState } from 'react'
import { IconArrowRight, IconChevronLeft, IconChevronRight } from './Icons.jsx'
import portada from '../assets/portada.png'
import pasaportes from '../assets/pasaportes/pasaportes_portad.png'

const slides = [
  {
    id: 'talento',
    kicker: 'Bienvenido a la Intranet',
    lineA: 'Conectamos talento,',
    lineB: 'impulsamos ',
    accent: 'resultados',
    text: 'Encuentra aquí herramientas, información y servicios para hacer tu día a día más fácil y eficiente.',
    img: portada,
    pos: '18% center',
  },
  {
    id: 'pasaportes',
    kicker: 'Servicio al ciudadano',
    lineA: 'Oficina de Pasaportes,',
    lineB: 'atención que ',
    accent: 'acerca',
    text: 'Trámites ágiles, horario ampliado y un equipo dedicado a atender a cada persona.',
    img: pasaportes,
    pos: '75% center',
  },
  {
    id: 'bienestar',
    kicker: 'Personas primero',
    lineA: 'Bienestar y desarrollo',
    lineB: 'para tu ',
    accent: 'equipo',
    text: 'Programas de formación, salud y acompañamiento para los colaboradores durante todo el año.',
    img: portada,
    pos: '50% center',
  },
]

const INTERVAL = 7000

export default function Hero() {
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((p) => (p + 1) % slides.length)
    }, INTERVAL)
    return () => clearInterval(timer.current)
  }, [index])

  const go = useCallback((next) => {
    setIndex(((next % slides.length) + slides.length) % slides.length)
  }, [])

  const slide = slides[index]

  return (
    <section className="hero" aria-roledescription="carrusel" aria-label="Destacados">
      <div className="hero__left">
        <span className="hero__blob" aria-hidden="true" />
        <span className="hero__curve" aria-hidden="true" />

        <div className="hero__content">
          <span className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            {slide.kicker}
          </span>

          <h1 className="hero__title">
            {slide.lineA}
            <br />
            {slide.lineB}
            <span className="hero__accent">{slide.accent}</span>
          </h1>

          <p className="hero__text">{slide.text}</p>

          <a className="hero__btn" href="#accesos">
            Explorar la intranet
            <IconArrowRight width={18} height={18} />
          </a>

          <div className="hero__dots" role="tablist" aria-label="Cambiar destacado">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Destacado ${i + 1}`}
                className={`hero__dot ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hero__right">
        <img
          className="hero__img"
          src={slide.img}
          alt=""
          style={{ objectPosition: slide.pos }}
        />
        <span className="hero__stripe hero__stripe--red" aria-hidden="true" />
        <span className="hero__stripe hero__stripe--blue" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="hero__nav hero__nav--prev"
        aria-label="Destacado anterior"
        onClick={() => go(index - 1)}
      >
        <IconChevronLeft width={22} height={22} />
      </button>
      <button
        type="button"
        className="hero__nav hero__nav--next"
        aria-label="Destacado siguiente"
        onClick={() => go(index + 1)}
      >
        <IconChevronRight width={22} height={22} />
      </button>
    </section>
  )
}
