import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MAX_COLABORADORES, MOTIVOS, validarAusentismo } from '../../../shared/salas.js'
import { hoyISO } from '../../../shared/solicitudes.js'
import { MARCA } from './brand.js'
import { PageHeader, Section } from './ui.jsx'
import { IconAlert, IconDownload, IconEye, IconPlus, IconPrinter, IconTrash, IconUserClock, IconX } from './icons.jsx'
import './ausentismo.css'

/* Ausentismo laboral (FT-OP-76): se diligencia aquí, se revisa en vista previa
   y se descarga el Excel oficial ya lleno o se imprime / guarda en PDF. No se guarda en el servidor. */

const CLAVE = 'gys-borrador-ausentismo'
const nuevo = () => ({
  fechaSolicitud: hoyISO(), motivo: '', descripcion: '', soporte: '',
  fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '',
  empresa: 'Gestión y Servicios', colaboradores: [{ nombre: '', identificacion: '', cargo: '' }],
  observaciones: '', jefe: '',
})
const leer = () => { try { return { ...nuevo(), ...JSON.parse(localStorage.getItem(CLAVE) || '{}'), fechaSolicitud: hoyISO() } } catch { return nuevo() } }
const fecha = (iso) => (iso ? iso.split('-').reverse().join('/') : '')
const hora12 = (h) => { if (!h) return ''; const [a, b] = h.split(':').map(Number); return `${((a + 11) % 12) + 1}:${String(b).padStart(2, '0')} ${a < 12 ? 'a. m.' : 'p. m.'}` }

export default function AusentismoPage() {
  const [d, setD] = useState(leer)
  const [tocados, setTocados] = useState({})
  const [vista, setVista] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const errores = useMemo(() => validarAusentismo(d), [d])
  const hayErrores = Object.keys(errores).length > 0
  const err = (k) => tocados[k] && errores[k]

  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(d)) } catch { /* sin almacenamiento */ } }, [d])

  const set = (k, v) => setD((x) => ({ ...x, [k]: v }))
  const toque = (k) => setTocados((x) => ({ ...x, [k]: true }))
  const setCol = (i, k, v) => setD((x) => ({ ...x, colaboradores: x.colaboradores.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }))
  const tocarTodo = () => setTocados(Object.fromEntries(Object.keys(errores).map((k) => [k, true])))

  function revisar() {
    tocarTodo()
    if (hayErrores) {
      setError('Revisa los campos marcados antes de continuar.')
      requestAnimationFrame(() => document.querySelector('.au .has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return false
    }
    setError('')
    return true
  }

  async function descargar() {
    if (!revisar()) return
    setBusy(true)
    try {
      const res = await fetch('/api/documentos/ausentismo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).catch(() => null)
      if (!res) throw new Error('No hay conexión con el servidor de la intranet.')
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'No se pudo generar el formato.')
      const nombre = decodeURIComponent((res.headers.get('Content-Disposition') || '').split("''")[1] || 'FT-OP-76 Ausentismo.xlsx')
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sv au">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Ausentismo laboral']]}
        eyebrow="Formato FT-OP-76"
        title="Ausentismo laboral"
        lead="Diligencia el formato de ausentismo, revísalo en la vista previa y descárgalo en Excel o imprímelo (también puedes guardarlo como PDF)."
        icon={IconUserClock}
      />

      <div className="sv-wrap sv-page au-layout">
        <div className="au-form">
          <Section number="1" title="Datos de la solicitud">
            <div className="sv-grid">
              <Campo label="Fecha de solicitud" error={err('fechaSolicitud')}>
                <input className="sv-input" type="date" value={d.fechaSolicitud} onChange={(e) => set('fechaSolicitud', e.target.value)} onBlur={() => toque('fechaSolicitud')} />
              </Campo>
              <Campo label="Empresa usuaria" error={err('empresa')}>
                <input className="sv-input" value={d.empresa} onChange={(e) => set('empresa', e.target.value)} onBlur={() => toque('empresa')} />
              </Campo>
            </div>
          </Section>

          <Section number="2" title="Motivo del ausentismo">
            <div className={`au-motivos ${err('motivo') ? 'has-error' : ''}`} role="radiogroup" aria-label="Motivo del ausentismo">
              {MOTIVOS.map(([k, l]) => (
                <label key={k} className={`au-motivo ${d.motivo === k ? 'is-on' : ''}`}>
                  <input type="radio" name="motivo" value={k} checked={d.motivo === k} onChange={() => { set('motivo', k); toque('motivo') }} />
                  <span className="au-motivo__dot" aria-hidden="true" />
                  {l}
                </label>
              ))}
            </div>
            {err('motivo') && <small className="sv-error"><IconAlert width={14} height={14} /> {errores.motivo}</small>}
            <div className="sv-grid au-mt">
              <Campo label="Descripción" error={err('descripcion')} full>
                <textarea className="sv-input sv-textarea" rows={3} maxLength={250} value={d.descripcion} onChange={(e) => set('descripcion', e.target.value)} onBlur={() => toque('descripcion')} placeholder="Ej. Cita de control con medicina especializada" />
              </Campo>
              <div className={`sv-field ${err('soporte') ? 'has-error' : ''}`}>
                <span className="sv-label">¿Tiene soporte? <i className="sv-required">*</i></span>
                <div className="au-yesno" role="radiogroup" aria-label="¿Tiene soporte?">
                  {[['si', 'Sí'], ['no', 'No']].map(([k, l]) => (
                    <label key={k} className={d.soporte === k ? 'is-on' : ''}>
                      <input type="radio" name="soporte" checked={d.soporte === k} onChange={() => { set('soporte', k); toque('soporte') }} /> {l}
                    </label>
                  ))}
                </div>
                {err('soporte') && <small className="sv-error">{errores.soporte}</small>}
              </div>
            </div>
          </Section>

          <Section number="3" title="Fechas del ausentismo" description="Las horas son opcionales: úsalas cuando el ausentismo es por horas.">
            <div className="sv-grid au-grid4">
              <Campo label="Fecha inicio" error={err('fechaInicio')}>
                <input className="sv-input" type="date" value={d.fechaInicio} onChange={(e) => set('fechaInicio', e.target.value)} onBlur={() => toque('fechaInicio')} />
              </Campo>
              <Campo label="Hora inicio" error={err('horaInicio')} optional>
                <input className="sv-input" type="time" value={d.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} />
              </Campo>
              <Campo label="Fecha fin" error={err('fechaFin')}>
                <input className="sv-input" type="date" value={d.fechaFin} min={d.fechaInicio || undefined} onChange={(e) => set('fechaFin', e.target.value)} onBlur={() => toque('fechaFin')} />
              </Campo>
              <Campo label="Hora fin" error={err('horaFin')} optional>
                <input className="sv-input" type="time" value={d.horaFin} onChange={(e) => set('horaFin', e.target.value)} />
              </Campo>
            </div>
          </Section>

          <Section number="4" title="Colaboradores" description={`Hasta ${MAX_COLABORADORES} personas por formato. La firma de cada colaborador se hace a mano al imprimir.`}>
            <div className="sv-repeat">
              {d.colaboradores.map((c, i) => (
                <div key={i} className="sv-repeat__item">
                  <div className="sv-repeat__head">
                    <b>Colaborador {i + 1}</b>
                    {d.colaboradores.length > 1 && <button type="button" className="sv-link sv-link--danger" onClick={() => set('colaboradores', d.colaboradores.filter((_, j) => j !== i))}><IconTrash width={16} height={16} /> Quitar</button>}
                  </div>
                  <div className="sv-grid sv-grid--3">
                    <Campo label="Nombres y apellidos" error={err(`colaboradores.${i}.nombre`)}>
                      <input className="sv-input" value={c.nombre} onChange={(e) => setCol(i, 'nombre', e.target.value)} onBlur={() => toque(`colaboradores.${i}.nombre`)} />
                    </Campo>
                    <Campo label="Identificación" error={err(`colaboradores.${i}.identificacion`)}>
                      <input className="sv-input" inputMode="numeric" value={c.identificacion} onChange={(e) => setCol(i, 'identificacion', e.target.value.replace(/[^\dA-Za-z]/g, ''))} onBlur={() => toque(`colaboradores.${i}.identificacion`)} />
                    </Campo>
                    <Campo label="Cargo" error={err(`colaboradores.${i}.cargo`)}>
                      <input className="sv-input" value={c.cargo} onChange={(e) => setCol(i, 'cargo', e.target.value)} onBlur={() => toque(`colaboradores.${i}.cargo`)} />
                    </Campo>
                  </div>
                </div>
              ))}
            </div>
            {d.colaboradores.length < MAX_COLABORADORES && (
              <button type="button" className="sv-btn sv-btn--soft" onClick={() => set('colaboradores', [...d.colaboradores, { nombre: '', identificacion: '', cargo: '' }])}>
                <IconPlus width={18} height={18} /> Agregar colaborador
              </button>
            )}
          </Section>

          <Section number="5" title="Observaciones y autorización">
            <div className="sv-grid">
              <Campo label="Observaciones" error={err('observaciones')} optional full>
                <textarea className="sv-input sv-textarea" rows={3} maxLength={400} value={d.observaciones} onChange={(e) => set('observaciones', e.target.value)} />
              </Campo>
              <Campo label="Jefe inmediato" error={err('jefe')}>
                <input className="sv-input" value={d.jefe} onChange={(e) => set('jefe', e.target.value)} onBlur={() => toque('jefe')} placeholder="Nombre de quien autoriza" />
              </Campo>
              <div className="sv-field">
                <span className="sv-label">Talento Humano</span>
                <p className="sv-locked">Queda en blanco para su firma.</p>
              </div>
            </div>
          </Section>

          {error && <p className="sv-alert sv-alert--error" role="alert">{error}</p>}
          <div className="au-actions">
            <button type="button" className="sv-btn sv-btn--ghost" onClick={() => { if (window.confirm('¿Limpiar el formulario?')) { setD(nuevo()); setTocados({}); setError('') } }}>Limpiar</button>
            <button type="button" className="sv-btn sv-btn--ghost" onClick={() => { if (revisar()) setVista(true) }}><IconEye width={18} height={18} /> Vista previa</button>
            <button type="button" className="sv-btn" onClick={descargar} disabled={busy}><IconDownload width={18} height={18} /> {busy ? 'Generando…' : 'Descargar Excel'}</button>
          </div>
        </div>
      </div>

      {vista && <Vista d={d} onClose={() => setVista(false)} onDescargar={descargar} busy={busy} />}
    </div>
  )
}

function Campo({ label, error, optional, full, children }) {
  return (
    <div className={`sv-field ${error ? 'has-error' : ''} ${full ? 'sv-col-2' : ''}`}>
      <label className="sv-label">
        {label} {optional ? <small className="sv-opt">(opcional)</small> : <i className="sv-required" aria-hidden="true">*</i>}
      </label>
      {children}
      {error && <small className="sv-error" role="alert"><IconAlert width={14} height={14} /> {error}</small>}
    </div>
  )
}

/* Réplica del formato FT-OP-76 para ver, imprimir o guardar como PDF (dos copias por hoja, como el original). */
function Formato({ d }) {
  const filas = Array.from({ length: MAX_COLABORADORES }, (_, i) => d.colaboradores[i] || null)
  const X = (k) => (d.motivo === k ? 'X' : '')
  return (
    <div className="fo">
      <table className="fo-head">
        <tbody>
          <tr>
            <td rowSpan={4} className="fo-head__logo"><img src={MARCA.logoVertical} alt="Gestión y Servicios" /></td>
            <td rowSpan={4} className="fo-head__title">AUSENTISMO LABORAL</td>
            <td>Código: FT-OP-76</td>
          </tr>
          <tr><td>Versión: 03</td></tr>
          <tr><td>Página: 1 de 1</td></tr>
          <tr><td>Edición: Enero 2025</td></tr>
        </tbody>
      </table>
      <div className="fo-date"><span>Fecha solicitud</span><b>{fecha(d.fechaSolicitud)}</b></div>
      <div className="fo-sec">I. MOTIVO DEL AUSENTISMO</div>
      <table className="fo-grid">
        <tbody>
          <tr className="fo-motivos">{MOTIVOS.map(([k, l]) => <td key={k}><span>{l}</span><b>{X(k)}</b></td>)}</tr>
        </tbody>
      </table>
      <table className="fo-grid">
        <tbody>
          <tr><th>Descripción:</th><td className="fo-wide">{d.descripcion}</td><th>¿Soporte?</th><td className="fo-box">Sí {d.soporte === 'si' ? 'X' : ''}</td><td className="fo-box">No {d.soporte === 'no' ? 'X' : ''}</td></tr>
        </tbody>
      </table>
      <table className="fo-grid">
        <tbody>
          <tr><th>Fecha inicio:</th><td>{fecha(d.fechaInicio)}</td><th>Hora:</th><td>{hora12(d.horaInicio)}</td><th>Fecha fin:</th><td>{fecha(d.fechaFin)}</td><th>Hora:</th><td>{hora12(d.horaFin)}</td></tr>
          <tr><th>Empresa usuaria:</th><td colSpan={7}>{d.empresa}</td></tr>
        </tbody>
      </table>
      <div className="fo-sec">II. IDENTIFICACIÓN DE LOS COLABORADORES</div>
      <table className="fo-grid fo-people">
        <thead><tr><th>No.</th><th>Nombres y apellidos</th><th>Identificación</th><th>Cargo</th><th>Firma</th></tr></thead>
        <tbody>
          {filas.map((c, i) => (
            <tr key={i}><td>{i + 1}</td><td>{c?.nombre}</td><td>{c?.identificacion}</td><td>{c?.cargo}</td><td /></tr>
          ))}
        </tbody>
      </table>
      <div className="fo-sec">III. OBSERVACIONES</div>
      <div className="fo-obs">{d.observaciones}</div>
      <div className="fo-sec">IV. FIRMAS AUTORIZACIÓN</div>
      <table className="fo-grid fo-signs">
        <tbody>
          <tr><td>{d.jefe}</td><td /></tr>
          <tr><th>Jefe inmediato</th><th>Talento Humano</th></tr>
        </tbody>
      </table>
    </div>
  )
}

function Vista({ d, onClose, onDescargar, busy }) {
  const ref = useRef(null)
  useEffect(() => {
    const dlg = ref.current
    dlg.showModal()
    document.body.classList.add('au-printing')
    return () => { dlg.close(); document.body.classList.remove('au-printing') }
  }, [])
  return createPortal(
    <div className="au-portal">
    <dialog ref={ref} className="au-preview" aria-labelledby="au-prev-title" onCancel={(e) => { e.preventDefault(); onClose() }}>
      <header className="au-preview__bar">
        <h2 id="au-prev-title">Vista previa · FT-OP-76</h2>
        <div>
          <button type="button" className="sv-btn sv-btn--ghost" onClick={onDescargar} disabled={busy}><IconDownload width={18} height={18} /> Excel</button>
          <button type="button" className="sv-btn" onClick={() => window.print()}><IconPrinter width={18} height={18} /> Imprimir o guardar PDF</button>
          <button type="button" className="sv-icon-btn" onClick={onClose} aria-label="Cerrar vista previa"><IconX width={20} height={20} /></button>
        </div>
      </header>
      <p className="au-preview__hint">Para obtener el PDF, en la ventana de impresión elige <b>Guardar como PDF</b> como destino.</p>
      <div className="au-sheet" id="au-sheet">
        <Formato d={d} />
        <div className="au-sheet__cut" aria-hidden="true" />
        <Formato d={d} />
      </div>
    </dialog>
    </div>,
    document.body,
  )
}
