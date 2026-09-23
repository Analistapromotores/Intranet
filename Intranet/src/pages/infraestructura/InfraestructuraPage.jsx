import { useEffect, useState } from 'react'
import { IconCone } from '../../components/Icons.jsx'
import logo from '../../assets/gys/logo_principa.png'
import { ACTIVIDADES, COMPONENTES, PROYECTO } from './data.js'
import './infraestructura.css'

/* Proyecto Infraestructura: mantenimiento de la malla vial de Santiago de Cali.
   Paleta de obra vial: gris asfalto, naranja de señalización y amarillo de demarcación. */

const svg = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const ICONOS = {
  sst: <svg {...svg}><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z" /><path d="M12 9v6M9 12h6" /></svg>,
  social: <svg {...svg}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 3-4.5 5.5-4.5S13.8 16 14.5 19" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.6c2 .6 3.4 2.1 4 4.4" /></svg>,
  transporte: <svg {...svg}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>,
  herramientas: <svg {...svg}><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.3 2.3-2.4-.6-.6-2.4 2.3-2.3Z" /></svg>,
  movimiento: <svg {...svg}><path d="M3 17h11v-4H7l-2 2H3zM14 15h3l2-6h2" /><path d="M8 13 11 6l3 1" /><circle cx="6" cy="18.5" r="1.5" /><circle cx="12" cy="18.5" r="1.5" /></svg>,
  objetivo: <svg {...svg}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></svg>,
  llave: <svg {...svg}><path d="M4 20h16M6 20V10l6-5 6 5v10" /><path d="M10 20v-5h4v5" /></svg>,
  doc: <svg {...svg}><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
  equipo: <svg {...svg}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M13.5 14.6c.8-.1 1.6-.1 2.5-.1 2.7 0 4.9 1.5 5.5 4.5" /></svg>,
}

const COMPONENTE = {
  sst: 'Seguridad y salud en el trabajo (SST)',
  social: 'Gestión social',
  transporte: 'Transporte',
  herramientas: 'Equipos y herramientas menores',
  movimiento: 'Movimiento de equipos',
}

function Cono({ className = '' }) {
  return (
    <svg className={`inf-cone ${className}`} viewBox="0 0 60 80" aria-hidden="true">
      <path d="M24 6h12l16 62H8Z" fill="#f97316" />
      <path d="M20.5 24h19l3.2 12.5H17.3ZM15.6 43h28.8l3 11.5H12.6Z" fill="#fff" opacity=".92" />
      <rect x="2" y="68" width="56" height="8" rx="3" fill="#4b5563" />
    </svg>
  )
}

export default function InfraestructuraPage() {
  const [abierta, setAbierta] = useState('1')
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])
  const subTotal = ACTIVIDADES.reduce((n, a) => n + a.sub.length, 0)

  return (
    <div className="inf">
      {/* ---------- Encabezado ---------- */}
      <header className="inf-hero">
        <div className="inf-wrap inf-hero__grid">
          <div className="inf-hero__text">
            <p className="inf-kicker"><IconCone width={16} height={16} /> Proyecto {PROYECTO.codigo}</p>
            <h1>Infraestructura <span>vial de Cali</span></h1>
            <p className="inf-hero__lead">{PROYECTO.titulo} de {PROYECTO.ciudad}: talento humano y equipos para el mantenimiento de la malla vial, en apoyo a la {PROYECTO.entidad}.</p>
            <ul className="inf-stats" aria-label="El proyecto en cifras">
              <li><b>{ACTIVIDADES.length}</b><span>actividades</span></li>
              <li><b>{subTotal}</b><span>subactividades</span></li>
              <li><b>{COMPONENTES.length}</b><span>componentes conexos</span></li>
            </ul>
          </div>
          <aside className="inf-badge" aria-label="Ficha del proyecto">
            <span className="inf-badge__stripe" aria-hidden="true" />
            <dl>
              <div><dt>Código</dt><dd>{PROYECTO.codigo}</dd></div>
              <div><dt>Entidad</dt><dd>{PROYECTO.entidad}</dd></div>
              <div><dt>Ciudad</dt><dd>{PROYECTO.ciudad}</dd></div>
            </dl>
            <div className="inf-badge__by">
              <small>Operado por</small>
              <img src={logo} alt="Gestión y Servicios" />
            </div>
          </aside>
        </div>
        {/* Vía con demarcación animada */}
        <div className="inf-road" aria-hidden="true">
          <span className="inf-road__line" />
          <Cono className="inf-cone--1" />
          <Cono className="inf-cone--2" />
          <Cono className="inf-cone--3" />
        </div>
      </header>

      <main className="inf-wrap inf-page">
        {/* ---------- Objetivos ---------- */}
        <section className="inf-goals" aria-label="Objetivos del proyecto">
          <article className="inf-goal inf-goal--main">
            <span className="inf-goal__icon">{ICONOS.objetivo}</span>
            <p className="inf-eyebrow">Objetivo general</p>
            <p className="inf-goal__text">{PROYECTO.objetivoGeneral}</p>
          </article>
          <article className="inf-goal">
            <span className="inf-goal__icon inf-goal__icon--yellow">{ICONOS.llave}</span>
            <p className="inf-eyebrow">Objetivo específico</p>
            <p className="inf-goal__text">{PROYECTO.objetivoEspecifico}</p>
          </article>
        </section>

        {/* ---------- Actividades ---------- */}
        <section className="inf-block" aria-labelledby="inf-act">
          <p className="inf-eyebrow">Qué hacemos</p>
          <h2 id="inf-act" className="inf-h2">Actividades del proyecto</h2>
          <div className="inf-acts">
            {ACTIVIDADES.map((a) => {
              const open = abierta === a.n
              return (
                <article key={a.n} className={`inf-act ${open ? 'is-open' : ''}`}>
                  <button type="button" className="inf-act__head" onClick={() => setAbierta(open ? '' : a.n)} aria-expanded={open} aria-controls={`inf-act-${a.n}`}>
                    <span className="inf-act__n">{a.n}</span>
                    <span className="inf-act__title">
                      <b>{a.titulo}</b>
                      <small>{a.sub.length} subactividades</small>
                    </span>
                    <span className="inf-act__chev" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </button>
                  <div className="inf-act__body" id={`inf-act-${a.n}`} hidden={!open}>
                    <p className="inf-act__text">{a.texto}</p>
                    <ol className="inf-subs">
                      {a.sub.map(([code, t], i) => (
                        <li key={code} style={{ '--i': i }}>
                          <span className="inf-subs__code">{code}</span>
                          <p>{t}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ---------- Componentes conexos ---------- */}
        <section className="inf-block" aria-labelledby="inf-comp">
          <p className="inf-eyebrow">Actividad 2 · Bolsa única a monto agotable</p>
          <h2 id="inf-comp" className="inf-h2">Componentes integrados a la operación</h2>
          <ul className="inf-comps">
            {COMPONENTES.map((c, i) => (
              <li key={c} style={{ '--i': i }}>
                <span className="inf-comps__icon">{ICONOS[c]}</span>
                <b>{COMPONENTE[c]}</b>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- En construcción ---------- */}
        <section className="inf-soon" aria-labelledby="inf-soon-title">
          <div className="inf-soon__tape" aria-hidden="true" />
          <div className="inf-soon__body">
            <span className="inf-soon__status"><IconCone width={16} height={16} /> En construcción</span>
            <h2 id="inf-soon-title">Muy pronto en este espacio</h2>
            <p>Seguimos completando la información del proyecto. Estos contenidos se publicarán aquí:</p>
            <ul>
              <li>{ICONOS.doc}<span><b>Documentos y formatos</b>Formatos, informes y lineamientos para el equipo.</span></li>
              <li>{ICONOS.equipo}<span><b>Equipo y contactos</b>Responsables del proyecto y canales de atención.</span></li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
