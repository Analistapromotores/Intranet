import { useEffect, useRef } from 'react'
import { IconClose } from './Icons.jsx'
import './ui.css'

/* Diálogo nativo: foco atrapado, Escape y fondo modal sin dependencias. */
export default function Dialog({ title, subtitle, onClose, children, size = 'md', label = 'dlg' }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    d.showModal()
    return () => d.close()
  }, [])
  const id = `${label}-title`
  return (
    <dialog
      ref={ref}
      className={`ui-dialog ui-dialog--${size}`}
      aria-labelledby={id}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="ui-dialog__box">
        <header className="ui-dialog__head">
          <div>
            <h2 id={id}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={onClose} aria-label="Cerrar"><IconClose width={18} height={18} /></button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
