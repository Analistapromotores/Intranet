import { useEffect, useRef, useState } from 'react'
import VideoPlayer from '../../components/VideoPlayer.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import CountUp from '../../components/CountUp.jsx'
import { IconCone, IconArrowRight, IconExternal } from '../../components/Icons.jsx'
import { useReveal } from '../../lib/useReveal.js'
import gysLogo from '../../assets/gys_logo.png'
import { ACTIVIDADES, CIFRAS_CALI, COMPONENTES, ENLACES, FUENTE_CIFRAS, PROYECTO } from './data.js'
import { CASTOR_3D, CASTOR_STICKERS, FOTOS, HISTORIAS, LOGO, VIDEO_DRON } from './recursos.js'
import './infraestructura.css'

/* Infraestructura vial de Cali · «El camino»: la página se recorre como una vía, de la obra en el aire
   a las cuadrillas en el asfalto. Identidad: naranja de obra, ámbar de demarcación, azul del logo y
   fotografía real del proyecto. */

const svg = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const ICONOS = {
  sst: <svg {...svg}><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z" /><path d="M12 9v6M9 12h6" /></svg>,
  social: <svg {...svg}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 3-4.5 5.5-4.5S13.8 16 14.5 19" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.6c2 .6 3.4 2.1 4 4.4" /></svg>,
  transporte: <svg {...svg}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>,
  herramientas: <svg {...svg}><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.3 2.3-2.4-.6-.6-2.4 2.3-2.3Z" /></svg>,
  movimiento: <svg {...svg}><path d="M3 17h11v-4H7l-2 2H3zM14 15h3l2-6h2" /><path d="M8 13 11 6l3 1" /><circle cx="6" cy="18.5" r="1.5" /><circle cx="12" cy="18.5" r="1.5" /></svg>,
  objetivo: <svg {...svg}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></svg>,
  llave: <svg {...svg}><path d="M4 20h16M6 20V10l6-5 6 5v10" /><path d="M10 20v-5h4v5" /></svg>,
  pausa: <svg {...svg} width="18" height="18"><path d="M8 5v14M16 5v14" /></svg>,
  play: <svg {...svg} width="18" height="18" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>,
}
const COMPONENTE = {
  sst: 'Seguridad y salud en el trabajo (SST)',
  social: 'Gestión social',
  transporte: 'Transporte',
  herramientas: 'Equipos y herramientas menores',
  movimiento: 'Movimiento de equipos',
}
const SECCIONES = [
  ['inf-cifras', 'Cali en cifras'],
  ['inf-aporte', 'Nuestro aporte'],
  ['inf-actividades', 'Actividades'],
  ['inf-historias', 'Historias'],
  ['inf-galeria', 'En terreno'],
  ['inf-mascota', 'Mascota'],
  ['inf-docs', 'Enlaces'],
]
/* Fotos de cabecera de las dos actividades */
const FOTO_ACT = { 1: FOTOS.find((f) => /jornada-nocturna/.test(f.base))?.src, 2: FOTOS.find((f) => /aerea/.test(f.base))?.src }

/* Portada con video del dron: silenciado, en bucle, con botón de pausa, y detenido fuera de pantalla o si se prefiere menos movimiento. */
function VideoFondo() {
  const ref = useRef(null)
  const [reproduciendo, setReproduciendo] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const menos = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (menos) return
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (!visible) v.pause()
      else if (v.dataset.manual !== 'pausa') v.play().catch(() => {})
    })
    io.observe(v)
    const al = () => setReproduciendo(true)
    const alPausa = () => setReproduciendo(false)
    v.addEventListener('playing', al)
    v.addEventListener('pause', alPausa)
    v.play().catch(() => {})
    return () => { io.disconnect(); v.removeEventListener('playing', al); v.removeEventListener('pause', alPausa) }
  }, [])

  const alternar = () => {
    const v = ref.current
    if (v.paused) { v.dataset.manual = ''; v.play().catch(() => {}) } else { v.dataset.manual = 'pausa'; v.pause() }
  }

  return (
    <>
      <video ref={ref} className="inf-hero__video" src={VIDEO_DRON.hero} poster={VIDEO_DRON.poster} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
      <button type="button" className="inf-hero__pause" onClick={alternar} aria-label={reproduciendo ? 'Pausar el video de fondo' : 'Reproducir el video de fondo'}>
        {reproduciendo ? ICONOS.pausa : ICONOS.play}
      </button>
    </>
  )
}

export default function InfraestructuraPage() {
  useReveal()
  const [foto, setFoto] = useState(null) // índice en la lista activa
  const [lista, setLista] = useState(FOTOS)
  const [vertical, setVertical] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])

  const abrir = (items, i, esVertical = false) => { setLista(items); setVertical(esVertical); setFoto(i) }
  const irA = (e, id) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const subTotal = ACTIVIDADES.reduce((n, a) => n + a.sub.length, 0)

  return (
    <div className="inf">
      {/* ---------- Portada con video del dron ---------- */}
      <header className="inf-hero">
        <VideoFondo />
        <div className="inf-hero__shade" aria-hidden="true" />
        <div className="inf-wrap inf-hero__inner">
          <div className="inf-hero__text">
            <p className="inf-kicker"><IconCone width={16} height={16} /> {PROYECTO.entidad} · {PROYECTO.ciudad}</p>
            <h1>
              <span className="inf-h1__a">Infraestructura</span>
              <span className="inf-h1__b">que transforma.</span>
            </h1>
            <p className="inf-hero__lead">{PROYECTO.titulo} de {PROYECTO.ciudad}. Ponemos el talento humano y los equipos que hacen posible que las cuadrillas recuperen la malla vial de la ciudad.</p>
            <div className="inf-hero__cta">
              <a className="inf-btn inf-btn--main" href="#inf-cifras" onClick={(e) => irA(e, 'inf-cifras')}>Conoce el proyecto <IconArrowRight width={18} height={18} /></a>
              <VideoPlayer src={VIDEO_DRON.completo} poster={VIDEO_DRON.poster} titulo="Recuperación vial vista desde el dron" className="inf-hero__vid" ratio="16 / 9" />
            </div>
          </div>
          <div className="inf-hero__art">
            {CASTOR_3D.saludando && <img className="inf-hero__castor" src={CASTOR_3D.saludando} alt="El castor de Infraestructura, con casco y chaleco, saludando" />}
          </div>
        </div>
        <div className="inf-allies" aria-label="Gestión y Servicios, operador del proyecto">
          <span className="inf-allies__logo inf-allies__logo--gys"><img src={gysLogo} alt="Gestión y Servicios" /></span>
          {LOGO && <img className="inf-allies__brand" src={LOGO} alt="Infraestructura" />}
        </div>
      </header>

      {/* ---------- La carretera ---------- */}
      <div className="inf-road" aria-hidden="true">
        <span className="inf-road__lane" />
        <span className="inf-road__line" />
        <i className="inf-cone inf-cone--1" /><i className="inf-cone inf-cone--2" /><i className="inf-cone inf-cone--3" />
        {CASTOR_STICKERS.find((c) => /maquina/i.test(c.base)) && <img className="inf-road__drive" src={CASTOR_STICKERS.find((c) => /maquina/i.test(c.base)).src} alt="" />}
      </div>

      <nav className="inf-nav" aria-label="Secciones de Infraestructura">
        <div className="inf-wrap inf-nav__row">
          {SECCIONES.map(([id, n]) => <a key={id} href={`#${id}`} onClick={(e) => irA(e, id)}>{n}</a>)}
        </div>
      </nav>

      <main>
        {/* ---------- Cali en cifras ---------- */}
        <section className="inf-cifras" id="inf-cifras" aria-labelledby="inf-cifras-t">
          <div className="inf-wrap">
            <div className="inf-head inf-head--light" data-reveal>
              <p className="inf-eyebrow">Cali en movimiento</p>
              <h2 id="inf-cifras-t">La ciudad recupera su <em>malla vial</em></h2>
              <p>Los resultados de la Secretaría de Infraestructura en recuperación de vías. Este proyecto aporta las personas y los equipos de las cuadrillas.</p>
            </div>
            <ul className="inf-cifras__grid">
              {CIFRAS_CALI.map((c, i) => (
                <li key={c.unidad} data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <b><CountUp value={c.valor} /></b>
                  <span>{c.unidad}</span>
                  <small>{c.texto}</small>
                </li>
              ))}
            </ul>
            <p className="inf-cifras__src">Fuente: <a href={FUENTE_CIFRAS.url} target="_blank" rel="noreferrer">{FUENTE_CIFRAS.texto} <IconExternal width={13} height={13} /></a></p>
          </div>
        </section>

        {/* ---------- Nuestro aporte ---------- */}
        <section className="inf-sec inf-aporte" id="inf-aporte" aria-labelledby="inf-aporte-t">
          <div className="inf-wrap inf-aporte__grid">
            <figure className="inf-aporte__foto" data-reveal="left">
              <img src={FOTOS[0]?.src} alt="Cuadrilla de Infraestructura y retroexcavadora demoliendo el pavimento dañado" loading="lazy" />
              {CASTOR_STICKERS.find((c) => /ok/i.test(c.base)) && <img className="inf-aporte__castor" src={CASTOR_STICKERS.find((c) => /ok/i.test(c.base)).src} alt="" />}
            </figure>
            <div className="inf-aporte__text">
              <div className="inf-head" data-reveal>
                <p className="inf-eyebrow">Nuestro aporte</p>
                <h2 id="inf-aporte-t">Las personas y los equipos que <em>recuperan la vía</em></h2>
              </div>
              <article className="inf-obj" data-reveal>
                <span className="inf-obj__ico">{ICONOS.objetivo}</span>
                <div><h3>Objetivo general</h3><p>{PROYECTO.objetivoGeneral}</p></div>
              </article>
              <article className="inf-obj inf-obj--2" data-reveal style={{ '--d': '90ms' }}>
                <span className="inf-obj__ico">{ICONOS.llave}</span>
                <div><h3>Objetivo específico</h3><p>{PROYECTO.objetivoEspecifico}</p></div>
              </article>
              <ul className="inf-mini" aria-label="El proyecto en cifras" data-reveal>
                <li><b>{ACTIVIDADES.length}</b> actividades</li>
                <li><b>{subTotal}</b> subactividades</li>
                <li><b>{COMPONENTES.length}</b> componentes conexos</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Actividades ---------- */}
        <section className="inf-sec inf-act" id="inf-actividades" aria-labelledby="inf-act-t">
          <div className="inf-wrap">
            <div className="inf-head inf-head--center" data-reveal>
              <p className="inf-eyebrow">Qué hacemos</p>
              <h2 id="inf-act-t">Dos actividades, una misma <em>meta</em></h2>
            </div>
            <div className="inf-act__grid">
              {ACTIVIDADES.map((a, i) => (
                <article key={a.n} className="inf-card" data-reveal={i ? 'right' : 'left'}>
                  <div className="inf-card__foto">
                    {FOTO_ACT[a.n] && <img src={FOTO_ACT[a.n]} alt="" loading="lazy" />}
                    <span className="inf-card__n">{a.n}</span>
                  </div>
                  <div className="inf-card__body">
                    <h3>{a.titulo}</h3>
                    <p>{a.texto}</p>
                    <ol className="inf-subs">
                      {a.sub.map(([code, t]) => (
                        <li key={code}><span>{code}</span><p>{t}</p></li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>

            <div className="inf-comps" data-reveal>
              <p className="inf-comps__t"><b>Actividad 2 </b> Componentes integrados a la operación:</p>
              <ul>
                {COMPONENTES.map((c, i) => (
                  <li key={c} style={{ '--i': i }}>
                    <span>{ICONOS[c]}</span>
                    <b>{COMPONENTE[c]}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Historias de obra ---------- */}
        {HISTORIAS.length > 0 && (
          <section className="inf-historias" id="inf-historias" aria-labelledby="inf-hist-t">
            <div className="inf-wrap">
              <div className="inf-head inf-head--center" data-reveal>
                <p className="inf-eyebrow">Historias de obra</p>
                <h2 id="inf-hist-t">Así se ve <em>nuestro trabajo</em></h2>
              </div>
              <ul className="inf-stories">
                {HISTORIAS.map((h, i) => (
                  <li key={h.ruta} data-reveal style={{ '--d': `${i * 110}ms`, '--r': `${[-5, 0, 5][i % 3]}deg` }}>
                    <button type="button" onClick={() => abrir(HISTORIAS, i, true)} aria-label={`Ampliar: ${h.titulo}`}>
                      <img src={h.src} alt={h.titulo} loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- En terreno: video y fotos ---------- */}
        {FOTOS.length > 0 && (
          <section className="inf-sec inf-galeria" id="inf-galeria" aria-labelledby="inf-gal-t">
            <div className="inf-wrap">
              <div className="inf-head inf-head--center" data-reveal>
                <p className="inf-eyebrow">En terreno</p>
                <h2 id="inf-gal-t">De día, de noche y desde el <em>aire</em></h2>
              </div>
              <div className="inf-mosaico">
                <div className="inf-mosaico__video" data-reveal>
                  <VideoPlayer src={VIDEO_DRON.completo} poster={VIDEO_DRON.poster} titulo="Recuperación vial vista desde el dron" ratio="16 / 10" />
                  <span className="inf-mosaico__tag">Video · vista desde el dron</span>
                </div>
                {FOTOS.map((f, i) => (
                  <button key={f.ruta} type="button" className="inf-foto" data-reveal style={{ '--d': `${(i % 3) * 80}ms` }} onClick={() => abrir(FOTOS, i)} aria-label={`Ampliar: ${f.titulo}`}>
                    <img src={f.src} alt={f.titulo} loading="lazy" />
                    <span>{f.titulo}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Mascota ---------- */}
        {(CASTOR_3D.maquina || CASTOR_STICKERS.length > 0) && (
          <section className="inf-mascota" id="inf-mascota" aria-labelledby="inf-mas-t">
            <div className="inf-wrap inf-mascota__grid">
              <div className="inf-mascota__text">
                <div className="inf-head" data-reveal>
                  <p className="inf-eyebrow">Nuestra mascota</p>
                  <h2 id="inf-mas-t">El castor constructor de <em>Cali</em></h2>
                </div>
                <p data-reveal>Con su casco, su chaleco y las manos a la obra, el castor acompaña cada jornada del proyecto: recuerda que las vías se recuperan trabajando en equipo y con seguridad.</p>
                <a className="inf-btn inf-btn--soft" href={ENLACES[1].url} target="_blank" rel="noreferrer">Ver la identidad visual completa <IconExternal width={16} height={16} /></a>
                <ul className="inf-stickers">
                  {CASTOR_STICKERS.map((c, i) => (
                    <li key={c.ruta} data-reveal style={{ '--d': `${i * 70}ms`, '--r': `${[-4, 5, -3, 4, -5][i % 5]}deg` }}><img src={c.src} alt="" loading="lazy" /></li>
                  ))}
                </ul>
              </div>
              {CASTOR_3D.maquina && (
                <div className="inf-mascota__art" data-reveal="right">
                  <span className="inf-mascota__sun" aria-hidden="true" />
                  <img src={CASTOR_3D.maquina} alt="El castor manejando una máquina asfaltadora" loading="lazy" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- Enlaces y documentos ---------- */}
        <section className="inf-sec inf-docs" id="inf-docs" aria-labelledby="inf-docs-t">
          <div className="inf-wrap">
            <div className="inf-head" data-reveal>
              <p className="inf-eyebrow">Para el equipo</p>
              <h2 id="inf-docs-t">Enlaces del <em>proyecto</em></h2>
            </div>
            <ul className="inf-links">
              {ENLACES.map((e, i) => (
                <li key={e.id} data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <a href={e.url} target="_blank" rel="noreferrer">
                    <span className="inf-links__ico" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
                    </span>
                    <span className="inf-links__txt"><b>{e.titulo}</b><small>{e.texto}</small></span>
                    <span className="inf-links__go">Abrir carpeta <IconExternal width={15} height={15} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="inf-foot">
        <div className="inf-wrap inf-foot__inner">
          <span className="inf-foot__logo"><img src={gysLogo} alt="Gestión y Servicios" /></span>
          <p>{PROYECTO.titulo} · {PROYECTO.entidad} · {PROYECTO.ciudad}. Las cifras de ciudad son de la Secretaría de Infraestructura; el aporte de Gestión y Servicios es el talento humano y los equipos de las cuadrillas.</p>
        </div>
      </footer>

      {foto !== null && <Lightbox items={lista} indice={foto} vertical={vertical} onCambiar={setFoto} onCerrar={() => setFoto(null)} />}
    </div>
  )
}
