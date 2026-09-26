import { useEffect, useState } from 'react'
import { IconArrowRight, IconClock } from '../../components/Icons.jsx'
import Contenido from './Contenido.jsx'
import { noticiasApi, fechaLarga, TIPO_TEXTO, esGestor } from './api.js'
import { useSession } from '../../lib/useSession.js'
import { Etiqueta } from './piezas.jsx'

/* Cuerpo de una publicación: se usa en la lectura pública y en la vista previa del editor. */
export function Articulo({ post, preview = false }) {
  return (
    <article className={`nw-article ${preview ? 'is-preview' : ''}`}>
      <header className="nw-article__head">
        <Etiqueta tipo={post.tipo} />
        <h1>{post.titulo || 'Título de la publicación'}</h1>
        {post.resumen && <p className="nw-article__lead">{post.resumen}</p>}
        <p className="nw-article__meta">
          <IconClock width={14} height={14} />
          {post.publicadoEn ? fechaLarga(post.publicadoEn) : 'Borrador'}
          {post.autor && <> · {post.autor}</>}
        </p>
      </header>
      {post.portada && <img className="nw-article__cover" src={post.portada} alt="" />}
      <Contenido bloques={post.bloques || []} />
    </article>
  )
}

export default function NoticiaVista({ id }) {
  const user = useSession()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    let vivo = true
    noticiasApi.una(id).then((p) => vivo && setPost(p)).catch((e) => vivo && setError(e.message))
    return () => { vivo = false }
  }, [id])

  return (
    <div className="nw nw-read">
      <div className="nw-read__bar">
        <a href="#noticias" className="nw-back">← Noticias y comunicados</a>
        {esGestor(user) && post && <a className="ui-btn ui-btn--ghost ui-btn--sm" href={`#noticias-editar-${post.id}`}>Editar publicación</a>}
      </div>
      {error && (
        <div className="nw-empty">
          <h1>No encontramos esta publicación</h1>
          <p>{error}</p>
          <a className="ui-btn" href="#noticias">Ver todas las publicaciones <IconArrowRight width={16} height={16} /></a>
        </div>
      )}
      {!post && !error && <div className="nw-skel nw-skel--article" aria-busy="true" />}
      {post && (
        <>
          {!post.publicado && <p className="nw-draft">Borrador: solo lo ves tú y quienes publican. {TIPO_TEXTO[post.tipo]} sin publicar.</p>}
          <Articulo post={post} />
        </>
      )}
    </div>
  )
}
