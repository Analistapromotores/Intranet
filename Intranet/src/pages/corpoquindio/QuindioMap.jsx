import { useState } from 'react'
import { QUINDIO_MUNICIPIOS, QUINDIO_VIEWBOX } from './quindioGeo.js'

/* Mapa del Quindío con los límites municipales reales, extruido en 3D.
   El relieve se simula con una cara inferior desplazada (la "pared") y la cara
   superior encima; el municipio activo se eleva e ilumina. */

const DEPTH = 16 // grosor de la extrusión, en unidades del viewBox
const LIFT = 12 // cuánto se eleva el municipio activo

/* Tonos cálidos para diferenciar municipios vecinos sin romper la paleta. */
const TONOS = ['#f4ecdf', '#e9dcc7', '#f0e4d2', '#e2d2b8', '#f6f0e5', '#ddcbaf']

export default function QuindioMap() {
  const [activo, setActivo] = useState('armenia')
  const actual = QUINDIO_MUNICIPIOS.find((m) => m.id === activo) ?? QUINDIO_MUNICIPIOS[0]

  return (
    <div className="qe-map">
      <div className="qe-map__stage">
        <svg
          className="qe-map__svg"
          viewBox={`0 0 ${QUINDIO_VIEWBOX.w} ${QUINDIO_VIEWBOX.h + DEPTH + LIFT}`}
          role="img"
          aria-label="Mapa del departamento del Quindío con sus 12 municipios"
        >
          <defs>
            <linearGradient id="qe-top" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#f7f1e7" />
              <stop offset="100%" stopColor="#dcc9ac" />
            </linearGradient>
            <linearGradient id="qe-top-on" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#f6b98d" />
              <stop offset="55%" stopColor="#db9066" />
              <stop offset="100%" stopColor="#b96f45" />
            </linearGradient>
            <filter id="qe-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#b96f45" floodOpacity="0.5" />
            </filter>
            <filter id="qe-ground" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#203139" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* El grupo se inclina para dar la perspectiva del terreno */}
          <g className="qe-map__tilt" filter="url(#qe-ground)">
            {QUINDIO_MUNICIPIOS.map((m, i) => {
              const on = m.id === activo
              const lift = on ? LIFT : 0
              return (
                <g
                  key={m.id}
                  className={`qe-mun ${on ? 'is-on' : ''}`}
                  onMouseEnter={() => setActivo(m.id)}
                  onFocus={() => setActivo(m.id)}
                  onClick={() => setActivo(m.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={on}
                  aria-label={m.name}
                  style={{ '--tono': TONOS[i % TONOS.length] }}
                >
                  {/* pared lateral (extrusión) */}
                  <path
                    className="qe-mun__wall"
                    d={m.d}
                    transform={`translate(0 ${DEPTH - lift})`}
                  />
                  {/* cara superior */}
                  <path
                    className="qe-mun__top"
                    d={m.d}
                    transform={`translate(0 ${-lift})`}
                    filter={on ? 'url(#qe-glow)' : undefined}
                  />
                  {m.capital && (
                    <circle
                      className="qe-mun__cap"
                      cx={m.cx}
                      cy={m.cy - lift}
                      r="5.5"
                    />
                  )}
                </g>
              )
            })}
          </g>
        </svg>

        <p className="qe-map__note">Límites municipales oficiales · 12 municipios</p>
      </div>

      <div className="qe-map__side">
        <p className="qe-map__eyebrow">Cobertura territorial</p>
        <p className="qe-map__active">{actual.name}</p>
        <p className="qe-map__role">
          {actual.capital ? 'Capital del departamento' : 'Municipio del Quindío'}
        </p>
        <ul className="qe-map__list">
          {[...QUINDIO_MUNICIPIOS]
            .sort((a, b) => a.name.localeCompare(b.name, 'es'))
            .map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`qe-chip ${m.id === activo ? 'is-on' : ''}`}
                  onMouseEnter={() => setActivo(m.id)}
                  onFocus={() => setActivo(m.id)}
                  onClick={() => setActivo(m.id)}
                  aria-pressed={m.id === activo}
                >
                  {m.name}
                  {m.capital && <span className="qe-chip__cap">capital</span>}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
