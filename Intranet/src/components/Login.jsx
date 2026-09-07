import { useEffect, useRef, useState } from 'react'
import gysLogo from '../assets/gys_logo.png'
import { GOOGLE_CLIENT_ID } from '../config.js'
import { useAuth } from '../auth.jsx'

const GSI_SRC = 'https://accounts.google.com/gsi/client'

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    let s = document.querySelector(`script[src="${GSI_SRC}"]`)
    if (!s) {
      s = document.createElement('script')
      s.src = GSI_SRC
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('No se pudo cargar el inicio de sesión de Google.')))
  })
}

export default function Login() {
  const { signInWithCredential, signInDev } = useAuth()
  const btnRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGsi()
      .then(() => {
        if (cancelled || !btnRef.current) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          callback: (resp) => {
            const r = signInWithCredential(resp.credential)
            if (!r.ok) setError(r.error)
          },
        })
        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          locale: 'es',
          width: 300,
        })
      })
      .catch((e) => setError(e.message))

    return () => {
      cancelled = true
    }
  }, [signInWithCredential])

  return (
    <div className="login">
      <div className="login__card">
        <img className="login__logo" src={gysLogo} alt="Gestión y Servicios" />
        <p className="login__brand">Intranet</p>
        <h1 className="login__title">Bienvenido</h1>
        <p className="login__text">
          Inicia sesión con tu cuenta de Google para continuar.
        </p>

        {GOOGLE_CLIENT_ID ? (
          <div className="login__gbtn" ref={btnRef} />
        ) : (
          <p className="login__warn">
            Falta configurar <code>VITE_GOOGLE_CLIENT_ID</code>. Revisa el archivo
            <code>.env.example</code>.
          </p>
        )}

        {error && <p className="login__error">{error}</p>}

        {import.meta.env.DEV && (
          <button type="button" className="login__dev" onClick={signInDev}>
            Entrar sin cuenta (solo desarrollo)
          </button>
        )}
      </div>

      <p className="login__foot">Gestión y Servicios · Apoyo en talento humano</p>
    </div>
  )
}
