import { useEffect } from 'react'
import {
  IconArrowRight,
  IconCheck,
  IconDownload,
  IconExternal,
} from '../../components/Icons.jsx'
import { useReveal } from '../../lib/useReveal.js'
import { Skyline, Hoja } from './deco.jsx'
import {
  COLORES,
  DOTACION,
  FICHA,
  LINEAS,
  OBJETIVOS,
  OBJETIVO_GENERAL,
  PROJECT,
  RECURSOS,
} from './data.js'

import gysLogo from '../../assets/gys_logo.png'
import logoMCB from '../../assets/mi-cali-bella/logo.png'
import bellaSaluda from '../../assets/mi-cali-bella/bella-saluda.png'
import bellaFrente from '../../assets/mi-cali-bella/bella-frente.png'
import bellaVuela from '../../assets/mi-cali-bella/bella-vuela.png'
import bellaFeliz from '../../assets/mi-cali-bella/bella-feliz.png'
import bellaMusica from '../../assets/mi-cali-bella/bella-musica.png'
import bellaSilba from '../../assets/mi-cali-bella/bella-silba.png'
import bellaUaesp from '../../assets/mi-cali-bella/bella-saluda-uaesp.png'
import './promotores.css'

const POSES = [
  { src: bellaFrente, alt: 'Bella de frente' },
  { src: bellaVuela, alt: 'Bella volando' },
  { src: bellaFeliz, alt: 'Bella feliz' },
  { src: bellaMusica, alt: 'Bella con música' },
  { src: bellaSilba, alt: 'Bella silbando' },
  { src: bellaUaesp, alt: 'Bella con la gorra de la UAESP' },
]

export default function PromotoresPage() {
  useReveal()

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, '')
    const target = h && h !== 'promotores' ? document.getElementById(h) : null
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="mcb">
      <main className="mcb-main">
        {/* ---------- Hero ---------- */}
        <section className="mcb-hero" id="promotores-proyecto">
          <span className="mcb-hero__blob mcb-hero__blob--a" aria-hidden="true" />
          <span className="mcb-hero__blob mcb-hero__blob--b" aria-hidden="true" />
          <Skyline className="mcb-hero__skyline" />

          <div className="mcb-hero__inner">
            <div className="mcb-hero__text" data-reveal>
              <a
                className="mcb-cobrand"
                href="#inicio"
                aria-label="Ir a la intranet de Gestión y Servicios"
              >
                <img src={gysLogo} alt="Gestión y Servicios" />
              </a>

              <img
                className="mcb-hero__logo"
                src={logoMCB}
                alt={PROJECT.nombre + ': ' + PROJECT.sub}
              />

              <p className="mcb-hero__lema">{PROJECT.lema}</p>
              <p className="mcb-hero__desc">
                Estrategia de pedagogía, prevención y control en el manejo de residuos
                sólidos para Santiago de Cali. Un proyecto de la UAESPM y la Alcaldía de
                Santiago de Cali, operado por Gestión y Servicios.
              </p>

              <div className="mcb-hero__cta">
                <a className="mcb-btn mcb-btn--primary" href="#promotores-recursos">
                  Recursos de marca
                  <IconArrowRight width={18} height={18} />
                </a>
                <a className="mcb-btn mcb-btn--ghost" href="#promotores-objetivos">
                  Conocer el proyecto
                </a>
              </div>

              <p className="mcb-hero__meta">Contrato {PROJECT.contrato}</p>
            </div>

            <div className="mcb-hero__art" data-reveal>
              <span className="mcb-hero__disc" aria-hidden="true" />
              <img
                className="mcb-hero__bella"
                src={bellaSaluda}
                alt="Bella, mascota del proyecto"
              />
            </div>
          </div>
        </section>

        {/* ---------- Ficha del contrato ---------- */}
        <section className="mcb-ficha" aria-label="Ficha del contrato">
          <div className="mcb-wrap mcb-ficha__grid">
            {FICHA.map((f, i) => (
              <article
                className={'mcb-stat mcb-stat--' + f.tone}
                key={f.label}
                data-reveal
                style={{ '--d': i * 70 + 'ms' }}
              >
                <span className="mcb-stat__value">{f.value}</span>
                <span className="mcb-stat__unit">{f.unit}</span>
                <span className="mcb-stat__label">{f.label}</span>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Objetivos ---------- */}
        <section className="mcb-sec mcb-sec--objetivos" id="promotores-objetivos">
          <div className="mcb-wrap">
            <SecTitle eyebrow="El proyecto">
              Recuperamos la <em>gobernanza</em> del espacio público
            </SecTitle>
            <p className="mcb-lead" data-reveal>
              {OBJETIVO_GENERAL}
            </p>

            <div className="mcb-obj">
              {OBJETIVOS.map((o, i) => (
                <article
                  className="mcb-obj__card"
                  key={o.n}
                  data-reveal
                  style={{ '--d': i * 90 + 'ms' }}
                >
                  <span className="mcb-obj__n">{o.n}</span>
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                </article>
              ))}
            </div>

            <ul className="mcb-lineas">
              {LINEAS.map((l, i) => (
                <li key={l.id} data-reveal style={{ '--d': i * 60 + 'ms' }}>
                  <Hoja className="mcb-lineas__icon" />
                  <h4>{l.title}</h4>
                  <p>{l.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Bella ---------- */}
        <section className="mcb-sec mcb-sec--bella" id="promotores-bella">
          <div className="mcb-wrap mcb-bella">
            <div className="mcb-bella__text">
              <SecTitle eyebrow="Mascota" light>
                ¡Hola, soy <em>Bella</em>!
              </SecTitle>
              <p data-reveal>
                Integrante del proyecto Promotores Mi Cali Bella, clave para transformar
                varias zonas de nuestra ciudad y, lo más importante, para sensibilizar a la
                ciudadanía caleña sobre el manejo adecuado de los residuos sólidos.
              </p>
              <p data-reveal>
                Como ave <strong>torito cabecirrojo</strong>, estaré a su lado en esta misión
                de recuperar a Cali y, sobre todo, de fomentar una cultura de conciencia
                ciudadana.
              </p>
            </div>

            <ul className="mcb-poses" aria-label="Poses de la mascota">
              {POSES.map((p, i) => (
                <li key={p.alt} data-reveal style={{ '--d': i * 55 + 'ms' }}>
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Identidad de marca ---------- */}
        <section className="mcb-sec mcb-sec--marca" id="promotores-marca">
          <div className="mcb-wrap">
            <SecTitle eyebrow="Manual de marca" center>
              Identidad <em>visual</em>
            </SecTitle>
            <p className="mcb-lead mcb-lead--center" data-reveal>
              Las gamas de verde evocan la frescura y vitalidad de la naturaleza, y la energía
              de la comunidad: armonía entre el medio ambiente y la vida urbana.
            </p>

            <div className="mcb-marca">
              <article className="mcb-card" data-reveal>
                <h3 className="mcb-card__title">Colorimetría</h3>
                <ul className="mcb-colores">
                  {COLORES.map((c) => (
                    <li key={c.hex}>
                      <span className="mcb-color" style={{ background: c.hex }} />
                      <span className="mcb-color__info">
                        <strong>{c.name}</strong>
                        <code>{c.hex}</code>
                        <em>{c.detail}</em>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="mcb-card" data-reveal style={{ '--d': '90ms' }}>
                <h3 className="mcb-card__title">Tipografía</h3>
                <p className="mcb-tipo">Mohr Rounded</p>
                <p className="mcb-tipo__note">
                  Familia del logosímbolo y las piezas gráficas.
                </p>
                <p className="mcb-tipo mcb-tipo--alt">Poppins</p>
                <p className="mcb-tipo__note">
                  Familia para papelería, membretes y presentaciones.
                </p>
                <ul className="mcb-checks">
                  <li>
                    <IconCheck width={15} height={15} /> Black / ExtraBold en títulos
                  </li>
                  <li>
                    <IconCheck width={15} height={15} /> SemiBold en subtítulos y botones
                  </li>
                  <li>
                    <IconCheck width={15} height={15} /> Light en textos secundarios
                  </li>
                </ul>
              </article>

              <article className="mcb-card" data-reveal style={{ '--d': '180ms' }}>
                <h3 className="mcb-card__title">Dotación del equipo</h3>
                <p className="mcb-card__lead">
                  Elementos de identificación para cada promotor en territorio.
                </p>
                <ul className="mcb-dot">
                  {DOTACION.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- Recursos ---------- */}
        <section className="mcb-sec mcb-sec--recursos" id="promotores-recursos">
          <div className="mcb-wrap">
            <SecTitle eyebrow="Descargas" center>
              Recursos y <em>plantillas</em>
            </SecTitle>
            <p className="mcb-lead mcb-lead--center" data-reveal>
              El manual de marca es una herramienta viva: guía las aplicaciones de la marca
              sin restringir la creatividad del equipo.
            </p>

            <ul className="mcb-recursos">
              {RECURSOS.map((r, i) => (
                <li key={r.id} data-reveal style={{ '--d': i * 50 + 'ms' }}>
                  <a
                    className="mcb-rec"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="mcb-rec__icon">
                      {r.externo ? (
                        <IconExternal width={20} height={20} />
                      ) : (
                        <IconDownload width={20} height={20} />
                      )}
                    </span>
                    <span className="mcb-rec__body">
                      <strong>{r.title}</strong>
                      <em>{r.desc}</em>
                      <span className="mcb-rec__tipo">{r.tipo}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="mcb-cta">
          <div className="mcb-wrap mcb-cta__inner">
            <img className="mcb-cta__bella" src={bellaFeliz} alt="" />
            <div className="mcb-cta__text" data-reveal>
              <h2>
                Una ciudad que evoluciona es una ciudad <em>limpia</em>.
              </h2>
              <p>
                Separa en la fuente, saca los residuos en el horario indicado y súmate al
                Sistema de Gestión Integral de Residuos Sólidos.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Entidades ---------- */}
        <section className="mcb-aliados" aria-label="Entidades del proyecto">
          <div className="mcb-wrap mcb-aliados__inner">
            <div>
              <p className="mcb-aliados__title">Entidad ejecutora</p>
              <p className="mcb-aliados__val">{PROJECT.entidad}</p>
            </div>
            <div>
              <p className="mcb-aliados__title">Operador</p>
              <p className="mcb-aliados__val">
                {PROJECT.contratista} · NIT {PROJECT.nit}
              </p>
            </div>
            <div>
              <p className="mcb-aliados__title">Contacto</p>
              <p className="mcb-aliados__val">
                PBX {PROJECT.pbx} · {PROJECT.direccion}, {PROJECT.ciudad}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mcb-foot">
        <div className="mcb-wrap mcb-foot__inner">
          <img className="mcb-foot__logo" src={logoMCB} alt="" />
          <p className="mcb-foot__legal">
            {PROJECT.nombre}: {PROJECT.sub} · Contrato {PROJECT.contrato}
          </p>
        </div>
      </footer>
    </div>
  )
}

function SecTitle({ eyebrow, children, center, light }) {
  return (
    <div
      className={
        'mcb-title' + (center ? ' is-center' : '') + (light ? ' is-light' : '')
      }
      data-reveal
    >
      <span className="mcb-title__eyebrow">
        <Hoja width={14} height={14} />
        {eyebrow}
      </span>
      <h2 className="mcb-title__h">{children}</h2>
    </div>
  )
}
