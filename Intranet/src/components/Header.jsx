import gysLogo from '../assets/gys_logo.png'
import { IconSearch } from './Icons.jsx'

export default function Header() {
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
    </header>
  )
}
