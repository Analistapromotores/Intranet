import { useCallback, useEffect, useRef, useState } from 'react'
import { IconArrowRight, IconChevronLeft, IconChevronRight } from './Icons.jsx'
import portada from '../assets/portada.png'
import oficina from '../assets/gys/trbajadoras_gys.png'
import equipoPromotores from '../assets/PROMOTORES/equipo-administrativo.webp'
import castor from '../assets/infraestructura/castor-3d-saludando.webp'

/* `fit: 'contain'` + `bg` se usan con imágenes recortadas (sin fondo) sobre un color de marca. */
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
    id: 'bienestar',
    kicker: 'Personas primero',
    lineA: 'Bienestar y desarrollo',
    lineB: 'para tu ',
    accent: 'equipo',
    text: 'Programas de formación, salud y acompañamiento para los colaboradores durante todo el año.',
    img: oficina,
    pos: '62% 30%',
  },
  {
    id: 'promotores',
    kicker: 'Promotores Mi Cali Bella',
    lineA: 'Recuperar a Cali',
    lineB: 'es tarea de ',
    accent: 'todas y todos',
    text: 'Pedagogía, prevención y control en el manejo de residuos sólidos, junto a la Alcaldía de Santiago de Cali.',
    img: equipoPromotores,
    fit: 'contain',
    pos: 'center bottom',
    bg: 'linear-gradient(135deg, #215c53 0%, #164a42 60%, #0f3a33 100%)',
  },
  {
    id: 'infraestructura',
    kicker: 'Infraestructura vial',
    lineA: 'Mantenemos la malla vial,',
    lineB: 'construimos ',
    accent: 'ciudad',
    text: 'Talento humano y equipos para recuperar las vías de Santiago de Cali, con seguridad y compromiso.',
    img: castor,
    fit: 'contain',
    pos: 'center bottom',
    bg: 'linear-gradient(135deg, #3a414b 0%, #2d333b 55%, #1f2328 100%)',
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

      <div className="hero__right" style={slide.bg ? { background: slide.bg } : undefined}>
        <img
          key={slide.id}
          className="hero__img"
          src={slide.img}
          alt=""
          style={{ objectPosition: slide.pos, objectFit: slide.fit || 'cover', padding: slide.fit === 'contain' ? '18px 8% 0 26%' : 0 }}
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
