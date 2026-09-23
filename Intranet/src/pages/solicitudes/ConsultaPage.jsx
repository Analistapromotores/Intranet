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
  const [numero, setNumero] = useState('')
  const [correo, setCorreo] = useState('')
  const [resultado, setResultado] = useState(null)
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
    setResultado(null)
    if (!numero.trim() || !correo.trim()) return setError('Escribe el número de solicitud y el correo con el que la registraste.')
    setBuscando(true)
    try {
      setResultado(await api.consultar(numero.trim(), correo.trim()))
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
          <h2 id="sv-buscar" className="sv-card__title">Buscar por número</h2>
          <form className="sv-lookup" onSubmit={buscar} noValidate>
            <div className="sv-field">
              <label className="sv-label" htmlFor="sv-num">Número de solicitud</label>
              <input id="sv-num" className="sv-input" value={numero} onChange={(e) => setNumero(e.target.value.toUpperCase())} placeholder="Ej. II-2026-0001" autoComplete="off" />
            </div>
            <div className="sv-field">
              <label className="sv-label" htmlFor="sv-mail">Correo con el que la registraste</label>
              <input id="sv-mail" className="sv-input" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
            </div>
            <button type="submit" className="sv-btn" disabled={buscando}>{buscando ? <><span className="sv-spinner" aria-hidden="true" /> Buscando…</> : <><IconSearch width={18} height={18} /> Consultar</>}</button>
          </form>
          {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
          {resultado && <div className="sv-result"><SolicitudCard s={resultado} abierta /></div>}
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
