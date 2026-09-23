import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import QuickAccess from './components/QuickAccess.jsx'
import ProjectsSection from './components/ProjectsSection.jsx'
import NewsCard from './components/NewsCard.jsx'
import CorporateCalendar from './components/CorporateCalendar.jsx'
import HelpCard from './components/HelpCard.jsx'
import CorpoquindioPage from './pages/corpoquindio/CorpoquindioPage.jsx'
import PromotoresPage from './pages/promotores/PromotoresPage.jsx'
import GysPage from './pages/gys/GysPage.jsx'
import MediadoresPage from './pages/mediadores/MediadoresPage.jsx'
import './App.css'

const STORAGE_KEY = 'gys-nav-layout'

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
        <QuickAccess />
        <ProjectsSection />

        <div className="board">
          <NewsCard />
          <CorporateCalendar />
          <HelpCard />
        </div>
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
  const route = ['corpoquindio', 'promotores', 'gys', 'mediadores'].find(
    (r) => hash === r || hash.startsWith(r + '-'),
  )
  const activeId = route || hash || 'inicio'

  return (
    <div className={`app app--nav-${navLayout}`}>
      <Sidebar layout={navLayout} onLayoutChange={setNavLayout} activeId={activeId} />

      <div className="shell">
        {route === 'corpoquindio' && <CorpoquindioPage />}
        {route === 'promotores' && <PromotoresPage />}
        {route === 'gys' && <GysPage />}
        {route === 'mediadores' && <MediadoresPage />}
        {!route && <Home />}
      </div>
    </div>
  )
}
