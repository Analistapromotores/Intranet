import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconArrowRight, IconNews } from '../../components/Icons.jsx'
import Dialog from '../../components/Dialog.jsx'
import SocialSection from '../../components/SocialSection.jsx'
import logo from '../../assets/gys_logo.png'
import { useSession } from '../../lib/useSession.js'
import { IconEdit, IconEye, IconEyeOff, IconTrash } from '../cumpleanos/icons.jsx'
import { noticiasApi, esGestor, fechaCorta } from './api.js'
import { Etiqueta, IconMas, IconPin } from './piezas.jsx'
import NoticiaVista from './NoticiaVista.jsx'
import NoticiaEditor from './NoticiaEditor.jsx'
import './noticias.css'

/* Noticias y comunicados: lectura pública; quienes publican (gestores y administradores) crean y administran desde aquí. */

const FILTROS = [
  ['', 'Todo'],
  ['noticias', 'Noticias'],
  ['comunicados', 'Comunicados'],
]

function Portada({ post }) {
  return post.portada ? (
    <>
      <img className="nw-blur" src={post.portada} alt="" aria-hidden="true" loading="lazy" />
      <img className="nw-fit" src={post.portada} alt="" loading="lazy" />
    </>
  ) : (
    <span className={`nw-ph nw-ph--${post.tipo}`} aria-hidden="true">
      <img src={logo} alt="" />
    </span>
  )
}

function Tarjeta({ post, gestor, ocupado, onAccion, grande = false }) {
  return (
    <article className={`nw-card-post ${grande ? 'nw-card-post--big' : ''} ${post.publicado ? '' : 'is-draft'}`}>
      <a className="nw-card-post__cover" href={`#noticias-ver-${post.id}`} tabIndex={-1} aria-hidden="true"><Portada post={post} /></a>
      <div className="nw-card-post__body">
        <div className="nw-card-post__tags">
          <Etiqueta tipo={post.tipo} />
          {post.destacado && <span className="ui-badge ui-badge--gray"><IconPin width={12} height={12} /> Fijada</span>}
          {!post.publicado && <span className="ui-badge ui-badge--gray">Borrador</span>}
          <time dateTime={post.publicadoEn || undefined}>{fechaCorta(post.publicadoEn)}</time>
        </div>
        <h3><a href={`#noticias-ver-${post.id}`}>{post.titulo}</a></h3>
        {post.resumen && <p>{post.resumen}</p>}
        <a className="nw-card-post__more" href={`#noticias-ver-${post.id}`}>Leer más <IconArrowRight width={15} height={15} /></a>
      </div>
      {gestor && (
        <div className="nw-card-post__tools" role="group" aria-label={`Acciones de «${post.titulo}»`}>
          <a className="ui-icon-btn ui-icon-btn--sm" href={`#noticias-editar-${post.id}`} aria-label="Editar" title="Editar"><IconEdit width={16} height={16} /></a>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm" disabled={ocupado} onClick={() => onAccion('publicar', post)} aria-label={post.publicado ? 'Ocultar (pasar a borrador)' : 'Publicar'} title={post.publicado ? 'Ocultar' : 'Publicar'}>{post.publicado ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}</button>
          <button type="button" className={`ui-icon-btn ui-icon-btn--sm ${post.destacado ? 'is-on' : ''}`} disabled={ocupado} aria-pressed={post.destacado} onClick={() => onAccion('fijar', post)} aria-label={post.destacado ? 'Quitar de destacadas' : 'Fijar como destacada'} title="Fijar"><IconPin width={16} height={16} /></button>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm ui-icon-btn--danger" disabled={ocupado} onClick={() => onAccion('eliminar', post)} aria-label="Eliminar" title="Eliminar"><IconTrash width={16} height={16} /></button>
        </div>
      )}
    </article>
  )
}

function Listado({ filtro }) {
  const user = useSession()
  const gestor = esGestor(user)
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [porEliminar, setPorEliminar] = useState(null)

  const cargar = useCallback(() => {
    if (user === undefined) return
    const f = gestor ? noticiasApi.todasAdmin() : noticiasApi.lista()
    f.then((l) => { setPosts(l); setError('') }).catch((e) => { setError(e.message); setPosts([]) })
  }, [gestor, user])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])
  useEffect(() => { cargar() }, [cargar])

  async function accion(que, post) {
    if (que === 'eliminar') return setPorEliminar(post)
    setOcupado(true)
    try {
      await noticiasApi.cambiar(post.id, que === 'publicar' ? { publicado: !post.publicado } : { destacado: !post.destacado })
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }
  async function eliminar() {
    setOcupado(true)
    try {
      await noticiasApi.eliminar(porEliminar.id)
      setPorEliminar(null)
      cargar()
    } catch (e) {
      setError(e.message)
      setPorEliminar(null)
    } finally {
      setOcupado(false)
    }
  }

  const visibles = useMemo(() => (posts || []).filter((p) => !filtro || p.tipo === filtro.replace(/s$/, '')), [posts, filtro])
  const [primero, ...resto] = visibles
  const conteo = { noticias: (posts || []).filter((p) => p.tipo === 'noticia').length, comunicados: (posts || []).filter((p) => p.tipo === 'comunicado').length }

  return (
    <div className="nw">
      <header className="nw-hero">
        <div className="nw-wrap nw-hero__inner">
          <div>
            <p className="nw-kicker"><IconNews width={16} height={16} /> Gestión y Servicios</p>
            <h1>Noticias y <span>comunicados</span></h1>
            <p className="nw-hero__lead">Lo último del equipo y los avisos oficiales de la organización, en un solo lugar.</p>
          </div>
          {gestor && (
            <a className="ui-btn nw-hero__cta" href="#noticias-nueva"><IconMas width={18} height={18} /> Publicar</a>
          )}
        </div>
      </header>

      <main className="nw-wrap nw-main">
        <nav className="nw-filters" aria-label="Filtrar publicaciones">
          {FILTROS.map(([v, n]) => (
            <a key={v} href={v ? `#noticias-${v}` : '#noticias'} aria-current={filtro === v ? 'page' : undefined} className={filtro === v ? 'is-on' : ''}>
              {n}{posts && v ? <em>{conteo[v]}</em> : null}
            </a>
          ))}
        </nav>

        {error && <p className="ui-alert" role="alert">{error}</p>}
        {posts === null && (
          <div className="nw-grid" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="nw-skel" />)}</div>
        )}

        {posts !== null && visibles.length === 0 && (
          <div className="nw-empty">
            <IconNews width={36} height={36} />
            <h2>Aún no hay {filtro ? filtro : 'publicaciones'}</h2>
            <p>{gestor ? 'Crea la primera publicación y aparecerá aquí y en el inicio de la intranet.' : 'Vuelve pronto: cuando se publique algo nuevo lo verás aquí.'}</p>
            {gestor && <a className="ui-btn" href="#noticias-nueva"><IconMas width={18} height={18} /> Publicar ahora</a>}
          </div>
        )}

        {primero && <Tarjeta post={primero} gestor={gestor} ocupado={ocupado} onAccion={accion} grande />}
        {resto.length > 0 && (
          <div className="nw-grid">
            {resto.map((p) => <Tarjeta key={p.id} post={p} gestor={gestor} ocupado={ocupado} onAccion={accion} />)}
          </div>
        )}

        <div className="nw-social"><SocialSection id="noticias-redes" /></div>
      </main>

      {porEliminar && (
        <Dialog title="Eliminar publicación" size="sm" onClose={() => setPorEliminar(null)} label="nw-del">
          <p>Se eliminará «<b>{porEliminar.titulo}</b>» con sus imágenes. Esta acción no se puede deshacer.</p>
          <div className="ui-dialog__foot">
            <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setPorEliminar(null)}>Cancelar</button>
            <button type="button" className="ui-btn ui-btn--red" disabled={ocupado} onClick={eliminar}>Eliminar</button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default function NoticiasPage({ hash }) {
  if (hash.startsWith('noticias-ver-')) return <NoticiaVista key={hash} id={hash.slice('noticias-ver-'.length)} />
  if (hash === 'noticias-nueva') return <NoticiaEditor key="nueva" />
  if (hash.startsWith('noticias-editar-')) return <NoticiaEditor key={hash} id={hash.slice('noticias-editar-'.length)} />
  return <Listado filtro={hash === 'noticias-comunicados' ? 'comunicados' : hash === 'noticias-noticias' ? 'noticias' : ''} />
}
