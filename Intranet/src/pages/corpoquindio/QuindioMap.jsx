import { useState } from 'react'
import { MUNICIPIOS } from './data.js'

/* Silueta estilizada del Quindío (no es un mapa a escala).
   Los 12 marcadores conservan la posición relativa real de cada cabecera. */
const SILUETA =
  'M160 32C192 34 218 42 238 58C260 76 280 96 276 122C272 150 266 158 262 182C258 208 246 220 232 242C216 266 210 280 196 302C180 328 156 352 132 374C116 388 100 400 80 396C60 390 52 372 50 352C46 330 46 318 44 296C42 272 40 246 40 220C40 192 46 164 52 140C58 114 66 86 86 66C104 48 132 30 160 32Z'

export default function QuindioMap() {
  const [activo, setActivo] = useState('Armenia')

  return (
    <div className="qe-map">
      <div className="qe-map__canvas">
        <svg viewBox="0 0 320 420" role="img" aria-label="Mapa estilizado del departamento del Quindío con sus 12 municipios">
          <defs>
            <pattern id="qe-map-tex" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M2 11V3h7v5h-4V6" fill="none" stroke="var(--qe-beige)" strokeWidth="1" opacity=".55" />
            </pattern>
          </defs>

          <path d={SILUETA} fill="var(--qe-cream)" />
          <path d={SILUETA} fill="url(#qe-map-tex)" />
          <path d={SILUETA} fill="none" stroke="var(--qe-slate)" strokeWidth="2.5" strokeLinejoin="round" />

          {MUNICIPIOS.map((m) => {
            const on = m.name === activo
            return (
              <g
                key={m.name}
                className={`qe-map__pin ${on ? 'is-on' : ''}`}
                onMouseEnter={() => setActivo(m.name)}
                onFocus={() => setActivo(m.name)}
              >
                <circle cx={m.x} cy={m.y} r="13" fill="transparent" />
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={on ? 7.5 : m.capital ? 6 : 4.5}
                  fill={on ? 'var(--qe-terracota)' : m.capital ? 'var(--qe-cafe)' : 'var(--qe-slate)'}
                  stroke="#fff"
                  strokeWidth="2"
                />
              </g>
            )
          })}
        </svg>
        <p className="qe-map__note">Representación estilizada, no a escala.</p>
      </div>

      <div className="qe-map__side">
        <p className="qe-map__eyebrow">Los 12 municipios</p>
        <p className="qe-map__active">{activo}</p>
        <ul className="qe-map__list">
          {MUNICIPIOS.map((m) => (
            <li key={m.name}>
              <button
                type="button"
                className={`qe-chip ${m.name === activo ? 'is-on' : ''}`}
                onMouseEnter={() => setActivo(m.name)}
                onFocus={() => setActivo(m.name)}
                onClick={() => setActivo(m.name)}
                aria-pressed={m.name === activo}
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
