import { useCallback, useEffect, useMemo, useState } from 'react'
import Dialog from '../../components/Dialog.jsx'
import { useSession } from '../../lib/useSession.js'
import { request } from '../cumpleanos/api.js'
import './ti.css'

/* Panel de TI: alertas y seguimiento de módulos (líneas móviles y correos inactivos).
   Solo para los roles «ti» y «admin». */

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, width: 18, height: 18, viewBox: '0 0 24 24' }
const I = {
  mas: <svg {...svg}><path d="M12 5v14M5 12h14" /></svg>,
  edit: <svg {...svg}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>,
  basura: <svg {...svg}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>,
  recarga: <svg {...svg}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>,
  campana: <svg {...svg}><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9ZM10 20a2 2 0 0 0 4 0" /></svg>,
  cel: <svg {...svg}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></svg>,
  mail: <svg {...svg}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
  subir: <svg {...svg}><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>,
  ext: <svg {...svg} width={14} height={14}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>,
  ajustes: <svg {...svg}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.200l-2 1.500 2 3.400 2.300-.9c.6.5 1.300.9 2 1.200l.4 2.600h4l.4-2.600c.7-.3 1.400-.7 2-1.200l2.300.9 2-3.400-2-1.500c.1-.4.1-.8.1-1.200Z" /></svg>,
}

const pesos = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`
const fecha = (iso) => (iso ? iso.split('-').reverse().join('/') : '—')
const ADMIN_CORREO = (correo) => `https://admin.google.com/ac/search?query=${encodeURIComponent(correo)}`
const LINK_PAQUETES = 'https://www.movistar.com.co/'

/* ---------- Píldoras de estado ---------- */
function EstadoLinea({ l }) {
  if (l.nivel === 'vencida') return <span className="ti-pill ti-pill--red">Vencida hace {Math.abs(l.dias)} d</span>
  if (l.nivel === 'por_vencer') return <span className="ti-pill ti-pill--amber">{l.dias === 0 ? 'Vence hoy' : `Vence en ${l.dias} d`}</span>
  if (l.nivel === 'sin_fecha') return <span className="ti-pill">Sin fecha</span>
  return <span className="ti-pill ti-pill--green">Al día · {l.dias} d</span>
}

/* ---------- Diálogos ---------- */
function LineaDialog({ inicial, onClose, onGuardada }) {
  const [f, setF] = useState(() => ({
    grupo: inicial?.grupo || 'principal',
    linea: inicial?.linea || '',
    area: inicial?.area || '',
    plan: inicial?.plan || '',
    recarga: inicial?.recarga || '',
    vence: inicial?.vence || '',
    observacion: inicial?.observacion || '',
  }))
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setErrores({})
    try {
      const r = inicial ? await request(`/ti/lineas/${inicial.id}`, { method: 'PUT', body: f }) : await request('/ti/lineas', { method: 'POST', body: f })
      onGuardada(r)
    } catch (err) {
      setError(err.message)
      setErrores(err.fields || {})
      setGuardando(false)
    }
  }
  const campo = (k, etiqueta, props = {}) => (
    <label className={`ui-field ${errores[k] ? 'is-bad' : ''}`}>
      <span className="ui-label">{etiqueta}</span>
      <input value={f[k]} onChange={(e) => set(k, e.target.value)} {...props} />
      {errores[k] && <p className="ui-error">{errores[k]}</p>}
    </label>
  )
  return (
    <Dialog title={inicial ? 'Editar línea' : 'Nueva línea'} onClose={onClose} label="ti-linea">
      <form className="ti-form" onSubmit={guardar}>
        <div className="ti-form__row">
          {campo('linea', 'Número de línea', { inputMode: 'numeric', maxLength: 20, autoFocus: true, required: true })}
          {campo('area', 'Área o persona', { maxLength: 80, required: true })}
        </div>
        <div className="ti-form__row">
          {campo('plan', 'Plan / valor de la recarga ($)', { inputMode: 'numeric' })}
          <label className="ui-field"><span className="ui-label">Grupo</span>
            <select value={f.grupo} onChange={(e) => set('grupo', e.target.value)}><option value="principal">Líneas principales</option><option value="caja_menor">Caja menor</option></select>
          </label>
        </div>
        <div className="ti-form__row">
          {campo('recarga', 'Fecha de recarga', { placeholder: 'dd/mm/aaaa' })}
          {campo('vence', 'Vence', { placeholder: 'Se calcula si lo dejas vacío' })}
        </div>
        {campo('observacion', 'Observación', { maxLength: 120, placeholder: 'minutos, minutos y datos…' })}
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Dialog>
  )
}

function ImportarDialog({ onClose, onHecho }) {
  const [texto, setTexto] = useState('')
  const [modo, setModo] = useState('reemplazar')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function leerArchivo(file) {
    if (!file) return
    setTexto(await file.text())
  }
  async function importar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      onHecho(await request('/ti/correos/importar', { method: 'POST', body: { texto, modo } }))
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }
  return (
    <Dialog title="Cargar reporte de correos" subtitle="Copia la tabla del reporte «Usuarios inactivos» (con sus encabezados) y pégala aquí, o sube el CSV." size="lg" onClose={onClose} label="ti-import">
      <form className="ti-form" onSubmit={importar}>
        <label className="ui-field">
          <span className="ui-label">Reporte <small>(Nombre · Correo · Estado · Último acceso · Días inactivo)</small></span>
          <textarea className="ti-paste" value={texto} onChange={(e) => setTexto(e.target.value)} rows={9} placeholder={'Nombre\tCorreo\tEstado\tÚltimo Acceso\tDías Inactivo\nAna Pérez\tana@empresa.com\tActivo\t12/05/2026\t136'} required />
        </label>
        <div className="ti-form__row ti-form__row--center">
          <label className="ti-file">{I.subir} Subir archivo CSV<input type="file" accept=".csv,.tsv,.txt" hidden onChange={(e) => leerArchivo(e.target.files?.[0])} /></label>
          <fieldset className="ti-modo">
            <label><input type="radio" name="modo" checked={modo === 'reemplazar'} onChange={() => setModo('reemplazar')} /> Reemplazar el reporte anterior</label>
            <label><input type="radio" name="modo" checked={modo === 'agregar'} onChange={() => setModo('agregar')} /> Agregar / actualizar</label>
          </fieldset>
        </div>
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando || !texto.trim()}>{guardando ? 'Cargando…' : 'Cargar reporte'}</button>
        </div>
      </form>
    </Dialog>
  )
}

function AjustesDialog({ config, destino, onClose, onGuardado }) {
  const [f, setF] = useState({ diasAviso: config.diasAviso, diasInactivo: config.diasInactivo, diasRecarga: config.diasRecarga, correoAuto: config.correoAuto })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      await request('/ti/config', { method: 'PUT', body: f })
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }
  const num = (k, etiqueta, ayuda) => (
    <label className="ui-field"><span className="ui-label">{etiqueta}</span>
      <input type="number" min="0" value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} />
      <p className="ui-hint">{ayuda}</p>
    </label>
  )
  return (
    <Dialog title="Reglas de las alertas" size="sm" onClose={onClose} label="ti-ajustes">
      <form className="ti-form" onSubmit={guardar}>
        {num('diasAviso', 'Avisar líneas por vencer con (días)', 'Una línea pasa a «por vencer» cuando faltan estos días o menos.')}
        {num('diasRecarga', 'Duración de una recarga (días)', 'Al registrar una recarga, el vencimiento será hoy + estos días.')}
        {num('diasInactivo', 'Correo inactivo desde (días)', 'Los correos con más días sin acceso se marcan como alerta.')}
        <label className="ui-switch">
          <input type="checkbox" checked={f.correoAuto} onChange={(e) => setF((x) => ({ ...x, correoAuto: e.target.checked }))} />
          <i aria-hidden="true" />
          <span>Resumen diario por correo<small>Se envía a {destino} cada día a partir de las 8:00 a. m. si hay alertas.</small></span>
        </label>
        {error && <p className="ui-alert" role="alert">{error}</p>}
        <div className="ui-dialog__foot">
          <button type="button" className="ui-btn ui-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="ui-btn" disabled={guardando}>Guardar</button>
        </div>
      </form>
    </Dialog>
  )
}

/* ---------- Pestaña: líneas móviles ---------- */
function Lineas({ datos, recargar, avisar }) {
  const [grupo, setGrupo] = useState('todas')
  const [estado, setEstado] = useState('todas')
  const [busca, setBusca] = useState('')
  const [dialogo, setDialogo] = useState(null) // { linea? } | 'nueva'
  const [quitar, setQuitar] = useState(null)

  const items = datos.items
  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return items.filter((l) =>
      (grupo === 'todas' || l.grupo === grupo) &&
      (estado === 'todas' || (estado === 'alerta' ? ['vencida', 'por_vencer'].includes(l.nivel) : l.nivel === estado)) &&
      (!q || `${l.linea} ${l.area} ${l.observacion}`.toLowerCase().includes(q)),
    )
  }, [items, grupo, estado, busca])
  const total = visibles.reduce((n, l) => n + (l.plan || 0), 0)
  const cuenta = (n) => items.filter((l) => l.nivel === n).length

  async function recargar1(l) {
    try {
      await request(`/ti/lineas/${l.id}/recarga`, { method: 'POST', body: {} })
      avisar(`Recarga registrada para ${l.area}. Vence en ${datos.config.diasRecarga} días.`)
      recargar()
    } catch (e) { avisar(e.message, true) }
  }
  async function eliminar() {
    try {
      await request(`/ti/lineas/${quitar.id}`, { method: 'DELETE' })
      avisar(`Se eliminó la línea ${quitar.linea}.`)
      setQuitar(null)
      recargar()
    } catch (e) { avisar(e.message, true); setQuitar(null) }
  }

  const tabla = (lista, titulo) => (
    <div className="ti-card ti-table-card" key={titulo}>
      {titulo && <h3 className="ti-h3">{titulo}</h3>}
      <div className="ti-scroll">
        <table className="ti-table">
          <thead><tr><th>Nro</th><th>Línea</th><th>Área o persona</th><th>Plan</th><th>Fecha recarga</th><th>Observación</th><th>Vence</th><th className="ti-sr-col"><span className="ti-sr">Acciones</span></th></tr></thead>
          <tbody>
            {lista.map((l, i) => (
              <tr key={l.id} className={l.nivel === 'vencida' ? 'is-red' : l.nivel === 'por_vencer' ? 'is-amber' : ''}>
                <td>{i + 1}</td>
                <td className="ti-num">{l.linea}</td>
                <td><b>{l.area}</b></td>
                <td>{pesos(l.plan)}</td>
                <td>{fecha(l.recarga)}</td>
                <td>{l.observacion || '—'}</td>
                <td><span className="ti-vence">{fecha(l.vence)}</span><EstadoLinea l={l} /></td>
                <td>
                  <span className="ti-actions">
                    <button type="button" className="ui-btn ui-btn--sm" onClick={() => recargar1(l)} title="Marcar como recargada hoy">{I.recarga} Recargada</button>
                    <button type="button" className="ui-icon-btn ui-icon-btn--sm" onClick={() => setDialogo({ linea: l })} aria-label={`Editar ${l.area}`}>{I.edit}</button>
                    <button type="button" className="ui-icon-btn ui-icon-btn--sm ui-icon-btn--danger" onClick={() => setQuitar(l)} aria-label={`Eliminar ${l.area}`}>{I.basura}</button>
                  </span>
                </td>
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={8} className="ti-none">No hay líneas con estos filtros.</td></tr>}
          </tbody>
          {lista.length > 0 && <tfoot><tr><td colSpan={3}>Total de planes</td><td colSpan={5}><b>{pesos(lista.reduce((n, l) => n + (l.plan || 0), 0))}</b></td></tr></tfoot>}
        </table>
      </div>
    </div>
  )

  return (
    <div className="ti-tab">
      <div className="ti-toolbar">
        <div className="ti-chips" role="group" aria-label="Filtrar por estado">
          {[['todas', `Todas (${items.length})`], ['alerta', `Con alerta (${cuenta('vencida') + cuenta('por_vencer')})`], ['vencida', `Vencidas (${cuenta('vencida')})`], ['por_vencer', `Por vencer (${cuenta('por_vencer')})`], ['ok', `Al día (${cuenta('ok')})`]].map(([v, n]) => (
            <button key={v} type="button" aria-pressed={estado === v} className={estado === v ? 'is-on' : ''} onClick={() => setEstado(v)}>{n}</button>
          ))}
        </div>
        <div className="ti-toolbar__right">
          <select className="ti-select" value={grupo} onChange={(e) => setGrupo(e.target.value)} aria-label="Grupo de líneas"><option value="todas">Todos los grupos</option><option value="principal">Líneas principales</option><option value="caja_menor">Caja menor</option></select>
          <input className="ti-search" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar línea o persona" aria-label="Buscar líneas" />
          <a className="ui-btn ui-btn--ghost" href={LINK_PAQUETES} target="_blank" rel="noreferrer">Paquetes Movistar prepago {I.ext}</a>
          <button type="button" className="ui-btn" onClick={() => setDialogo('nueva')}>{I.mas} Nueva línea</button>
        </div>
      </div>

      {grupo === 'todas' ? (
        <>
          {tabla(visibles.filter((l) => l.grupo === 'principal'), 'Líneas principales')}
          {visibles.some((l) => l.grupo === 'caja_menor') && tabla(visibles.filter((l) => l.grupo === 'caja_menor'), 'Caja menor')}
        </>
      ) : tabla(visibles, grupo === 'caja_menor' ? 'Caja menor' : 'Líneas principales')}
      <p className="ui-hint">Total mostrado: <b>{pesos(total)}</b> en {visibles.length} línea(s).</p>

      {dialogo && <LineaDialog inicial={dialogo === 'nueva' ? null : dialogo.linea} onClose={() => setDialogo(null)} onGuardada={() => { setDialogo(null); avisar('Línea guardada.'); recargar() }} />}
      {quitar && (
        <Dialog title="Eliminar línea" size="sm" onClose={() => setQuitar(null)} label="ti-del">
          <p>Se eliminará la línea <b>{quitar.linea}</b> ({quitar.area}) del seguimiento.</p>
          <div className="ui-dialog__foot">
            <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setQuitar(null)}>Cancelar</button>
            <button type="button" className="ui-btn ui-btn--red" onClick={eliminar}>Eliminar</button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

/* ---------- Pestaña: correos inactivos ---------- */
function Correos({ datos, recargar, avisar }) {
  const [soloAlerta, setSoloAlerta] = useState(false)
  const [busca, setBusca] = useState('')
  const [importar, setImportar] = useState(false)
  const items = datos.items
  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return items
      .filter((c) => (!soloAlerta || c.alerta) && (!q || `${c.nombre} ${c.correo}`.toLowerCase().includes(q)))
      .sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1))
  }, [items, soloAlerta, busca])

  async function quitar(c) {
    try { await request(`/ti/correos/${c.id}`, { method: 'DELETE' }); recargar() } catch (e) { avisar(e.message, true) }
  }

  return (
    <div className="ti-tab">
      <div className="ti-toolbar">
        <div className="ti-chips" role="group" aria-label="Filtro">
          <button type="button" aria-pressed={!soloAlerta} className={!soloAlerta ? 'is-on' : ''} onClick={() => setSoloAlerta(false)}>Todos ({items.length})</button>
          <button type="button" aria-pressed={soloAlerta} className={soloAlerta ? 'is-on' : ''} onClick={() => setSoloAlerta(true)}>Inactivos {datos.config.diasInactivo}+ días ({items.filter((c) => c.alerta).length})</button>
        </div>
        <div className="ti-toolbar__right">
          <input className="ti-search" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nombre o correo" aria-label="Buscar correos" />
          <button type="button" className="ui-btn" onClick={() => setImportar(true)}>{I.subir} Cargar reporte</button>
        </div>
      </div>

      <div className="ti-card ti-table-card">
        <h3 className="ti-h3">Reporte de correos · usuarios inactivos {datos.actualizado && <small>Actualizado el {new Date(datos.actualizado).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</small>}</h3>
        {items.length === 0 ? (
          <div className="ti-empty">
            {I.mail}
            <p><b>Aún no hay un reporte cargado.</b> Pega la tabla «Reporte de Correos – Usuarios Inactivos» y aquí verás quién lleva más días sin entrar.</p>
            <button type="button" className="ui-btn" onClick={() => setImportar(true)}>{I.subir} Cargar reporte</button>
          </div>
        ) : (
          <div className="ti-scroll">
            <table className="ti-table">
              <thead><tr><th>Nombre</th><th>Correo <small>(clic para administrar)</small></th><th>Estado</th><th>Último acceso</th><th>Días inactivo</th><th className="ti-sr-col"><span className="ti-sr">Quitar</span></th></tr></thead>
              <tbody>
                {visibles.map((c) => (
                  <tr key={c.id} className={c.alerta ? 'is-red' : ''}>
                    <td><b>{c.nombre || '—'}</b></td>
                    <td><a className="ti-mail" href={ADMIN_CORREO(c.correo)} target="_blank" rel="noreferrer">{c.correo} {I.ext}</a></td>
                    <td><span className={`ti-pill ${/suspend|inactiv|bloque/i.test(c.estado) ? 'ti-pill--amber' : 'ti-pill--green'}`}>{c.estado || '—'}</span></td>
                    <td>{c.ultimoAcceso ? fecha(c.ultimoAcceso) : c.ultimoAccesoTexto || '—'}</td>
                    <td>{c.dias === null ? '—' : <span className={`ti-pill ${c.alerta ? 'ti-pill--red' : ''}`}>{c.dias} días</span>}</td>
                    <td><button type="button" className="ui-icon-btn ui-icon-btn--sm ui-icon-btn--danger" onClick={() => quitar(c)} aria-label={`Quitar a ${c.correo} del reporte`}>{I.basura}</button></td>
                  </tr>
                ))}
                {visibles.length === 0 && <tr><td colSpan={6} className="ti-none">Nada que mostrar con este filtro.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {importar && <ImportarDialog onClose={() => setImportar(false)} onHecho={(r) => { setImportar(false); avisar(`Reporte cargado: ${r.importados} correo(s).`); recargar() }} />}
    </div>
  )
}

/* ---------- Página ---------- */
export default function TiPage({ hash }) {
  const user = useSession()
  const tab = hash === 'ti-correos' ? 'correos' : 'lineas'
  const [resumen, setResumen] = useState(null)
  const [lineas, setLineas] = useState(null)
  const [correos, setCorreos] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [ajustes, setAjustes] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const permitido = user && ['ti', 'admin'].includes(user.role)
  const cargar = useCallback(() => {
    request('/ti/resumen').then(setResumen).catch(() => {})
    request('/ti/lineas').then(setLineas).catch(() => {})
    request('/ti/correos').then(setCorreos).catch(() => {})
  }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])
  useEffect(() => { if (permitido) cargar() }, [permitido, cargar])

  const avisar = (texto, error = false) => { setAviso({ texto, error }); setTimeout(() => setAviso(null), 5000) }

  async function enviarAhora() {
    setEnviando(true)
    try {
      const r = await request('/ti/alertas/enviar', { method: 'POST', body: {} })
      if (r.estado === 'sin_alertas') avisar('No hay alertas pendientes: no se envió nada.')
      else if (r.estado === 'error') avisar(`No se pudo enviar: ${r.detalle}`, true)
      else avisar(r.estado === 'simulado' ? 'Resumen preparado (SMTP sin configurar: quedó guardado en la bandeja local).' : `Resumen enviado a ${r.to}.`)
      cargar()
    } catch (e) { avisar(e.message, true) } finally { setEnviando(false) }
  }

  if (user === undefined) return <div className="ti"><p className="ti-loading">Comprobando sesión…</p></div>
  if (!permitido) {
    return (
      <div className="ti">
        <div className="ti-gate">
          <h1>Panel de TI</h1>
          <p>Esta sección es solo para el equipo de TI. Inicia sesión con un usuario con ese rol desde el botón «Iniciar sesión» del menú.</p>
          <a className="ui-btn" href="#inicio">Volver al inicio</a>
        </div>
      </div>
    )
  }

  const r = resumen
  const alertasLineas = r ? r.lineas.vencidas + r.lineas.porVencer : 0
  return (
    <div className="ti">
      <header className="ti-hero">
        <div className="ti-wrap ti-hero__inner">
          <div>
            <p className="ti-kicker">{I.campana} Alertas y seguimiento</p>
            <h1>Panel de <span>TI</span></h1>
            <p className="ti-hero__lead">Líneas móviles por recargar y correos sin uso, en un solo lugar. Las alertas se calculan solas y llegan por correo cada día.</p>
          </div>
          <div className="ti-hero__actions">
            <button type="button" className="ui-btn ti-btn-light" onClick={enviarAhora} disabled={enviando || !r}>{I.mail} {enviando ? 'Enviando…' : 'Enviar resumen ahora'}</button>
            <button type="button" className="ui-btn ti-btn-glass" onClick={() => setAjustes(true)} disabled={!r}>{I.ajustes} Reglas</button>
          </div>
        </div>
        <div className="ti-wrap ti-stats">
          <div className={`ti-stat ${r?.lineas.vencidas ? 'is-red' : ''}`}><span>{I.cel}Líneas vencidas</span><b>{r ? r.lineas.vencidas : '–'}</b><small>de {r?.lineas.total ?? '–'} líneas</small></div>
          <div className={`ti-stat ${r?.lineas.porVencer ? 'is-amber' : ''}`}><span>{I.recarga}Por vencer</span><b>{r ? r.lineas.porVencer : '–'}</b><small>en {r?.config.diasAviso ?? '–'} días o menos</small></div>
          <div className={`ti-stat ${r?.correos.inactivos ? 'is-blue' : ''}`}><span>{I.mail}Correos inactivos</span><b>{r ? r.correos.inactivos : '–'}</b><small>{r?.correos.total ? `de ${r.correos.total} en el reporte` : 'sin reporte cargado'}</small></div>
          <div className="ti-stat"><span>{I.campana}Resumen diario</span><b className="ti-stat__txt">{r ? (r.config.correoAuto ? 'Activo' : 'Apagado') : '–'}</b><small>{r?.config.ultimoResumen ? `Último envío: ${fecha(r.config.ultimoResumen)}` : 'Aún sin envíos'}</small></div>
        </div>
      </header>

      <main className="ti-wrap ti-main">
        <nav className="ti-tabs" aria-label="Módulos de TI">
          <a href="#ti" className={tab === 'lineas' ? 'is-on' : ''} aria-current={tab === 'lineas' ? 'page' : undefined}>{I.cel} Recargas y líneas {alertasLineas > 0 && <em>{alertasLineas}</em>}</a>
          <a href="#ti-correos" className={tab === 'correos' ? 'is-on' : ''} aria-current={tab === 'correos' ? 'page' : undefined}>{I.mail} Correos inactivos {r?.correos.inactivos > 0 && <em>{r.correos.inactivos}</em>}</a>
        </nav>

        {aviso && <p className={`ui-alert ${aviso.error ? '' : 'ui-alert--ok'}`} role="status">{aviso.texto}</p>}

        {tab === 'lineas' ? (lineas ? <Lineas datos={lineas} recargar={cargar} avisar={avisar} /> : <p className="ti-loading">Cargando líneas…</p>) : (correos ? <Correos datos={correos} recargar={cargar} avisar={avisar} /> : <p className="ti-loading">Cargando correos…</p>)}

        <p className="ti-soon">Este panel crecerá: aquí se sumarán nuevas alertas y notificaciones automáticas de otros módulos.</p>
      </main>

      {ajustes && r && <AjustesDialog config={r.config} destino={r.destino} onClose={() => setAjustes(false)} onGuardado={() => { setAjustes(false); avisar('Reglas actualizadas.'); cargar() }} />}
    </div>
  )
}
