import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { PLANTILLA_CSV, api, leerCsv } from './api.js'
import { IconFile, IconTrash, IconUpload } from './icons.jsx'

/* Carga masiva desde un CSV exportado de Excel o de nómina. */
export function ImportDialog({ onClose, onDone }) {
  const [rows, setRows] = useState(null)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function leer(file) {
    if (!file) return
    setError('')
    setResult(null)
    setFileName(file.name)
    const parsed = leerCsv(await file.text())
    if (!parsed.length) setError('No se encontraron filas. Revisa que el archivo tenga encabezados y al menos una persona.')
    setRows(parsed)
  }

  async function importar() {
    setBusy(true)
    try {
      const r = await api.importar(rows)
      setResult(r)
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const plantilla = `data:text/csv;charset=utf-8,${encodeURIComponent(PLANTILLA_CSV)}`

  return (
    <Modal title="Importar personas desde CSV" onClose={onClose}>
      <div className="cb-form">
        <p className="cb-help cb-help--block">
          Sube un archivo <b>.csv</b> con las columnas <code>nombre</code>, <code>fecha</code> y, si quieres, <code>cargo</code>, <code>area</code> y <code>publicar</code> (si/no).
          La fecha puede ir como <code>14/03</code>, <code>14/03/1990</code> o <code>1990-03-14</code>. Las personas repetidas (mismo nombre y fecha) se omiten.
        </p>
        <a className="cb-link" href={plantilla} download="plantilla-cumpleanos.csv"><IconFile width={16} height={16} /> Descargar plantilla</a>

        <label className="cb-drop cb-drop--wide">
          <input type="file" accept=".csv,text/csv" className="cb-sr" onChange={(e) => leer(e.target.files[0])} />
          <span className="cb-drop__empty">
            <IconUpload width={28} height={28} />
            <b>{fileName || 'Elegir archivo CSV'}</b>
            <small>{rows ? `${rows.length} filas encontradas` : 'En Excel: Archivo › Guardar como › CSV'}</small>
          </span>
        </label>

        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}
        {result && (
          <div className="cb-alert cb-alert--ok" role="status">
            <b>{result.added} personas agregadas.</b> {result.skipped > 0 && `${result.skipped} ya existían. `}
            {result.errors.length > 0 && (
              <ul>{result.errors.slice(0, 6).map((e) => <li key={e.row}>Fila {e.row}: {e.error}</li>)}</ul>
            )}
          </div>
        )}

        <footer className="cb-modal__foot">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose}>{result ? 'Cerrar' : 'Cancelar'}</button>
          {!result && <button type="button" className="cb-btn" disabled={!rows?.length || busy} onClick={importar}>{busy ? 'Importando…' : `Importar ${rows?.length || ''}`}</button>}
        </footer>
      </div>
    </Modal>
  )
}

export function PasswordDialog({ onClose, onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    if (next !== confirm) return setError('Las contraseñas nuevas no coinciden.')
    setBusy(true)
    setError('')
    try {
      await api.cambiarClave(current, next)
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Cambiar contraseña" onClose={onClose} size="sm">
      <form className="cb-form" onSubmit={guardar}>
        <input type="text" name="username" autoComplete="username" hidden readOnly />
        <label className="cb-field">
          <span className="cb-label">Contraseña actual</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className="cb-field">
          <span className="cb-label">Nueva contraseña</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
          <small className="cb-help">Mínimo 8 caracteres.</small>
        </label>
        <label className="cb-field">
          <span className="cb-label">Repite la nueva contraseña</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </label>
        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}
        <footer className="cb-modal__foot">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="cb-btn" disabled={busy}>{busy ? 'Guardando…' : 'Cambiar contraseña'}</button>
        </footer>
      </form>
    </Modal>
  )
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="cb-form">
        <p>{message}</p>
        <footer className="cb-modal__foot">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onClose} autoFocus>Cancelar</button>
          <button type="button" className="cb-btn cb-btn--danger" disabled={busy} onClick={async () => { setBusy(true); await onConfirm() }}>{busy ? 'Eliminando…' : confirmLabel}</button>
        </footer>
      </div>
    </Modal>
  )
}

/* Moderación del muro: el gestor revisa las felicitaciones del año y borra las que no correspondan. */
export function WishesDialog({ person, onClose, onChange }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.deseosAdmin(person.id).then(setLista).catch((e) => { setError(e.message); setLista([]) })
  }, [person.id])

  async function borrar(w) {
    try {
      await api.borrarDeseo(w.id)
      setLista((l) => l.filter((x) => x.id !== w.id))
      onChange()
    } catch (e) {
      setError(e.message)
    }
  }

  const conMensaje = (lista || []).filter((w) => w.message)
  return (
    <Modal title={`Felicitaciones para ${person.name}`} onClose={onClose}>
      <div className="cb-form">
        <p>{lista === null ? 'Cargando…' : `${lista.length} felicitaciones este año, ${conMensaje.length} con mensaje.`}</p>
        {error && <p className="cb-alert cb-alert--error" role="alert">{error}</p>}
        {conMensaje.length > 0 && (
          <ul className="cb-mod">
            {conMensaje.map((w) => (
              <li key={w.id}>
                <div>
                  <p>{w.message}</p>
                  <small>{w.name || 'Sin nombre'} · {new Date(w.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                </div>
                <button type="button" className="cb-icon-btn cb-icon-btn--danger" onClick={() => borrar(w)} aria-label="Borrar este mensaje"><IconTrash /></button>
              </li>
            ))}
          </ul>
        )}
        <footer className="cb-modal__foot">
          <button type="button" className="cb-btn" onClick={onClose}>Listo</button>
        </footer>
      </div>
    </Modal>
  )
}
