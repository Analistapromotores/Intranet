import { CORREO_AUSENTISMO, ANTES_DE_EMPEZAR, PREGUNTAS, SECCIONES } from './manual.js'
import { PageHeader } from './ui.jsx'
import { FOTOS } from './brand.js'
import { IconArrowRight, IconBook, IconMail, IconPrinter } from './icons.jsx'
import './manual.css'

/* Manual de usuario de Solicitudes (público): cómo hacer cada trámite, paso a paso. */

function Pasos({ pasos }) {
  return (
    <ol className="mn-steps">
      {pasos.map(([t, x], i) => (
        <li key={t}>
          <span className="mn-steps__n" aria-hidden="true">{i + 1}</span>
          <div><b>{t}</b><p>{x}</p></div>
        </li>
      ))}
    </ol>
  )
}

function Bloque({ titulo, cuando, href, pasos, resultado, estados, notas, correo, h = 'h3' }) {
  const H = h
  return (
    <div className="mn-block">
      {titulo && <H className="mn-block__title">{titulo}</H>}
      {cuando && <p className="mn-when"><b>Cuándo usarlo:</b> {cuando}</p>}
      <Pasos pasos={pasos} />
      {estados && (
        <dl className="mn-states">
          {estados.map(([t, x]) => <div key={t}><dt>{t}</dt><dd>{x}</dd></div>)}
        </dl>
      )}
      {resultado && <p className="mn-result"><b>Resultado:</b> {resultado}</p>}
      {correo && (
        <a className="sv-btn mn-mail" href={`mailto:${CORREO_AUSENTISMO}?subject=${encodeURIComponent('Ausentismo – ')}`}>
          <IconMail width={18} height={18} /> {CORREO_AUSENTISMO}
        </a>
      )}
      {notas?.map((n) => <p key={n} className="mn-note">{n}</p>)}
      {href && (
        <a className="sv-link mn-go" href={href}>Ir al formulario <IconArrowRight width={16} height={16} /></a>
      )}
    </div>
  )
}

/* Los enlaces internos de la intranet usan #, así que el índice desplaza la página en vez de cambiar el hash. */
const irA = (id) => (e) => {
  e.preventDefault()
  document.getElementById(`mn-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function ManualPage() {
  return (
    <div className="sv mn">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Manual de usuario']]}
        eyebrow="Guía paso a paso"
        title="Manual de usuario: Solicitudes"
        lead="Cómo pedir personal, equipos y salas, y cómo tramitar un permiso de ausentismo. Sin usuario ni contraseña."
        icon={IconBook}
        photo={FOTOS.equipoBanner}
      >
        <button type="button" className="sv-btn sv-btn--light mn-print" onClick={() => window.print()}>
          <IconPrinter width={18} height={18} /> Imprimir o guardar PDF
        </button>
      </PageHeader>

      <div className="sv-wrap sv-page">
        <nav className="mn-index" aria-label="Contenido del manual">
          <b>En este manual</b>
          <ol>
            <li><a href="#solicitudes-manual" onClick={irA('inicio')}>Antes de empezar</a></li>
            {SECCIONES.map((s) => (
              <li key={s.id}><a href="#solicitudes-manual" onClick={irA(s.id)}>{s.titulo}</a></li>
            ))}
            <li><a href="#solicitudes-manual" onClick={irA('preguntas')}>Preguntas frecuentes</a></li>
          </ol>
        </nav>

        <section className="sv-block" id="mn-inicio" aria-labelledby="mn-inicio-t">
          <p className="sv-eyebrow">Para todos</p>
          <h2 id="mn-inicio-t" className="sv-h2">Antes de empezar</h2>
          <ul className="mn-ready">
            {ANTES_DE_EMPEZAR.map(([t, x]) => <li key={t}><b>{t}</b><p>{x}</p></li>)}
          </ul>
        </section>

        {SECCIONES.map((s) => (
          <section key={s.id} className="sv-block mn-section" id={`mn-${s.id}`} aria-labelledby={`mn-${s.id}-t`}>
            <p className="sv-eyebrow">{s.ruta}</p>
            <h2 id={`mn-${s.id}-t`} className="sv-h2"><span className="mn-num">{s.numero}</span> {s.titulo}</h2>
            <p className="mn-intro">{s.intro}</p>
            {s.subsecciones
              ? s.subsecciones.map((b) => <Bloque key={b.numero} {...b} titulo={`${b.numero} ${b.titulo}`} />)
              : <Bloque {...s} titulo={null} />}
          </section>
        ))}

        <section className="sv-block" id="mn-preguntas" aria-labelledby="mn-preguntas-t">
          <p className="sv-eyebrow">Dudas comunes</p>
          <h2 id="mn-preguntas-t" className="sv-h2">Preguntas frecuentes</h2>
          <div className="sv-faq">
            {PREGUNTAS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </section>
      </div>
    </div>
  )
}
