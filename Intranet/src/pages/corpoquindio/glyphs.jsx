import { useId } from 'react'

/* Glifos Quimbaya — reinterpretación minimalista de los patrones del manual de
   marca de Quindío Emprendedor. Cada glifo representa un sector productivo.
   Trazo geométrico, `currentColor`, viewBox 48x48. */

const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  focusable: 'false',
  'aria-hidden': 'true',
}

/* Artesanía — tejido / cestería */
export function GlyphArtesania(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="7" width="34" height="34" />
      <path d="M7 21 21 7M7 33 33 7M15 41 41 15M27 41 41 27" />
      <path d="M7 27 27 7M7 15 15 7M21 41 41 21M33 41 41 33" opacity=".55" />
    </svg>
  )
}

/* Periodistas e influencers — grecas / comunicación */
export function GlyphComunicacion(props) {
  return (
    <svg {...base} {...props}>
      <g strokeWidth="2.2">
        <path d="M9 21V9h12v7h-7v-3" />
        <path d="M39 21V9H27v7h7v-3" />
        <path d="M9 27v12h12v-7h-7v3" />
        <path d="M39 27v12H27v-7h7v3" />
      </g>
    </svg>
  )
}

/* Papelería — pliegos y renglones */
export function GlyphPapeleria(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 12h20M8 20h14M8 28h20M8 36h12" />
      <path d="M32 10v12M38 14v12M32 30v8" opacity=".7" />
      <path d="M26 34h14" opacity=".7" />
    </svg>
  )
}

/* Marroquinería — espiral cuadrada quimbaya */
export function GlyphMarroquineria(props) {
  return (
    <svg {...base} {...props}>
      <path d="M26 24v-4h-6v10h12V16H14v20h20V10H9" />
    </svg>
  )
}

/* Confección y moda — chevrones escalonados */
export function GlyphConfeccion(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 22 14 10l8 12M26 22l8-12 8 12" />
      <path d="M11 22 14 18l3 4M31 22l3-4 3 4" opacity=".6" />
      <path d="M6 40 14 28l8 12M26 40l8-12 8 12" />
    </svg>
  )
}

/* Cafetería — hojas de café */
export function GlyphCafe(props) {
  return (
    <svg {...base} {...props} strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 42V24" />
      <path d="M24 26c-9-1-13-7-13-15 8-1 13 4 13 12" />
      <path d="M24 26c9-1 13-7 13-15-8-1-13 4-13 12" />
      <path d="M24 38c-6-1-9-5-9-11M24 38c6-1 9-5 9-11" opacity=".55" />
    </svg>
  )
}

/* Tecnología — ondas angulares */
export function GlyphTecnologia(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 30l11-9 7 6 16-13" />
      <path d="M7 39l11-9 7 6 16-13" opacity=".55" />
      <path d="M34 14h7v7" />
    </svg>
  )
}

/* Complementario para sectores sin glifo propio en el manual */
export function GlyphCelular(props) {
  return (
    <svg {...base} {...props}>
      <rect x="16" y="6" width="16" height="36" />
      <path d="M21 11h6M21 37h6" opacity=".7" />
      <path d="M8 18l-3 6 3 6M40 18l3 6-3 6" opacity=".55" />
    </svg>
  )
}

/* Cenefa quimbaya para separar secciones (greca continua repetible) */
export function Cenefa({ className = '', tone = 'currentColor' }) {
  const id = useId().replace(/[:]/g, '')
  return (
    <svg className={className} width="100%" height="16" role="presentation" aria-hidden="true">
      <defs>
        <pattern id={id} width="24" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M0 12H6V4H18V12H24"
            fill="none"
            stroke={tone}
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  )
}

/* Marca de sección: pequeño rombo escalonado */
export function GlyphMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M12 3l9 9-9 9-9-9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path d="M12 9l3 3-3 3-3-3z" fill="currentColor" />
    </svg>
  )
}
