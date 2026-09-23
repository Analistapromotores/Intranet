import { useCallback, useEffect, useMemo, useState } from 'react'
import { advertencias, validar } from '../../../shared/solicitudes.js'

/* Rutas tipo "beneficios.0.valor" para leer y escribir datos anidados. */
export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}
export function setPath(obj, path, value) {
  const [k, ...rest] = path.split('.')
  const base = Array.isArray(obj) ? [...obj] : { ...obj }
  base[k] = rest.length ? setPath(obj?.[k] ?? (/^\d+$/.test(rest[0]) ? [] : {}), rest.join('.'), value) : value
  return base
}
export const fieldId = (path) => `f-${path.replace(/\./g, '-')}`

/* Errores que pertenecen a un conjunto de campos (acepta prefijos: "beneficios" cubre "beneficios.0.valor"). */
export function erroresDe(errores, campos) {
  return Object.entries(errores).filter(([k]) => campos.some((c) => k === c || k.startsWith(`${c}.`)))
}

function leerBorrador(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave) || 'null')
  } catch {
    return null
  }
}

/* Estado del formulario con validación en vivo y borrador automático en este navegador. */
export function useSolicitudForm(tipo, inicial, claveBorrador) {
  const [borrador] = useState(() => leerBorrador(claveBorrador))
  const [datos, setDatos] = useState(() => (borrador?.datos ? { ...inicial, ...borrador.datos } : inicial))
  const [tocados, setTocados] = useState({})
  const [guardado, setGuardado] = useState(borrador?.fecha || null)
  const errores = useMemo(() => validar(tipo, datos), [tipo, datos])
  const avisos = useMemo(() => advertencias(tipo, datos), [tipo, datos])

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const fecha = new Date().toISOString()
        localStorage.setItem(claveBorrador, JSON.stringify({ datos, fecha }))
        setGuardado(fecha)
      } catch {
        /* sin almacenamiento: el borrador no se conserva */
      }
    }, 700)
    return () => clearTimeout(t)
  }, [datos, claveBorrador])

  const set = useCallback((path, value) => setDatos((d) => setPath(d, path, value)), [])
  const tocar = useCallback((path) => setTocados((t) => (t[path] ? t : { ...t, [path]: true })), [])
  const tocarVarios = useCallback((paths) => setTocados((t) => ({ ...t, ...Object.fromEntries(paths.map((p) => [p, true])) })), [])
  const error = useCallback((path) => (tocados[path] ? errores[path] : undefined), [tocados, errores])

  const descartar = useCallback(() => {
    try {
      localStorage.removeItem(claveBorrador)
    } catch {
      /* nada que borrar */
    }
    setDatos(inicial)
    setTocados({})
    setGuardado(null)
  }, [claveBorrador, inicial])

  const limpiarBorrador = useCallback(() => {
    try {
      localStorage.removeItem(claveBorrador)
    } catch {
      /* nada que borrar */
    }
  }, [claveBorrador])

  return { tipo, datos, set, tocar, tocarVarios, error, errores, avisos, guardado, descartar, limpiarBorrador, teniaBorrador: Boolean(borrador) }
}

/* Historial local: números de solicitud enviados desde este navegador, para consultarlos luego. */
const CLAVE_MIAS = 'gys-solicitudes-mias'
export function misSolicitudes() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_MIAS) || '[]')
  } catch {
    return []
  }
}
export function recordarSolicitud(numero, correo) {
  try {
    const lista = misSolicitudes().filter((s) => s.numero !== numero)
    localStorage.setItem(CLAVE_MIAS, JSON.stringify([{ numero, correo }, ...lista].slice(0, 50)))
  } catch {
    /* sin almacenamiento */
  }
}
