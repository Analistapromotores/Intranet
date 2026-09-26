import '../../components/ui.css'
import '../../components/estados.css'

/* Página 404: el enlace no corresponde a ninguna sección. Ofrece volver al inicio y las secciones más usadas. */
export default function NotFound() {
  return (
    <main className="estado" id="contenido">
      <div className="estado__card">
        <p className="estado__codigo" aria-hidden="true">404</p>
        <h1>Esta página no existe</h1>
        <p>El enlace que abriste no corresponde a ninguna sección de la intranet. Pudo cambiar de lugar o estar mal escrito.</p>
        <div className="estado__acciones">
          <a className="ui-btn" href="#inicio">Volver al inicio</a>
        </div>
        <nav className="estado__enlaces" aria-label="Secciones frecuentes">
          <a href="#solicitudes">Solicitudes</a>
          <a href="#noticias">Noticias y comunicados</a>
          <a href="#cumpleanos">Cumpleaños</a>
          <a href="#extensiones">Extensiones</a>
        </nav>
      </div>
    </main>
  )
}
