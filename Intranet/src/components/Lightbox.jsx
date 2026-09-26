import { useEffect, useRef, useState } from 'react'
import gysLogo from '../assets/gys_logo.png'
import './video.css'

/* Visor de imágenes con el mismo cristal del visor de videos. Flechas del teclado y botones para navegar. */
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
const Flecha = ({ der }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={der ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} /></svg>

export default function Lightbox({ items, indice, onCambiar, onCerrar, vertical: pista = false }) {
  const ref = useRef(null)
  /* Las imágenes verticales (historias 9:16) se ven en un visor angosto y alto; se detecta al cargar cada imagen. */
  const [detectada, setDetectada] = useState(null)
  const item = items[indice]

  useEffect(() => {
    const d = ref.current
    d.showModal()
    document.documentElement.classList.add('vmod-open')
    return () => { document.documentElement.classList.remove('vmod-open'); d.close() }
  }, [])

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'ArrowRight') onCambiar((indice + 1) % items.length)
      if (e.key === 'ArrowLeft') onCambiar((indice - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [indice, items.length, onCambiar])

  return (
    <dialog ref={ref} className="vmod" aria-label={item.titulo} onCancel={(e) => { e.preventDefault(); onCerrar() }} onClick={(e) => { if (e.target === ref.current) onCerrar() }}>
      <div className={`vmod__panel ${(detectada ?? pista) ? 'vmod__panel--vertical' : ''}`}>
        <div className="vmod__screen vmod__screen--img">
          <img key={item.src} src={item.src} alt={item.titulo} onLoad={(e) => setDetectada(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth * 1.1)} />
          <button type="button" className="vmod__close" onClick={onCerrar} aria-label="Cerrar"><IconX /></button>
          {items.length > 1 && (
            <>
              <button type="button" className="vmod__nav vmod__nav--prev" onClick={() => onCambiar((indice - 1 + items.length) % items.length)} aria-label="Anterior"><Flecha /></button>
              <button type="button" className="vmod__nav vmod__nav--next" onClick={() => onCambiar((indice + 1) % items.length)} aria-label="Siguiente"><Flecha der /></button>
            </>
          )}
        </div>
        <div className="vmod__bar">
          <span className="vmod__brand"><img src={gysLogo} alt="Gestión y Servicios" /></span>
          <span className="vmod__title">{item.titulo}</span>
          <span className="vmod__count">{indice + 1} / {items.length}</span>
        </div>
      </div>
    </dialog>
  )
}
