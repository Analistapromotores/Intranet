import { useEffect, useMemo, useState } from 'react'
import { IconCalendar, IconChevronLeft, IconChevronRight } from './Icons.jsx'
import { getColombianHolidays } from '../data/holidays.js'
import { request } from '../pages/cumpleanos/api.js'
import { useSession } from '../lib/useSession.js'
import { SALAS } from '../../shared/salas.js'
import NuevaReunion from './NuevaReunion.jsx'
import './calendario.css'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const ESTADOS = { programada: 'Programada', en_curso: 'En curso', finalizada: 'Finalizada' }

const NOW = new Date()
const TODAY_KEY = keyOf(NOW.getFullYear(), NOW.getMonth(), NOW.getDate())

function keyOf(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/* «14:30» → «2:30 p. m.» */
function hora12(h) {
  const [hh, mm] = String(h).split(':').map(Number)
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'p. m.' : 'a. m.'}`
}

const fechaLarga = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* Detalle de una reserva o reunión: quién, cuándo, dónde y en qué estado va. */
function DetalleEvento({ e, esAdmin, onCancelar, cancelando }) {
  const sala = SALAS.find((s) => s.id === e.sala)
  const donde = sala ? sala.nombre : e.lugar || 'Sin lugar indicado'
  return (
    <>
      <dl className="cal__ev-det">
        <div><dt>Estado</dt><dd>{ESTADOS[e.estado] || e.estado}</dd></div>
        <div><dt>Tipo</dt><dd>{e.tipo === 'evento' ? 'Reunión del calendario' : 'Reserva de sala'}</dd></div>
        <div><dt>Dónde</dt><dd>{donde}</dd></div>
        <div><dt>Fecha</dt><dd>{fechaLarga(e.fecha)}</dd></div>
        <div><dt>Horario</dt><dd>{hora12(e.inicio)} – {hora12(e.fin)}</dd></div>
        <div><dt>{e.tipo === 'evento' ? 'Organiza' : 'Reservada por'}</dt><dd>{e.nombre}</dd></div>
        {e.colaborador && <div><dt>Contacto</dt><dd>{e.colaborador}</dd></div>}
        <div><dt>Motivo</dt><dd>{e.descripcion}</dd></div>
      </dl>
      {esAdmin && (
        <button type="button" className="cal__ev-cancelar" onClick={() => onCancelar(e)} disabled={cancelando}>
          {cancelando ? 'Cancelando…' : e.tipo === 'evento' ? 'Cancelar reunión' : 'Cancelar reserva'}
        </button>
      )}
    </>
  )
}

export default function CorporateCalendar() {
  const [view, setView] = useState({ year: NOW.getFullYear(), month: NOW.getMonth() })
  const [selected, setSelected] = useState(null)
  const [eventos, setEventos] = useState([])
  const [abierto, setAbierto] = useState(null)
  const [version, setVersion] = useState(0)
  const [nueva, setNueva] = useState(false)
  const [cancelando, setCancelando] = useState(null)
  const [error, setError] = useState('')
  const user = useSession()
  const esAdmin = user?.role === 'admin'

  const holidays = useMemo(() => getColombianHolidays(view.year), [view.year])

  /* Reservas de sala y reuniones del mes que se está viendo: son públicas, las ve cualquiera. */
  useEffect(() => {
    let vivo = true
    const desde = keyOf(view.year, view.month, 1)
    const hasta = keyOf(view.year, view.month, new Date(view.year, view.month + 1, 0).getDate())
    request(`/salas/reservas?desde=${desde}&hasta=${hasta}`)
      .then((r) => { if (vivo) setEventos(r) })
      .catch(() => { if (vivo) setEventos([]) })
    return () => { vivo = false }
  }, [view, version])

  const porDia = useMemo(() => {
    const m = {}
    eventos.forEach((e) => { (m[e.fecha] ||= []).push(e) })
    Object.values(m).forEach((l) => l.sort((a, b) => a.inicio.localeCompare(b.inicio)))
    return m
  }, [eventos])

  const weeks = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const days = new Date(view.year, view.month + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7
    const cells = []
    for (let i = 0; i < offset; i += 1) cells.push(null)
    for (let d = 1; d <= days; d += 1) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [view])

  const shift = (delta) => {
    setSelected(null)
    setAbierto(null)
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  const goToday = () => {
    setSelected(null)
    setAbierto(null)
    setView({ year: NOW.getFullYear(), month: NOW.getMonth() })
  }

  const elegir = (k) => {
    setSelected(selected === k ? null : k)
    setAbierto(null)
    setError('')
  }

  async function cancelar(e) {
    if (!window.confirm(`¿Cancelar «${e.descripcion}»? Dejará de verse en el calendario.`)) return
    setCancelando(e.id)
    setError('')
    try {
      await request(`/salas/reservas/${e.id}`, { method: 'DELETE' })
      setAbierto(null)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelando(null)
    }
  }

  const detail = selected ? getColombianHolidays(Number(selected.slice(0, 4)))[selected] : null
  const detailParts = selected ? selected.split('-').map(Number) : null
  const delDia = selected ? porDia[selected] || [] : []

  return (
    <section className="cal card" aria-labelledby="cal-title">
      <div className="card__head">
        <IconCalendar className="card__head-icon" width={20} height={20} />
        <h2 id="cal-title" className="card__title">Calendario corporativo</h2>
        {esAdmin && (
          <button type="button" className="card__link cal__nueva" onClick={() => setNueva(true)}>
            Nueva reunión
          </button>
        )}
        <button type="button" className="card__link cal__today" onClick={goToday}>
          Hoy
        </button>
      </div>

      <div className="cal__body">
        <div className="cal__nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Mes anterior">
            <IconChevronLeft width={16} height={16} />
          </button>
          <strong>{MONTHS[view.month]} {view.year}</strong>
          <button type="button" onClick={() => shift(1)} aria-label="Mes siguiente">
            <IconChevronRight width={16} height={16} />
          </button>
        </div>

        <table className="cal__grid">
          <thead>
            <tr>
              {WEEKDAYS.map((w, i) => (
                <th key={i} scope="col">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((row, ri) => (
              <tr key={ri}>
                {row.map((day, ci) => {
                  if (!day) return <td key={ci} className="cal__cell is-empty" />
                  const k = keyOf(view.year, view.month, day)
                  const holiday = holidays[k]
                  const evs = porDia[k]
                  const isToday = k === TODAY_KEY

                  if (holiday || evs) {
                    const partes = [holiday?.name, evs && `${evs.length} ${evs.length === 1 ? 'reserva o reunión' : 'reservas o reuniones'}`].filter(Boolean)
                    return (
                      <td key={ci} className="cal__cell">
                        <button
                          type="button"
                          className={`cal__day${holiday ? ' is-holiday' : ''}${evs ? ' has-events' : ''}${isToday ? ' is-today' : ''}${
                            selected === k ? ' is-selected' : ''
                          }`}
                          title={partes.join(' · ')}
                          aria-label={`${day} de ${MONTHS[view.month]}: ${partes.join(', ')}`}
                          aria-pressed={selected === k}
                          onClick={() => elegir(k)}
                        >
                          {day}
                        </button>
                      </td>
                    )
                  }

                  return (
                    <td key={ci} className="cal__cell">
                      <span className={`cal__day${isToday ? ' is-today' : ''}`}>{day}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cal__legend">
          <span><i className="cal__key cal__key--red" />Festivo</span>
          <span><i className="cal__key cal__key--evento" />Reserva o reunión</span>
          <span><i className="cal__key cal__key--today" />Hoy</span>
        </div>

        <div className="cal__detail" aria-live="polite">
          {selected ? (
            <>
              <div className="cal__event">
                <div className={`cal__date ${detail ? 'cal__date--red' : 'cal__date--blue'}`}>
                  <span className="cal__date-day">{detailParts[2]}</span>
                  <span className="cal__date-mon">
                    {MONTHS[detailParts[1] - 1].slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="cal__event-info">
                  {detail ? (
                    <>
                      <p className="cal__event-name">
                        {detail.name}
                        <span className="cal__badge">Festivo</span>
                      </p>
                      <p className="cal__detail-desc">{detail.description}</p>
                      {detail.moved && (
                        <p className="cal__detail-moved">
                          Trasladado al lunes por la Ley Emiliani.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="cal__event-name">{delDia.length === 1 ? '1 reserva o reunión' : `${delDia.length} reservas o reuniones`}</p>
                  )}
                </div>
              </div>
              {delDia.length > 0 && (
                <ul className="cal__evs">
                  {delDia.map((e) => (
                    <li key={e.id}>
                      <button type="button" className="cal__ev" aria-expanded={abierto === e.id} onClick={() => setAbierto(abierto === e.id ? null : e.id)}>
                        <span className="cal__ev-hora">{hora12(e.inicio)} – {hora12(e.fin)}</span>
                        <span className="cal__ev-tit">{e.descripcion}</span>
                        <span className={`cal__chip cal__chip--${e.estado}`}>{ESTADOS[e.estado] || e.estado}</span>
                      </button>
                      {abierto === e.id && <DetalleEvento e={e} esAdmin={esAdmin} onCancelar={cancelar} cancelando={cancelando === e.id} />}
                    </li>
                  ))}
                </ul>
              )}
              {error && <p className="cal__error" role="alert">{error}</p>}
            </>
          ) : (
            <p className="cal__detail-hint">
            </p>
          )}
        </div>
      </div>

      {nueva && (
        <NuevaReunion
          fechaInicial={selected && selected >= TODAY_KEY ? selected : TODAY_KEY}
          onClose={() => setNueva(false)}
          onCreada={(fecha) => {
            setNueva(false)
            const [y, m] = fecha.split('-').map(Number)
            setView({ year: y, month: m - 1 })
            setSelected(fecha)
            setVersion((v) => v + 1)
          }}
        />
      )}
    </section>
  )
}
