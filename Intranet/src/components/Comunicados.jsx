import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle.jsx'
import { IconArrowRight, IconClock, IconMegaphone } from './Icons.jsx'
import { noticiasApi, fechaCorta } from '../pages/noticias/api.js'

/* Los últimos comunicados publicados en el módulo de Noticias y comunicados. */
const CANTIDAD = 3

export default function Comunicados() {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    let vivo = true
    noticiasApi.lista('comunicado', CANTIDAD).then((l) => vivo && setPosts(l)).catch(() => vivo && setPosts([]))
    return () => { vivo = false }
  }, [])

  /* Sin comunicados publicados, la sección no se muestra. */
  if (!posts || posts.length === 0) return null

  return (
    <section className="comm" id="comunicados" aria-labelledby="comm-title">
      <SectionTitle icon={IconMegaphone} action={{ label: 'Ver todos los comunicados', href: '#noticias-comunicados' }}>
        <span id="comm-title">Comunicados</span>
      </SectionTitle>

      <ul className="comm__grid">
          {posts.map((p, i) => (
            <li key={p.id}>
              <a className={`comm__card ${i === 0 ? 'is-new' : ''}`} href={`#noticias-ver-${p.id}`}>
                <span className="comm__top">
                  <span className="comm__tag">{i === 0 ? 'Último comunicado' : 'Comunicado'}</span>
                  <time dateTime={p.publicadoEn}><IconClock width={13} height={13} /> {fechaCorta(p.publicadoEn)}</time>
                </span>
                <b className="comm__title">{p.titulo}</b>
                {p.resumen && <span className="comm__text">{p.resumen}</span>}
                <span className="comm__more">Leer comunicado <IconArrowRight width={15} height={15} /></span>
              </a>
            </li>
          ))}
      </ul>
    </section>
  )
}
