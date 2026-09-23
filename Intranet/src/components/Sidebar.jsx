import { useState } from 'react'
import { navItems } from '../data/navItems.js'
import {
  IconMenu,
  IconClose,
  IconDockLeft,
  IconDockTop,
} from './Icons.jsx'
import SessionBox from './SessionBox.jsx'

export default function Sidebar({ layout, onLayoutChange, activeId = 'inicio' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

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
              {navItems.filter((item) => item.menu !== false).map(({ id, label, href, Icon, external }) => (
                <li key={id}>
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
