import { useEffect, useMemo, useRef, useState } from 'react'
import { HORA_APERTURA, HORA_CIERRE, SALAS, minutos, validarReserva } from '../../../shared/salas.js'
import { FOTOS, MARCA } from './brand.js'
import { PageHeader } from './ui.jsx'
import { IconArrowLeft, IconArrowRight, IconCalendarPlus, IconClock, IconPlus, IconTrash, IconX } from './icons.jsx'
import './salas.css'

/* Reserva de salas: calendario por día, semana o mes y formulario lateral. */

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const ALTO_HORA = 52
const HORAS = Array.from({ length: HORA_CIERRE - HORA_APERTURA }, (_, i) => HORA_APERTURA + i)
const SALA = Object.fromEntries(SALAS.map((s) => [s.id, s]))

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const sumar = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const lunes = (d) => sumar(d, -((d.getDay() + 6) % 7))
const hh = (h) => `${String(h).padStart(2, '0')}:00`
const hora12 = (h) => { const [a, b] = h.split(':').map(Number); return `${((a + 11) % 12) + 1}:${String(b).padStart(2, '0')} ${a < 12 ? 'a. m.' : 'p. m.'}` }

/* Llaves de las reservas propias (para poder cancelarlas desde este navegador). */
const CLAVE = 'gys-reservas-propias'
const leerPropias = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '{}') } catch { return {} } }
const guardarPropia = (id, key) => { try { localStorage.setItem(CLAVE, JSON.stringify({ ...leerPropias(), [id]: key })) } catch { /* sin almacenamiento */ } }
const quitarPropia = (id) => { try { const p = leerPropias(); delete p[id]; localStorage.setItem(CLAVE, JSON.stringify(p)) } catch { /* sin almacenamiento */ } }
const PERFIL = 'gys-reservas-perfil'
const leerPerfil = () => { try { return JSON.parse(localStorage.getItem(PERFIL) || '{}') } catch { return {} } }

async function pedir(url, opciones = {}) {
  const res = await fetch(url, { credentials: 'same-origin', headers: opciones.body ? { 'Content-Type': 'application/json' } : undefined, ...opciones }).catch(() => null)
  if (!res) throw Object.assign(new Error('No hay conexión con el servidor de la intranet.'), { fields: {} })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'No se pudo completar la operación.'), { fields: data.fields || {} })
  return data
}

function rango(vista, ref) {
  if (vista === 'dia') return [ref, ref]
  if (vista === 'semana') { const l = lunes(ref); return [l, sumar(l, 6)] }
  const ini = lunes(new Date(ref.getFullYear(), ref.getMonth(), 1))
  return [ini, sumar(ini, 41)]
}

function titulo(vista, ref) {
  if (vista === 'dia') return ref.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (vista === 'mes') return `${MESES[ref.getMonth()]} ${ref.getFullYear()}`
  const l = lunes(ref)
  const d = sumar(l, 6)
  return l.getMonth() === d.getMonth() ? `${l.getDate()} – ${d.getDate()} de ${MESES[l.getMonth()]} ${l.getFullYear()}` : `${l.getDate()} ${MESES[l.getMonth()].slice(0, 3)} – ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

export default function SalasPage() {
  const [vista, setVista] = useState(() => (window.innerWidth < 760 ? 'dia' : 'semana'))
  const [ref, setRef] = useState(() => new Date())
  const [reservas, setReservas] = useState(null)
  const [hoy, setHoy] = useState(iso(new Date()))
  const [panel, setPanel] = useState(null) // { modo: 'nueva', fecha, inicio } | { modo: 'ver', r }
  const [aviso, setAviso] = useState('')
  const [propias, setPropias] = useState(leerPropias)

  const [desde, hasta] = rango(vista, ref)
  const desdeIso = iso(desde)
  const hastaIso = iso(hasta)
  const [version, setVersion] = useState(0)
  const cargar = () => setVersion((v) => v + 1)
  useEffect(() => {
    let vivo = true
    pedir(`/api/salas/reservas?desde=${desdeIso}&hasta=${hastaIso}`)
      .then((r) => { if (vivo) setReservas(r) })
      .catch((e) => { if (vivo) { setReservas([]); setAviso(e.message) } })
    return () => { vivo = false }
  }, [desdeIso, hastaIso, version])
  useEffect(() => { pedir('/api/salas').then((r) => setHoy(r.hoy)).catch(() => {}) }, [])
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(''), 3500); return () => clearTimeout(t) }, [aviso])

  const porDia = useMemo(() => {
    const m = {}
    ;(reservas || []).forEach((r) => { (m[r.fecha] ||= []).push(r) })
    Object.values(m).forEach((l) => l.sort((a, b) => a.inicio.localeCompare(b.inicio)))
    return m
  }, [reservas])

  const mover = (n) => setRef((d) => (vista === 'mes' ? new Date(d.getFullYear(), d.getMonth() + n, 1) : sumar(d, n * (vista === 'semana' ? 7 : 1))))
  const nueva = (fecha = hoy, inicio = '') => setPanel({ modo: 'nueva', fecha: fecha < hoy ? hoy : fecha, inicio })
  const dias = vista === 'dia' ? [ref] : Array.from({ length: 7 }, (_, i) => sumar(lunes(ref), i))

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Reserva de salas']]}
        eyebrow="Espacios de reunión"
        title="Reserva de salas"
        lead="Consulta la disponibilidad y aparta la sala para tus reuniones. Las reservas se ven al instante para todo el equipo."
        icon={IconCalendarPlus}
        photo={FOTOS.equipoOficina}
      />

      <div className="sv-wrap sv-page">
        <div className="rs-bar">
          <div className="rs-bar__nav">
            <button type="button" className="sv-icon-btn" onClick={() => mover(-1)} aria-label="Anterior"><IconArrowLeft width={18} height={18} /></button>
            <button type="button" className="sv-btn sv-btn--ghost sv-btn--sm" onClick={() => setRef(new Date())}>Hoy</button>
            <button type="button" className="sv-icon-btn" onClick={() => mover(1)} aria-label="Siguiente"><IconArrowRight width={18} height={18} /></button>
            <h2 className="rs-bar__title" aria-live="polite">{titulo(vista, ref)}</h2>
          </div>
          <div className="rs-bar__end">
            <div className="rs-seg" role="group" aria-label="Vista">
              {[['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']].map(([k, l]) => (
                <button key={k} type="button" className={vista === k ? 'is-on' : ''} aria-pressed={vista === k} onClick={() => setVista(k)}>{l}</button>
              ))}
            </div>
            <button type="button" className="sv-btn" onClick={() => nueva()}><IconPlus width={18} height={18} /> Nueva reserva</button>
          </div>
        </div>

        <ul className="rs-legend" aria-label="Salas">
          {SALAS.map((s) => <li key={s.id} style={{ '--c': s.color }}><i aria-hidden="true" />{s.nombre}</li>)}
          <li className="rs-legend__mine"><i aria-hidden="true" />Tus reservas</li>
          <li className="rs-legend__hint">Haz clic en un espacio libre para reservar.</li>
        </ul>

        {vista === 'mes' ? (
          <div className="rs-month">
            {DIAS.map((d) => <div key={d} className="rs-month__head">{d}</div>)}
            {Array.from({ length: 42 }, (_, i) => sumar(desde, i)).map((d) => {
              const f = iso(d)
              const lista = porDia[f] || []
              const fuera = d.getMonth() !== ref.getMonth()
              return (
                <div key={f} className={`rs-month__day ${fuera ? 'is-out' : ''} ${f === hoy ? 'is-today' : ''} ${f < hoy ? 'is-past' : ''}`}>
                  <button type="button" className="rs-month__num" onClick={() => { setVista('dia'); setRef(d) }} aria-label={`Ver el ${d.getDate()} de ${MESES[d.getMonth()]}`}>{d.getDate()}</button>
                  {lista.slice(0, 3).map((r) => (
                    <button key={r.id} type="button" className={`rs-chip ${propias[r.id] ? 'is-mine' : ''}`} style={{ '--c': SALA[r.sala]?.color }} onClick={() => setPanel({ modo: 'ver', r })}>
                      <b>{r.inicio}</b> {r.descripcion}
                    </button>
                  ))}
                  {lista.length > 3 && <button type="button" className="rs-more" onClick={() => { setVista('dia'); setRef(d) }}>+{lista.length - 3} más</button>}
                  {f >= hoy && !fuera && <button type="button" className="rs-month__add" onClick={() => nueva(f)} aria-label={`Reservar el ${d.getDate()}`}><IconPlus width={14} height={14} /></button>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`rs-grid ${vista === 'dia' ? 'is-day' : ''}`} style={{ '--cols': dias.length, '--h': `${ALTO_HORA}px` }}>
            <div className="rs-grid__corner" />
            {dias.map((d) => {
              const f = iso(d)
              return (
                <div key={f} className={`rs-grid__head ${f === hoy ? 'is-today' : ''}`}>
                  <small>{DIAS[(d.getDay() + 6) % 7]}</small>
                  <b>{d.getDate()}</b>
                </div>
              )
            })}
            <div className="rs-grid__hours">
              {HORAS.map((h) => <span key={h}>{hora12(hh(h))}</span>)}
            </div>
            {dias.map((d) => {
              const f = iso(d)
              const pasado = f < hoy
              return (
                <div key={f} className={`rs-grid__col ${pasado ? 'is-past' : ''}`}>
                  {HORAS.map((h) => (
                    <button key={h} type="button" className="rs-slot" disabled={pasado} onClick={() => nueva(f, hh(h))} aria-label={`Reservar el ${d.getDate()} a las ${hora12(hh(h))}`} />
                  ))}
                  {(porDia[f] || []).map((r) => {
                    const top = ((minutos(r.inicio) - HORA_APERTURA * 60) / 60) * ALTO_HORA
                    const alto = Math.max(22, ((minutos(r.fin) - minutos(r.inicio)) / 60) * ALTO_HORA - 3)
                    return (
                      <button key={r.id} type="button" className={`rs-event ${propias[r.id] ? 'is-mine' : ''}`} style={{ top, height: alto, '--c': SALA[r.sala]?.color }} onClick={() => setPanel({ modo: 'ver', r })}>
                        <b>{SALA[r.sala]?.nombre || r.sala}</b>
                        <span>{r.inicio} – {r.fin}</span>
                        {alto > 50 && <small>{r.descripcion}</small>}
                      </button>
                    )
                  })}
                  {f === hoy && <AhoraLinea />}
                </div>
              )
            })}
          </div>
        )}
        {reservas === null && <p className="sv-muted rs-loading">Cargando reservas…</p>}
      </div>

      {panel && (
        <Panel
          panel={panel}
          hoy={hoy}
          esPropia={panel.r && Boolean(propias[panel.r.id])}
          onClose={() => setPanel(null)}
          onGuardada={(r) => {
            guardarPropia(r.id, r.key)
            setPropias(leerPropias())
            setPanel(null)
            setAviso(`Sala reservada el ${deIso(r.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} de ${r.inicio} a ${r.fin}.`)
            if (r.fecha < desdeIso || r.fecha > hastaIso) setRef(deIso(r.fecha))
            else cargar()
          }}
          onCancelada={(id) => {
            quitarPropia(id)
            setPropias(leerPropias())
            setPanel(null)
            setAviso('Reserva cancelada.')
            cargar()
          }}
        />
      )}

      <div className={`sv-toast ${aviso ? 'is-on' : ''}`} role="status" aria-live="polite">{aviso}</div>
    </div>
  )
}

/* Línea roja con la hora actual. */
function AhoraLinea() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 60000); return () => clearInterval(t) }, [])
  const m = ahora.getHours() * 60 + ahora.getMinutes()
  if (m < HORA_APERTURA * 60 || m > HORA_CIERRE * 60) return null
  return <span className="rs-now" style={{ top: ((m - HORA_APERTURA * 60) / 60) * ALTO_HORA }} aria-hidden="true" />
}

/* Campo del formulario con su mensaje de error. */
function Campo({ label, error, children }) {
  return (
    <label className={`rs-field ${error ? 'has-error' : ''}`}>
      <span>{label} <i aria-hidden="true">*</i></span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  )
}

/* Panel lateral: formulario de reserva o detalle de una reserva existente. */
function Panel({ panel, hoy, esPropia, onClose, onGuardada, onCancelada }) {
  const perfil = leerPerfil()
  const [d, setD] = useState(() => {
    const ini = panel.inicio || ''
    const fin = ini ? hh(Math.min(Number(ini.slice(0, 2)) + 1, HORA_CIERRE)) : ''
    return { colaborador: perfil.colaborador || '', nombre: perfil.nombre || '', sala: SALAS.length === 1 ? SALAS[0].id : '', fecha: panel.fecha || hoy, inicio: ini, fin, descripcion: '' }
  })
  const [tocados, setTocados] = useState({})
  const [errServidor, setErrServidor] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const primero = useRef(null)
  const errores = validarReserva(d, hoy)
  const err = (k) => errServidor[k] || (tocados[k] && errores[k])

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    primero.current?.focus()
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const set = (k) => (e) => { setD((x) => ({ ...x, [k]: e.target.value })); setErrServidor((x) => ({ ...x, [k]: undefined })) }
  const toque = (k) => () => setTocados((x) => ({ ...x, [k]: true }))

  async function reservar(e) {
    e.preventDefault()
    setTocados(Object.fromEntries(Object.keys(d).map((k) => [k, true])))
    if (Object.keys(errores).length) return
    setBusy(true)
    setError('')
    try {
      const r = await pedir('/api/salas/reservas', { method: 'POST', body: JSON.stringify(d) })
      try { localStorage.setItem(PERFIL, JSON.stringify({ colaborador: d.colaborador, nombre: d.nombre })) } catch { /* sin almacenamiento */ }
      onGuardada(r)
    } catch (ex) {
      setError(ex.message)
      setErrServidor(ex.fields)
      setBusy(false)
    }
  }

  async function cancelar() {
    if (!window.confirm('¿Cancelar esta reserva?')) return
    setBusy(true)
    try {
      await pedir(`/api/salas/reservas/${panel.r.id}`, { method: 'DELETE', body: JSON.stringify({ key: leerPropias()[panel.r.id] }) })
      onCancelada(panel.r.id)
    } catch (ex) {
      setError(ex.message)
      setBusy(false)
    }
  }

  return (
    <div className="rs-drawer" role="dialog" aria-modal="true" aria-labelledby="rs-drawer-title">
      <button type="button" className="rs-drawer__backdrop" onClick={onClose} aria-label="Cerrar" tabIndex={-1} />
      <aside className="rs-drawer__panel">
        <header className="rs-drawer__head">
          <img src={MARCA.logoHorizontal} alt="Gestión y Servicios" />
          <button type="button" className="sv-icon-btn" onClick={onClose} aria-label="Cerrar"><IconX width={20} height={20} /></button>
        </header>

        {panel.modo === 'ver' ? (
          <div className="rs-detail">
            <span className="rs-detail__sala" style={{ '--c': SALA[panel.r.sala]?.color }}><i aria-hidden="true" />{SALA[panel.r.sala]?.nombre}</span>
            <h2 id="rs-drawer-title">{panel.r.descripcion}</h2>
            <dl>
              <div><dt>Fecha</dt><dd>{deIso(panel.r.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</dd></div>
              <div><dt>Horario</dt><dd><IconClock width={16} height={16} /> {hora12(panel.r.inicio)} – {hora12(panel.r.fin)}</dd></div>
              <div><dt>Reservada por</dt><dd>{panel.r.nombre}<small>{panel.r.colaborador}</small></dd></div>
            </dl>
            {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
            {esPropia && panel.r.fecha >= hoy && (
              <button type="button" className="sv-btn sv-btn--ghost rs-cancel" onClick={cancelar} disabled={busy}><IconTrash width={18} height={18} /> Cancelar reserva</button>
            )}
          </div>
        ) : (
          <form className="rs-form" onSubmit={reservar} noValidate>
            <h2 id="rs-drawer-title">Nueva reserva</h2>
            <p className="sv-muted">Las salas se reservan entre {HORA_APERTURA}:00 a. m. y {HORA_CIERRE - 12}:00 p. m.</p>
            <Campo error={err('colaborador')} label="Tu correo">
              <input ref={primero} type="email" value={d.colaborador} onChange={set('colaborador')} onBlur={toque('colaborador')} autoComplete="email" placeholder="nombre@gestionyservicios.com.co" />
            </Campo>
            <Campo error={err('nombre')} label="Tu nombre">
              <input value={d.nombre} onChange={set('nombre')} onBlur={toque('nombre')} autoComplete="name" />
            </Campo>
            <Campo error={err('sala')} label="Sala">
              <select value={d.sala} onChange={set('sala')} onBlur={toque('sala')}>
                <option value="">Selecciona la sala</option>
                {SALAS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </Campo>
            <Campo error={err('fecha')} label="Fecha">
              <input type="date" value={d.fecha} min={hoy} onChange={set('fecha')} onBlur={toque('fecha')} />
            </Campo>
            <div className="rs-form__row">
              <Campo error={err('inicio')} label="Hora inicio">
                <input type="time" value={d.inicio} step={900} min={hh(HORA_APERTURA)} max={hh(HORA_CIERRE)} onChange={set('inicio')} onBlur={toque('inicio')} />
              </Campo>
              <Campo error={err('fin')} label="Hora fin">
                <input type="time" value={d.fin} step={900} min={hh(HORA_APERTURA)} max={hh(HORA_CIERRE)} onChange={set('fin')} onBlur={toque('fin')} />
              </Campo>
            </div>
            <Campo error={err('descripcion')} label="Descripción">
              <textarea rows={3} maxLength={160} value={d.descripcion} onChange={set('descripcion')} onBlur={toque('descripcion')} placeholder="Ej. Comité de seguimiento del proyecto" />
            </Campo>
            {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
            <footer className="rs-form__foot">
              <button type="button" className="sv-btn sv-btn--ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="sv-btn" disabled={busy}>{busy ? 'Reservando…' : 'Reservar'}</button>
            </footer>
          </form>
        )}
      </aside>
    </div>
  )
}
