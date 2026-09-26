import { Fragment } from 'react'
import { embedDe } from '../../lib/social.js'
import VideoPlayer from '../../components/VideoPlayer.jsx'
import { esVideoDirecto, youtubeEmbed, youtubePoster } from '../../lib/video.js'

/* Renderizado de los bloques de una publicación (vista pública y vista previa del editor).
   Texto con formato mínimo y seguro, sin HTML: **negrita**, *cursiva*, [texto](enlace) y enlaces sueltos. */

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<)]+)/g

/* Solo http(s), mailto y anclas de la propia intranet. */
function urlSegura(u) {
  const s = String(u || '').trim()
  if (/^(https?:\/\/|mailto:)/i.test(s) || s.startsWith('#')) return s
  return /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(s) ? `https://${s}` : ''
}
const esExterno = (u) => /^https?:\/\//i.test(u)

export function Inline({ texto }) {
  const out = []
  let ultimo = 0
  let n = 0
  for (const m of String(texto).matchAll(INLINE)) {
    if (m.index > ultimo) out.push(texto.slice(ultimo, m.index))
    const key = n++
    if (m[1] !== undefined) out.push(<strong key={key}><Inline texto={m[1]} /></strong>)
    else if (m[2] !== undefined) out.push(<em key={key}><Inline texto={m[2]} /></em>)
    else {
      const href = urlSegura(m[4] || m[5])
      const label = m[3] ?? m[5].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
      out.push(href ? <a key={key} href={href} target={esExterno(href) ? '_blank' : undefined} rel="noreferrer">{label}</a> : label)
    }
    ultimo = m.index + m[0].length
  }
  if (ultimo < texto.length) out.push(texto.slice(ultimo))
  return out.map((x, i) => <Fragment key={i}>{x}</Fragment>)
}

/* Párrafos por línea en blanco, saltos de línea simples y listas con "- ". */
function Texto({ texto }) {
  const partes = String(texto).split(/\n{2,}/)
  return partes.map((p, i) => {
    const lineas = p.split('\n')
    if (lineas.every((l) => /^\s*[-•]\s+/.test(l))) {
      return <ul key={i}>{lineas.map((l, j) => <li key={j}><Inline texto={l.replace(/^\s*[-•]\s+/, '')} /></li>)}</ul>
    }
    return <p key={i}>{lineas.map((l, j) => <Fragment key={j}>{j > 0 && <br />}<Inline texto={l} /></Fragment>)}</p>
  })
}

function Video({ url, pie }) {
  /* MP4 propios y videos de YouTube / Vimeo: miniatura + visor de cristal. */
  if (esVideoDirecto(url)) {
    return <figure className="nw-video"><VideoPlayer src={url} titulo={pie} className="nw-video__frame" />{pie && <figcaption>{pie}</figcaption>}</figure>
  }
  const e = embedDe(url)
  if (e?.red === 'youtube' && !e.canal && !e.alto) {
    const id = e.src.split('/embed/')[1]
    return <figure className="nw-video"><VideoPlayer embed={youtubeEmbed(id)} poster={youtubePoster(id)} titulo={pie} className="nw-video__frame" />{pie && <figcaption>{pie}</figcaption>}</figure>
  }
  if (e?.red === 'vimeo') {
    return <figure className="nw-video"><VideoPlayer embed={`${e.src}?autoplay=1`} titulo={pie} className="nw-video__frame" />{pie && <figcaption>{pie}</figcaption>}</figure>
  }
  if (!e) {
    const href = urlSegura(url)
    return href ? <p className="nw-video-link"><a href={href} target="_blank" rel="noreferrer">{pie || href}</a></p> : null
  }
  return (
    <figure className="nw-video">
      <div className="nw-video__frame" style={e.ratio ? { aspectRatio: String(e.ratio) } : { height: e.alto, maxWidth: 520 }}>
        <iframe src={e.src} title={pie || 'Contenido incrustado'} loading="lazy" allowFullScreen allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" />
      </div>
      {pie && <figcaption>{pie}</figcaption>}
    </figure>
  )
}

export default function Contenido({ bloques }) {
  return (
    <div className="nw-body">
      {bloques.map((b) => {
        switch (b.type) {
          case 'titulo': {
            const H = b.nivel === 3 ? 'h3' : 'h2'
            return b.texto ? <H key={b.id}>{b.texto}</H> : null
          }
          case 'texto':
            return b.texto ? <div key={b.id} className="nw-text"><Texto texto={b.texto} /></div> : null
          case 'imagen':
            return b.src ? (
              <figure key={b.id} className={`nw-img nw-img--${b.ancho || 'completo'}`}>
                <img src={b.src} alt={b.pie || ''} loading="lazy" />
                {b.pie && <figcaption>{b.pie}</figcaption>}
              </figure>
            ) : null
          case 'enlace': {
            const href = urlSegura(b.url)
            return (
              <p key={b.id} className="nw-cta">
                {href ? (
                  <a className={`ui-btn ${b.estilo === 'secundario' ? 'ui-btn--ghost' : ''}`} href={href} target={esExterno(href) ? '_blank' : undefined} rel="noreferrer">{b.texto || 'Abrir enlace'}</a>
                ) : (
                  <span className="ui-btn ui-btn--ghost" aria-disabled="true">{b.texto || 'Abrir enlace'}</span>
                )}
              </p>
            )
          }
          case 'cita':
            return b.texto ? (
              <blockquote key={b.id} className="nw-quote">
                <p>{b.texto}</p>
                {b.autor && <footer>— {b.autor}</footer>}
              </blockquote>
            ) : null
          case 'video':
            return <Video key={b.id} url={b.url} pie={b.pie} />
          case 'separador':
            return <hr key={b.id} className="nw-hr" />
          default:
            return null
        }
      })}
    </div>
  )
}
