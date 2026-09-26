import { useEffect, useRef, useState } from 'react'
import gysLogo from '../assets/gys_logo.png'
import './video.css'

/* Visualizador de videos de toda la intranet.
   Muestra una miniatura (con vista previa al pasar el mouse si es un MP4 propio) y, al pulsar, abre un
   visor modal de cristal, al estilo iOS, con el logo de Gestión y Servicios siempre en la esquina inferior izquierda.
   Sirve para MP4 propios (`src`) y para reproductores incrustados como YouTube o Vimeo (`embed`). */

const IconPlay = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 5.8v12.4a.6.6 0 0 0 .92.5l9.6-6.2a.6.6 0 0 0 0-1L9.42 5.3a.6.6 0 0 0-.92.5Z" /></svg>
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>

function VideoModal({ src, embed, poster, titulo, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    d.showModal()
    document.documentElement.classList.add('vmod-open')
    return () => {
      document.documentElement.classList.remove('vmod-open')
      d.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className="vmod"
      aria-label={titulo || 'Video'}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="vmod__panel">
        <div className="vmod__screen">
          {src ? (
            <video src={src} poster={poster} controls autoPlay playsInline controlsList="nodownload" />
          ) : (
            <iframe src={embed} title={titulo || 'Video'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          )}
          <button type="button" className="vmod__close" onClick={onClose} aria-label="Cerrar el video"><IconX /></button>
        </div>
        <div className="vmod__bar">
          <span className="vmod__brand"><img src={gysLogo} alt="Gestión y Servicios" /></span>
          {titulo && <span className="vmod__title">{titulo}</span>}
        </div>
      </div>
    </dialog>
  )
}

export default function VideoPlayer({ src, embed, poster, titulo, ratio = '16 / 9', className = '' }) {
  const [abierto, setAbierto] = useState(false)
  const video = useRef(null)

  /* Vista previa muda al pasar el mouse (solo MP4 propios). */
  const previa = (on) => {
    const v = video.current
    if (!v) return
    if (on) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }

  return (
    <>
      <button
        type="button"
        className={`vp ${className}`}
        style={{ aspectRatio: ratio }}
        onClick={() => setAbierto(true)}
        onMouseEnter={() => previa(true)}
        onMouseLeave={() => previa(false)}
        onFocus={() => previa(true)}
        onBlur={() => previa(false)}
        aria-label={`Reproducir video${titulo ? `: ${titulo}` : ''}`}
      >
        {src ? (
          <video ref={video} src={src} poster={poster} muted loop playsInline preload="none" tabIndex={-1} aria-hidden="true" />
        ) : (
          poster && <img src={poster} alt="" loading="lazy" />
        )}
        <span className="vp__shade" aria-hidden="true" />
        <span className="vp__play" aria-hidden="true"><IconPlay /></span>
        <span className="vp__logo" aria-hidden="true"><img src={gysLogo} alt="" /></span>
      </button>
      {abierto && <VideoModal src={src} embed={embed} poster={poster} titulo={titulo} onClose={() => setAbierto(false)} />}
    </>
  )
}
