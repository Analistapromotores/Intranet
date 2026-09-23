/* Cliente de la API de cumpleaños (server/index.js). La sesión viaja en una cookie httpOnly. */

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No hay conexión con el servidor de la intranet.', 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || data === null) {
    throw new ApiError(data?.error || 'El servicio de cumpleaños no está disponible.', res.status, data?.fields)
  }
  return data
}

export const api = {
  cumpleanos: () => request('/birthdays'),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  yo: () => request('/auth/me'),
  cambiarClave: (current, next) => request('/auth/password', { method: 'PUT', body: { current, next } }),
  personas: () => request('/admin/people'),
  crear: (persona) => request('/admin/people', { method: 'POST', body: persona }),
  actualizar: (id, persona) => request(`/admin/people/${id}`, { method: 'PUT', body: persona }),
  publicar: (id, published) => request(`/admin/people/${id}/published`, { method: 'PATCH', body: { published } }),
  eliminar: (id) => request(`/admin/people/${id}`, { method: 'DELETE' }),
  importar: (rows) => request('/admin/import', { method: 'POST', body: { rows } }),
  deseos: (id) => request(`/birthdays/${id}/wishes`),
  felicitar: (id, datos = {}) => request(`/birthdays/${id}/wishes`, { method: 'POST', body: datos }),
  firmarDeseo: (id, wid, datos) => request(`/birthdays/${id}/wishes/${wid}`, { method: 'PATCH', body: datos }),
  deseosAdmin: (id) => request(`/admin/people/${id}/wishes`),
  borrarDeseo: (wid) => request(`/admin/wishes/${wid}`, { method: 'DELETE' }),
}

/* Recuerda en este navegador que ya felicitaste a alguien este año. */
const claveDeseo = (id) => `cb-deseo-${id}-${new Date().getFullYear()}`
export function deseoGuardado(id) {
  try {
    return JSON.parse(localStorage.getItem(claveDeseo(id)) || 'null')
  } catch {
    return null
  }
}
export function guardarDeseo(id, datos) {
  try {
    localStorage.setItem(claveDeseo(id), JSON.stringify(datos))
  } catch {
    /* almacenamiento no disponible */
  }
}

/* Redimensiona y recorta al centro la foto en el navegador: cuadrada, 480 px, WebP. */
export function prepararFoto(file, size = 480) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Usa una imagen JPG, PNG o WebP.'))
    if (file.size > 15 * 1024 * 1024) return reject(new Error('La imagen supera 15 MB.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 3, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/webp', 0.86))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    img.src = url
  })
}

/* CSV: nombre;fecha;cargo;area;publicar (separador ; o ,). Fecha DD/MM, DD/MM/AAAA o AAAA-MM-DD. */
export function leerCsv(texto) {
  const lineas = texto.replace(BOM, '').split(/\r?\n/).filter((l) => l.trim())
  if (lineas.length < 2) return []
  const sep = (lineas[0].match(/;/g) || []).length >= (lineas[0].match(/,/g) || []).length ? ';' : ','
  const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase()
  const cab = lineas[0].split(sep).map(norm)
  const col = (...nombres) => cab.findIndex((c) => nombres.includes(c))
  const iNombre = col('nombre', 'nombre completo', 'name')
  const iFecha = col('fecha', 'fecha de nacimiento', 'cumpleanos', 'nacimiento')
  const iCargo = col('cargo')
  const iArea = col('area', 'proyecto', 'area o proyecto')
  const iPub = col('publicar', 'publicado')
  return lineas.slice(1).map((l) => {
    const c = l.split(sep).map((v) => v.trim().replace(/^"|"$/g, ''))
    const f = c[iFecha] || ''
    let day, month, year
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(f)
    const lat = /^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?$/.exec(f)
    if (iso) [, year, month, day] = iso
    else if (lat) [, day, month, year] = lat
    return {
      name: c[iNombre] || '',
      day: Number(day),
      month: Number(month),
      year: year ? Number(year) : null,
      cargo: iCargo >= 0 ? c[iCargo] : '',
      area: iArea >= 0 ? c[iArea] : '',
      published: iPub >= 0 ? !/^(no|0|false)$/i.test(c[iPub] || '') : true,
    }
  })
}

const BOM = String.fromCharCode(0xfeff)

export const PLANTILLA_CSV = BOM + 'nombre;fecha;cargo;area;publicar\nAna María Pérez;14/03;Analista de talento humano;G&S;si\nCarlos Gómez;1990-07-22;Mediador de convivencia;Mediadores;si\n'
