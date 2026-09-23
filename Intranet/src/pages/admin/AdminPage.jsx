import { useEffect, useState } from 'react'
import './admin.css'

/* Panel de administración (rol "admin"): mismo diseño del dashboard de base-app
   (tarjetas de métricas, barras mensuales, meta en anillo y estadísticas), con datos reales de la intranet. */

const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const etiquetaMes = (k) => MES[Number(k.slice(5, 7)) - 1]
const SERIES = { informe_ingreso: ['Informe de ingreso', '#465fff'], orden_servicio: ['Orden de servicio', '#9cb9ff'], prestamo_equipos: ['Préstamo de equipos', '#12b76a'] }

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const Icono = {
  solicitudes: <svg {...svg} width="24" height="24" viewBox="0 0 24 24"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
  salas: <svg {...svg} width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
  cumple: <svg {...svg} width="24" height="24" viewBox="0 0 24 24"><path d="M5 21v-6.2a2.8 2.8 0 0 1 2.8-2.8h8.4A2.8 2.8 0 0 1 19 14.8V21M3 21h18M12 6.7V10M12 3c.9.8 1.4 1.6 1.4 2.3 0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4c0-.7.5-1.5 1.4-2.3Z" /></svg>,
  usuarios: <svg {...svg} width="24" height="24" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.6c2 .6 3.4 2.1 4 4.4" /></svg>,
  arriba: <svg {...svg} width="12" height="12" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  abajo: <svg {...svg} width="12" height="12" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" /></svg>,
}

function Variacion({ valor }) {
  if (valor === null || valor === undefined) return <span className="ad-badge ad-badge--muted">Sin mes anterior</span>
  const sube = valor >= 0
  return <span className={`ad-badge ${sube ? 'ad-badge--ok' : 'ad-badge--err'}`}>{sube ? Icono.arriba : Icono.abajo}{Math.abs(valor)}%</span>
}

function Metrica({ icono, etiqueta, valor, extra, variacion }) {
  return (
    <div className="ad-card ad-metric">
      <span className="ad-metric__icon">{icono}</span>
      <div className="ad-metric__row">
        <div>
          <span className="ad-metric__label">{etiqueta}</span>
          <h4>{valor.toLocaleString('es-CO')}</h4>
          {extra && <small>{extra}</small>}
        </div>
        {variacion !== false && <Variacion valor={variacion} />}
      </div>
    </div>
  )
}

/* Barras agrupadas por mes (equivale al MonthlySalesChart). */
function Barras({ meses, series }) {
  const max = Math.max(1, ...series.flatMap((s) => s.datos))
  const tope = Math.ceil(max / 4) * 4 || 4
  const W = 720, H = 220, pad = 30, anchoGrupo = (W - pad) / meses.length
  const ancho = Math.min(14, (anchoGrupo * 0.7) / series.length)
  return (
    <svg className="ad-chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Solicitudes por mes">
      {[0, 1, 2, 3, 4].map((i) => {
        const yy = H - (H - 10) * (i / 4)
        return <g key={i}><line x1={pad} x2={W} y1={yy} y2={yy} className="ad-grid" /><text x={pad - 8} y={yy + 4} className="ad-axis" textAnchor="end">{Math.round((tope * i) / 4)}</text></g>
      })}
      {meses.map((k, i) => {
        const x0 = pad + i * anchoGrupo + (anchoGrupo - ancho * series.length - 4 * (series.length - 1)) / 2
        return (
          <g key={k}>
            {series.map((s, j) => {
              const v = s.datos[i]
              const h = ((H - 10) * v) / tope
              return <rect key={s.tipo} x={x0 + j * (ancho + 4)} y={H - h} width={ancho} height={Math.max(h, v ? 2 : 0)} rx="4" fill={SERIES[s.tipo][1]}><title>{`${SERIES[s.tipo][0]}: ${v}`}</title></rect>
            })}
            <text x={pad + i * anchoGrupo + anchoGrupo / 2} y={H + 18} className="ad-axis" textAnchor="middle">{etiquetaMes(k)}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* Anillo de avance (equivale al MonthlyTarget). */
function Anillo({ valor }) {
  const r = 70, c = Math.PI * r
  return (
    <svg className="ad-ring" viewBox="0 0 180 110" role="img" aria-label={`${valor}% de solicitudes resueltas`}>
      <path d="M20 95 A70 70 0 0 1 160 95" className="ad-ring__bg" />
      <path d="M20 95 A70 70 0 0 1 160 95" className="ad-ring__fg" strokeDasharray={c} strokeDashoffset={c * (1 - valor / 100)} />
      <text x="90" y="88" textAnchor="middle" className="ad-ring__num">{valor}%</text>
    </svg>
  )
}

/* Área suave de 12 meses (equivale al StatisticsChart). */
function Area({ meses, datos }) {
  const W = 1000, H = 240, pad = 30
  const max = Math.max(1, ...datos)
  const tope = Math.ceil(max / 4) * 4 || 4
  const pts = datos.map((v, i) => [pad + (i * (W - pad)) / (datos.length - 1), H - ((H - 10) * v) / tope])
  const linea = pts.map(([x, y], i) => (i ? `L${x},${y}` : `M${x},${y}`)).join(' ')
  return (
    <svg className="ad-chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Reservas de salas por mes">
      <defs>
        <linearGradient id="ad-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#465fff" stopOpacity=".35" /><stop offset="100%" stopColor="#465fff" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const yy = H - (H - 10) * (i / 4)
        return <g key={i}><line x1={pad} x2={W} y1={yy} y2={yy} className="ad-grid" /><text x={pad - 8} y={yy + 4} className="ad-axis" textAnchor="end">{Math.round((tope * i) / 4)}</text></g>
      })}
      <path d={`${linea} L${pts.at(-1)[0]},${H} L${pts[0][0]},${H} Z`} fill="url(#ad-area)" />
      <path d={linea} fill="none" stroke="#465fff" strokeWidth="2.5" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#465fff" strokeWidth="2"><title>{`${etiquetaMes(meses[i])}: ${datos[i]}`}</title></circle>)}
      {meses.map((k, i) => <text key={k} x={pts[i][0]} y={H + 18} className="ad-axis" textAnchor="middle">{etiquetaMes(k)}</text>)}
    </svg>
  )
}

export default function AdminPage() {
  const [estado, setEstado] = useState({ tipo: 'cargando' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    fetch('/api/admin/panel', { credentials: 'same-origin' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (r.ok) return setEstado({ tipo: 'ok', data })
        setEstado({ tipo: r.status === 403 ? 'prohibido' : 'sin-sesion' })
      })
      .catch(() => setEstado({ tipo: 'error' }))
  }, [])

  if (estado.tipo !== 'ok') {
    return (
      <div className="ad">
        <main className="ad-main">
          {estado.tipo === 'cargando' ? <p className="ad-muted">Comprobando permisos…</p> : (
            <div className="ad-card ad-empty">
              <h1>Administración</h1>
              <p>{estado.tipo === 'prohibido' ? 'Esta sección es solo para administradores.' : estado.tipo === 'error' ? 'No hay conexión con el servidor de la intranet.' : 'Inicia sesión con un usuario administrador desde el botón «Iniciar sesión» del menú.'}</p>
              <a className="ad-btn" href="#inicio">Volver al inicio</a>
            </div>
          )}
        </main>
      </div>
    )
  }

  const { data } = estado
  const m = data.metricas
  const avance = data.avance.total ? Math.round((data.avance.resueltas / data.avance.total) * 100) : 0
  return (
    <div className="ad">
      <main className="ad-main">
        <h1 className="ad-title">Admin Dashboard</h1>
        <p className="ad-muted ad-lead">Bienvenido al panel de administración de Gestión y Servicios. Aquí puedes ver la actividad de la intranet: solicitudes, reservas de salas, cumpleaños y usuarios.</p>

        <div className="ad-grid12">
          <div className="ad-col7">
            <div className="ad-metrics">
              <Metrica icono={Icono.solicitudes} etiqueta="Solicitudes este mes" valor={m.solicitudes.mes} extra={`${m.solicitudes.total} en total`} variacion={m.solicitudes.variacion} />
              <Metrica icono={Icono.salas} etiqueta="Reservas de salas este mes" valor={m.reservas.mes} extra={`${m.reservas.total} en total`} variacion={m.reservas.variacion} />
            </div>

            <div className="ad-card">
              <div className="ad-card__head">
                <h3>Solicitudes por mes</h3>
              </div>
              <ul className="ad-legend">
                {data.solicitudesPorTipo.map((s) => <li key={s.tipo}><i style={{ background: SERIES[s.tipo][1] }} />{SERIES[s.tipo][0]}</li>)}
              </ul>
              <Barras meses={data.meses} series={data.solicitudesPorTipo} />
            </div>
          </div>

          <div className="ad-col5">
            <div className="ad-card ad-target">
              <div className="ad-target__top">
                <div className="ad-card__head">
                  <div>
                    <h3>Solicitudes resueltas</h3>
                    <p className="ad-muted">Aprobadas o cerradas sobre el total</p>
                  </div>
                </div>
                <Anillo valor={avance} />
                <p className="ad-target__msg">
                  {data.avance.total ? <>Hay <b>{data.avance.pendientes}</b> solicitudes por atender. <a href="#solicitudes-gestion">Ir a gestión</a></> : 'Aún no hay solicitudes registradas.'}
                </p>
              </div>
              <div className="ad-target__foot">
                <div><span>Total</span><b>{data.avance.total}</b></div>
                <div><span>Resueltas</span><b>{data.avance.resueltas}</b></div>
                <div><span>Pendientes</span><b>{data.avance.pendientes}</b></div>
              </div>
            </div>

            <div className="ad-metrics ad-metrics--stack">
              <Metrica icono={Icono.cumple} etiqueta="Cumpleaños registrados" valor={m.cumpleanos.total} extra={`${m.cumpleanos.mes} cumplen este mes`} variacion={false} />
              <Metrica icono={Icono.usuarios} etiqueta="Usuarios con acceso" valor={m.usuarios.total} extra={`${m.usuarios.admins} administrador${m.usuarios.admins === 1 ? '' : 'es'}`} variacion={false} />
            </div>
          </div>

          <div className="ad-col12">
            <div className="ad-card">
              <div className="ad-card__head">
                <div>
                  <h3>Estadísticas</h3>
                  <p className="ad-muted">Reservas de salas por mes en los últimos 12 meses</p>
                </div>
              </div>
              <Area meses={data.meses} datos={data.reservasPorMes} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
