import { createContext, useContext, useState } from 'react'
import { GOOGLE_HD } from './config.js'

const STORAGE_KEY = 'gys-user'
const AuthContext = createContext(null)

/* Decodifica el payload de un JWT (id_token de Google), soportando UTF-8. */
function decodeJwt(token) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(part)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(json)
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored)

  const persist = (u) => {
    setUser(u)
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* almacenamiento no disponible */
    }
  }

  /* Recibe el `credential` (JWT) del callback de Google Identity Services. */
  const signInWithCredential = (jwt) => {
    let p
    try {
      p = decodeJwt(jwt)
    } catch {
      return { ok: false, error: 'No se pudo leer la credencial de Google.' }
    }
    if (p.email_verified === false) {
      return { ok: false, error: 'El correo de Google no está verificado.' }
    }
    if (GOOGLE_HD && p.hd !== GOOGLE_HD) {
      return { ok: false, error: `Inicia sesión con tu cuenta corporativa @${GOOGLE_HD}.` }
    }
    persist({
      name: p.name || p.email,
      email: p.email,
      picture: p.picture || '',
      hd: p.hd || null,
    })
    return { ok: true }
  }

  /* Solo para desarrollo local (botón visible únicamente con import.meta.env.DEV). */
  const signInDev = () => {
    if (!import.meta.env.DEV) return
    persist({ name: 'Usuario de prueba', email: 'dev@local', picture: '', hd: null, dev: true })
  }

  const signOut = () => {
    persist(null)
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  return (
    <AuthContext.Provider value={{ user, signInWithCredential, signInDev, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
