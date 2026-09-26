import { useSyncExternalStore } from 'react'
import { request } from '../pages/cumpleanos/api.js'

/* Sesión del navegador: undefined mientras se comprueba, null sin sesión, o { username, name, role }.
   Una sola consulta compartida por todos los componentes; se repite al cambiar de vista
   (por si se inició o cerró sesión en otro punto). */
let actual
let pendiente = null
const oyentes = new Set()

export function refrescarSesion() {
  return comprobar()
}

function comprobar() {
  if (pendiente) return pendiente
  pendiente = request('/auth/me')
    .catch(() => null)
    .then((u) => {
      actual = u
      pendiente = null
      oyentes.forEach((fn) => fn())
    })
  return pendiente
}

if (typeof window !== 'undefined') window.addEventListener('hashchange', comprobar)

function suscribir(fn) {
  oyentes.add(fn)
  if (actual === undefined) comprobar()
  return () => oyentes.delete(fn)
}

export function useSession() {
  return useSyncExternalStore(suscribir, () => actual)
}
