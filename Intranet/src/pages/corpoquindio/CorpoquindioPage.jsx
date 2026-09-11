import { useEffect } from 'react'
import {
  IconArrowRight,
  IconCheck,
  IconDownload,
  IconExternal,
  IconWhatsapp,
} from '../../components/Icons.jsx'
import { Cenefa, GlyphMark } from './glyphs.jsx'
import QuindioMap from './QuindioMap.jsx'
import { useReveal } from '../../lib/useReveal.js'
import {
  DOCUMENTOS,
  MUNICIPIOS,
  PASOS,
  PROJECT,
  REDES,
  SECTORES,
  STATS,
  WHATSAPP_URL,
} from './data.js'

import gysLogo from '../../assets/gys_logo.png'
import logoQE from '../../assets/CORPOQUINDIO/quindio_emprendedor.png'
import logoCorpo from '../../assets/CORPOQUINDIO/logo_corpo_quindio.png'
import aliados from '../../assets/CORPOQUINDIO/marcas_aliadas.png'
import personajeSaluda from '../../assets/CORPOQUINDIO/persona_publicitario.png'
import personajeSenala from '../../assets/CORPOQUINDIO/personaje_publicitario2.png'
import './corpoquindio.css'

export default function CorpoquindioPage() {
  useReveal()

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, '')
    const target = h && h !== 'corpoquindio' ? document.getElementById(h) : null
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="qe">
      <main className="qe-main">
        {/* ---------- Hero ---------- */}
        <section className="qe-hero" id="corpoquindio-proyecto">
          <div className="qe-hero__deco" aria-hidden="true">
            <span className="qe-blob qe-blob--a" />
            <span className="qe-blob qe-blob--b" />
            <span className="qe-blob qe-blob--c" />
          </div>

          <div className="qe-hero__inner">
            <div className="qe-hero__text" data-reveal>
              <a className="qe-hero__cobrand" href="#inicio" aria-label="Ir a la intranet de Gestión y Servicios">
                <img src={gysLogo} alt="Gestión y Servicios" />
              </a>

              <span className="qe-badge">
                <GlyphMark width={14} height={14} />
                {PROJECT.convocatoria}
              </span>

              <img className="qe-hero__logo" src={logoQE} alt="Quindío Emprendedor" />

              <p className="qe-hero__kicker">Fortalecimiento Integral</p>
              <p className="qe-hero__lema">Crecer juntos es llegar más lejos.</p>

              <p className="qe-hero__desc">
                Fortalecemos emprendimientos y unidades productivas del Quindío con
                asesoría técnica especializada, acompañamiento empresarial y activos
                productivos. Conectamos ideas, talentos y oficios con oportunidades
                reales de crecimiento.
              </p>

              <div className="qe-hero__cta">
                <a className="qe-btn qe-btn--primary" href="#corpoquindio-sectores">
                  Conocer el proyecto
                  <IconArrowRight width={18} height={18} />
                </a>
                <a className="qe-btn qe-btn--ghost" href="#corpoquindio-documentos">
                  Ver documentos
                  <IconDownload width={18} height={18} />
                </a>
              </div>

              <p className="qe-hero__bpin">BPIN {PROJECT.bpin}</p>
            </div>

            <div className="qe-hero__art" data-reveal>
              <span className="qe-hero__disc" aria-hidden="true" />
              <span className="qe-hero__ring" aria-hidden="true" />
              <img src={personajeSaluda} alt="" className="qe-hero__char" />
            </div>
          </div>

        </section>

        {/* ---------- Cifras ---------- */}
        <section className="qe-stats" aria-label="Cifras del proyecto">
          <div className="qe-wrap qe-stats__grid">
            {STATS.map((s, i) => (
              <article className={`qe-stat qe-stat--${s.tone}`} key={s.label} data-reveal style={{ '--d': `${i * 70}ms` }}>
                <span className="qe-stat__value">{s.value}</span>
                <span className="qe-stat__label">{s.label}</span>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Propósito / concepto ---------- */}
        <section className="qe-sec qe-sec--concepto">
          <div className="qe-wrap qe-concepto">
            <div className="qe-concepto__text" data-reveal>
              <SecTitle eyebrow="El proyecto">
                Una marca que nace del <em>territorio</em>
              </SecTitle>
              <p>
                Quindío Emprendedor es una iniciativa orientada al fortalecimiento del
                ecosistema de emprendimiento del departamento. Acompaña, impulsa y
                visibiliza a emprendedores y unidades productivas de los 12 municipios.
              </p>
              <p>
                Su lenguaje gráfico toma como inspiración la riqueza simbólica de la
                <strong> cultura Quimbaya</strong>, reinterpretando formas ancestrales en un
                sistema de glifos contemporáneos. Cada letra del logo incorpora patrones
                que representan un sector productivo: artesanías, comunicación, papelería,
                marroquinería, confección, café y tecnología.
              </p>
              <ul className="qe-checks">
                <li><IconCheck width={16} height={16} /> Asesoría técnica especializada</li>
                <li><IconCheck width={16} height={16} /> Acompañamiento empresarial</li>
                <li><IconCheck width={16} height={16} /> Provisión de activos productivos</li>
              </ul>
            </div>

            <aside className="qe-redes" data-reveal aria-label="Redes sociales del proyecto">
              <p className="qe-redes__title">Síguenos</p>
              <ul>
                {REDES.map(({ id, label, handle, url, Icon }) => (
                  <li key={id}>
                    <a href={url} target="_blank" rel="noreferrer" className={`qe-red qe-red--${id}`}>
                      <span className="qe-red__icon"><Icon width={20} height={20} /></span>
                      <span className="qe-red__text">
                        <strong>{label}</strong>
                        <em>{handle}</em>
                      </span>
                      <IconArrowRight className="qe-red__go" width={16} height={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <Cenefa className="qe-cenefa qe-cenefa--divider" tone="var(--qe-beige)" />

        {/* ---------- Sectores ---------- */}
        <section className="qe-sec qe-sec--sectores" id="corpoquindio-sectores">
          <div className="qe-wrap">
            <SecTitle eyebrow="Convocatoria" center>
              ¿Quiénes pueden <em>participar</em>?
            </SecTitle>
            <p className="qe-sec__lead">
              Unidades productivas del Quindío con mínimo un año de funcionamiento,
              pertenecientes a alguno de estos sectores.
            </p>

            <ul className="qe-sectores">
              {SECTORES.map(({ id, label, Glyph, tone }, i) => (
                <li key={id} data-reveal style={{ '--d': `${i * 45}ms` }}>
                  <div className={`qe-card qe-card--sector qe-tone-${tone}`}>
                    <span className="qe-card__glifo"><Glyph width={34} height={34} /></span>
                    <span className="qe-card__label">{label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Proceso ---------- */}
        <section className="qe-sec qe-sec--proceso" id="corpoquindio-proceso">
          <div className="qe-wrap">
            <SecTitle eyebrow="Proceso" center light>
              ¿Cómo <em>funciona</em>?
            </SecTitle>

            <ol className="qe-pasos">
              {PASOS.map((p, i) => (
                <li key={p.n} data-reveal style={{ '--d': `${i * 80}ms` }}>
                  <span className="qe-pasos__n">{p.n}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Territorio ---------- */}
        <section className="qe-sec qe-sec--territorio" id="corpoquindio-territorio">
          <div className="qe-wrap">
            <SecTitle eyebrow="Cobertura">
              Todo el <em>Quindío</em>
            </SecTitle>
            <p className="qe-sec__lead qe-sec__lead--left">
              El proyecto tiene cobertura en los {MUNICIPIOS.length} municipios del
              departamento. Pasa el cursor sobre un municipio para ubicarlo.
            </p>
            <div data-reveal>
              <QuindioMap />
            </div>
          </div>
        </section>

        {/* ---------- Documentos ---------- */}
        <section className="qe-sec qe-sec--docs" id="corpoquindio-documentos">
          <div className="qe-wrap">
            <SecTitle eyebrow="Recursos" center>
              Documentos y <em>recursos</em>
            </SecTitle>
            <p className="qe-sec__lead">
              Descarga y diligencia los formatos requeridos para completar tu postulación.
            </p>

            <ul className="qe-docs">
              {DOCUMENTOS.map((d, i) => (
                <li key={d.id} data-reveal style={{ '--d': `${i * 45}ms` }}>
                  <article className={`qe-card qe-doc ${d.destacado ? 'is-featured' : ''}`}>
                    <div className="qe-doc__head">
                      <span className="qe-doc__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                          <path d="M14 3v5h5" />
                        </svg>
                      </span>
                      <span className="qe-doc__tag">{d.tag}</span>
                    </div>
                    <h3 className="qe-doc__title">{d.title}</h3>
                    <p className="qe-doc__desc">{d.desc}</p>
                    {d.condicional && (
                      <p className="qe-doc__warn">Aplica solo si cumples esta condición</p>
                    )}
                    <a className="qe-btn qe-btn--doc" href={d.file} download>
                      <IconDownload width={16} height={16} />
                      Descargar
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Participación ciudadana ---------- */}
        <section className="qe-sec qe-sec--control">
          <div className="qe-wrap qe-control" data-reveal>
            <div>
              <SecTitle eyebrow="Proyectos SGR">
                Participación ciudadana y <em>control social</em>
              </SecTitle>
              <p>
                La Fundación Universidad del Valle invita a la participación ciudadana en la
                ejecución y evaluación de los proyectos financiados con recursos del Sistema
                General de Regalías, en cumplimiento del artículo 64 de la Ley 2056 de 2020.
              </p>
            </div>
            <a
              className="qe-btn qe-btn--outline-dark"
              href="https://fundacionunivalle.com"
              target="_blank"
              rel="noreferrer"
            >
              Ir a Auditores Ciudadanos
              <IconExternal width={16} height={16} />
            </a>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section className="qe-cta">
          <div className="qe-wrap qe-cta__inner">
            <img className="qe-cta__char" src={personajeSenala} alt="" />
            <div className="qe-cta__text" data-reveal>
              <h2>Tu emprendimiento <em>merece crecer</em>.</h2>
              <p>
                Accede a acompañamiento especializado y oportunidades de fortalecimiento
                para llevar tu negocio al siguiente nivel.
              </p>
              <div className="qe-cta__actions">
                <a className="qe-btn qe-btn--primary" href="#corpoquindio-proyecto">
                  Conocer más
                  <IconArrowRight width={18} height={18} />
                </a>
                <a
                  className="qe-btn qe-btn--wa"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconWhatsapp width={18} height={18} />
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>
          <Cenefa className="qe-cenefa qe-cenefa--cta" tone="rgba(255,255,255,.35)" />
        </section>

        {/* ---------- Aliados ---------- */}
        <section className="qe-aliados" aria-label="Marcas aliadas del proyecto">
          <div className="qe-wrap">
            <p className="qe-aliados__title">Un proyecto de</p>
            <img src={aliados} alt="Gobierno del Quindío, Quindío Emprendedor, SGR, Fundación Univalle y UT Corpo Quindío" />
          </div>
        </section>
      </main>

      <footer className="qe-foot">
        <div className="qe-wrap qe-foot__inner">
          <img className="qe-foot__logo" src={logoCorpo} alt="UT Corpo Quindío" />
          <p className="qe-foot__legal">
            {PROJECT.nombreLargo}. BPIN {PROJECT.bpin}.
          </p>
        </div>
      </footer>
    </div>
  )
}

function SecTitle({ eyebrow, children, center, light }) {
  return (
    <div className={`qe-title ${center ? 'is-center' : ''} ${light ? 'is-light' : ''}`}>
      <span className="qe-title__eyebrow">
        <GlyphMark width={13} height={13} />
        {eyebrow}
      </span>
      <h2 className="qe-title__h">{children}</h2>
    </div>
  )
}
