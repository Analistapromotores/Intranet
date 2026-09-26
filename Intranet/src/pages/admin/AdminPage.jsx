import { useEffect } from 'react'
import { useSession } from '../../lib/useSession.js'
import AccesosRoles from './AccesosRoles.jsx'
import './admin.css'
import './accesos.css'

/* Administración (rol "admin"): control de accesos y roles. */
export default function AdminPage() {
  const user = useSession()

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [])

  if (user === undefined) {
    return <div className="ad"><main className="ad-main"><p className="ad-muted">Comprobando permisos…</p></main></div>
  }
  if (!user || user.role !== 'admin') {
    return (
      <div className="ad">
        <main className="ad-main">
          <div className="ad-card ad-empty">
            <h1>Control de accesos y roles</h1>
            <p>{user ? 'Esta sección es solo para administradores.' : 'Inicia sesión con un usuario administrador desde el botón «Iniciar sesión» del menú.'}</p>
            <a className="ad-btn" href="#inicio">Volver al inicio</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="ad">
      <main className="ad-main">
        <h1 className="ad-title">Control de accesos y roles</h1>
        <p className="ad-muted ad-lead">Crea usuarios, asigna su rol y restablece contraseñas. Los roles son Gestor, TI y Administrador.</p>
        <AccesosRoles yo={user} />
      </main>
    </div>
  )
}
