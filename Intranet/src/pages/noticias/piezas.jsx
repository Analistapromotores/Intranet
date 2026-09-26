import { TIPO_TEXTO } from './api.js'

/* Piezas pequeñas compartidas del módulo de noticias. */

export function Etiqueta({ tipo }) {
  return <span className={`ui-badge ${tipo === 'comunicado' ? 'ui-badge--red' : ''}`}>{TIPO_TEXTO[tipo] || 'Noticia'}</span>
}

const g = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
export const IconGrip = (p) => <svg {...g} {...p}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>
export const IconArriba = (p) => <svg {...g} {...p}><path d="m6 15 6-6 6 6" /></svg>
export const IconAbajo = (p) => <svg {...g} {...p}><path d="m6 9 6 6 6-6" /></svg>
export const IconCopiar = (p) => <svg {...g} {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
export const IconTitulo = (p) => <svg {...g} {...p}><path d="M5 5v14M15 5v14M5 12h10M19 19v-6l-2 1" /></svg>
export const IconTexto = (p) => <svg {...g} {...p}><path d="M4 6h16M4 11h16M4 16h10" /></svg>
export const IconImagen = (p) => <svg {...g} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>
export const IconEnlace = (p) => <svg {...g} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
export const IconCita = (p) => <svg {...g} {...p}><path d="M7 7h4v5c0 2.5-1.500 4-4 4M15 7h4v5c0 2.500-1.500 4-4 4" /></svg>
export const IconVideo = (p) => <svg {...g} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10.500 9.500 4 2.500-4 2.500Z" /></svg>
export const IconSeparador = (p) => <svg {...g} {...p}><path d="M4 12h16" strokeDasharray="3 3" /></svg>
export const IconNegrita = (p) => <svg {...g} {...p}><path d="M7 5h6a3.500 3.500 0 0 1 0 7H7zM7 12h7a3.500 3.500 0 0 1 0 7H7z" /></svg>
export const IconCursiva = (p) => <svg {...g} {...p}><path d="M10 5h8M6 19h8M14 5 10 19" /></svg>
export const IconLista = (p) => <svg {...g} {...p}><path d="M9 6h11M9 12h11M9 18h11M4.500 6h.01M4.500 12h.01M4.500 18h.01" /></svg>
export const IconPin = (p) => <svg {...g} {...p}><path d="m14 4 6 6-3 1-3.500 3.500.5 4.500-1.500 1.500-3.500-3.500L4 20l4-5.500L4.500 11 6 9.500 10.500 10 14 6.500Z" /></svg>
export const IconMas = (p) => <svg {...g} {...p}><path d="M12 5v14M5 12h14" /></svg>
