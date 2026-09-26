import { useEffect, useRef, useState } from 'react'
import { IconArrowRight, IconExternal, IconFileText, IconShield, IconCheck, IconMapPin, IconPhone } from '../../components/Icons.jsx'
import LiteYouTube from '../../components/LiteYouTube.jsx'
import SocialSection from '../../components/SocialSection.jsx'
import { useReveal } from '../../lib/useReveal.js'
import monograma from '../../assets/gys/GyS Logo(1).png'
import banner from '../../assets/gys/unnamed.png'
import equipoOficina from '../../assets/gys/trbajadoras_gys.png'
import accidente from '../../assets/gys/unnamed (1).png'
import { ALIANZAS, ASSETS, CANAL_YOUTUBE, CIFRAS, CONTACTO, FLUJO, FORMATS, QUALITY, SERVICIOS, SST, VIDEOS } from './data.js'
import { projects } from '../../data/projects.js'
import './gys.css'

/* G&S en la intranet: quiénes somos, cómo funcionamos y las herramientas internas del día a día. */

const svg = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const ICONO_SERVICIO = {
  operador: <svg {...svg}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>,
  temporal: <svg {...svg}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5" /><circle cx="18" cy="15" r="3.5" /><path d="M18 13.5V15l1 1" /></svg>,
  seleccion: <svg {...svg}><circle cx="10" cy="8" r="3.5" /><path d="M4 20c.6-3.4 3-5.5 6-5.5 1.3 0 2.5.4 3.4 1" /><circle cx="17.5" cy="16.5" r="2.8" /><path d="m21 20-1.5-1.5" /></svg>,
  portal: <svg {...svg}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8M12 18v3" /><circle cx="6" cy="6" r=".5" /></svg>,
}

const PROYECTOS = Object.fromEntries(projects.map((p) => [p.id, p]))

const SECCIONES = [
  ['gys-quienes', 'Quiénes somos'],
  ['gys-funcionamos', 'Cómo funcionamos'],
  ['gys-alianzas', 'Alianzas'],
  ['gys-servicios', 'Servicios'],
  ['gys-valores', 'Valores'],
  ['gys-formatos', 'Formatos'],
  ['gys-calidad', 'Calidad'],
  ['gys-sst', 'SST'],
  ['gys-videos', 'Videos'],
  ['gys-redes', 'Redes'],
  ['gys-contacto', 'Contacto'],
]

const VALORES = [
  ['Trabajo en equipo', 'Construimos resultados respetando ideas y compartiendo conocimiento.'],
  ['Servicio al cliente', 'Escuchamos y respondemos para ser aliados de confianza.'],
  ['Liderazgo', 'Proponemos soluciones y generamos impacto positivo.'],
  ['Responsabilidad', 'Actuamos con compromiso, transparencia y mejora continua.'],
]

/* Cifra que cuenta desde cero cuando entra en pantalla. */
function Contador({ valor, prefijo = '' }) {
  const ref = useRef(null)
  const [estatico] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined')
  const [n, setN] = useState(() => (estatico ? valor : 0))
  useEffect(() => {
    const el = ref.current
    if (estatico) return
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const inicio = performance.now()
      const paso = (t) => {
        const p = Math.min(1, (t - inicio) / 1400)
        setN(Math.round(valor * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(paso)
      }
      raf = requestAnimationFrame(paso)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [valor, estatico])
  return <b ref={ref}>{prefijo}{n.toLocaleString('es-CO')}</b>
}

function Recurso({ item, i }) {
  return (
    <li data-reveal style={{ '--d': `${i * 40}ms` }}>
      <a className="gy-doc" href={item[1]} target="_blank" rel="noreferrer">
        <span className="gy-doc__icon"><IconFileText width={20} height={20} /></span>
        <span className="gy-doc__name">{item[0]}</span>
        <IconExternal className="gy-doc__go" width={16} height={16} />
      </a>
    </li>
  )
}

export default function GysPage() {
  useReveal()
  const [activa, setActiva] = useState('')

  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    if (target && target.id !== 'gys') target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  /* Resalta en la navegación interna la sección visible. */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) setActiva(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    SECCIONES.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  const irA = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="gy">
      {/* ---------- Encabezado ---------- */}
      <header className="gy-hero" id="gys">
        <img className="gy-hero__mark" src={monograma} alt="" aria-hidden="true" />
        <div className="gy-wrap gy-hero__grid">
          <div className="gy-hero__text" data-reveal>
            <img className="gy-hero__logo" src={ASSETS.logo} alt="Gestión y Servicios · Apoyo en talento humano" />
            <p className="gy-kicker">Intranet corporativa</p>
            <h1>Más humano, <em>más calidad.</em></h1>
            <p className="gy-hero__lead">Somos aliados en talento humano y en la gestión de procesos. Aquí encuentras quiénes somos, cómo trabajamos y las herramientas que necesitas en tu día a día.</p>
            <div className="gy-hero__actions">
              <a className="gy-btn" href="#gys-quienes" onClick={(e) => irA(e, 'gys-quienes')}>Conócenos <IconArrowRight width={18} height={18} /></a>
              <a className="gy-btn gy-btn--ghost" href="#gys-formatos" onClick={(e) => irA(e, 'gys-formatos')}>Formatos internos</a>
            </div>
          </div>
          <div className="gy-hero__media" data-reveal>
            <span className="gy-hero__shape" aria-hidden="true" />
            <img src={ASSETS.team} alt="Colaboradoras de Gestión y Servicios en la oficina" />
            <span className="gy-hero__seal"><b>+ valor</b><small>para las personas</small></span>
          </div>
        </div>

        <div className="gy-wrap">
          <ul className="gy-stats" aria-label="Así operamos">
            {CIFRAS.map((c) => (
              <li key={c.etiqueta} data-reveal>
                <Contador valor={c.valor} prefijo={c.prefijo} />
                <span>{c.etiqueta}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ---------- Navegación interna ---------- */}
      <nav className="gy-subnav" aria-label="Secciones de G&S">
        <div className="gy-wrap gy-subnav__inner">
          {SECCIONES.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={activa === id ? 'is-on' : ''} aria-current={activa === id ? 'true' : undefined} onClick={(e) => irA(e, id)}>{label}</a>
          ))}
        </div>
      </nav>

      <main>
        {/* ---------- Quiénes somos ---------- */}
        <section className="gy-sec" id="gys-quienes">
          <div className="gy-wrap gy-split">
            <div data-reveal>
              <p className="gy-eyebrow">Quiénes somos</p>
              <h2>Hacemos sencilla la gestión que mueve a las organizaciones.</h2>
              <p className="gy-text">Somos una aliada estratégica que brinda soluciones eficientes y oportunas en la administración del talento humano y la gestión de procesos.</p>
              <p className="gy-text">Sabemos que cada empresa es un activo valioso: por eso ponemos nuestra calidad y experiencia en el mercado del talento humano al servicio de cada cliente, con cercanía y altos estándares.</p>
              <ul className="gy-checks">
                <li><IconCheck width={18} height={18} /> Soluciones en talento humano y procesos</li>
                <li><IconCheck width={18} height={18} /> Sistema de gestión de calidad</li>
                <li><IconCheck width={18} height={18} /> Seguridad y salud en el trabajo en cada operación</li>
              </ul>
            </div>
            <div className="gy-video" data-reveal>
              <LiteYouTube id={VIDEOS[0].id} titulo={VIDEOS[0].titulo} />
              <p><b>{VIDEOS[0].titulo}</b> · Video institucional</p>
            </div>
          </div>
        </section>

        {/* ---------- Cómo funcionamos ---------- */}
        <section className="gy-sec gy-sec--soft" id="gys-funcionamos">
          <div className="gy-wrap">
            <div className="gy-head" data-reveal>
              <p className="gy-eyebrow">Cómo funcionamos</p>
              <h2>Del requerimiento del cliente a la persona en su puesto.</h2>
              <p className="gy-text">Así se mueve un servicio de talento humano entre nuestras áreas. Cada paso tiene su formato o su responsable en la intranet.</p>
            </div>
            <ol className="gy-flow">
              {FLUJO.map((f, i) => (
                <li key={f.paso} data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <a href={f.href}>
                    <span className="gy-flow__n">{i + 1}</span>
                    <small>{f.area}</small>
                    <b>{f.paso}</b>
                    <span className="gy-flow__text">{f.texto}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Alianzas ---------- */}
        <section className="gy-sec gy-sec--soft" id="gys-alianzas">
          <div className="gy-wrap gy-alli">
            <div className="gy-alli__intro" data-reveal>
              <p className="gy-eyebrow">Nuestras alianzas</p>
              <h2>Unidos con otros proyectos para llegar más lejos.</h2>
              <p className="gy-text">Gestión y Servicios se une con otras organizaciones, mediante alianzas y uniones temporales, para operar proyectos que impactan a la región. En cada uno aportamos lo que el proyecto necesita: desde el talento humano hasta la logística completa.</p>
            </div>

            <ol className="gy-alli__list">
              {ALIANZAS.map((a, i) => {
                const p = PROYECTOS[a.proyecto] || {}
                return (
                  <li key={a.proyecto} className="gy-alli__item" data-reveal style={{ '--d': `${i * 70}ms` }}>
                    <span className="gy-alli__node" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <a className="gy-alli__card" href={p.href || '#gys-alianzas'}>
                      <span className="gy-alli__logo">
                        {p.logo ? <img src={p.logo} alt={a.nombre} /> : <span className="gy-ally__mono" style={{ background: p.color }}>{p.monogram}</span>}
                      </span>
                      <span className="gy-alli__body">
                        <b>{a.nombre}</b>
                        <span>{a.texto}</span>
                      </span>
                      {p.href && <IconArrowRight className="gy-alli__go" width={20} height={20} />}
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ---------- Servicios ---------- */}
        <section className="gy-sec" id="gys-servicios">
          <div className="gy-wrap">
            <div className="gy-head gy-head--center" data-reveal>
              <p className="gy-eyebrow">Nuestros servicios</p>
              <h2>Lo que ofrecemos a nuestras empresas usuarias.</h2>
            </div>
            <div className="gy-services">
              {SERVICIOS.map((s, i) => (
                <article key={s.id} className="gy-service" data-reveal style={{ '--d': `${i * 70}ms` }}>
                  <span className="gy-service__icon">{ICONO_SERVICIO[s.id]}</span>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Banda del equipo ---------- */}
        <div className="gy-band" aria-hidden="true">
          <img src={banner} alt="" />
        </div>

        {/* ---------- Valores ---------- */}
        <section className="gy-sec" id="gys-valores">
          <div className="gy-wrap gy-esencia">
            <figure className="gy-esencia__foto" data-reveal>
              <img src={equipoOficina} alt="Colaboradoras de Gestión y Servicios trabajando en equipo" loading="lazy" />
              <figcaption><img src={monograma} alt="" /><span>Personas que hacen posible cada proyecto</span></figcaption>
            </figure>
            <div className="gy-esencia__body">
              <div className="gy-head" data-reveal>
                <p className="gy-eyebrow">Nuestra esencia</p>
                <h2>Cuatro valores, una forma de trabajar.</h2>
              </div>
              <div className="gy-values">
                {VALORES.map(([t, d], i) => (
                  <article key={t} className="gy-value" data-reveal style={{ '--d': `${i * 60}ms` }}>
                    <span>0{i + 1}</span>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Formatos ---------- */}
        <section className="gy-sec gy-sec--soft" id="gys-formatos">
          <div className="gy-wrap">
            <div className="gy-head gy-head--row" data-reveal>
              <div>
                <p className="gy-eyebrow">Herramientas internas</p>
                <h2>Formatos y solicitudes.</h2>
                <p className="gy-text">Los documentos que necesitas para gestionar tu día a día. Para personal y préstamos, usa <a href="#solicitudes">Solicitudes</a>.</p>
              </div>
            </div>
            <ul className="gy-docs">{FORMATS.map((x, i) => <Recurso key={x[0]} item={x} i={i} />)}</ul>
          </div>
        </section>

        {/* ---------- Calidad ---------- */}
        <section className="gy-sec" id="gys-calidad">
          <div className="gy-wrap gy-split gy-split--wide">
            <div className="gy-panel" data-reveal>
              <IconCheck width={28} height={28} />
              <p className="gy-eyebrow gy-eyebrow--light">Sistema de gestión</p>
              <h2>Calidad en cada proceso.</h2>
              <p>Lineamientos que orientan nuestro compromiso de mejorar continuamente.</p>
              <a className="gy-btn gy-btn--white" href="https://docs.google.com/forms/d/e/1FAIpQLSdgpsG4jIFDviBW30zIrVOGDa9QRsIr-pKrfUS5yK4XKOo0Pg/viewform" target="_blank" rel="noreferrer">
                Reportar salida no conforme <IconExternal width={16} height={16} />
              </a>
            </div>
            <ul className="gy-docs gy-docs--list">{QUALITY.map((x, i) => <Recurso key={x[0]} item={x} i={i} />)}</ul>
          </div>
        </section>

        {/* ---------- SST ---------- */}
        <section className="gy-sec gy-sec--sst" id="gys-sst">
          <div className="gy-wrap">
            <div className="gy-head" data-reveal>
              <p className="gy-eyebrow">Bienestar y prevención</p>
              <h2>Seguridad y salud en el trabajo.</h2>
              <p className="gy-text">Recursos para promover un entorno laboral seguro, saludable y productivo.</p>
            </div>
            <div className="gy-sst">
              <div className="gy-sst__col">
                <ul className="gy-docs gy-docs--list">{SST.map((x, i) => <Recurso key={x[0]} item={x} i={i} />)}</ul>
                <div className="gy-video gy-video--small" data-reveal>
                  <LiteYouTube id={VIDEOS[2].id} titulo={VIDEOS[2].titulo} />
                  <p><b>{VIDEOS[2].titulo}</b></p>
                </div>
              </div>
              <aside className="gy-accident" data-reveal>
                <div className="gy-accident__head">
                  <IconShield width={26} height={26} />
                  <div>
                    <p className="gy-eyebrow">¿Tuviste un accidente de trabajo?</p>
                    <h3>Repórtalo de inmediato.</h3>
                  </div>
                </div>
                <a className="gy-accident__img" href={accidente} target="_blank" rel="noreferrer">
                  <img src={accidente} alt="Qué hacer en caso de accidente de trabajo: 1. Notificación al jefe inmediato y a Gestión Humana dentro de las 48 horas. 2. Atención médica: el encargado de SST contacta a la ARL para el FURAT. 3. Documentación: enviar incapacidad e historia clínica a incapacidadesgys@gestionyservicios.com.co. 4. Consultas y medicamentos: línea #322 o portal de ARL Seguros Bolívar." loading="lazy" />
                  <span>Ver en tamaño completo <IconExternal width={14} height={14} /></span>
                </a>
                <a className="gy-btn" href={`mailto:${CONTACTO.incapacidades}`}>Enviar incapacidad <IconArrowRight width={17} height={17} /></a>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------- Videos ---------- */}
        <section className="gy-sec" id="gys-videos">
          <div className="gy-wrap">
            <div className="gy-head gy-head--row" data-reveal>
              <div>
                <p className="gy-eyebrow">Videos</p>
                <h2>Aprende y conócenos en video.</h2>
              </div>
              <a className="gy-btn gy-btn--ghost" href={CANAL_YOUTUBE} target="_blank" rel="noreferrer">Canal de YouTube <IconExternal width={16} height={16} /></a>
            </div>
            <div className="gy-videos">
              {VIDEOS.map((v, i) => (
                <article key={v.id} className="gy-videocard" data-reveal style={{ '--d': `${i * 70}ms` }}>
                  <LiteYouTube id={v.id} titulo={v.titulo} />
                  <span className="gy-videocard__tag">{v.tema}</span>
                  <h3>{v.titulo}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Redes sociales ---------- */}
        <section className="gy-sec" id="gys-redes">
          <div className="gy-wrap">
            <SocialSection id="gys-redes-social" />
          </div>
        </section>

        {/* ---------- Contacto ---------- */}
        <section className="gy-contact" id="gys-contacto">
          <div className="gy-wrap gy-contact__grid">
            <div data-reveal>
              <img className="gy-contact__logo" src={ASSETS.vertical} alt="Gestión y Servicios" />
            </div>
            <div data-reveal>
              <p className="gy-eyebrow gy-eyebrow--light">Contacto</p>
              <h2>Estamos para ayudarte.</h2>
              <ul className="gy-contact__list">
                <li><IconMapPin width={20} height={20} /><span><b>{CONTACTO.direccion}</b>{CONTACTO.ciudad}</span></li>
                <li><IconPhone width={20} height={20} /><span><b><a href={CONTACTO.pbxHref}>PBX {CONTACTO.pbx}</a></b><small>Recepción · <a href="#extensiones">ext. 100</a></small></span></li>
              </ul>
            </div>
            <div className="gy-contact__links" data-reveal>
              <a href="#extensiones">Extensiones internas <IconArrowRight width={16} height={16} /></a>
              <a href="#solicitudes">Solicitudes <IconArrowRight width={16} height={16} /></a>
              <a href="#solicitudes-soporte">Soporte IT <IconArrowRight width={16} height={16} /></a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
