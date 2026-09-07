import gysLogo from '../assets/gys_logo.png'
import { IconSearch, IconLogout } from './Icons.jsx'
import { useAuth } from '../auth.jsx'

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase()
}

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="topbar">
      <a href="#inicio" className="topbar__brand" aria-label="Gestión y Servicios · Intranet">
        <img className="topbar__logo" src={gysLogo} alt="Gestión y Servicios" />
        <span className="topbar__divider" aria-hidden="true" />
        <span className="topbar__intranet">Intranet</span>
      </a>

      <label className="search">
        <IconSearch className="search__icon" width={20} height={20} />
        <input
          className="search__input"
          type="search"
          placeholder="Buscar en la intranet..."
          aria-label="Buscar en la intranet"
        />
      </label>

      {user && (
        <div className="topbar__user">
          {user.picture ? (
            <img className="topbar__avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="topbar__avatar topbar__avatar--fallback">{initials(user.name)}</span>
          )}
          <span className="topbar__user-name" title={user.email}>{user.name}</span>
          <button
            type="button"
            className="topbar__signout"
            onClick={signOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <IconLogout width={18} height={18} />
          </button>
        </div>
      )}
    </header>
  )
}
