import { useEffect, useState } from 'react'
import { IconClock, IconExternal } from './Icons.jsx'
import { IG_TOKEN } from '../config.js'
import portada from '../assets/portada.png'
import pasaportes from '../assets/pasaportes_portad.png'

const FIELDS = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp'
const ENDPOINT = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=3`

/* Contenido de muestra cuando no hay token configurado. */
const SAMPLE = [
  {
    id: 's1',
    caption: 'Nueva convocatoria interna para líderes de proceso. Postulaciones abiertas.',
    thumb: portada,
    timestamp: daysAgo(2),
    permalink: 'https://www.instagram.com/',
  },
  {
    id: 's2',
    caption: 'Ampliación de horario en la Oficina de Pasaportes: jornada continua 7:00 a. m. - 5:00 p. m.',
    thumb: pasaportes,
    timestamp: daysAgo(4),
    permalink: 'https://www.instagram.com/',
  },
  {
    id: 's3',
    caption: 'Semana del bienestar con Fondo ValleINN: exámenes preventivos y pausas activas.',
    thumb: null,
    timestamp: daysAgo(8),
    permalink: 'https://www.instagram.com/',
  },
]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function relative(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86400000
  if (diff < day) return 'hoy'
  if (diff < 2 * day) return 'ayer'
  if (diff < 7 * day) return `hace ${Math.floor(diff / day)} días`
  if (diff < 14 * day) return 'hace 1 semana'
  return `hace ${Math.floor(diff / (7 * day))} semanas`
}

function excerpt(text, max = 96) {
  if (!text) return 'Publicación de Instagram'
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

export default function InstagramFeed() {
  const [state, setState] = useState({
    status: IG_TOKEN ? 'loading' : 'ready',
    posts: IG_TOKEN ? [] : SAMPLE,
  })

  useEffect(() => {
    if (!IG_TOKEN) return
    let alive = true

    fetch(`${ENDPOINT}&access_token=${IG_TOKEN}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!alive) return
        const posts = (json.data || []).slice(0, 3).map((p) => ({
          id: p.id,
          caption: p.caption,
          thumb: p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url,
          timestamp: p.timestamp,
          permalink: p.permalink,
        }))
        setState({ status: 'ready', posts })
      })
      .catch(() => {
        if (alive) setState({ status: 'ready', posts: SAMPLE })
      })

    return () => {
      alive = false
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <ul className="news__list">
        {[0, 1, 2].map((i) => (
          <li key={i} className="news__item">
            <div className="news__thumb news__thumb--grad" />
            <div className="news__body">
              <div className="ig-skel ig-skel--line" />
              <div className="ig-skel ig-skel--line short" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="news__list">
      {state.posts.map((p) => (
        <li key={p.id} className="news__item">
          <a
            className={`news__thumb ${p.thumb ? '' : 'news__thumb--grad'}`}
            href={p.permalink}
            target="_blank"
            rel="noreferrer"
          >
            {p.thumb ? <img src={p.thumb} alt="" /> : <IconExternal width={20} height={20} />}
          </a>
          <div className="news__body">
            <a
              className="news__headline news__headline--link"
              href={p.permalink}
              target="_blank"
              rel="noreferrer"
            >
              {excerpt(p.caption)}
            </a>
            <p className="news__date">
              <IconClock width={13} height={13} />
              {relative(p.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
