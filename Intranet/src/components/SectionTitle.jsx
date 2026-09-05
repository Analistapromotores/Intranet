import { IconChevronDown } from './Icons.jsx'

export default function SectionTitle({ children, icon: Icon, action }) {
  let actionEl = null
  if (action && action.onClick) {
    actionEl = (
      <button
        type="button"
        className="sec-title__action"
        aria-expanded={action.expanded}
        onClick={action.onClick}
      >
        {action.label}
        {action.chevron ? (
          <IconChevronDown
            className={`sec-title__chev ${action.expanded ? 'is-up' : ''}`}
            width={15}
            height={15}
          />
        ) : null}
      </button>
    )
  } else if (action) {
    actionEl = (
      <a className="sec-title__action" href={action.href}>
        {action.label}
      </a>
    )
  }

  return (
    <div className="sec-title">
      <h2 className="sec-title__text">
        {Icon ? (
          <span className="sec-title__icon" aria-hidden="true">
            <Icon width={18} height={18} />
          </span>
        ) : null}
        {children}
      </h2>
      {actionEl}
    </div>
  )
}
