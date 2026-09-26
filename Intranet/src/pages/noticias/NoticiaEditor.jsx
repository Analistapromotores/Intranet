import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconTrash } from '../cumpleanos/icons.jsx'
import { useSession } from '../../lib/useSession.js'
import { embedDe, REDES } from '../../lib/social.js'
import { noticiasApi, prepararImagen, esGestor } from './api.js'
import { Articulo } from './NoticiaVista.jsx'
import {
  IconGrip, IconArriba, IconAbajo, IconCopiar, IconTitulo, IconTexto, IconImagen, IconEnlace, IconCita, IconVideo,
  IconSeparador, IconNegrita, IconCursiva, IconLista, IconPin,
} from './piezas.jsx'

/* Editor de noticias y comunicados: bloques que se arrastran para reordenar, con vista previa en vivo.
   Cada bloque tiene también botones de subir/bajar, para quien no use el ratón. */

/* crypto.randomUUID solo existe en contextos seguros (HTTPS o localhost); en la red local (http://IP) no. */
const nuevoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`)

const TIPOS_BLOQUE = [
  { type: 'titulo', nombre: 'Título', Icono: IconTitulo, crear: () => ({ texto: '', nivel: 2 }) },
  { type: 'texto', nombre: 'Texto', Icono: IconTexto, crear: () => ({ texto: '' }) },
  { type: 'imagen', nombre: 'Imagen', Icono: IconImagen, crear: () => ({ src: null, pie: '', ancho: 'completo' }) },
  { type: 'enlace', nombre: 'Botón con enlace', Icono: IconEnlace, crear: () => ({ texto: 'Ver más', url: '', estilo: 'primario' }) },
  { type: 'cita', nombre: 'Cita', Icono: IconCita, crear: () => ({ texto: '', autor: '' }) },
  { type: 'video', nombre: 'Video o publicación', Icono: IconVideo, crear: () => ({ url: '', pie: '' }) },
  { type: 'separador', nombre: 'Separador', Icono: IconSeparador, crear: () => ({}) },
]
const META = Object.fromEntries(TIPOS_BLOQUE.map((t) => [t.type, t]))

/* ---------- Editores de cada tipo de bloque ---------- */
function EditorTexto({ b, onChange }) {
  const ref = useRef(null)
  const [enlace, setEnlace] = useState(null) // null cerrado | { url }

  /* Envuelve la selección (o inserta un marcador) y deja el cursor dentro. */
  function envolver(antes, despues, relleno) {
    const el = ref.current
    const ini = el.selectionStart
    const fin = el.selectionEnd
    const sel = b.texto.slice(ini, fin) || relleno
    const texto = b.texto.slice(0, ini) + antes + sel + despues + b.texto.slice(fin)
    onChange({ texto })
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(ini + antes.length, ini + antes.length + sel.length) })
  }
  function lista() {
    const el = ref.current
    const ini = b.texto.lastIndexOf('\n', el.selectionStart - 1) + 1
    const finIdx = b.texto.indexOf('\n', el.selectionEnd)
    const fin = finIdx === -1 ? b.texto.length : finIdx
    const trozo = b.texto.slice(ini, fin).split('\n').map((l) => (/^\s*[-•]\s/.test(l) ? l : `- ${l}`)).join('\n')
    onChange({ texto: b.texto.slice(0, ini) + trozo + b.texto.slice(fin) })
    requestAnimationFrame(() => el.focus())
  }
  function aplicarEnlace(e) {
    e.preventDefault()
    const url = enlace.url.trim()
    if (!url) return
    envolver('[', `](${url})`, 'texto del enlace')
    setEnlace(null)
  }

  return (
    <div className="nw-txt">
      <div className="nw-txt__bar" role="toolbar" aria-label="Formato del texto">
        <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={() => envolver('**', '**', 'texto en negrita')} aria-label="Negrita" title="Negrita"><IconNegrita width={16} height={16} /></button>
        <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={() => envolver('*', '*', 'texto en cursiva')} aria-label="Cursiva" title="Cursiva"><IconCursiva width={16} height={16} /></button>
        <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={lista} aria-label="Lista con viñetas" title="Lista con viñetas"><IconLista width={16} height={16} /></button>
        <button type="button" className={`ui-icon-btn ui-icon-btn--sm ${enlace ? 'is-on' : ''}`} onClick={() => setEnlace(enlace ? null : { url: '' })} aria-expanded={Boolean(enlace)} aria-label="Insertar enlace" title="Insertar enlace"><IconEnlace width={16} height={16} /></button>
        <span className="nw-txt__tip">Selecciona un texto y aplica el formato. Enter doble = nuevo párrafo.</span>
      </div>
      {enlace && (
        <div className="nw-txt__link">
          <input type="url" inputMode="url" value={enlace.url} onChange={(e) => setEnlace({ url: e.target.value })} placeholder="https://… o correo@dominio.com" aria-label="Dirección del enlace" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') aplicarEnlace(e); if (e.key === 'Escape') setEnlace(null) }} />
          <button type="button" className="ui-btn ui-btn--sm" onClick={aplicarEnlace}>Aplicar al texto seleccionado</button>
        </div>
      )}
      <textarea ref={ref} value={b.texto} onChange={(e) => onChange({ texto: e.target.value })} rows={5} maxLength={6000} placeholder="Escribe aquí. Puedes pegar enlaces: se vuelven clicables solos." aria-label="Texto" />
    </div>
  )
}

function EditorImagen({ b, onChange }) {
  const [error, setError] = useState('')
  const [encima, setEncima] = useState(false)
  const entrada = useRef(null)

  async function subir(file) {
    if (!file) return
    setError('')
    try {
      onChange({ src: await prepararImagen(file) })
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <div className="nw-img-ed">
      <div
        className={`nw-drop ${encima ? 'is-over' : ''} ${b.src ? 'has-img' : ''}`}
        onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setEncima(true) } }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => { e.preventDefault(); setEncima(false); subir(e.dataTransfer.files?.[0]) }}
      >
        {b.src ? <img src={b.src} alt="" draggable={false} decoding="async" /> : <span><IconImagen width={28} height={28} />Arrastra una imagen aquí</span>}
        <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => entrada.current.click()}>{b.src ? 'Cambiar imagen' : 'Elegir archivo'}</button>
        <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { subir(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      {error && <p className="ui-error" role="alert">{error}</p>}
      <div className="nw-row">
        <label className="ui-field"><span className="ui-label">Pie de foto <small>(opcional)</small></span><input value={b.pie} onChange={(e) => onChange({ pie: e.target.value })} maxLength={200} /></label>
        <label className="ui-field"><span className="ui-label">Ancho</span>
          <select value={b.ancho} onChange={(e) => onChange({ ancho: e.target.value })}><option value="completo">Completo</option><option value="medio">Mediano, centrado</option></select>
        </label>
      </div>
    </div>
  )
}

function EditorVideo({ b, onChange }) {
  const e = b.url.trim() ? embedDe(b.url) : null
  return (
    <div className="nw-video-ed">
      <label className="ui-field">
        <span className="ui-label">Enlace de YouTube, Vimeo, Instagram, Facebook, LinkedIn o TikTok</span>
        <input type="url" inputMode="url" value={b.url} onChange={(ev) => onChange({ url: ev.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
        {b.url.trim() && (e
          ? <p className="ui-hint">Se mostrará incrustado desde {REDES[e.red]?.nombre || 'Vimeo'}.</p>
          : <p className="ui-error">No se puede incrustar este enlace; se mostrará como un enlace normal.</p>)}
      </label>
      <label className="ui-field"><span className="ui-label">Descripción <small>(opcional)</small></span><input value={b.pie} onChange={(ev) => onChange({ pie: ev.target.value })} maxLength={160} /></label>
    </div>
  )
}

function CuerpoBloque({ b, onChange }) {
  switch (b.type) {
    case 'titulo':
      return (
        <div className="nw-row nw-row--title">
          <label className="ui-field"><span className="ui-label">Subtítulo</span><input value={b.texto} onChange={(e) => onChange({ texto: e.target.value })} maxLength={160} placeholder="Escribe el subtítulo" /></label>
          <label className="ui-field"><span className="ui-label">Tamaño</span><select value={b.nivel} onChange={(e) => onChange({ nivel: Number(e.target.value) })}><option value={2}>Grande</option><option value={3}>Mediano</option></select></label>
        </div>
      )
    case 'texto':
      return <EditorTexto b={b} onChange={onChange} />
    case 'imagen':
      return <EditorImagen b={b} onChange={onChange} />
    case 'enlace':
      return (
        <div className="nw-row">
          <label className="ui-field"><span className="ui-label">Texto del botón</span><input value={b.texto} onChange={(e) => onChange({ texto: e.target.value })} maxLength={80} /></label>
          <label className="ui-field"><span className="ui-label">Dirección (URL)</span><input type="url" inputMode="url" value={b.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://…" /></label>
          <label className="ui-field"><span className="ui-label">Estilo</span><select value={b.estilo} onChange={(e) => onChange({ estilo: e.target.value })}><option value="primario">Destacado (azul)</option><option value="secundario">Discreto (borde)</option></select></label>
        </div>
      )
    case 'cita':
      return (
        <div className="nw-row nw-row--quote">
          <label className="ui-field"><span className="ui-label">Cita</span><textarea value={b.texto} onChange={(e) => onChange({ texto: e.target.value })} rows={3} maxLength={500} /></label>
          <label className="ui-field"><span className="ui-label">Autor <small>(opcional)</small></span><input value={b.autor} onChange={(e) => onChange({ autor: e.target.value })} maxLength={80} /></label>
        </div>
      )
    case 'video':
      return <EditorVideo b={b} onChange={onChange} />
    default:
      return <p className="ui-hint">Una línea que separa secciones del contenido.</p>
  }
}

/* ---------- Bloque arrastrable ---------- */
function Bloque({ b, indice, total, onChange, onMover, onCopiar, onQuitar }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: b.id })
  const { Icono, nombre } = META[b.type]
  return (
    <li
      ref={setNodeRef}
      className={`nw-blk ${isDragging ? 'is-drag' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="nw-blk__bar">
        <button type="button" ref={setActivatorNodeRef} className="nw-blk__grip" {...attributes} {...listeners} aria-label={`Arrastrar el bloque ${indice + 1}: ${nombre}. Con teclado: espacio y flechas.`} title="Arrastra para reordenar">
          <IconGrip width={18} height={18} />
        </button>
        <span className="nw-blk__name"><Icono width={16} height={16} />{nombre}<small>{indice + 1}/{total}</small></span>
        <span className="nw-blk__tools">
          <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={() => onMover(-1)} disabled={indice === 0} aria-label="Subir bloque" title="Subir"><IconArriba width={16} height={16} /></button>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={() => onMover(1)} disabled={indice === total - 1} aria-label="Bajar bloque" title="Bajar"><IconAbajo width={16} height={16} /></button>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={onCopiar} aria-label="Duplicar bloque" title="Duplicar"><IconCopiar width={16} height={16} /></button>
          <button type="button" className="ui-icon-btn ui-icon-btn--sm ui-icon-btn--danger" onClick={onQuitar} aria-label="Eliminar bloque" title="Eliminar"><IconTrash width={16} height={16} /></button>
        </span>
      </div>
      <div className="nw-blk__body"><CuerpoBloque b={b} onChange={onChange} /></div>
    </li>
  )
}

/* ---------- Página del editor ---------- */
const VACIO = { tipo: 'noticia', titulo: '', resumen: '', portada: null, destacado: false, publicado: false, bloques: [], publicadoEn: null }

export default function NoticiaEditor({ id }) {
  const user = useSession()
  const [post, setPost] = useState(id ? null : VACIO)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [sucio, setSucio] = useState(false)
  const [vista, setVista] = useState('editar') // en pantallas pequeñas: editar | previa
  const portadaRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (!id) return
    let vivo = true
    noticiasApi.una(id).then((p) => vivo && setPost(p)).catch((e) => vivo && setError(e.message))
    return () => { vivo = false }
  }, [id])

  /* Aviso al cerrar la pestaña con cambios sin guardar. */
  useEffect(() => {
    if (!sucio) return
    const f = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', f)
    return () => window.removeEventListener('beforeunload', f)
  }, [sucio])

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const editar = useCallback((cambios) => { setPost((p) => ({ ...p, ...cambios })); setSucio(true) }, [])
  const editarBloque = (bid, cambios) => editar({ bloques: post.bloques.map((b) => (b.id === bid ? { ...b, ...cambios } : b)) })
  const agregar = (type) => editar({ bloques: [...post.bloques, { id: nuevoId(), type, ...META[type].crear() }] })
  const mover = (i, d) => editar({ bloques: arrayMove(post.bloques, i, i + d) })
  const copiar = (i) => { const c = { ...post.bloques[i], id: nuevoId() }; const l = [...post.bloques]; l.splice(i + 1, 0, c); editar({ bloques: l }) }
  const quitar = (i) => editar({ bloques: post.bloques.filter((_, j) => j !== i) })
  const alSoltar = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const a = post.bloques.findIndex((b) => b.id === active.id)
    const n = post.bloques.findIndex((b) => b.id === over.id)
    editar({ bloques: arrayMove(post.bloques, a, n) })
  }

  async function subirPortada(file) {
    if (!file) return
    try {
      editar({ portada: await prepararImagen(file) })
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  async function guardar(publicar) {
    setGuardando(true)
    setError('')
    setFields({})
    const carga = {
      tipo: post.tipo,
      titulo: post.titulo,
      resumen: post.resumen,
      portada: post.portada,
      destacado: post.destacado,
      publicado: publicar,
      bloques: post.bloques.map((b) => (b.type === 'imagen' ? { ...b, src: b.src } : b)),
    }
    try {
      const guardada = id ? await noticiasApi.guardar(id, carga) : await noticiasApi.crear(carga)
      setSucio(false)
      setPost(guardada)
      setGuardando(false)
      window.location.hash = publicar ? `noticias-ver-${guardada.id}` : `noticias-editar-${guardada.id}`
    } catch (e) {
      setError(e.message)
      setFields(e.fields || {})
      setGuardando(false)
    }
  }

  const previa = useMemo(() => (post ? { ...post, autor: post.autor || user?.name } : null), [post, user])

  if (user === undefined) return <div className="nw"><p className="nw-loading">Comprobando sesión…</p></div>
  if (!esGestor(user)) {
    return (
      <div className="nw">
        <div className="nw-empty">
          <h1>Solo para quienes publican</h1>
          <p>Inicia sesión con tu usuario de gestor desde el botón «Iniciar sesión» del menú para publicar noticias y comunicados.</p>
          <a className="ui-btn" href="#noticias">Volver a Noticias y comunicados</a>
        </div>
      </div>
    )
  }
  if (error && !post) return <div className="nw"><div className="nw-empty"><h1>No se pudo abrir</h1><p>{error}</p><a className="ui-btn" href="#noticias">Volver</a></div></div>
  if (!post) return <div className="nw"><p className="nw-loading">Cargando publicación…</p></div>

  return (
    <div className="nw nw-ed">
      <header className="nw-ed__top">
        <div>
          <a href="#noticias" className="nw-back" onClick={(e) => { if (sucio && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) e.preventDefault() }}>← Volver</a>
          <h1>{id ? 'Editar publicación' : 'Nueva publicación'}</h1>
        </div>
        <div className="nw-ed__actions">
          <span className={`ui-badge ${post.publicado ? 'ui-badge--green' : 'ui-badge--gray'}`}>{post.publicado ? 'Publicada' : 'Borrador'}{sucio ? ' · cambios sin guardar' : ''}</span>
          <button type="button" className="ui-btn ui-btn--ghost" disabled={guardando} onClick={() => guardar(false)}>{post.publicado ? 'Pasar a borrador' : 'Guardar borrador'}</button>
          <button type="button" className="ui-btn" disabled={guardando} onClick={() => guardar(true)}>{guardando ? 'Guardando…' : post.publicado ? 'Guardar cambios' : 'Publicar'}</button>
        </div>
      </header>

      <div className="nw-ed__tabs" role="tablist" aria-label="Vista">
        <button type="button" role="tab" aria-selected={vista === 'editar'} onClick={() => setVista('editar')}>Editar</button>
        <button type="button" role="tab" aria-selected={vista === 'previa'} onClick={() => setVista('previa')}>Vista previa</button>
      </div>

      {error && <p className="ui-alert nw-ed__alert" role="alert">{error}</p>}

      <div className="nw-ed__grid">
        <div className={`nw-ed__col ${vista === 'editar' ? '' : 'is-hidden'}`}>
          <section className="nw-card">
            <fieldset className="nw-tipo">
              <legend className="ui-label">¿Qué vas a publicar?</legend>
              {[['noticia', 'Noticia', 'Novedades, logros y actividades del equipo.'], ['comunicado', 'Comunicado', 'Avisos oficiales e informaciones importantes.']].map(([v, n, d]) => (
                <label key={v} className={`nw-tipo__op ${post.tipo === v ? 'is-on' : ''} nw-tipo__op--${v}`}>
                  <input type="radio" name="tipo" value={v} checked={post.tipo === v} onChange={() => editar({ tipo: v })} />
                  <b>{n}</b><span>{d}</span>
                </label>
              ))}
            </fieldset>

            <label className={`ui-field ${fields.titulo ? 'is-bad' : ''}`}>
              <span className="ui-label">Título</span>
              <input value={post.titulo} onChange={(e) => editar({ titulo: e.target.value })} maxLength={140} placeholder="Un título claro y corto" />
              {fields.titulo && <p className="ui-error">{fields.titulo}</p>}
            </label>
            <label className="ui-field">
              <span className="ui-label">Resumen <small>({post.resumen.length}/280) · aparece en las tarjetas</small></span>
              <textarea value={post.resumen} onChange={(e) => editar({ resumen: e.target.value })} maxLength={280} rows={3} />
            </label>

            <div className="ui-field">
              <span className="ui-label">Imagen de portada <small>(se muestra tal cual, sin recortar · opcional)</small></span>
              <div className={`nw-cover ${post.portada ? 'has-img' : ''}`}
                onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) e.preventDefault() }}
                onDrop={(e) => { e.preventDefault(); subirPortada(e.dataTransfer.files?.[0]) }}>
                {post.portada ? <img src={post.portada} alt="Portada seleccionada" /> : <span><IconImagen width={28} height={28} />Arrastra la portada aquí o elígela (vertical u horizontal)</span>}
                <div className="nw-cover__btns">
                  <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => portadaRef.current.click()}>{post.portada ? 'Cambiar' : 'Elegir imagen'}</button>
                  {post.portada && <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => editar({ portada: null })}>Quitar</button>}
                </div>
                <input ref={portadaRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { subirPortada(e.target.files?.[0]); e.target.value = '' }} />
              </div>
            </div>

            <label className="ui-switch">
              <input type="checkbox" checked={post.destacado} onChange={(e) => editar({ destacado: e.target.checked })} />
              <i aria-hidden="true" />
              <span><IconPin width={14} height={14} style={{ verticalAlign: '-2px' }} /> Fijar como destacada<small>Aparece primero en el listado y en el inicio.</small></span>
            </label>
          </section>

          <section className="nw-card" aria-labelledby="nw-cont">
            <div className="nw-card__head">
              <h2 id="nw-cont">Contenido</h2>
              <p className="ui-hint">Arrastra el ícono ⠿ para reordenar los bloques, o usa las flechas.</p>
            </div>
            {post.bloques.length === 0 && <p className="nw-blk__empty">Empieza agregando un bloque de texto, una imagen, un botón con enlace o un video.</p>}
            <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
              <SortableContext items={post.bloques.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <ol className="nw-blks">
                  {post.bloques.map((b, i) => (
                    <Bloque key={b.id} b={b} indice={i} total={post.bloques.length}
                      onChange={(c) => editarBloque(b.id, c)} onMover={(d) => mover(i, d)} onCopiar={() => copiar(i)} onQuitar={() => quitar(i)} />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>

            <div className="nw-add" role="group" aria-label="Agregar un bloque">
              <span className="nw-add__label">Agregar</span>
              {TIPOS_BLOQUE.map(({ type, nombre, Icono }) => (
                <button key={type} type="button" className="nw-add__btn" onClick={() => agregar(type)}><Icono width={17} height={17} />{nombre}</button>
              ))}
            </div>
          </section>
        </div>

        <aside className={`nw-ed__col nw-ed__preview ${vista === 'previa' ? '' : 'is-hidden'}`} aria-label="Vista previa">
          <p className="nw-ed__preview-label">Así se verá</p>
          <Articulo post={previa} preview />
        </aside>
      </div>
    </div>
  )
}
