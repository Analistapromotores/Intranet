import { useCallback, useEffect, useMemo, useState } from 'react'
import { ESTADOS, TIPOS, formatoFecha, formatoPesos } from '../../../shared/solicitudes.js'
import { api } from './api.js'
import { Modal, PageHeader, StatusBadge } from './ui.jsx'
import { IconDownload, IconList, IconLock, IconLogout, IconMail, IconRefresh, IconSearch } from './icons.jsx'

const fechaCorta = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
const CORREO = { enviado: ['Enviado', 'verde'], simulado: ['Pruebas', 'ambar'], error: ['Error', 'rojo'] }

/* Panel de gestión: listado, cambio de estado con trazabilidad, descarga del Excel y reenvío del correo. */
export default function GestionPage() {
  const [user, setUser] = useState(undefined)
  useEffect(() => { api.yo().then(setUser).catch(() => setUser(null)) }, [])
  if (user === undefined) return <div className="sv"><p className="sv-loading">Comprobando sesión…</p></div>
  if (!user) return <Login onLogin={setUser} />
  return <Panel user={user} onLogout={() => setUser(null)} />
}

function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function entrar(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await api.login(u, p))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }
  return (
    <div className="sv">
      <PageHeader crumbs={[['Solicitudes', '#solicitudes'], ['Gestión']]} eyebrow="Acceso restringido" title="Gestión de solicitudes" icon={IconLock} />
      <div className="sv-wrap sv-page">
        <form className="sv-card sv-login" onSubmit={entrar}>
          <h2 className="sv-card__title">Inicia sesión</h2>
          <p className="sv-muted">Usa el mismo usuario de gestor de la intranet.</p>
          <div className="sv-field">
            <label className="sv-label" htmlFor="sv-u">Usuario</label>
            <input id="sv-u" className="sv-input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoCapitalize="none" required />
          </div>
          <div className="sv-field">
            <label className="sv-label" htmlFor="sv-p">Contraseña</label>
            <input id="sv-p" className="sv-input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
          <button type="submit" className="sv-btn sv-btn--block" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
      </div>
    </div>
  )
}

function Panel({ user, onLogout }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [abierta, setAbierta] = useState(null)

  const cargar = useCallback(() => {
    api.todas().then(setLista).catch((e) => (e.status === 401 ? onLogout() : setError(e.message)))
  }, [onLogout])
  useEffect(cargar, [cargar])

  const todas = useMemo(() => lista || [], [lista])
  const conteo = useMemo(() => Object.fromEntries(Object.keys(ESTADOS).map((k) => [k, todas.filter((s) => s.estado === k).length])), [todas])
  const visibles = todas.filter((s) => {
    const t = `${s.numero} ${s.titulo} ${s.solicitante} ${s.correoSolicitante}`.toLowerCase()
    return (!q || t.includes(q.toLowerCase())) && (!tipo || s.tipo === tipo) && (!estado || s.estado === estado)
  })

  const actualizar = (s) => {
    setLista((l) => l.map((x) => (x.id === s.id ? s : x)))
    setAbierta(s)
  }

  return (
    <div className="sv">
      <PageHeader crumbs={[['Solicitudes', '#solicitudes'], ['Gestión']]} eyebrow="Panel de gestión" title="Solicitudes recibidas" icon={IconList}>
        <span className="sv-head__user">Hola, <b>{user.name || user.username}</b></span>
        <button type="button" className="sv-btn sv-btn--light" onClick={async () => { await api.logout().catch(() => {}); onLogout() }}><IconLogout width={18} height={18} /> Salir</button>
      </PageHeader>
      <div className="sv-wrap sv-page">
        <ul className="sv-kpis">
          {[['enviada', 'Nuevas'], ['en_proceso', 'En proceso'], ['pendiente', 'Pendientes'], ['aprobada', 'Aprobadas']].map(([k, l]) => (
            <li key={k}><button type="button" className={estado === k ? 'is-on' : ''} onClick={() => setEstado(estado === k ? '' : k)} aria-pressed={estado === k}><b>{lista ? conteo[k] : '—'}</b><span>{l}</span></button></li>
          ))}
        </ul>

        <div className="sv-toolbar">
          <label className="sv-search">
            <IconSearch width={18} height={18} />
            <span className="sv-sr">Buscar</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número, persona, cargo o correo" />
          </label>
          <select className="sv-input sv-select sv-select--sm" value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([k, t]) => <option key={k} value={k}>{t.nombre}</option>)}
          </select>
          <select className="sv-input sv-select sv-select--sm" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}
          </select>
        </div>

        {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}

        <div className="sv-table-wrap">
          <table className="sv-table">
            <thead>
              <tr><th>Número</th><th>Tipo</th><th>Detalle</th><th>Solicitante</th><th>Fecha</th><th>Correo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {lista === null && <tr><td colSpan={7} className="sv-muted">Cargando…</td></tr>}
              {lista && visibles.length === 0 && <tr><td colSpan={7} className="sv-muted">No hay solicitudes con estos filtros.</td></tr>}
              {visibles.map((s) => (
                <tr key={s.id} onClick={() => setAbierta(s)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setAbierta(s)}>
                  <td><b className="sv-mono">{s.numero}</b></td>
                  <td>{s.tipoNombre}</td>
                  <td className="sv-table__detail">{s.titulo}</td>
                  <td>{s.solicitante}<small>{s.correoSolicitante}</small></td>
                  <td>{fechaCorta(s.creada)}</td>
                  <td>{s.correo ? <span className={`sv-dot sv-tone--${CORREO[s.correo.estado]?.[1]}`}>{CORREO[s.correo.estado]?.[0]}</span> : '—'}</td>
                  <td><StatusBadge estado={s.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {abierta && <Detalle s={abierta} onClose={() => setAbierta(null)} onChange={actualizar} />}
    </div>
  )
}

/* Datos legibles de la solicitud, sin la firma. */
function filas(s) {
  const d = s.datos
  const v = (x) => (typeof x === 'number' && x > 999 ? formatoPesos(x) : /^\d{4}-\d{2}-\d{2}$/.test(String(x)) ? formatoFecha(x) : x)
  const out = []
  for (const [k, x] of Object.entries(d)) {
    if (k === 'mensajeCorreo') continue
    if (Array.isArray(x)) {
      const items = x.map((it) => (typeof it === 'object' ? Object.values(it).filter(Boolean).map(v).join(' · ') : it)).filter(Boolean)
      if (items.length) out.push([k, items.join(' | ')])
    } else if (x && typeof x === 'object') {
      const on = Object.entries(x).filter(([, y]) => y !== false && y !== '').map(([kk, y]) => (y === true ? kk : `${kk}: ${y}`))
      if (on.length) out.push([k, on.join(', ')])
    } else if (x !== '' && x !== null && x !== undefined) out.push([k, v(x)])
  }
  return out
}
const ETIQUETAS = {
  fechaSolicitud: 'Fecha de solicitud', fechaIngreso: 'Fecha de ingreso', nombre: 'Nombre', identificacion: 'Identificación', centroCosto: 'Centro de costo',
  telefono: 'Teléfono', direccion: 'Dirección', correo: 'Correo', auxilioTransporte: 'Auxilio de transporte', solicitanteNombre: 'Solicitante',
  solicitanteCargo: 'Cargo del solicitante', solicitanteCorreo: 'Correo del solicitante', responsableNombre: 'Responsable de contratación',
  responsableCargo: 'Cargo del responsable', justificacion: 'Justificación', ciudadSede: 'Ciudad o sede', tipoContratacion: 'Tipo de contratación',
  formacion: 'Formación', documento: 'Documento', area: 'Área', fechaRequerida: 'Fecha requerida', fechaDevolucion: 'Fecha de devolución', observacion: 'Observación',
}
const LEGIBLE = (k) => ETIQUETAS[k] || k.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, (c) => c.toUpperCase())

function Detalle({ s, onClose, onChange }) {
  const [nuevo, setNuevo] = useState(s.estado)
  const [comentario, setComentario] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  async function guardar() {
    setBusy('estado')
    setMsg('')
    try {
      onChange(await api.cambiarEstado(s.id, nuevo, comentario))
      setComentario('')
      setMsg('Estado actualizado.')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy('')
    }
  }
  async function reenviar() {
    setBusy('reenviar')
    setMsg('')
    try {
      const r = await api.reenviar(s.id)
      onChange(r)
      setMsg(r.correo?.estado === 'error' ? `No se pudo enviar: ${r.correo.detalle}` : 'Documento regenerado y correo procesado.')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <Modal title={`${s.numero} · ${s.tipoNombre}`} onClose={onClose} size="lg">
      <div className="sv-detail">
        <div className="sv-detail__bar">
          <StatusBadge estado={s.estado} />
          <span className="sv-muted">Registrada {fechaCorta(s.creada)} por {s.solicitante}</span>
          <span className="sv-detail__actions">
            {s.archivo && <a className="sv-btn sv-btn--ghost sv-btn--sm" href={api.archivoUrl(s.id)}><IconDownload width={16} height={16} /> Excel</a>}
            <button type="button" className="sv-btn sv-btn--ghost sv-btn--sm" onClick={reenviar} disabled={Boolean(busy)}><IconRefresh width={16} height={16} /> {busy === 'reenviar' ? 'Procesando…' : 'Reenviar correo'}</button>
          </span>
        </div>

        {s.correo && (
          <p className={`sv-callout sv-callout--${s.correo.estado === 'enviado' ? 'ok' : s.correo.estado === 'error' ? 'error' : 'warn'}`}>
            <IconMail width={18} height={18} />
            <span>Correo {CORREO[s.correo.estado]?.[0].toLowerCase()} a <b>{s.correo.to}</b> · {fechaCorta(s.correo.fecha)}{s.correo.detalle ? ` · ${s.correo.detalle}` : ''}</span>
          </p>
        )}

        <div className="sv-detail__grid">
          <section>
            <h3>Datos de la solicitud</h3>
            <dl className="sv-kv">{filas(s).map(([k, x]) => <div key={k}><dt>{LEGIBLE(k)}</dt><dd>{String(x)}</dd></div>)}</dl>
            {s.datos.mensajeCorreo && <><h3>Mensaje del correo</h3><p className="sv-pre sv-msg">{s.datos.mensajeCorreo}</p></>}
          </section>
          <aside>
            <h3>Cambiar estado</h3>
            <div className="sv-field">
              <label className="sv-label" htmlFor="sv-estado">Nuevo estado</label>
              <select id="sv-estado" className="sv-input sv-select" value={nuevo} onChange={(e) => setNuevo(e.target.value)}>
                {Object.entries(ESTADOS).filter(([k]) => k !== 'borrador').map(([k, e]) => <option key={k} value={k}>{e.label}</option>)}
              </select>
            </div>
            <div className="sv-field">
              <label className="sv-label" htmlFor="sv-com">Comentario <small className="sv-opt">(visible para el solicitante)</small></label>
              <textarea id="sv-com" className="sv-input sv-textarea" rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={400} />
            </div>
            <button type="button" className="sv-btn sv-btn--block" onClick={guardar} disabled={Boolean(busy) || (nuevo === s.estado && !comentario.trim())}>{busy === 'estado' ? 'Guardando…' : 'Guardar'}</button>
            {msg && <p className="sv-muted" role="status">{msg}</p>}

            <h3>Trazabilidad</h3>
            <ol className="sv-timeline">
              {[...s.historial].reverse().map((h, i) => (
                <li key={i} className={`sv-timeline__item sv-tone--${ESTADOS[h.estado]?.tono || 'gris'}`}>
                  <span className="sv-timeline__dot" aria-hidden="true" />
                  <div>
                    <b>{ESTADOS[h.estado]?.label}</b> <small>{fechaCorta(h.fecha)}{h.por ? ` · ${h.por}` : ''}</small>
                    {h.comentario && <p>{h.comentario}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </Modal>
  )
}
