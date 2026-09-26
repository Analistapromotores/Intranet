import { useState } from 'react'
import { navItems } from '../data/navItems.js'
import {
  IconMenu,
  IconClose,
  IconDockLeft,
  IconDockTop,
  IconExternal,
} from './Icons.jsx'
import SessionBox from './SessionBox.jsx'
import { useSession } from '../lib/useSession.js'

/* Menú superior: el desplegable se ancla debajo del ítem (position: fixed, para que el scroll del menú no lo recorte). */
function ubicarAviso(e) {
  const li = e.currentTarget
  const r = li.getBoundingClientRect()
  li.style.setProperty('--fx', `${Math.max(8, r.left)}px`)
  li.style.setProperty('--fy', `${r.bottom}px`)
}

export default function Sidebar({ layout, onLayoutChange, activeId = 'inicio' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useSession()

  const isSide = layout === 'side'

  return (
    <>
      <aside
        className={`side side--${layout} ${mobileOpen ? 'is-open' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="side__panel">
          <div className="side__top">
            <button
              type="button"
              className="side__dock"
              onClick={() => onLayoutChange(isSide ? 'top' : 'side')}
              title={isSide ? 'Mover el menú a la parte superior' : 'Mover el menú al lateral'}
            >
              {isSide ? <IconDockTop width={17} height={17} /> : <IconDockLeft width={17} height={17} />}
              <span className="side__dock-label">
                {isSide ? 'Mover arriba' : 'Mover al lado'}
              </span>
            </button>
            <button
              type="button"
              className="side__close"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            >
              <IconClose width={20} height={20} />
            </button>
          </div>

          <nav className="side__nav">
            <ul className="side__list">
              {navItems.filter((item) => item.menu !== false && (!item.roles || item.roles.includes(user?.role))).map(({ id, label, href, Icon, external, plataforma }) => (
                <li
                  key={id}
                  className={plataforma ? 'side__item side__item--plat' : 'side__item'}
                  onMouseEnter={plataforma ? (e) => ubicarAviso(e) : undefined}
                  onFocus={plataforma ? (e) => ubicarAviso(e) : undefined}
                >
                  <a
                    href={href}
                    className={`side__link ${activeId === id ? 'is-active' : ''}`}
                    aria-current={activeId === id ? 'page' : undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="side__icon" width={19} height={19} />
                    <span className="side__label">{label}</span>
                  </a>
                  {plataforma && (
                    <a
                      className="side__plat"
                      href={plataforma.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="side__plat-ico" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                      </span>
                      <span className="side__plat-txt">
                        <b>Ir a la plataforma</b>
                        <small>{plataforma.nombre}</small>
                      </span>
                      <IconExternal className="side__plat-go" width={15} height={15} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <SessionBox onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      <div
        className="side__backdrop"
        role="presentation"
        onClick={() => setMobileOpen(false)}
      />

      <button
        type="button"
        className="side__fab"
        aria-label="Abrir menú"
        onClick={() => setMobileOpen(true)}
      >
        <IconMenu width={22} height={22} />
      </button>
    </>
  )
}
