import { Component } from 'react'
import './ui.css'
import './estados.css'

/* Si algo falla al dibujar una pantalla, se muestra este aviso en lugar de una página en blanco.
   El detalle técnico va a la consola; el usuario nunca ve trazas ni rutas internas. */
export default class ErrorBoundary extends Component {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error, info) {
    /* Tras publicar una versión nueva, un navegador con la anterior abierta no encuentra los archivos viejos:
       se recarga una vez para descargar los nuevos. */
    if (/dynamically imported module|Importing a module script failed|Loading chunk/i.test(String(error?.message))) {
      try {
        const ultima = Number(sessionStorage.getItem('gys-recarga') || 0)
        if (Date.now() - ultima > 60_000) {
          sessionStorage.setItem('gys-recarga', String(Date.now()))
          window.location.reload()
          return
        }
      } catch { /* sin almacenamiento */ }
    }
    console.error('[intranet] error al mostrar la pantalla:', error, info?.componentStack)
  }

  render() {
    if (!this.state.fallo) return this.props.children
    return (
      <div className="estado" role="alert">
        <div className="estado__card">
          <h1>Algo salió mal en esta sección</h1>
          <p>No pudimos mostrar la pantalla. Puedes intentarlo de nuevo o volver al inicio; si el problema continúa, avisa al equipo de TI.</p>
          <div className="estado__acciones">
            <button type="button" className="ui-btn" onClick={() => this.setState({ fallo: false })}>Intentar de nuevo</button>
            <a className="ui-btn ui-btn--ghost" href="#inicio" onClick={() => this.setState({ fallo: false })}>Volver al inicio</a>
          </div>
        </div>
      </div>
    )
  }
}
