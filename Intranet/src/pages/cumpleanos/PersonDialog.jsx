import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { MESES } from './dates.js'
import { api, prepararFoto } from './api.js'
import { IconImage, IconTrash, IconUpload } from './icons.jsx'

/* Alta y edición de una persona: foto, datos y estado de publicación. */
export default function PersonDialog({ person, onClose, onSaved }) {
  const editing = Boolean(person)
  const [form, setForm] = useState(() => ({
    name: person?.name || '',
    cargo: person?.cargo || '',
    area: person?.area || '',
    day: person?.day || '',
    month: person?.month || '',
    year: person?.year || '',
    message: person?.message || '',
    published: person ? person.published : true,
  }))
  const [photo, setPhoto] = useState(null) // data URL nueva
  const [removePhoto, setRemovePhoto] = useState(false)
  const [fields, setFields] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef(null)

  const preview = photo || (!removePhoto && person?.photo) || null
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    setFields((x) => ({ ...x, [k]: undefined }))
  }

  async function elegirFoto(file) {
    if (!file) return
    setError('')
    try {
      setPhoto(await prepararFoto(file))
      setRemovePhoto(false)
    } catch (e) {
      setError(e.message)
    }
  }

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = {
      ...form,
      day: Number(form.day),
      month: Number(form.month),
      year: form.year ? Number(form.year) : null,
      ...(photo ? { photo } : {}),
      ...(removePhoto ? { removePhoto: true } : {}),
    }
    try {
      const saved = editing ? await api.actualizar(person.id, body) : await api.crear(body)
      onSaved(saved, editing)
    } catch (err) {
      setError(err.message)
      setFields(err.fields)
      setSaving(false)
    }
  }

  const dias = form.month ? new Date(2024, Number(form.month), 0).getDate() : 31

  return (
    <Modal title={editing ? 'Editar persona' : 'Agregar persona'} onClose={onClose} size="lg">
      <form className="cb-form" onSubmit={guardar} noValidate>
        <div className="cb-form__grid">
          <div className="cb-photo-field">
            <span className="cb-label">Foto</span>
            <button
              type="button"
              className={`cb-drop ${drag ? 'is-drag' : ''} ${preview ? 'has-photo' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); elegirFoto(e.dataTransfer.files[0]) }}
              aria-label={preview ? 'Cambiar foto' : 'Subir foto'}
            >
              {preview ? <img src={preview} alt="Vista previa de la foto" /> : (
                <span className="cb-drop__empty">
                  <IconImage width={30} height={30} />
                  <b>Subir foto</b>
                  <small>Arrastra o haz clic · JPG, PNG o WebP</small>
                </span>
              )}
              {preview && <span className="cb-drop__change"><IconUpload width={16} height={16} /> Cambiar</span>}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => elegirFoto(e.target.files[0])} />
            {preview && (
              <button type="button" className="cb-link cb-link--danger" onClick={() => { setPhoto(null); setRemovePhoto(true) }}>
                <IconTrash width={16} height={16} /> Quitar foto
              </button>
            )}
            <small className="cb-help">Se recorta en cuadrado y se optimiza automáticamente.</small>
          </div>

          <div className="cb-fields">
            <label className="cb-field cb-field--full">
              <span className="cb-label">Nombre completo <i>*</i></span>
              <input value={form.name} onChange={set('name')} autoComplete="off" required aria-invalid={Boolean(fields.name)} autoFocus />
              {fields.name && <small className="cb-err">{fields.name}</small>}
            </label>
            <label className="cb-field">
              <span className="cb-label">Cargo</span>
              <input value={form.cargo} onChange={set('cargo')} placeholder="Ej. Analista de nómina" />
            </label>
            <label className="cb-field">
              <span className="cb-label">Área o proyecto</span>
              <input value={form.area} onChange={set('area')} placeholder="Ej. Mediadores" list="cb-areas" />
              <datalist id="cb-areas">
                {['G&S', 'Promotores', 'Corpoquindío', 'Mediadores', 'Pasaportes', 'ValleInn'].map((a) => <option key={a} value={a} />)}
              </datalist>
            </label>

            <fieldset className="cb-field cb-field--full cb-date-row">
              <legend className="cb-label">Fecha de cumpleaños <i>*</i></legend>
              <label>
                <span className="cb-sr">Día</span>
                <select value={form.day} onChange={set('day')} aria-invalid={Boolean(fields.day)}>
                  <option value="">Día</option>
                  {Array.from({ length: dias }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
              </label>
              <label>
                <span className="cb-sr">Mes</span>
                <select value={form.month} onChange={set('month')} aria-invalid={Boolean(fields.month)}>
                  <option value="">Mes</option>
                  {MESES.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
                </select>
              </label>
              <label>
                <span className="cb-sr">Año (opcional)</span>
                <input type="number" inputMode="numeric" placeholder="Año (opcional)" value={form.year} onChange={set('year')} min="1930" max={new Date().getFullYear()} aria-invalid={Boolean(fields.year)} />
              </label>
              {(fields.day || fields.month || fields.year) && <small className="cb-err">{fields.day || fields.month || fields.year}</small>}
              <small className="cb-help">El año es opcional y nunca se muestra en la página pública.</small>
            </fieldset>

            <label className="cb-field cb-field--full">
              <span className="cb-label">Mensaje de felicitación</span>
              <textarea value={form.message} onChange={set('message')} rows={3} maxLength={240} placeholder="Opcional. Aparece en la tarjeta el día del cumpleaños." />
              <small className="cb-help">{form.message.length}/240</small>
            </label>

            <label className="cb-switch cb-field--full">
              <input type="checkbox" checked={form.published} onChange={set('published')} />
              <span className="cb-switch__track" aria-hidden="true" />
              <span>
                <b>Publicar en la intranet</b>
                <small>Si está apagado, la persona queda guardada pero no aparece en la página de cumpleaños.</small>
              </span>
            </label>
          </div>
        </div>

        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}

        <footer className="cb-modal__foot">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cb-btn" disabled={saving}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar persona'}</button>
        </footer>
      </form>
    </Modal>
  )
}
