import { useRef, useState } from 'react'
import { TIPOS } from '../../../shared/solicitudes.js'
import { ENLACE, EXTENSIONES_ANEXO, MAX_ANEXOS, MAX_ANEXO_BYTES, MAX_ENLACES, extensionDe, formatoTamano } from '../../../shared/incapacidades.js'
import { StatusBadge } from './ui.jsx'
import { IconAlert, IconArrowLeft, IconCheckCircle, IconClock, IconList, IconPlus, IconX } from './icons.jsx'
import { MARCA } from './brand.js'
import './anexos.css'

const Clip = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
  </svg>
)

/* Lee un archivo y lo deja como { nombre, tamano, datos (base64) }. */
function leer(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve({ nombre: file.name, tamano: file.size, datos: String(r.result).split(',')[1] || '' })
    r.onerror = () => reject(new Error(`No se pudo leer «${file.name}».`))
    r.readAsDataURL(file)
  })
}

/* Archivos y enlaces que acompañan el correo. El estado vive en el formulario que lo usa (value / onChange). */
export function AnexosEditor({ anexos, enlaces, onChange, error, errorEnlaces }) {
  const input = useRef(null)
  const [enlace, setEnlace] = useState('')
  const [aviso, setAviso] = useState('')

  async function agregar(lista) {
    setAviso('')
    const nuevos = []
    for (const f of Array.from(lista || [])) {
      if (!EXTENSIONES_ANEXO.includes(extensionDe(f.name))) { setAviso(`«${f.name}»: usa PDF, imagen (JPG, PNG, WebP), Word o Excel.`); continue }
      if (f.size > MAX_ANEXO_BYTES) { setAviso(`«${f.name}» pesa ${formatoTamano(f.size)}; el máximo es ${formatoTamano(MAX_ANEXO_BYTES)}.`); continue }
      try { nuevos.push(await leer(f)) } catch (e) { setAviso(e.message) }
    }
    if (nuevos.length) onChange({ anexos: [...anexos, ...nuevos].slice(0, MAX_ANEXOS + 1), enlaces })
    if (input.current) input.current.value = ''
  }

  function agregarEnlace(e) {
    e.preventDefault()
    const u = enlace.trim()
    if (!u) return
    if (!ENLACE.test(u)) return setAviso('El enlace debe empezar por http:// o https://.')
    setAviso('')
    onChange({ anexos, enlaces: [...enlaces, u] })
    setEnlace('')
  }

  return (
    <div className="an">
      <div className="an__block">
        <div className="an__head">
          <b>Archivos anexos</b>
          <small>PDF, imagen, Word o Excel · hasta {MAX_ANEXOS} archivos de {formatoTamano(MAX_ANEXO_BYTES)} cada uno</small>
        </div>
        <ul className="an__list" aria-label="Archivos anexos">
          {anexos.map((a, i) => (
            <li key={`${a.nombre}-${i}`}>
              <Clip /> <span className="an__name">{a.nombre}</span> <small>{formatoTamano(a.tamano)}</small>
              <button type="button" className="an__x" onClick={() => onChange({ anexos: anexos.filter((_, j) => j !== i), enlaces })} aria-label={`Quitar ${a.nombre}`}><IconX width={16} height={16} /></button>
            </li>
          ))}
        </ul>
        <input ref={input} type="file" hidden multiple accept={EXTENSIONES_ANEXO.map((x) => `.${x}`).join(',')} onChange={(e) => agregar(e.target.files)} />
        <button type="button" className="sv-btn sv-btn--soft" onClick={() => input.current?.click()} disabled={anexos.length >= MAX_ANEXOS}><Clip /> Anexar archivos</button>
        {error && <small className="sv-error" role="alert"><IconAlert width={14} height={14} /> {error}</small>}
      </div>

      <div className="an__block">
        <div className="an__head">
          <b>Enlaces</b>
          <small>Por ejemplo una carpeta de Drive. Hasta {MAX_ENLACES} enlaces.</small>
        </div>
        <ul className="an__list" aria-label="Enlaces">
          {enlaces.map((u, i) => (
            <li key={`${u}-${i}`}>
              <span className="an__name">{u}</span>
              <button type="button" className="an__x" onClick={() => onChange({ anexos, enlaces: enlaces.filter((_, j) => j !== i) })} aria-label={`Quitar ${u}`}><IconX width={16} height={16} /></button>
            </li>
          ))}
        </ul>
        <div className="an__add">
          <input className="sv-input" type="url" inputMode="url" placeholder="https://drive.google.com/…" value={enlace} onChange={(e) => setEnlace(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') agregarEnlace(e) }} aria-label="Dirección del enlace" disabled={enlaces.length >= MAX_ENLACES} />
          <button type="button" className="sv-btn sv-btn--soft" onClick={agregarEnlace} disabled={!enlace.trim() || enlaces.length >= MAX_ENLACES}><IconPlus width={18} height={18} /> Agregar enlace</button>
        </div>
        {errorEnlaces && <small className="sv-error" role="alert"><IconAlert width={14} height={14} /> {errorEnlaces}</small>}
      </div>
      {aviso && <p className="sv-alert sv-alert--error" role="alert">{aviso}</p>}
    </div>
  )
}

/* Pantalla de «enviado»: número de solicitud y cómo consultarla. */
export function Enviado({ resultado, destino, volverHref = '#solicitudes', volverTexto = 'Volver a Solicitudes' }) {
  const tipo = TIPOS[resultado.tipo]
  return (
    <div className="sv-success" role="status">
      <div className="sv-success__badge" aria-hidden="true"><IconCheckCircle width={44} height={44} /></div>
      <h2 tabIndex={-1} ref={(el) => el?.focus()}>Enviado correctamente</h2>
      <p className="sv-success__lead">Guarda el número para consultar el estado cuando quieras. Lo encuentras con tu número de cédula o tu correo.</p>
      <div className="sv-ticket">
        <div className="sv-ticket__brand"><img src={MARCA.logoHorizontal} alt="Gestión y Servicios" /><span>{tipo.categoria}</span></div>
        <div className="sv-ticket__num"><span>Número de solicitud</span><b>{resultado.numero}</b></div>
        <dl>
          <div><dt>Tipo</dt><dd>{tipo.nombre}</dd></div>
          <div><dt>Fecha</dt><dd>{new Date(resultado.creada).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}</dd></div>
          <div><dt>Estado</dt><dd><StatusBadge estado={resultado.estado} /></dd></div>
          <div><dt>Enviado a</dt><dd>{destino}</dd></div>
        </dl>
      </div>
      {resultado.aviso && <p className="sv-callout sv-callout--warn"><IconAlert width={20} height={20} /> <span>{resultado.aviso}</span></p>}
      {resultado.correo?.estado === 'error' && (
        <p className="sv-callout sv-callout--error"><IconAlert width={20} height={20} /> <span>La solicitud quedó registrada, pero el correo no se pudo enviar. El equipo de gestión lo reenviará.</span></p>
      )}
      <div className="sv-success__actions">
        <a className="sv-btn sv-btn--ghost" href={volverHref}><IconArrowLeft width={18} height={18} /> {volverTexto}</a>
        <a className="sv-btn" href="#solicitudes-consulta"><IconList width={18} height={18} /> Consultar mis solicitudes</a>
      </div>
      <p className="sv-success__next"><IconClock width={16} height={16} /> Consulta el avance en «Mis solicitudes» con tu cédula.</p>
    </div>
  )
}
