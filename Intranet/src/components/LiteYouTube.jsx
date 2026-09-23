import { useState } from 'react'
import './LiteYouTube.css'

/* Video de YouTube liviano: muestra la miniatura y carga el reproductor solo al pulsar.
   Usa youtube-nocookie para no dejar cookies de seguimiento hasta reproducir. */
export default function LiteYouTube({ id, titulo, className = '' }) {
  const [activo, setActivo] = useState(false)
  return (
    <div className={`yt ${className}`}>
      {activo ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="yt__poster" onClick={() => setActivo(true)} aria-label={`Reproducir video: ${titulo}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="yt__play" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
        </button>
      )}
    </div>
  )
}
