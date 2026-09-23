/* Decoración festiva en SVG + CSS: globos, serpentinas y confeti.
   Todo es decorativo (aria-hidden) y se congela con prefers-reduced-motion. */

const COLORES = ['#e51d2a', '#1769e8', '#ffb020', '#23b5d3', '#ff7a45', '#7c5cff']

/* Pseudoaleatorio estable: el confeti no cambia entre renders. */
function rand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function Globo({ color, x, delay, size, sway }) {
  return (
    <span className="cb-balloon" style={{ '--x': `${x}%`, '--delay': `${delay}s`, '--size': `${size}px`, '--sway': `${sway}s` }}>
      <svg viewBox="0 0 60 120" width={size} height={size * 2}>
        <defs>
          <radialGradient id={`g-${color.slice(1)}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity=".75" />
            <stop offset="28%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity=".92" />
          </radialGradient>
        </defs>
        <ellipse cx="30" cy="30" rx="24" ry="29" fill={`url(#g-${color.slice(1)})`} />
        <path d="M26 58 L30 64 L34 58 Z" fill={color} />
        <path d="M30 64 C 24 78, 36 88, 28 100 S 32 114, 30 120" fill="none" stroke="#8aa0bd" strokeWidth="1.2" />
      </svg>
    </span>
  )
}

export function Globos() {
  const globos = [
    { color: COLORES[0], x: 4, delay: 0, size: 54, sway: 6 },
    { color: COLORES[2], x: 13, delay: 1.2, size: 42, sway: 7 },
    { color: COLORES[1], x: 80, delay: 0.6, size: 58, sway: 6.5 },
    { color: COLORES[3], x: 90, delay: 1.8, size: 44, sway: 7.5 },
    { color: COLORES[4], x: 70, delay: 2.4, size: 36, sway: 5.5 },
  ]
  return (
    <div className="cb-balloons" aria-hidden="true">
      {globos.map((g) => <Globo key={g.x} {...g} />)}
    </div>
  )
}

export function Serpentinas() {
  return (
    <svg className="cb-streamers" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
      <path className="cb-streamer" d="M0 18 C 100 70, 200 -10, 300 40 S 500 90, 600 30 S 800 -10, 900 45 S 1100 80, 1200 20" stroke="#ffb020" />
      <path className="cb-streamer cb-streamer--2" d="M0 50 C 120 0, 240 90, 360 44 S 600 0, 720 60 S 960 100, 1080 38 S 1180 20, 1200 50" stroke="#e51d2a" />
      <path className="cb-streamer cb-streamer--3" d="M0 30 C 150 90, 260 20, 420 60 S 700 110, 820 40 S 1050 0, 1200 70" stroke="#23b5d3" />
      {/* banderines */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = 30 + i * 75
        return <path key={x} className="cb-flag" d={`M${x} 6 l24 0 l-12 26 Z`} fill={COLORES[i % COLORES.length]} style={{ '--i': i }} />
      })}
    </svg>
  )
}

/* Lluvia de confeti; `rafaga` cambia la key para relanzarla. */
export function Confeti({ piezas = 70, rafaga = 0 }) {
  return (
    <div className="cb-confetti" aria-hidden="true" key={rafaga}>
      {Array.from({ length: piezas }, (_, i) => {
        const r = rand(i + 1)
        const r2 = rand(i + 101)
        const r3 = rand(i + 201)
        return (
          <i
            key={i}
            className={`cb-piece ${i % 3 === 0 ? 'cb-piece--round' : ''}`}
            style={{
              '--x': `${r * 100}%`,
              '--delay': `${r2 * 2.8}s`,
              '--dur': `${3.2 + r3 * 2.6}s`,
              '--drift': `${(r2 - 0.5) * 160}px`,
              '--spin': `${360 + r3 * 720}deg`,
              background: COLORES[i % COLORES.length],
            }}
          />
        )
      })}
    </div>
  )
}
