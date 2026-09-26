/* Recursos del proyecto: se toman de src/assets/infraestructura/ (ver LEEME.txt).
   Al soltar archivos ahi, la vista los muestra sin editar codigo. Solo se leen los de esta carpeta
   (no las subcarpetas, donde quedan los originales pesados). */
const imagenes = import.meta.glob('../../assets/infraestructura/*.{png,jpg,jpeg,webp,svg}', { eager: true, import: 'default', query: '?url' })
const archivos = import.meta.glob('../../assets/infraestructura/*.{pdf,xlsx,xls,docx,doc,pptx,ppt}', { eager: true, import: 'default', query: '?url' })

const nombreBase = (ruta) => ruta.split('/').pop().replace(/\.[^.]+$/, '')
const ext = (ruta) => ruta.split('.').pop().toLowerCase()
const porNombre = (a, b) => a.ruta.localeCompare(b.ruta, 'es', { numeric: true })

const todas = Object.entries(imagenes).map(([ruta, src]) => ({ ruta, src, base: nombreBase(ruta) }))
const es = (re) => (i) => re.test(i.base)

export const PORTADA = todas.find(es(/^portada/i))?.src || null
export const LOGO = todas.find(es(/^logo/i))?.src || null
export const CASTOR_3D = Object.fromEntries(todas.filter(es(/^castor-3d-/i)).map((i) => [i.base.replace(/^castor-3d-/i, ''), i.src]))
export const CASTOR_STICKERS = todas.filter(es(/^castor-sticker-/i)).sort(porNombre)
export const GALERIA = todas.filter((i) => !/^(portada|logo|castor)/i.test(i.base)).sort(porNombre)

const TIPO = { pdf: 'PDF', xlsx: 'Excel', xls: 'Excel', docx: 'Word', doc: 'Word', pptx: 'PowerPoint', ppt: 'PowerPoint' }
export const DOCUMENTOS = Object.entries(archivos)
  .map(([ruta, href]) => ({
    ruta,
    href,
    tipo: TIPO[ext(ruta)],
    titulo: nombreBase(ruta).replace(/^\d+[\s._-]+/, '').replace(/[_-]+/g, ' ').trim(),
  }))
  .sort(porNombre)

/* ---------- Fotos, historias y video de obra ---------- */
const galeria = import.meta.glob('../../assets/infraestructura/galeria/*.webp', { eager: true, import: 'default', query: '?url' })
const historias = import.meta.glob('../../assets/infraestructura/historias/*.webp', { eager: true, import: 'default', query: '?url' })
/* Título de cada foto según su nombre de archivo (así, quitar o agregar fotos no descuadra los títulos). */
const TITULOS_FOTOS = [
  [/demolicion/i, 'Demolición del pavimento con retroexcavadora'],
  [/aerea/i, 'Vista aérea de la pavimentadora'],
  [/jornada-nocturna/i, 'Jornada nocturna de pavimentación'],
  [/retroexcavadora-de-noche/i, 'Retroexcavadora en jornada nocturna'],
  [/compactacion/i, 'Compactación de la carpeta asfáltica'],
]
export const FOTOS = Object.entries(galeria)
  .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
  .map(([ruta, src]) => ({ ruta, src, base: nombreBase(ruta), titulo: TITULOS_FOTOS.find(([re]) => re.test(ruta))?.[1] || 'Obra de recuperación vial' }))
export const HISTORIAS = Object.entries(historias)
  .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
  .map(([ruta, src], i) => ({ ruta, src, titulo: ['Infraestructura que transforma', 'Seguimos construyendo ciudad', 'Así se recupera Cali'][i] || 'Historia de obra' }))
/* Videos propios (MP4 optimizados en public/media/infraestructura). */
const MEDIA = `${import.meta.env.BASE_URL}media/infraestructura/`
export const VIDEO_DRON = { hero: `${MEDIA}dron-hero.mp4`, completo: `${MEDIA}dron.mp4`, poster: `${MEDIA}dron.jpg` }
