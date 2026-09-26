import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import PlatformSection from '../../components/PlatformSection.jsx'
import { PLATAFORMAS } from '../../data/plataformas.js'
import { IconArrowRight, IconCheck, IconDownload, IconExternal } from '../../components/Icons.jsx'
import { useReveal } from '../../lib/useReveal.js'
import VideoPlayer from '../../components/VideoPlayer.jsx'
import { Skyline, Hoja } from './deco.jsx'
import { CIFRAS_PERIODO, CIFRAS_RESUMEN, COLORES, DOTACION, EJES, OBJETIVOS, OBJETIVO_GENERAL, PASOS, PROJECT, RECURSOS, SECCIONES, VIDEOS_PROMOTORES } from './data.js'
import gysLogo from '../../assets/gys_logo.png'
import alcaldia from '../../assets/alcaldia-cali.png'
import logoMCBBlanco from '../../assets/mi-cali-bella/logo-bn.png'
import bellaSaluda from '../../assets/mi-cali-bella/bella-saluda.png'
import bellaFrente from '../../assets/mi-cali-bella/bella-frente.png'
import bellaVuela from '../../assets/mi-cali-bella/bella-vuela.png'
import bellaFeliz from '../../assets/mi-cali-bella/bella-feliz.png'
import bellaMusica from '../../assets/mi-cali-bella/bella-musica.png'
import bellaSilba from '../../assets/mi-cali-bella/bella-silba.png'
import bellaUaesp from '../../assets/mi-cali-bella/bella-saluda-uaesp.png'
import bellaBien from '../../assets/PROMOTORES/bella-bien.webp'
import bellaCorazon from '../../assets/PROMOTORES/bella-corazon.webp'
import equipoAdmin from '../../assets/PROMOTORES/equipo-administrativo.webp'
import './promotores.css'

/* El mapa (Leaflet + datos) pesa bastante: solo se descarga cuando se abre esta vista. */
const PromotoresMap = lazy(() => import('./PromotoresMap.jsx'))

/* Hojas que flotan en la sección de videos. */
const HOJAS = Array.from({ length: 12 }, (_, i) => ({ x: `${(i * 83 + 7) % 100}%`, s: `${18 + ((i * 13) % 26)}px`, t: `${9 + ((i * 5) % 9)}s`, d: `-${(i * 1.7).toFixed(1)}s` }))

const STICKERS = [
  { src: bellaBien, alt: 'Bella con el pulgar arriba', big: true },
  { src: bellaCorazon, alt: 'Bella haciendo un corazón con la mano', big: true },
  { src: bellaFrente, alt: 'Bella de frente' },
  { src: bellaVuela, alt: 'Bella volando' },
  { src: bellaFeliz, alt: 'Bella feliz' },
  { src: bellaMusica, alt: 'Bella con música' },
  { src: bellaSilba, alt: 'Bella silbando' },
  { src: bellaUaesp, alt: 'Bella con gorra de la UAESP' },
]

/* Cifra que cuenta desde cero al entrar en pantalla («514.708+», «22/22»…). */
function CountUp({ value }) {
  const ref = useRef(null)
  const m = /^([\d.]+)(.*)$/.exec(value)
  const objetivo = m ? Number(m[1].replace(/\./g, '')) : null
  const [n, setN] = useState(() => (objetivo === null || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? objetivo : 0))
  useEffect(() => {
    if (objetivo === null || n === objetivo) return
    const el = ref.current
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / 1600)
        setN(Math.round(objetivo * (1 - Math.pow(1 - k, 3))))
        if (k < 1) raf = requestAnimationFrame(paso)
      }
      raf = requestAnimationFrame(paso)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objetivo])
  if (objetivo === null) return <span ref={ref}>{value}</span>
  return <span ref={ref}>{n.toLocaleString('es-CO')}{m[2]}</span>
}

function SecTitle({ eyebrow, children, center, light }) {
  return (
    <div className={`mcb-title ${center ? 'is-center' : ''} ${light ? 'is-light' : ''}`} data-reveal>
      <span className="mcb-title__eyebrow"><Hoja width={14} height={14} />{eyebrow}</span>
      <h2 className="mcb-title__h">{children}</h2>
    </div>
  )
}

export default function PromotoresPage() {
  useReveal()

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, '')
    const target = h && h !== 'promotores' ? document.getElementById(h) : null
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const irA = (e, id) => {
    e.preventDefault()
    document.getElementById(`promotores-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mcb">
      {/* ---------- Portada ---------- */}
      <header className="mcb-hero" id="promotores-proyecto">
        <h1 className="sr-only">{PROJECT.nombre}: {PROJECT.sub}</h1>
        <span className="mcb-hero__blob mcb-hero__blob--a" />
        <span className="mcb-hero__blob mcb-hero__blob--b" />
        <Skyline className="mcb-hero__skyline" />
        <div className="mcb-hero__inner">
          <div className="mcb-hero__text" data-reveal>
            <a className="mcb-allies" href="#inicio" aria-label="Estrategia de la Alcaldía de Santiago de Cali, operada por Gestión y Servicios">
              <img className="mcb-allies__gys" src={gysLogo} alt="Gestión y Servicios" />
              <span className="mcb-allies__sep" aria-hidden="true" />
              <img className="mcb-allies__alc" src={alcaldia} alt="Alcaldía de Santiago de Cali" />
            </a>
            <p className="mcb-allies__cap">Estrategia de la Alcaldía de Santiago de Cali, operada por Gestión y Servicios</p>
            <img className="mcb-hero__logo" src={logoMCBBlanco} alt={`${PROJECT.nombre}: ${PROJECT.sub}`} />
            <p className="mcb-hero__lema">{PROJECT.lema}</p>
            <p className="mcb-hero__desc">Somos la estrategia con la que Santiago de Cali recupera sus espacios públicos, de la mano de la Alcaldía: pedagogía, prevención y control en el manejo de residuos sólidos.</p>
            <div className="mcb-hero__cta">
              <a className="mcb-btn mcb-btn--primary" href="#promotores-territorio" onClick={(e) => irA(e, 'territorio')}>Ver el mapa de intervenciones <IconArrowRight width={18} height={18} /></a>
              <a className="mcb-btn mcb-btn--ghost" href="#promotores-videos" onClick={(e) => irA(e, 'videos')}>Ver videos</a>
            </div>
          </div>
          <div className="mcb-hero__art" data-reveal>
            <span className="mcb-hero__disc" />
            <img className="mcb-hero__bella" src={bellaSaluda} alt="Bella, mascota del proyecto" />
            <img className="mcb-hero__sticker mcb-hero__sticker--a" src={bellaBien} alt="" />
            <img className="mcb-hero__sticker mcb-hero__sticker--b" src={bellaCorazon} alt="" />
          </div>
        </div>
      </header>

      <div className="mcb-marquee" aria-hidden="true">
        <div className="mcb-marquee__track">
          {[0, 1].map((k) => (
            <span key={k}>
              {['Recuperar', 'Cuidar', 'Transformar', 'Residuos Cero', 'Mi Cali Bella', 'Todas y todos'].map((t) => <b key={t}><Hoja width={16} height={16} />{t}</b>)}
            </span>
          ))}
        </div>
      </div>

      <nav className="mcb-nav" aria-label="Secciones de Promotores">
        <div className="mcb-wrap mcb-nav__row">
          {SECCIONES.map((s) => <a key={s.id} href={`#promotores-${s.id}`} onClick={(e) => irA(e, s.id)}>{s.label}</a>)}
        </div>
      </nav>

      <main className="mcb-main">
        {/* ---------- Cifras ---------- */}
        <section className="mcb-ficha" aria-label="Resultados de la operación">
          <div className="mcb-wrap mcb-ficha__grid">
            {CIFRAS_RESUMEN.map((item, i) => (
              <article className={`mcb-stat mcb-stat--${item.tone}`} key={item.label} data-reveal style={{ '--d': `${i * 70}ms` }}>
                <span className="mcb-stat__value"><CountUp value={item.value} /></span>
                <span className="mcb-stat__unit">{item.unit}</span>
                <span className="mcb-stat__label">{item.label}</span>
              </article>
            ))}
          </div>
          <p className="mcb-ficha__nota">Cifras de la operación · {CIFRAS_PERIODO}</p>
        </section>

        {/* ---------- Objetivos y cómo trabajamos ---------- */}
        <section className="mcb-sec mcb-sec--objetivos" id="promotores-objetivos">
          <div className="mcb-wrap">
            <SecTitle eyebrow="El proyecto">Recuperamos la <em>gobernanza</em> del espacio público</SecTitle>
            <p className="mcb-lead" data-reveal>{OBJETIVO_GENERAL}</p>
            <div className="mcb-obj">
              {OBJETIVOS.map((item, i) => (
                <article className="mcb-obj__card" key={item.n} data-reveal style={{ '--d': `${i * 90}ms` }}>
                  <span className="mcb-obj__n">{item.n}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <p className="mcb-ejes-intro" data-reveal>Tres ejes, una misma meta: recuperar, cuidar y transformar hábitos en cada comunidad.</p>
            <ul className="mcb-lineas">
              {EJES.map((item, i) => (
                <li key={item.id} data-reveal style={{ '--d': `${i * 70}ms` }}>
                  <Hoja className="mcb-lineas__icon" />
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>

            <h3 className="mcb-sub" data-reveal>Así trabajamos, paso a paso</h3>
            <ol className="mcb-pasos">
              {PASOS.map((p, i) => (
                <li key={p.n} data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <span className="mcb-pasos__n">{p.n}</span>
                  <b>{p.title}</b>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Videos ---------- */}
        <section className="mcb-sec mcb-sec--videos" id="promotores-videos">
          <div className="mcb-leaves" aria-hidden="true">
            {HOJAS.map((h, i) => <Hoja key={i} className="mcb-leaf" style={{ '--x': h.x, '--s': h.s, '--t': h.t, '--d': h.d }} />)}
          </div>
          <div className="mcb-wrap">
            <SecTitle eyebrow="En video" center light>Las personas detrás de <em>Mi Cali Bella</em></SecTitle>
            <p className="mcb-lead mcb-lead--center mcb-lead--light" data-reveal>Pasa el mouse para ver un adelanto y haz clic para verlo en pantalla completa.</p>
            <div className="mcb-videos">
              {VIDEOS_PROMOTORES.map((v, i) => (
                <article className={`mcb-video mcb-video--${v.id}`} key={v.id} data-reveal={i ? 'right' : 'left'} style={{ '--d': `${i * 120}ms` }}>
                  <div className="mcb-video__frame">
                    <VideoPlayer src={v.src} poster={v.poster} titulo={v.titulo} />
                    <span className="mcb-video__tag">{i === 0 ? 'Nuestro equipo' : 'Gracias, promotores'}</span>
                  </div>
                  <div className="mcb-video__body">
                    <h3>{v.titulo}</h3>
                    <p>{v.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Equipo ---------- */}
        <section className="mcb-sec mcb-sec--equipo" id="promotores-equipo">
          <div className="mcb-wrap mcb-equipo">
            <div className="mcb-equipo__text">
              <SecTitle eyebrow="Nuestro equipo">El equipo administrativo que <em>hace posible</em> cada jornada</SecTitle>
              <p data-reveal>Detrás de cada promotor en la calle hay un equipo que planea, coordina, forma y acompaña la operación en las 22 comunas de Cali.</p>
              <ul className="mcb-checks mcb-checks--light" data-reveal>
                <li><IconCheck width={15} height={15} /> Coordinación de la operación en territorio</li>
                <li><IconCheck width={15} height={15} /> Formación y cualificación del equipo</li>
                <li><IconCheck width={15} height={15} /> Seguimiento y reporte de resultados</li>
              </ul>
            </div>
            <figure className="mcb-equipo__foto" data-reveal>
              <span className="mcb-equipo__halo" aria-hidden="true" />
              <img src={equipoAdmin} alt="Equipo administrativo de Promotores Mi Cali Bella, con el pulgar arriba" />
              <img className="mcb-equipo__bella" src={bellaCorazon} alt="" aria-hidden="true" />
            </figure>
          </div>
        </section>

        {/* ---------- Mapa ---------- */}
        <section className="mcb-sec mcb-sec--territorio" id="promotores-territorio">
          <div className="mcb-wrap mcb-wrap--wide">
            <SecTitle eyebrow="Cobertura territorial" center>Acciones que se ven en <em>toda Cali</em></SecTitle>
            <p className="mcb-lead mcb-lead--center" data-reveal>Cada punto es un lugar donde estuvimos: recuperando espacios, haciendo pedagogía o acompañando a la comunidad. Explora las 22 comunas y los barrios y mira qué hicimos en cada uno.</p>
            <div data-reveal>
              <Suspense fallback={<p className="mcb-mapa-carga">Preparando el mapa…</p>}>
                <PromotoresMap />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ---------- Bella ---------- */}
        <section className="mcb-sec mcb-sec--bella" id="promotores-bella">
          <div className="mcb-wrap mcb-bella">
            <div className="mcb-bella__text">
              <SecTitle eyebrow="Mascota" light>¡Hola, soy <em>Bella</em>!</SecTitle>
              <p data-reveal>Integro el proyecto Promotores Mi Cali Bella y acompaño la sensibilización ciudadana sobre el manejo adecuado de residuos sólidos.</p>
              <p data-reveal>Como torito cabecirrojo, invito a cada persona a recuperar Cali con hábitos que cuidan el entorno.</p>
            </div>
            <ul className="mcb-stickers">
              {STICKERS.map((s, i) => (
                <li key={s.alt} className={s.big ? 'is-big' : ''} data-reveal style={{ '--d': `${i * 55}ms`, '--r': `${[-5, 4, -3, 5, -4, 3, -6, 4][i]}deg` }}>
                  <img src={s.src} alt={s.alt} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Identidad ---------- */}
        <section className="mcb-sec mcb-sec--marca" id="promotores-marca">
          <div className="mcb-wrap">
            <SecTitle eyebrow="Manual de marca" center>Identidad <em>visual</em></SecTitle>
            <p className="mcb-lead mcb-lead--center" data-reveal>Un verde profundo que transmite confianza y cuidado del territorio, con un lima vivo que expresa la energía de una comunidad que transforma su entorno.</p>
            <div className="mcb-marca">
              <article className="mcb-card" data-reveal>
                <h3 className="mcb-card__title">Colorimetría</h3>
                <ul className="mcb-colores">
                  {COLORES.map((color) => (
                    <li key={color.hex}>
                      <span className="mcb-color" style={{ background: color.hex }} />
                      <span className="mcb-color__info"><strong>{color.name}</strong><code>{color.hex}</code><em>{color.detail}</em></span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="mcb-card" data-reveal style={{ '--d': '90ms' }}>
                <h3 className="mcb-card__title">Tipografía</h3>
                <p className="mcb-tipo">Mohr Rounded</p>
                <p className="mcb-tipo__note">Para el logosímbolo y las piezas gráficas del proyecto.</p>
                <p className="mcb-tipo mcb-tipo--alt">Poppins</p>
                <p className="mcb-tipo__note">Para papelería, membretes y presentaciones corporativas.</p>
                <ul className="mcb-checks">
                  <li><IconCheck width={15} height={15} /> Black / ExtraBold en títulos</li>
                  <li><IconCheck width={15} height={15} /> SemiBold en subtítulos y botones</li>
                </ul>
              </article>
              <article className="mcb-card" data-reveal style={{ '--d': '180ms' }}>
                <h3 className="mcb-card__title">Sistema visual</h3>
                <p className="mcb-card__lead">Una identidad amable y reconocible que une a Bella, la ciudad y el mensaje de residuos cero.</p>
                <ul className="mcb-visual">
                  <li><strong>Bella</strong><span>La voz cercana que acompaña la conversación ciudadana.</span></li>
                  <li><strong>Formas orgánicas</strong><span>Conectan naturaleza, movimiento y vida urbana.</span></li>
                  <li><strong>Verdes de la marca</strong><span>Dan unidad a las piezas en territorio y canales digitales.</span></li>
                </ul>
              </article>
            </div>
            <div className="mcb-dotacion" data-reveal>
              <h3>Nuestra dotación</h3>
              <ul>{DOTACION.map((d) => <li key={d}><Hoja width={14} height={14} />{d}</li>)}</ul>
            </div>
          </div>
        </section>

        <PlatformSection
          id="promotores-plataforma"
          title="Conoce nuestra plataforma"
          text="La plataforma de Promotores Mi Cali Bella concentra la operación digital del proyecto. Ingresa con tu usuario para acceder."
          url={PLATAFORMAS.promotores.url}
          style={{ '--pf-accent': '#2c6b1f', '--pf-deep': '#215c53', '--pf-soft': '#f1f7ea', '--pf-ink': '#14332e' }}
        />

        {/* ---------- Recursos ---------- */}
        <section className="mcb-sec mcb-sec--recursos" id="promotores-recursos">
          <div className="mcb-wrap">
            <SecTitle eyebrow="Descargas" center>Recursos y <em>plantillas</em></SecTitle>
            <p className="mcb-lead mcb-lead--center" data-reveal>Todo lo necesario para aplicar la marca con claridad y consistencia.</p>
            <ul className="mcb-recursos">
              {RECURSOS.map((item, i) => (
                <li key={item.id} data-reveal style={{ '--d': `${i * 50}ms` }}>
                  <a className="mcb-rec" href={item.url} target="_blank" rel="noreferrer">
                    <span className="mcb-rec__icon">{item.externo ? <IconExternal width={20} height={20} /> : <IconDownload width={20} height={20} />}</span>
                    <span className="mcb-rec__body"><strong>{item.title}</strong><em>{item.desc}</em><span className="mcb-rec__tipo">{item.tipo}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mcb-foot">
        <div className="mcb-wrap mcb-foot__inner">
          <img className="mcb-foot__logo" src={logoMCBBlanco} alt="" />
          <p className="mcb-foot__legal">{PROJECT.nombre}: {PROJECT.sub} · {PROJECT.direccion}, {PROJECT.ciudad}</p>
        </div>
      </footer>
    </div>
  )
}
