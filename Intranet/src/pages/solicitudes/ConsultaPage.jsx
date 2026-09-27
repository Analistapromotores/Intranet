import { useEffect, useState } from 'react'
import { ESTADOS } from '../../../shared/solicitudes.js'
import { api } from './api.js'
import { misSolicitudes } from './form.js'
import { PageHeader, StatusBadge } from './ui.jsx'
import { IconArrowRight, IconList, IconSearch } from './icons.jsx'

const fechaLarga = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

/* Tarjeta de una solicitud con su línea de tiempo de estados. */
export function SolicitudCard({ s, abierta = false }) {
  const [open, setOpen] = useState(abierta)
  return (
    <article className="sv-req">
      <button type="button" className="sv-req__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="sv-req__num">{s.numero}</span>
        <span className="sv-req__main">
          <b>{s.tipoNombre}</b>
          <small>{s.titulo}</small>
        </span>
        <span className="sv-req__date">{fechaLarga(s.creada)}</span>
        <StatusBadge estado={s.estado} />
        <IconArrowRight width={18} height={18} className={`sv-req__chev ${open ? 'is-open' : ''}`} />
      </button>
      {open && (
        <div className="sv-req__body">
          <ol className="sv-timeline">
            {s.historial.map((h, i) => (
              <li key={i} className={`sv-timeline__item sv-tone--${ESTADOS[h.estado]?.tono || 'gris'}`}>
                <span className="sv-timeline__dot" aria-hidden="true" />
                <div>
                  <b>{ESTADOS[h.estado]?.label || h.estado}</b> <small>{fechaLarga(h.fecha)}</small>
                  {h.comentario && <p>{h.comentario}</p>}
                </div>
              </li>
            ))}
          </ol>
          {s.correo && <p className="sv-muted">Correo {s.correo.estado === 'enviado' ? 'enviado' : s.correo.estado === 'simulado' ? 'registrado en modo de pruebas' : 'pendiente de reenvío'} a {s.correo.to}.</p>}
        </div>
      )}
    </article>
  )
}

export default function ConsultaPage() {
  const [locales] = useState(misSolicitudes)
  const [mias, setMias] = useState(() => (locales.length ? null : []))
  const [dato, setDato] = useState('')
  const [resultados, setResultados] = useState(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (!locales.length) return
    const porCorreo = locales.reduce((acc, s) => ({ ...acc, [s.correo]: [...(acc[s.correo] || []), s.numero] }), {})
    Promise.all(Object.entries(porCorreo).map(([c, nums]) => api.mias(c, nums).catch(() => [])))
      .then((listas) => setMias(listas.flat().sort((a, b) => b.creada.localeCompare(a.creada))))
  }, [locales])

  async function buscar(e) {
    e.preventDefault()
    setError('')
    setResultados(null)
    if (!dato.trim()) return setError('Escribe tu número de cédula o tu correo.')
    setBuscando(true)
    try {
      setResultados(await api.buscar(dato.trim()))
    } catch (err) {
      setError(err.message)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Mis solicitudes']]}
        eyebrow="Seguimiento"
        title="Consultar solicitudes"
        lead="Revisa el estado y la trazabilidad de tus solicitudes."
        icon={IconList}
      />
      <div className="sv-wrap sv-page sv-consulta">
        <section className="sv-card" aria-labelledby="sv-buscar">
          <h2 id="sv-buscar" className="sv-card__title">Buscar mis solicitudes</h2>
          <form className="sv-lookup" onSubmit={buscar} noValidate>
            <div className="sv-field">
              <label className="sv-label" htmlFor="sv-dato">Número de cédula o correo</label>
              <input id="sv-dato" className="sv-input" value={dato} onChange={(e) => setDato(e.target.value)} placeholder="Ej. 1130456789 o nombre@gestionyservicios.com.co" autoComplete="off" aria-describedby="sv-dato-ayuda" />
              <small id="sv-dato-ayuda" className="sv-muted">Usa cualquiera de los dos: el correo con el que registraste la solicitud o la cédula que escribiste en ella.</small>
            </div>
            <button type="submit" className="sv-btn" disabled={buscando}>{buscando ? <><span className="sv-spinner" aria-hidden="true" /> Buscando…</> : <><IconSearch width={18} height={18} /> Consultar</>}</button>
          </form>
          {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
          {resultados && (
            <div className="sv-result">
              <p className="sv-muted" aria-live="polite">{resultados.length === 1 ? 'Encontramos 1 solicitud.' : `Encontramos ${resultados.length} solicitudes.`}</p>
              <div className="sv-reqs">{resultados.map((s) => <SolicitudCard key={s.id} s={s} abierta={resultados.length === 1} />)}</div>
            </div>
          )}
        </section>

        <section aria-labelledby="sv-mias">
          <h2 id="sv-mias" className="sv-h2 sv-h2--sm">Enviadas desde este navegador</h2>
          {mias === null && <div className="sv-req sv-skeleton" aria-busy="true" />}
          {mias?.length === 0 && (
            <div className="sv-empty">
              <IconList width={32} height={32} />
              <p>Aún no has enviado solicitudes desde este navegador.</p>
              <a className="sv-btn sv-btn--ghost" href="#solicitudes">Ir a Solicitudes</a>
            </div>
          )}
          <div className="sv-reqs">{mias?.map((s) => <SolicitudCard key={s.id} s={s} />)}</div>
        </section>
      </div>
    </div>
  )
}
