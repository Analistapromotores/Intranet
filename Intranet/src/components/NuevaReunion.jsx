import { useId, useState } from 'react'
import Dialog from './Dialog.jsx'
import { request } from '../pages/cumpleanos/api.js'
import { SALAS } from '../../shared/salas.js'
import './calendario.css'

/* Diálogo para que un administrador cree una reunión o evento que verá todo el que entre a la intranet. */
export default function NuevaReunion({ fechaInicial, onClose, onCreada }) {
  const uid = useId()
  const [d, setD] = useState({ descripcion: '', fecha: fechaInicial, inicio: '09:00', fin: '10:00', sala: SALAS[0]?.id || '', lugar: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const set = (k) => (e) => setD((v) => ({ ...v, [k]: e.target.value }))
  const campo = (k, etiqueta, control) => (
    <div className={`cal-form__campo ${errores[k] ? 'has-error' : ''}`}>
      <label htmlFor={`${uid}-${k}`}>{etiqueta}</label>
      {control}
      {errores[k] && <small id={`${uid}-${k}-e`} role="alert">{errores[k]}</small>}
    </div>
  )
  const props = (k) => ({ id: `${uid}-${k}`, value: d[k], onChange: set(k), 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `${uid}-${k}-e` : undefined })

  async function guardar(e) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError('')
    setErrores({})
    try {
      await request('/salas/reservas', { method: 'POST', body: { tipo: 'evento', ...d, lugar: d.sala ? '' : d.lugar } })
      onCreada(d.fecha)
    } catch (err) {
      setError(err.message)
      setErrores(err.fields || {})
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog title="Nueva reunión" subtitle="La verá todo el que entre a la intranet, en el calendario." onClose={onClose} label="cal-nueva">
      <form className="cal-form" onSubmit={guardar} noValidate>
        {campo('descripcion', 'Título de la reunión', <input type="text" maxLength={160} placeholder="Ej. Comité de gerencia" autoComplete="off" {...props('descripcion')} />)}
        <div className="cal-form__fila">
          {campo('fecha', 'Fecha', <input type="date" {...props('fecha')} />)}
          {campo('inicio', 'Desde', <input type="time" {...props('inicio')} />)}
          {campo('fin', 'Hasta', <input type="time" {...props('fin')} />)}
        </div>
        {campo('sala', 'Dónde', (
          <select {...props('sala')}>
            {SALAS.map((s) => <option key={s.id} value={s.id}>{s.nombre} (bloquea la sala)</option>)}
            <option value="">Otro lugar</option>
          </select>
        ))}
        {!d.sala && campo('lugar', 'Lugar (opcional)', <input type="text" maxLength={80} placeholder="Ej. Oficina de la Alcaldía, Teams…" autoComplete="off" {...props('lugar')} />)}
        {error && <p className="cal-form__error" role="alert">{error}</p>}
        <div className="cal-form__acciones">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose} disabled={enviando}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={enviando} aria-busy={enviando}>{enviando ? 'Guardando…' : 'Crear reunión'}</button>
        </div>
      </form>
    </Dialog>
  )
}
