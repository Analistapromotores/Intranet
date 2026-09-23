import { useEffect, useState } from 'react'
import { PageHeader } from '../solicitudes/ui.jsx'
import { IconLock, IconShield } from '../solicitudes/icons.jsx'
import '../solicitudes/solicitudes.css'
import '../solicitudes/brand.css'

/* Panel de administración (rol "admin"). Por ahora la vista está en blanco:
   el servidor ya valida el rol en /api/admin/panel y aquí se irán agregando módulos. */
export default function AdminPage() {
  const [estado, setEstado] = useState({ tipo: 'cargando' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    fetch('/api/admin/panel', { credentials: 'same-origin' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (r.ok) return setEstado({ tipo: 'ok', user: data.user })
        setEstado({ tipo: r.status === 403 ? 'prohibido' : 'sin-sesion', error: data.error })
      })
      .catch(() => setEstado({ tipo: 'error' }))
  }, [])

  return (
    <div className="sv">
      <PageHeader eyebrow="Rol administrador" title="Administración" lead="Espacio reservado para la administración de la intranet." icon={IconShield} />
      <div className="sv-wrap sv-page">
        {estado.tipo === 'cargando' && <p className="sv-loading">Comprobando permisos…</p>}

        {estado.tipo === 'ok' && (
          <section className="sv-empty" aria-label="Panel de administración">
            <IconShield width={32} height={32} />
            <p><b>Hola, {estado.user?.name || estado.user?.username}.</b> Esta vista está en construcción.</p>
            <p className="sv-muted">Aquí aparecerán las herramientas de administración.</p>
          </section>
        )}

        {(estado.tipo === 'sin-sesion' || estado.tipo === 'prohibido' || estado.tipo === 'error') && (
          <section className="sv-empty" aria-live="polite">
            <IconLock width={32} height={32} />
            <p>
              {estado.tipo === 'prohibido'
                ? 'Esta sección es solo para administradores.'
                : estado.tipo === 'error'
                  ? 'No hay conexión con el servidor de la intranet.'
                  : 'Inicia sesión con un usuario administrador desde el botón «Iniciar sesión» del menú.'}
            </p>
            <a className="sv-btn sv-btn--ghost" href="#inicio">Volver al inicio</a>
          </section>
        )}
      </div>
    </div>
  )
}
