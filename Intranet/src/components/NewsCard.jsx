import { useEffect, useState } from 'react'
import { IconClock, IconNews } from './Icons.jsx'
import { noticiasApi, hace } from '../pages/noticias/api.js'
import logo from '../assets/gys_logo.png'

/* Últimas noticias publicadas en el módulo de Noticias y comunicados. */
const CANTIDAD = 3

const recorte = (t, max = 96) => (t && t.length > max ? `${t.slice(0, max).trim()}…` : t)

export default function NewsCard() {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    let vivo = true
    noticiasApi.lista('noticia', CANTIDAD).then((l) => vivo && setPosts(l)).catch(() => vivo && setPosts([]))
    return () => { vivo = false }
  }, [])

  /* Sin noticias publicadas (o mientras carga), el componente no se muestra. */
  if (!posts || posts.length === 0) return null

  return (
    <section className="news card" aria-labelledby="news-title">
      <div className="card__head">
        <IconNews className="card__head-icon" width={20} height={20} />
        <h2 id="news-title" className="card__title">Noticias destacadas</h2>
        <a className="card__link" href="#noticias-noticias">Ver todas</a>
      </div>

      {posts === null && (
        <ul className="news__list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="news__item">
              <div className="news__thumb news__thumb--grad" />
              <div className="news__body"><div className="ig-skel ig-skel--line" /><div className="ig-skel ig-skel--line short" /></div>
            </li>
          ))}
        </ul>
      )}

      {posts !== null && posts.length === 0 && (
        <p className="news__empty">Todavía no hay noticias publicadas. Vuelve pronto.</p>
      )}

      {posts !== null && posts.length > 0 && (
        <ul className="news__list">
          {posts.map((p) => (
            <li key={p.id} className="news__item">
              <a className={`news__thumb ${p.portada ? '' : 'news__thumb--logo'}`} href={`#noticias-ver-${p.id}`} tabIndex={-1} aria-hidden="true">
                {p.portada && <img className="nw-blur" src={p.portada} alt="" aria-hidden="true" loading="lazy" />}
                <img className={p.portada ? 'nw-fit' : ''} src={p.portada || logo} alt="" loading="lazy" />
              </a>
              <div className="news__body">
                <a className="news__headline news__headline--link" href={`#noticias-ver-${p.id}`}>{p.titulo}</a>
                {p.resumen && <p className="news__excerpt">{recorte(p.resumen)}</p>}
                <p className="news__date"><IconClock width={13} height={13} />{hace(p.publicadoEn)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
