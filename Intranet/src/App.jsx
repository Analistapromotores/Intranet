import { Suspense, lazy, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import QuickAccess from './components/QuickAccess.jsx'
import ProjectsSection from './components/ProjectsSection.jsx'
import NewsCard from './components/NewsCard.jsx'
import CorporateCalendar from './components/CorporateCalendar.jsx'
import HelpCard from './components/HelpCard.jsx'
import BirthdayCard from './components/BirthdayCard.jsx'
import Comunicados from './components/Comunicados.jsx'
import SocialSection from './components/SocialSection.jsx'
import NotFound from './pages/estados/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './App.css'

/* Cada sección se descarga solo cuando se abre: la portada carga mucho más rápido. */
const CorpoquindioPage = lazy(() => import('./pages/corpoquindio/CorpoquindioPage.jsx'))
const PromotoresPage = lazy(() => import('./pages/promotores/PromotoresPage.jsx'))
const GysPage = lazy(() => import('./pages/gys/GysPage.jsx'))
const MediadoresPage = lazy(() => import('./pages/mediadores/MediadoresPage.jsx'))
const CumpleanosPage = lazy(() => import('./pages/cumpleanos/CumpleanosPage.jsx'))
const GestorPage = lazy(() => import('./pages/cumpleanos/GestorPage.jsx'))
const SolicitudesPage = lazy(() => import('./pages/solicitudes/SolicitudesPage.jsx'))
const ExtensionesPage = lazy(() => import('./pages/extensiones/ExtensionesPage.jsx'))
const InfraestructuraPage = lazy(() => import('./pages/infraestructura/InfraestructuraPage.jsx'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'))
const PasaportesPage = lazy(() => import('./pages/pasaportes/PasaportesPage.jsx'))
const NoticiasPage = lazy(() => import('./pages/noticias/NoticiasPage.jsx'))
const TiPage = lazy(() => import('./pages/ti/TiPage.jsx'))

const STORAGE_KEY = 'gys-nav-layout'

const SUFIJO = ' · Intranet Gestión y Servicios'
/* Título y descripción de cada sección (pestaña del navegador, historial y lectores de pantalla). */
const PAGINAS = {
  inicio: ['Inicio', 'Noticias, comunicados, cumpleaños, accesos rápidos y proyectos de Gestión y Servicios.'],
  solicitudes: ['Solicitudes', 'Solicita personal, préstamo de equipos, reserva de salas, ausentismo e incapacidades y consulta el estado de tus solicitudes.'],
  noticias: ['Noticias y comunicados', 'Noticias y comunicados oficiales de Gestión y Servicios.'],
  cumpleanos: ['Cumpleaños', 'Celebra a quienes cumplen años en Gestión y Servicios y déjales tu felicitación.'],
  gys: ['Gestión y Servicios', 'Quiénes somos, valores, alianzas, calidad y formatos de Gestión y Servicios, apoyo en talento humano.'],
  promotores: ['Promotores', 'Proyecto de promotores Mi Cali Bella: territorio, equipo, videos y recursos.'],
  corpoquindio: ['Corpoquindío', 'Proyecto Corpoquindío: sectores, documentos y avances.'],
  mediadores: ['Mediadores de convivencia', 'Proyecto de mediadores de convivencia: informes, presentaciones y cobertura.'],
  pasaportes: ['Pasaportes', 'UT Gestión Pasaportes: etapas del trámite y aporte de Gestión y Servicios.'],
  infraestructura: ['Infraestructura', 'Recuperación de la malla vial de Cali: cifras, actividades y evidencias del aporte de Gestión y Servicios.'],
  extensiones: ['Directorio de extensiones', 'Directorio telefónico de extensiones de Gestión y Servicios.'],
  admin: ['Administración', 'Accesos y roles de la intranet.'],
  ti: ['Panel de TI', 'Líneas móviles y correos inactivos.'],
  noencontrada: ['Página no encontrada', 'La página que buscas no existe en la intranet.'],
}
/* Anclas válidas dentro de la portada; cualquier otro enlace desconocido muestra la página 404. */
const ANCLAS_INICIO = new Set(['', 'inicio', 'accesos', 'comunicados', 'proyectos', 'redes'])

/* Enrutado por hash, sin dependencias. */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, ''))
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#/, ''))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function readLayout() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'top' || v === 'side' ? v : 'side'
  } catch {
    return 'side'
  }
}

function Home() {
  return (
    <>
      <Header />

      <main className="main" id="inicio">
        <Hero />
        {/* La tarjeta de cumpleaños flota a la derecha y el resto del contenido se acomoda a su lado, sin huecos. */}
        <div className="home-flow">
          <BirthdayCard />
          <QuickAccess />
          <NewsCard />
          <Comunicados />
          <ProjectsSection />
        </div>

        <div className="board board--2">
          <CorporateCalendar />
          <HelpCard />
        </div>

        <SocialSection id="redes" />
      </main>

      <footer className="foot">
        <span>Gestión y Servicios · Apoyo en talento humano</span>
        <span>Intranet corporativa · {new Date().getFullYear()}</span>
      </footer>
    </>
  )
}

export default function App() {
  const hash = useHashRoute()
  const [navLayout, setNavLayout] = useState(readLayout)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, navLayout)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [navLayout])

  /* Vistas de proyecto con ruta propia (#id o #id-seccion). */
  /* Los enlaces internos de Infraestructura (#inf-…) también pertenecen a esa vista. */
  const route =
    ['corpoquindio', 'promotores', 'gys', 'mediadores', 'cumpleanos', 'solicitudes', 'extensiones', 'infraestructura', 'admin', 'pasaportes', 'noticias', 'ti'].find(
      (r) => hash === r || hash.startsWith(r + '-'),
    ) || (hash.startsWith('inf-') ? 'infraestructura' : undefined)
  const noEncontrada = !route && !ANCLAS_INICIO.has(hash)
  const activeId = route || hash || 'inicio'
  const [tituloPagina, descripcionPagina] = PAGINAS[route || (noEncontrada ? 'noencontrada' : 'inicio')]

  useEffect(() => {
    document.title = (route || noEncontrada ? tituloPagina : 'Intranet · Gestión y Servicios')
    if (route || noEncontrada) document.title += SUFIJO
    document.querySelector('meta[name="description"]')?.setAttribute('content', descripcionPagina)
  }, [route, noEncontrada, tituloPagina, descripcionPagina])

  /* Enlace «Saltar al contenido» para teclado y lectores de pantalla (no usa # para no chocar con el enrutado). */
  const saltar = (e) => {
    e.preventDefault()
    const destino = document.querySelector('.shell main, .shell h1, .shell')
    destino?.setAttribute('tabindex', '-1')
    destino?.focus()
  }

  return (
    <div className={`app app--nav-${navLayout}`}>
      <a className="skip-link" href="#inicio" onClick={saltar}>Saltar al contenido</a>
      <Sidebar layout={navLayout} onLayoutChange={setNavLayout} activeId={activeId} />

      <div className="shell">
        <ErrorBoundary key={route || hash}>
          <Suspense fallback={<div className="vista-cargando" role="status" aria-live="polite"><span className="vista-cargando__punto" aria-hidden="true" />Cargando…</div>}>
        {route === 'corpoquindio' && <CorpoquindioPage />}
        {route === 'promotores' && <PromotoresPage />}
        {route === 'gys' && <GysPage />}
        {route === 'mediadores' && <MediadoresPage />}
        {route === 'solicitudes' && <SolicitudesPage hash={hash} />}
        {route === 'infraestructura' && <InfraestructuraPage />}
        {route === 'admin' && <AdminPage />}
        {route === 'ti' && <TiPage hash={hash} />}
        {route === 'noticias' && <NoticiasPage hash={hash} />}
        {route === 'pasaportes' && <PasaportesPage />}
        {route === 'extensiones' && <ExtensionesPage key={hash} hash={hash} />}
        {route === 'cumpleanos' && (hash === 'cumpleanos-gestor' ? <GestorPage /> : <CumpleanosPage />)}
        {noEncontrada && <NotFound />}
        {!route && !noEncontrada && <Home />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
