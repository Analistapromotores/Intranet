import { useEffect, useRef } from 'react'
import { IconClose } from '../../components/Icons.jsx'

/* Diálogo nativo: foco atrapado, Escape y fondo modal sin dependencias. */
export default function Modal({ title, onClose, children, size = 'md' }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    d.showModal()
    return () => d.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={`cb-modal cb-modal--${size}`}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      aria-labelledby="cb-modal-title"
    >
      <div className="cb-modal__box">
        <header className="cb-modal__head">
          <h2 id="cb-modal-title">{title}</h2>
          <button type="button" className="cb-icon-btn" onClick={onClose} aria-label="Cerrar"><IconClose width={20} height={20} /></button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
