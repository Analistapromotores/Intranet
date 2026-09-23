import { navItems } from '../data/navItems.js'
import SectionTitle from './SectionTitle.jsx'
import { IconGrid } from './Icons.jsx'

const shortcuts = navItems.filter(
  (item) => item.id !== 'inicio' && item.quickAccess !== false,
)

export default function QuickAccess() {
  return (
    <section className="quick" id="accesos" aria-labelledby="quick-title">
      <SectionTitle icon={IconGrid}>
        <span id="quick-title">Accesos rápidos</span>
      </SectionTitle>

      <ul className="quick__row">
        {shortcuts.map(({ id, label, href, Icon, accent, external }) => (
          <li key={id}>
            <a
              href={href}
              className="quick__card"
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
            >
              <span className={`quick__icon quick__icon--${accent}`}>
                <Icon width={24} height={24} />
              </span>
              <span className="quick__label">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
