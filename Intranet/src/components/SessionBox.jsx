import { useCallback, useEffect, useRef, useState } from 'react'
import { IconClose } from './Icons.jsx'

/* Acceso de gestores en el menú: mismo usuario y sesión que el panel de Cumpleaños
   (API /api/auth/*, cookie httpOnly). Con sesión, lleva a los paneles de gestión. */

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const IconLock = () => <svg {...svg}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
const IconLogout = () => <svg {...svg}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg>
const IconCake = () => <svg {...svg}><path d="M5 21v-6.2a2.8 2.8 0 0 1 2.8-2.8h8.4A2.8 2.8 0 0 1 19 14.8V21M3 21h18M12 6.7V10M12 3c.9.8 1.4 1.6 1.4 2.3 0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4c0-.7.5-1.5 1.4-2.3Z" /></svg>
const IconShield = () => <svg {...svg}><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
const IconList = () => <svg {...svg}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
const IconEye = ({ off }) => (
  <svg {...svg}>
    {off ? <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /> : <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
)

async function pedir(path, body) {
  const res = await fetch(`/api${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null)
  if (!res) throw new Error('No hay conexión con el servidor de la intranet.')
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'No se pudo completar la operación.')
  return data
}

const RUTAS_PRIVADAS = ['cumpleanos-gestor', 'solicitudes-gestion', 'admin']
const ROL = { admin: 'Administrador', gestor: 'Gestor' }
const iniciales = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'G'

function LoginDialog({ onClose, onLogin }) {
  const ref = useRef(null)
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const d = ref.current
    d.showModal()
    return () => d.close()
  }, [])

  async function entrar(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await pedir('/auth/login', { username: u, password: p }))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={ref}
      className="login-dlg"
      aria-labelledby="login-dlg-title"
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <form className="login-dlg__box" onSubmit={entrar}>
        <button type="button" className="login-dlg__close" onClick={onClose} aria-label="Cerrar"><IconClose width={18} height={18} /></button>
        <span className="login-dlg__icon"><IconLock /></span>
        <h2 id="login-dlg-title">Iniciar sesión</h2>
        <p>Acceso para gestores y administradores de la intranet.</p>
        <label className="login-dlg__field">
          <span>Usuario</span>
          <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoCapitalize="none" required autoFocus />
        </label>
        <label className="login-dlg__field">
          <span>Contraseña</span>
          <span className="login-dlg__pass">
            <input type={ver ? 'text' : 'password'} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
            <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={ver}><IconEye off={ver} /></button>
          </span>
        </label>
        {error && <p className="login-dlg__error" role="alert">{error}</p>}
        <button type="submit" className="login-dlg__submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </dialog>
  )
}

export default function SessionBox({ onNavigate }) {
  const [user, setUser] = useState(undefined) // undefined = comprobando
  const [dialogo, setDialogo] = useState(false)
  const [menu, setMenu] = useState(false)
  const boxRef = useRef(null)

  const comprobar = useCallback(() => {
    pedir('/auth/me').then(setUser).catch(() => setUser(null))
  }, [])

  /* Se revisa al cargar y al cambiar de vista (por si se inició o cerró sesión en un panel). */
  useEffect(() => {
    comprobar()
    window.addEventListener('hashchange', comprobar)
    return () => window.removeEventListener('hashchange', comprobar)
  }, [comprobar])

  useEffect(() => {
    if (!menu) return
    const fuera = (e) => { if (!boxRef.current?.contains(e.target)) setMenu(false) }
    const esc = (e) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc) }
  }, [menu])

  async function salir() {
    await pedir('/auth/logout', {}).catch(() => {})
    setUser(null)
    setMenu(false)
    const h = window.location.hash.replace(/^#/, '')
    if (RUTAS_PRIVADAS.includes(h)) window.location.hash = 'inicio'
  }

  const ir = () => { setMenu(false); onNavigate?.() }

  if (user === undefined) return <div className="session session--loading" aria-hidden="true" />

  if (!user) {
    return (
      <div className="session">
        <button type="button" className="session__login" onClick={() => setDialogo(true)}>
          <IconLock /> <span>Iniciar sesión</span>
        </button>
        {dialogo && (
          <LoginDialog
            onClose={() => setDialogo(false)}
            onLogin={(u) => {
              setUser(u)
              setDialogo(false)
              const h = window.location.hash.replace(/^#/, '')
              if (u.role === 'admin' && h !== 'admin') window.location.hash = 'admin'
              else if (RUTAS_PRIVADAS.includes(h)) window.location.reload()
            }}
          />
        )}
      </div>
    )
  }

  const nombre = user.name || user.username
  return (
    <div className={`session is-in ${menu ? 'is-open' : ''}`} ref={boxRef}>
      <button type="button" className="session__user" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
        <span className="session__avatar" aria-hidden="true">{iniciales(nombre)}</span>
        <span className="session__who"><b>{nombre}</b><small>{ROL[user.role] || ROL.gestor}</small></span>
      </button>
      {menu && (
        <div className="session__menu" role="menu">
          {user.role === 'admin' && <a role="menuitem" href="#admin" onClick={ir}><IconShield /> Administración</a>}
          <a role="menuitem" href="#cumpleanos-gestor" onClick={ir}><IconCake /> Panel de cumpleaños</a>
          <a role="menuitem" href="#solicitudes-gestion" onClick={ir}><IconList /> Gestión de solicitudes</a>
          <button type="button" role="menuitem" onClick={salir}><IconLogout /> Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}
