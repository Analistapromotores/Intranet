import { useEffect, useRef, useState } from 'react'
import { ESTADOS, formatoPesos } from '../../../shared/solicitudes.js'
import { fieldId, getPath } from './form.js'
import { IconAlert, IconCheck, IconEraser, IconX } from './icons.jsx'
import { MARCA } from './brand.js'

/* ---------- Estructura de página ---------- */
export function Breadcrumbs({ items }) {
  return (
    <nav className="sv-crumbs" aria-label="Ruta">
      <ol>
        {items.map(([label, href], i) => (
          <li key={label}>
            {href && i < items.length - 1 ? <a href={href}>{label}</a> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* Encabezado de marca: fondo corporativo, monograma GS de marca de agua y,
   si se indica, una foto del equipo con el corte diagonal rojo del banner institucional. */
export function PageHeader({ crumbs, eyebrow, title, lead, icon: Icon, tone = 'blue', photo, children }) {
  return (
    <header className={`sv-head sv-head--${tone} ${photo ? 'has-photo' : ''}`}>
      <img className="sv-head__mark" src={MARCA.monograma} alt="" aria-hidden="true" />
      {photo && (
        <div className="sv-head__photo">
          <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.pos }} />
          <span className="sv-head__slash" aria-hidden="true" />
        </div>
      )}
      <div className="sv-wrap">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="sv-head__row">
          {Icon && <span className="sv-head__icon"><Icon width={28} height={28} /></span>}
          <div className="sv-head__text">
            {eyebrow && <p className="sv-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {lead && <p className="sv-head__lead">{lead}</p>}
          </div>
          {children && <div className="sv-head__aside">{children}</div>}
        </div>
      </div>
    </header>
  )
}

export function StatusBadge({ estado }) {
  const e = ESTADOS[estado] || { label: estado, tono: 'gris' }
  return <span className={`sv-status sv-status--${e.tono}`}><i aria-hidden="true" />{e.label}</span>
}

/* ---------- Campos ---------- */
export function Field({ form, path, label, required, hint, children, className = '' }) {
  const id = fieldId(path)
  const error = form.error(path)
  const aviso = !error && form.avisos[path]
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`, aviso && `${id}-warn`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`sv-field ${error ? 'has-error' : ''} ${className}`}>
      <label className="sv-label" htmlFor={id}>
        {label} {required ? <i className="sv-required" aria-hidden="true">*</i> : <small className="sv-opt">(opcional)</small>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {hint && <small className="sv-hint" id={`${id}-hint`}>{hint}</small>}
      {error && <small className="sv-error" id={`${id}-err`} role="alert"><IconAlert width={14} height={14} /> {error}</small>}
      {aviso && <small className="sv-warn" id={`${id}-warn`}><IconAlert width={14} height={14} /> {aviso}</small>}
    </div>
  )
}

export function TextField({ form, path, type = 'text', placeholder, autoComplete, inputMode, maxLength, list, ...rest }) {
  const value = getPath(form.datos, path) ?? ''
  return (
    <Field form={form} path={path} {...rest}>
      {(a) => (
        <input
          {...a}
          className="sv-input"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete || 'off'}
          inputMode={inputMode}
          maxLength={maxLength}
          list={list}
          onChange={(e) => form.set(path, e.target.value)}
          onBlur={() => form.tocar(path)}
        />
      )}
    </Field>
  )
}

export function DigitsField({ form, path, maxLength = 15, ...rest }) {
  const value = getPath(form.datos, path) ?? ''
  return (
    <Field form={form} path={path} {...rest}>
      {(a) => (
        <input
          {...a}
          className="sv-input"
          inputMode="numeric"
          value={value}
          maxLength={maxLength}
          onChange={(e) => form.set(path, e.target.value.replace(/[^\d+]/g, ''))}
          onBlur={() => form.tocar(path)}
        />
      )}
    </Field>
  )
}

export function TextArea({ form, path, rows = 4, placeholder, maxLength, ...rest }) {
  const value = getPath(form.datos, path) ?? ''
  return (
    <Field form={form} path={path} {...rest}>
      {(a) => (
        <>
          <textarea {...a} className="sv-input sv-textarea" rows={rows} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => form.set(path, e.target.value)} onBlur={() => form.tocar(path)} />
          {maxLength && <small className="sv-count" aria-hidden="true">{String(value).length}/{maxLength}</small>}
        </>
      )}
    </Field>
  )
}

export function SelectField({ form, path, options, placeholder = 'Selecciona una opción', ...rest }) {
  const value = getPath(form.datos, path) ?? ''
  return (
    <Field form={form} path={path} {...rest}>
      {(a) => (
        <select {...a} className="sv-input sv-select" value={value} onChange={(e) => { form.set(path, e.target.value); form.tocar(path) }} onBlur={() => form.tocar(path)}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </Field>
  )
}

/* Pesos colombianos: se escribe solo con números, se muestra "$ 1.000.000" y se guarda como número. */
export function MoneyField({ form, path, ...rest }) {
  const value = getPath(form.datos, path)
  return (
    <Field form={form} path={path} {...rest}>
      {(a) => (
        <input
          {...a}
          className="sv-input sv-money"
          inputMode="numeric"
          placeholder="$ 0"
          value={formatoPesos(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
            form.set(path, digits === '' ? '' : Number(digits))
          }}
          onBlur={() => form.tocar(path)}
        />
      )}
    </Field>
  )
}

/* ---------- Pasos ---------- */
export function Stepper({ steps, current, completed, onJump }) {
  return (
    <ol className="sv-stepper" aria-label="Pasos del formulario">
      {steps.map((s, i) => {
        const state = i === current ? 'current' : completed.has(i) ? 'done' : 'todo'
        const clickable = state === 'done' || i < current
        return (
          <li key={s.id} className={`sv-step is-${state}`}>
            <button type="button" onClick={() => clickable && onJump(i)} disabled={!clickable} aria-current={i === current ? 'step' : undefined}>
              <span className="sv-step__dot">{state === 'done' ? <IconCheck width={16} height={16} /> : i + 1}</span>
              <span className="sv-step__label">{s.title}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function Section({ number, title, description, children }) {
  return (
    <section className="sv-section">
      <header className="sv-section__head">
        {number && <span className="sv-section__num">{number}</span>}
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className="sv-section__body">{children}</div>
    </section>
  )
}

/* Resumen de errores enfocable (tras intentar avanzar con campos inválidos). */
export function ErrorSummary({ items, labels }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [items])
  if (!items.length) return null
  return (
    <div className="sv-summary" role="alert" tabIndex={-1} ref={ref}>
      <p><IconAlert width={18} height={18} /> Revisa {items.length === 1 ? 'este campo' : `estos ${items.length} campos`} antes de continuar:</p>
      <ul>
        {items.map(([path, msg]) => (
          <li key={path}>
            <a href={`#${fieldId(path)}`} onClick={(e) => { e.preventDefault(); document.getElementById(fieldId(path))?.focus() }}>
              <b>{labels[path] || labels[path.split('.')[0]] || path}:</b> {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Firma digital ---------- */
export function SignaturePad({ form, path, label = 'Firma', required }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const dirty = useRef(false)
  const value = getPath(form.datos, path)
  const [vacia, setVacia] = useState(!value)

  useEffect(() => {
    const c = canvasRef.current
    const ratio = window.devicePixelRatio || 1
    const w = c.clientWidth
    const h = c.clientHeight
    c.width = w * ratio
    c.height = h * ratio
    const ctx = c.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0b1f5c'
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, w, h)
      img.src = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const punto = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  const inicio = (e) => {
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const [x, y] = punto(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 0.1, y + 0.1)
    ctx.stroke()
    dirty.current = true
    setVacia(false)
  }
  const mover = (e) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const [x, y] = punto(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const fin = () => {
    if (!drawing.current) return
    drawing.current = false
    if (dirty.current) {
      form.set(path, exportar(canvasRef.current))
      form.tocar(path)
    }
  }
  const limpiar = () => {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    dirty.current = false
    setVacia(true)
    form.set(path, '')
  }

  const id = fieldId(path)
  const error = form.error(path)
  return (
    <div className={`sv-field sv-field--full ${error ? 'has-error' : ''}`}>
      <span className="sv-label" id={`${id}-label`}>{label} {required && <i className="sv-required" aria-hidden="true">*</i>}</span>
      <div className={`sv-sign ${vacia ? 'is-empty' : ''}`}>
        <canvas
          id={id}
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          onPointerDown={inicio}
          onPointerMove={mover}
          onPointerUp={fin}
          onPointerCancel={fin}
          onPointerLeave={fin}
        />
        {vacia && <span className="sv-sign__ph" aria-hidden="true">Firma aquí con el mouse o con el dedo</span>}
        <span className="sv-sign__line" aria-hidden="true" />
        {!vacia && <button type="button" className="sv-link sv-sign__clear" onClick={limpiar}><IconEraser width={16} height={16} /> Borrar firma</button>}
      </div>
      <small className="sv-hint" id={`${id}-hint`}>La firma se inserta en el formato de Excel que se genera.</small>
      {error && <small className="sv-error" role="alert"><IconAlert width={14} height={14} /> {error}</small>}
    </div>
  )
}

/* Recorta el espacio vacío y devuelve un PNG liviano. */
function exportar(canvas) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const px = ctx.getImageData(0, 0, width, height).data
  let minX = width, minY = height, maxX = 0, maxY = 0
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    if (px[(y * width + x) * 4 + 3] > 10) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX <= minX || maxY <= minY) return ''
  const pad = 12
  const w = Math.min(width, maxX - minX + pad * 2)
  const h = Math.min(height, maxY - minY + pad * 2)
  const out = document.createElement('canvas')
  const escala = Math.min(1, 600 / w, 200 / h)
  out.width = Math.round(w * escala)
  out.height = Math.round(h * escala)
  out.getContext('2d').drawImage(canvas, Math.max(0, minX - pad), Math.max(0, minY - pad), w, h, 0, 0, out.width, out.height)
  return out.toDataURL('image/png')
}

/* ---------- Diálogo ---------- */
export function Modal({ title, onClose, children, size = 'md', labelledBy = 'sv-modal-title' }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    d.showModal()
    return () => d.close()
  }, [])
  return (
    <dialog ref={ref} className={`sv-modal sv-modal--${size}`} aria-labelledby={labelledBy} onCancel={(e) => { e.preventDefault(); onClose() }} onClick={(e) => { if (e.target === ref.current) onClose() }}>
      <div className="sv-modal__box">
        <header className="sv-modal__head">
          <h2 id={labelledBy}>{title}</h2>
          <button type="button" className="sv-icon-btn" onClick={onClose} aria-label="Cerrar"><IconX width={20} height={20} /></button>
        </header>
        {children}
      </div>
    </dialog>
  )
}

/* ---------- Revisión antes de enviar ---------- */
export function Review({ groups, onEdit }) {
  return (
    <div className="sv-review">
      {groups.map((g) => (
        <section key={g.title} className="sv-review__group">
          <header>
            <h3>{g.title}</h3>
            <button type="button" className="sv-link" onClick={() => onEdit(g.step)}>Editar</button>
          </header>
          <dl>
            {g.items.filter(([, v]) => v !== undefined).map(([k, v]) => (
              <div key={k} className={g.wide?.includes(k) ? 'is-wide' : ''}>
                <dt>{k}</dt>
                <dd>{v === '' || v === null ? <span className="sv-muted">Sin diligenciar</span> : v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

/* Panel lateral de los formularios: identidad, qué tener a mano y apoyo del equipo. */
export function FormAside({ code, title, tips, photo, note }) {
  return (
    <aside className="sv-aside" aria-label="Información del formato">
      <div className="sv-aside__brand">
        <img src={MARCA.logoHorizontal} alt="Gestión y Servicios · Apoyo en talento humano" />
        {code && <span className="sv-aside__code">Formato oficial {code}</span>}
      </div>
      {tips?.length > 0 && (
        <div className="sv-aside__block">
          <h2>{title || 'Ten a mano'}</h2>
          <ul>{tips.map((t) => <li key={t}><IconCheck width={16} height={16} /> {t}</li>)}</ul>
        </div>
      )}
      {photo && (
        <figure className="sv-aside__photo">
          <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.pos }} loading="lazy" />
          <figcaption>{note || 'El equipo de Gestión y Servicios recibe tu solicitud y te acompaña en el proceso.'}</figcaption>
        </figure>
      )}
    </aside>
  )
}
