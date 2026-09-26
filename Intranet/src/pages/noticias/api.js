/* Cliente de la API de noticias y redes (server/noticias/routes.js). */
import { request } from '../cumpleanos/api.js'

export const noticiasApi = {
  lista: (tipo, limit) => request(`/noticias?${new URLSearchParams({ ...(tipo ? { tipo } : {}), ...(limit ? { limit } : {}) })}`),
  una: (id) => request(`/noticias/${id}`),
  todasAdmin: () => request('/admin/noticias'),
  crear: (post) => request('/admin/noticias', { method: 'POST', body: post }),
  guardar: (id, post) => request(`/admin/noticias/${id}`, { method: 'PUT', body: post }),
  cambiar: (id, cambios) => request(`/admin/noticias/${id}`, { method: 'PATCH', body: cambios }),
  eliminar: (id) => request(`/admin/noticias/${id}`, { method: 'DELETE' }),
  redes: () => request('/redes'),
  guardarRedes: (items) => request('/admin/redes', { method: 'PUT', body: { items } }),
}

/* Prepara una imagen para publicarla sin deformarla ni recortarla.
   - Si ya es liviana (hasta ~3,5 MB) y de tamaño razonable, se sube TAL CUAL: mismo formato, mismas dimensiones.
   - Si es muy grande o larguísima (infografías), se reduce manteniendo la proporción: ancho máximo 1800 px y
     alto máximo 15.000 px (límite del formato WebP), con calidad alta para que el texto se lea bien.
   `recorte` (proporción ancho/alto) solo se usa para la portada, que sí se recorta al centro. */
const leerComoDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(r.result)
  r.onerror = () => reject(new Error('No se pudo leer la imagen.'))
  r.readAsDataURL(file)
})

export async function prepararImagen(file, { ancho = 1800, alto = 15000, calidad = 0.92, recorte } = {}) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Usa una imagen JPG, PNG o WebP.')
  if (file.size > 40 * 1024 * 1024) throw new Error('La imagen supera 40 MB.')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      i.src = url
    })
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (recorte) {
      if (sw / sh > recorte) { const w = sh * recorte; sx = (sw - w) / 2; sw = w } else { const h = sw / recorte; sy = (sh - h) / 3; sh = h }
    } else if (file.size <= 3.5 * 1024 * 1024 && sw <= 2400 && sh <= alto) {
      return await leerComoDataUrl(file)
    }
    const escala = Math.min(1, ancho / sw, alto / sh)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sw * escala))
    canvas.height = Math.max(1, Math.round(sh * escala))
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    const out = canvas.toDataURL('image/webp', calidad)
    if (!out.startsWith('data:image/webp')) throw new Error('La imagen es demasiado grande para procesarla. Reduce su tamaño e inténtalo de nuevo.')
    return out
  } finally {
    URL.revokeObjectURL(url)
  }
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export function fechaLarga(iso) {
  if (!iso) return 'Borrador'
  const d = new Date(iso)
  return `${d.getDate()} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][d.getMonth()]} de ${d.getFullYear()}`
}
export function fechaCorta(iso) {
  if (!iso) return 'Borrador'
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}
export function hace(iso) {
  if (!iso) return ''
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400e3)
  if (dias < 1) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} sem.`
  return fechaCorta(iso)
}

export const TIPO_TEXTO = { noticia: 'Noticia', comunicado: 'Comunicado' }
export const esGestor = (user) => Boolean(user && (['gestor', 'ti', 'admin'].includes(user.role)))
