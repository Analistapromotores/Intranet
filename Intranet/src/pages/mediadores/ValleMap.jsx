import { useRef, useState } from 'react'
import { VALLE_MUNICIPIOS, VALLE_VIEWBOX } from './valleGeo.js'

/* Mapa del Valle del Cauca con los límites municipales reales, extruido en 3D.
   El relieve se simula con una cara inferior desplazada (la "pared") y la cara
   superior encima; el municipio bajo el cursor se eleva y se pinta azul claro. */

const DEPTH = 12 // grosor de la extrusión, en unidades del viewBox
const LIFT = 14 // cuánto se eleva el municipio activo
const ZONAS = ['1', '2', '3', '4', '5', '6', '7', '8']

/* Tonos fríos y suaves para diferenciar las zonas sin competir con el resaltado. */
const TONOS = { 1: '#eef4f8', 2: '#e2ecf3', 3: '#f6f9fb', 4: '#e8eff5', 5: '#dde8f0', 6: '#f1f6f9', 7: '#e5edf3', 8: '#eaf1f6' }

const etiquetaZona = (m) => (m.subzona === m.zona ? `Zona ${m.zona}` : `Zona ${m.zona} · subzona ${m.subzona}`)

export default function ValleMap() {
  const stageRef = useRef(null)
  const [activo, setActivo] = useState('cali')
  const [hover, setHover] = useState(null)
  const [tip, setTip] = useState(null)
  const actual = VALLE_MUNICIPIOS.find((m) => m.id === activo) ?? VALLE_MUNICIPIOS[0]
  const vecinos = VALLE_MUNICIPIOS.filter((m) => m.zona === actual.zona).sort((a, b) => a.name.localeCompare(b.name, 'es'))

  /* El municipio elevado se dibuja al final para que su cara superior quede encima de sus vecinos. */
  const orden = [...VALLE_MUNICIPIOS.filter((m) => m.id !== hover), ...VALLE_MUNICIPIOS.filter((m) => m.id === hover)]

  const mover = (e) => {
    const box = stageRef.current?.getBoundingClientRect()
    if (box) setTip({ x: e.clientX - box.left, y: e.clientY - box.top })
  }
  const entrar = (m) => { setHover(m.id); setActivo(m.id) }
  const salir = () => { setHover(null); setTip(null) }
  const elegirZona = (z) => setActivo(VALLE_MUNICIPIOS.filter((m) => m.zona === z).sort((a, b) => a.cy - b.cy)[0].id)
  const enHover = VALLE_MUNICIPIOS.find((m) => m.id === hover)

  return (
    <div className="vm">
      <div className="vm__stage" ref={stageRef} onMouseLeave={salir}>
        <svg
          className="vm__svg"
          viewBox={`-30 ${-LIFT - 20} ${VALLE_VIEWBOX.w + 60} ${VALLE_VIEWBOX.h + DEPTH + LIFT + 20}`}
          role="img"
          aria-label="Mapa del Valle del Cauca con sus 42 municipios organizados en ocho zonas"
        >
          <defs>
            <linearGradient id="vm-top-on" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#d6f0fa" />
              <stop offset="60%" stopColor="#a7d8ec" />
              <stop offset="100%" stopColor="#7cc1de" />
            </linearGradient>
            <filter id="vm-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#15123e" floodOpacity="0.35" />
            </filter>
            <filter id="vm-ground" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#15123e" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* El grupo se inclina para dar la perspectiva del terreno */}
          <g className="vm__tilt" filter="url(#vm-ground)">
            {orden.map((m) => {
              const on = m.id === hover
              const zona = m.zona === actual.zona
              const lift = on ? LIFT : 0
              return (
                <g
                  key={m.id}
                  className={`vm-mun ${on ? 'is-on' : ''} ${zona ? 'is-zone' : ''}`}
                  onMouseEnter={() => entrar(m)}
                  onMouseMove={mover}
                  onFocus={() => setActivo(m.id)}
                  onClick={(e) => { entrar(m); mover(e) }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={m.id === activo}
                  aria-label={`${m.name}, ${etiquetaZona(m)}`}
                  style={{ '--tono': TONOS[m.zona] }}
                >
                  <path className="vm-mun__wall" d={m.d} transform={`translate(0 ${DEPTH - lift})`} />
                  <path
                    className="vm-mun__top"
                    d={m.d}
                    transform={`translate(0 ${-lift})`}
                    filter={on ? 'url(#vm-glow)' : undefined}
                  />
                  {m.capital && <circle className="vm-mun__cap" cx={m.cx} cy={m.cy - lift} r="5" />}
                </g>
              )
            })}
          </g>
        </svg>

        {enHover && tip && (
          <div className="vm__tip" style={{ left: tip.x, top: tip.y }} role="status">
            <b>{enHover.name}</b>
            <span>{etiquetaZona(enHover)}</span>
          </div>
        )}

        <p className="vm__note">Límites municipales oficiales · 42 municipios · 8 zonas</p>
      </div>

      <aside className="vm__side">
        <span className="vm__eyebrow">Municipio</span>
        <h3 className="vm__active">{actual.name}</h3>
        <p className="vm__zone">{etiquetaZona(actual)}{actual.capital && ' · Capital del departamento'}</p>

        <span className="vm__eyebrow">Municipios de la zona {actual.zona}</span>
        <ul className="vm__list">
          {vecinos.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`vm-chip ${m.id === activo ? 'is-on' : ''}`}
                onMouseEnter={() => setActivo(m.id)}
                onFocus={() => setActivo(m.id)}
                onClick={() => setActivo(m.id)}
                aria-pressed={m.id === activo}
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>

        <span className="vm__eyebrow">Zonas</span>
        <div className="vm__zones">
          {ZONAS.map((z) => (
            <button
              key={z}
              type="button"
              className={`vm-zone ${z === actual.zona ? 'is-on' : ''}`}
              onClick={() => elegirZona(z)}
              aria-pressed={z === actual.zona}
            >
              {z}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
