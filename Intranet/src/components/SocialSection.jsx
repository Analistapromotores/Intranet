import { useEffect, useMemo, useState } from 'react'
import { IconExternal } from './Icons.jsx'
import Dialog from './Dialog.jsx'
import { ICONO_RED } from '../lib/iconosRedes.js'
import { ORDEN_REDES, REDES, embedDe, redDe } from '../lib/social.js'
import { useSession } from '../lib/useSession.js'
import { noticiasApi, esGestor } from '../pages/noticias/api.js'
import './social.css'

/* Redes sociales de Gestión y Servicios: enlaces a cada perfil y la última publicación incrustada.
   Quienes publican (gestores y administradores) pegan el enlace de la publicación y se actualiza al instante. */

const IconShare = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="6" r="2.6" /><circle cx="18" cy="18" r="2.6" /><path d="m8.4 10.8 7.2-3.6M8.4 13.2l7.2 3.6" />
  </svg>
)
const IconEditar = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" />
  </svg>
)

function Escenario({ red, embed, gestor, onEditar }) {
  const meta = REDES[red.id]
  if (!embed) {
    return (
      <div className="soc-stage__empty">
        <span className="soc-stage__ico" style={{ '--c': meta.color }}>{(() => { const I = ICONO_RED[red.id]; return <I width={30} height={30} /> })()}</span>
        <p><b>{red.perfil && !gestor ? `Encuéntranos en ${meta.nombre}` : `Aún no hay una publicación destacada en ${meta.nombre}.`}</b></p>
        {gestor ? (
          <button type="button" className="ui-btn ui-btn--sm" onClick={onEditar}><IconEditar /> Pegar enlace de una publicación</button>
        ) : (
          red.perfil && <a className="ui-btn ui-btn--ghost ui-btn--sm" href={red.perfil} target="_blank" rel="noreferrer">Visitar {meta.nombre} <IconExternal width={14} height={14} /></a>
        )}
      </div>
    )
  }
  return (
    <div className="soc-stage__frame" style={embed.ratio ? { aspectRatio: String(embed.ratio) } : { height: embed.alto }}>
      <iframe
        key={embed.src}
        src={embed.src}
        title={`Última publicación en ${meta.nombre}`}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen; clipboard-write"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
      />
    </div>
  )
}

function EditorRedes({ redes, onClose, onGuardado }) {
  const [valores, setValores] = useState(() => Object.fromEntries(redes.map((r) => [r.id, { perfil: r.perfil, publicacion: r.publicacion }])))
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (id, campo, valor) => setValores((v) => ({ ...v, [id]: { ...v[id], [campo]: valor } }))

  /* Diagnóstico en vivo del enlace pegado. */
  const estado = (id, campo) => {
    const v = valores[id][campo].trim()
    if (!v) return null
    if (redDe(v) !== id) return { mal: true, texto: `Este enlace no parece ser de ${REDES[id].nombre}.` }
    if (campo === 'publicacion' && !embedDe(v)) return { mal: true, texto: 'No se puede mostrar este enlace. Usa el enlace directo a una publicación o video.' }
    return { mal: false, texto: campo === 'publicacion' ? 'Publicación reconocida.' : 'Perfil reconocido.' }
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setErrores({})
    try {
      const nuevas = await noticiasApi.guardarRedes(redes.map((r) => ({ id: r.id, ...valores[r.id] })))
      onGuardado(nuevas)
    } catch (err) {
      setError(err.message)
      setErrores(err.fields || {})
      setGuardando(false)
    }
  }

  return (
    <Dialog title="Redes sociales" subtitle="Pega el enlace del perfil y el de la última publicación. Se muestra a toda la intranet en cuanto guardes." size="lg" onClose={onClose} label="soc-ed">
      <form className="soc-ed" onSubmit={guardar}>
        {ORDEN_REDES.map((id) => {
          const I = ICONO_RED[id]
          const meta = REDES[id]
          const ep = estado(id, 'perfil')
          const eb = estado(id, 'publicacion')
          return (
            <fieldset key={id} className="soc-ed__net" style={{ '--c': meta.color }}>
              <legend><span className="soc-ed__ico"><I width={18} height={18} /></span>{meta.nombre}</legend>
              <label className={`ui-field ${errores[`${id}.perfil`] || ep?.mal ? 'is-bad' : ''}`}>
                <span className="ui-label">Enlace del perfil</span>
                <input type="url" inputMode="url" value={valores[id].perfil} onChange={(e) => cambiar(id, 'perfil', e.target.value)} placeholder={`https://…${id === 'youtube' ? 'youtube.com/@gys' : id + '.com/gys'}`} />
                {(errores[`${id}.perfil`] || ep) && <p className={ep?.mal || errores[`${id}.perfil`] ? 'ui-error' : 'ui-hint'}>{errores[`${id}.perfil`] || ep.texto}</p>}
              </label>
              <label className={`ui-field ${errores[`${id}.publicacion`] || eb?.mal ? 'is-bad' : ''}`}>
                <span className="ui-label">Publicación fijada <small>(opcional: vacío = se muestran las últimas solas)</small></span>
                <input type="url" inputMode="url" value={valores[id].publicacion} onChange={(e) => cambiar(id, 'publicacion', e.target.value)} placeholder={meta.ejemplo} />
                {(errores[`${id}.publicacion`] || eb) && <p className={eb?.mal || errores[`${id}.publicacion`] ? 'ui-error' : 'ui-hint'}>{errores[`${id}.publicacion`] || eb.texto}</p>}
              </label>
            </fieldset>
          )
        })}
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar redes'}</button>
        </div>
      </form>
    </Dialog>
  )
}

export default function SocialSection({ id = 'redes', titulo = 'Nuestras redes sociales', texto = 'Lo último que compartimos como Gestión y Servicios. Síguenos para no perderte nada.' }) {
  const user = useSession()
  const gestor = esGestor(user)
  const [redes, setRedes] = useState(null)
  const [elegida, setElegida] = useState(null)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    let vivo = true
    noticiasApi.redes().then((r) => vivo && setRedes(r)).catch(() => vivo && setRedes([]))
    return () => { vivo = false }
  }, [])

  /* El público solo ve las redes configuradas; quien publica ve todas para completarlas. */
  const visibles = useMemo(() => (redes || []).filter((r) => gestor || r.perfil || r.publicacion), [redes, gestor])
  const actual = visibles.find((r) => r.id === elegida) || visibles.find((r) => r.publicacion) || visibles[0]
  const embed = actual ? embedDe(actual.publicacion || actual.perfil) : null
  const meta = actual ? REDES[actual.id] : null
  const enlaceOriginal = actual?.publicacion || (embed?.canal || embed?.auto ? actual.perfil : '')

  if (redes === null) return null
  if (!visibles.length) return null

  return (
    <section className="soc" id={id} aria-labelledby={`${id}-titulo`}>
      <div className="soc__head">
        <h2 id={`${id}-titulo`} className="soc__title"><span className="soc__title-ico"><IconShare /></span>{titulo}</h2>
        {gestor && <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => setEditando(true)}><IconEditar /> Editar redes</button>}
      </div>

      <div className="soc__grid">
        <div className="soc__rail">
          <p className="soc__text">{texto}</p>
          <ul className="soc__nets" role="tablist" aria-label="Redes sociales">
            {visibles.map((r) => {
              const I = ICONO_RED[r.id]
              const m = REDES[r.id]
              const activa = actual?.id === r.id
              return (
                <li key={r.id} className={`soc__net ${activa ? 'is-on' : ''}`} style={{ '--c': m.color }}>
                  <button type="button" role="tab" aria-selected={activa} className="soc__pick" onClick={() => setElegida(r.id)}>
                    <span className="soc__ico"><I width={20} height={20} /></span>
                    <span className="soc__name">
                      <b>{m.nombre}</b>
                      <small>{r.publicacion ? 'Publicación fijada' : embedDe(r.perfil)?.auto || embedDe(r.perfil)?.canal ? 'Últimas publicaciones · automático' : r.perfil ? 'Perfil' : 'Sin configurar'}</small>
                    </span>
                  </button>
                  {r.perfil && (
                    <a className="soc__go" href={r.perfil} target="_blank" rel="noreferrer" aria-label={`Abrir el perfil de ${m.nombre}`} title={`Abrir ${m.nombre}`}>
                      <IconExternal width={16} height={16} />
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
          {visibles.some((r) => r.perfil) && (
            <div className="soc__follow">
              <span>Síguenos</span>
              {visibles.filter((r) => r.perfil).map((r) => {
                const I = ICONO_RED[r.id]
                return (
                  <a key={r.id} href={r.perfil} target="_blank" rel="noreferrer" className="soc__btn" style={{ '--c': REDES[r.id].color }} aria-label={`Seguir a Gestión y Servicios en ${REDES[r.id].nombre}`} title={REDES[r.id].nombre}>
                    <I width={20} height={20} />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <div className="soc__stage" role="tabpanel" style={{ '--c': meta?.color }}>
          <Escenario red={actual} embed={embed} gestor={gestor} onEditar={() => setEditando(true)} />
          {embed && enlaceOriginal && (
            <a className="soc__open" href={enlaceOriginal} target="_blank" rel="noreferrer">
              Ver en {meta.nombre} <IconExternal width={14} height={14} />
            </a>
          )}
        </div>
      </div>

      {editando && <EditorRedes redes={redes} onClose={() => setEditando(false)} onGuardado={(r) => { setRedes(r); setEditando(false) }} />}
    </section>
  )
}
