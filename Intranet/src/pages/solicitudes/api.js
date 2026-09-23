/* Cliente de la API de Solicitudes (server/solicitudes/routes.js). */

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
    throw new ApiError('No hay conexión con el servidor de la intranet. Revisa tu conexión e inténtalo de nuevo.', 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || data === null) throw new ApiError(data?.error || 'El servicio no está disponible en este momento.', res.status, data?.fields)
  return data
}

let configCache = null
export const api = {
  config: () => (configCache ||= request('/solicitudes/config').catch((e) => { configCache = null; throw e })),
  enviar: (tipo, datos) => request(`/solicitudes/${tipo}`, { method: 'POST', body: datos }),
  consultar: (numero, correo) => request(`/solicitudes/consulta?numero=${encodeURIComponent(numero)}&correo=${encodeURIComponent(correo)}`),
  mias: (correo, numeros) => request(`/solicitudes/mias?correo=${encodeURIComponent(correo)}&numeros=${encodeURIComponent(numeros.join(','))}`),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  yo: () => request('/auth/me'),
  todas: () => request('/admin/solicitudes'),
  cambiarEstado: (id, estado, comentario) => request(`/admin/solicitudes/${id}/estado`, { method: 'PATCH', body: { estado, comentario } }),
  reenviar: (id) => request(`/admin/solicitudes/${id}/reenviar`, { method: 'POST' }),
  archivoUrl: (id) => `/api/admin/solicitudes/${id}/archivo`,
}
