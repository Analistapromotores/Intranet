import { useCallback, useEffect, useMemo, useState } from 'react'
import Dialog from '../../components/Dialog.jsx'
import { request } from '../cumpleanos/api.js'

/* Control de accesos y roles: quién puede entrar a la intranet como gestor o administrador. */

const ROLES = {
  gestor: { nombre: 'Gestor', resumen: 'Publica noticias, cumpleaños y gestiona solicitudes.' },
  ti: { nombre: 'TI', resumen: 'Lo del gestor, más alertas y seguimiento de TI.' },
  admin: { nombre: 'Administrador', resumen: 'Todo, incluido el control de accesos.' },
}

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, width: 18, height: 18, viewBox: '0 0 24 24' }
const Ico = {
  mas: <svg {...svg}><path d="M12 5v14M5 12h14" /></svg>,
  llave: <svg {...svg}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3M15 8l2 2" /></svg>,
  basura: <svg {...svg}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>,
  ojo: <svg {...svg}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
  ojoNo: <svg {...svg}><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>,
  check: <svg {...svg} width={14} height={14}><path d="m5 12 5 5 9-10" /></svg>,
  buscar: <svg {...svg}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>,
  copiar: <svg {...svg}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>,
}

const iniciales = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'

/* Contraseña legible: sin caracteres que se confunden (0/O, 1/l/I). */
function generarClave() {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(12))
  return Array.from(bytes, (b) => abc[b % abc.length]).join('')
}

function CampoClave({ valor, onCambio, error, etiqueta = 'Contraseña' }) {
  const [ver, setVer] = useState(false)
  const [copiada, setCopiada] = useState(false)
  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiada(true)
      setTimeout(() => setCopiada(false), 1800)
    } catch { /* el portapapeles puede estar bloqueado */ }
  }
  return (
    <div className={`ui-field ${error ? 'is-bad' : ''}`}>
      <label className="ui-label" htmlFor="ac-clave">{etiqueta} <small>(mínimo 8 caracteres)</small></label>
      <span className="ui-pass">
        <input id="ac-clave" type={ver ? 'text' : 'password'} value={valor} onChange={(e) => onCambio(e.target.value)} autoComplete="new-password" minLength={8} required />
        <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={ver}>{ver ? Ico.ojoNo : Ico.ojo}</button>
      </span>
      <span className="ac-clave-tools">
        <button type="button" className="ad-link" onClick={() => { onCambio(generarClave()); setVer(true) }}>Generar una segura</button>
        {valor && <button type="button" className="ad-link" onClick={copiar}>{copiada ? <>{Ico.check} Copiada</> : <>{Ico.copiar} Copiar</>}</button>}
      </span>
      {error && <p className="ui-error">{error}</p>}
    </div>
  )
}

function NuevoUsuario({ onClose, onCreado }) {
  const [f, setF] = useState({ name: '', username: '', role: 'gestor', password: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  async function crear(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setErrores({})
    try {
      onCreado(await request('/admin/users', { method: 'POST', body: f }), f.password)
    } catch (err) {
      setError(err.message)
      setErrores(err.fields || {})
      setGuardando(false)
    }
  }

  return (
    <Dialog title="Nuevo usuario" subtitle="Podrá iniciar sesión desde el botón «Iniciar sesión» del menú." onClose={onClose} label="ac-nuevo">
      <form className="ac-form" onSubmit={crear}>
        <label className={`ui-field ${errores.name ? 'is-bad' : ''}`}>
          <span className="ui-label">Nombre completo</span>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={80} autoFocus required />
          {errores.name && <p className="ui-error">{errores.name}</p>}
        </label>
        <label className={`ui-field ${errores.username ? 'is-bad' : ''}`}>
          <span className="ui-label">Usuario <small>(para iniciar sesión)</small></span>
          <input value={f.username} onChange={(e) => set('username', e.target.value)} maxLength={32} autoCapitalize="none" autoComplete="off" required />
          {errores.username && <p className="ui-error">{errores.username}</p>}
        </label>
        <fieldset className="ac-roles">
          <legend className="ui-label">Rol</legend>
          {Object.entries(ROLES).map(([id, r]) => (
            <label key={id} className={`ac-role ${f.role === id ? 'is-on' : ''}`}>
              <input type="radio" name="rol" value={id} checked={f.role === id} onChange={() => set('role', id)} />
              <b>{r.nombre}</b>
              <span>{r.resumen}</span>
            </label>
          ))}
        </fieldset>
        <CampoClave valor={f.password} onCambio={(v) => set('password', v)} error={errores.password} />
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando}>{guardando ? 'Creando…' : 'Crear usuario'}</button>
        </div>
      </form>
    </Dialog>
  )
}

function ReiniciarClave({ usuario, onClose, onHecho }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await request(`/admin/users/${encodeURIComponent(usuario.username)}`, { method: 'PATCH', body: { password: clave } })
      onHecho(clave)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }
  return (
    <Dialog title="Restablecer contraseña" subtitle={`${usuario.name} (${usuario.username})`} size="sm" onClose={onClose} label="ac-clave-dlg">
      <form className="ac-form" onSubmit={guardar}>
        <CampoClave valor={clave} onCambio={setClave} etiqueta="Nueva contraseña" />
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar contraseña'}</button>
        </div>
      </form>
    </Dialog>
  )
}

export default function AccesosRoles({ yo }) {
  const [usuarios, setUsuarios] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [busca, setBusca] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const [reiniciar, setReiniciar] = useState(null)
  const [eliminar, setEliminar] = useState(null)
  const [ocupado, setOcupado] = useState('')

  const cargar = useCallback(() => {
    request('/admin/users').then((l) => { setUsuarios(l); setError('') }).catch((e) => { setError(e.message); setUsuarios([]) })
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (usuarios || []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  }, [usuarios, busca])
  const admins = (usuarios || []).filter((u) => u.role === 'admin').length

  async function cambiarRol(u, role) {
    setOcupado(u.username)
    setError('')
    try {
      await request(`/admin/users/${encodeURIComponent(u.username)}`, { method: 'PATCH', body: { role } })
      setAviso(`${u.name} ahora es ${ROLES[role].nombre.toLowerCase()}.`)
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado('')
    }
  }
  async function borrar() {
    setOcupado(eliminar.username)
    setError('')
    try {
      await request(`/admin/users/${encodeURIComponent(eliminar.username)}`, { method: 'DELETE' })
      setAviso(`Se eliminó el acceso de ${eliminar.name}.`)
      setEliminar(null)
      cargar()
    } catch (e) {
      setError(e.message)
      setEliminar(null)
    } finally {
      setOcupado('')
    }
  }

  return (
    <div className="ac">
      <div className="ad-card ac-table-card">
        <div className="ad-card__head ac-head">
          <div>
            <h3>Usuarios con acceso</h3>
            <p className="ad-muted">Crea usuarios, cambia su rol o restablece su contraseña.</p>
          </div>
          <button type="button" className="ad-btn" onClick={() => setNuevo(true)}>{Ico.mas} Nuevo usuario</button>
        </div>

        <label className="ac-search">
          {Ico.buscar}
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre o usuario" aria-label="Buscar usuarios" />
        </label>

        {aviso && <p className="ui-alert ui-alert--ok" role="status">{aviso}</p>}
        {error && <p className="ui-alert" role="alert">{error}</p>}

        {usuarios === null ? <p className="ad-muted" aria-busy="true">Cargando usuarios…</p> : (
          <div className="ac-scroll">
            <table className="ac-table">
              <thead><tr><th scope="col">Usuario</th><th scope="col">Rol</th><th scope="col"><span className="ad-sr">Acciones</span></th></tr></thead>
              <tbody>
                {visibles.map((u) => {
                  const esYo = u.username === yo.username
                  const ultimoAdmin = u.role === 'admin' && admins <= 1
                  return (
                    <tr key={u.username}>
                      <td>
                        <span className="ac-user">
                          <span className="ac-avatar" aria-hidden="true">{iniciales(u.name)}</span>
                          <span><b>{u.name}{esYo && <em className="ad-badge ad-badge--muted">Tú</em>}</b><small>{u.username}</small></span>
                        </span>
                      </td>
                      <td>
                        <select className="ac-select" value={u.role} disabled={ocupado === u.username || ultimoAdmin} onChange={(e) => cambiarRol(u, e.target.value)} aria-label={`Rol de ${u.name}`} title={ultimoAdmin ? 'Debe quedar al menos un administrador' : undefined}>
                          {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{r.nombre}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className="ac-actions">
                          <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setReiniciar(u)}>{Ico.llave} Contraseña</button>
                          <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm ad-btn--danger" onClick={() => setEliminar(u)} disabled={esYo || ultimoAdmin} title={esYo ? 'No puedes eliminar tu propio usuario' : ultimoAdmin ? 'Debe quedar al menos un administrador' : undefined} aria-label={`Eliminar a ${u.name}`}>{Ico.basura}</button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {visibles.length === 0 && <tr><td colSpan={3} className="ac-none">No hay usuarios que coincidan.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {nuevo && <NuevoUsuario onClose={() => setNuevo(false)} onCreado={(u) => { setNuevo(false); setAviso(`Usuario «${u.username}» creado como ${ROLES[u.role].nombre.toLowerCase()}. Entrégale su contraseña por un canal seguro.`); cargar() }} />}
      {reiniciar && <ReiniciarClave usuario={reiniciar} onClose={() => setReiniciar(null)} onHecho={() => { setAviso(`Se cambió la contraseña de ${reiniciar.name}.`); setReiniciar(null) }} />}
      {eliminar && (
        <Dialog title="Eliminar acceso" size="sm" onClose={() => setEliminar(null)} label="ac-del">
          <p>{eliminar.name} (<b>{eliminar.username}</b>) ya no podrá iniciar sesión. Lo que publicó se conserva.</p>
          <div className="ui-dialog__foot">
            <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setEliminar(null)}>Cancelar</button>
            <button type="button" className="ui-btn ui-btn--red" onClick={borrar} disabled={ocupado === eliminar.username}>Eliminar acceso</button>
          </div>
        </Dialog>
      )}
    </div>
  )
}
