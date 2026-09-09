import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import QuickAccess from './components/QuickAccess.jsx'
import ProjectsSection from './components/ProjectsSection.jsx'
import NewsCard from './components/NewsCard.jsx'
import CorporateCalendar from './components/CorporateCalendar.jsx'
import HelpCard from './components/HelpCard.jsx'
import Login from './components/Login.jsx'
import CorpoquindioPage from './pages/corpoquindio/CorpoquindioPage.jsx'
import { AuthProvider, useAuth } from './auth.jsx'
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

function Intranet() {
  const [navLayout, setNavLayout] = useState(readLayout)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, navLayout)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [navLayout])

  return (
    <div className={`app app--nav-${navLayout}`}>
      <Sidebar layout={navLayout} onLayoutChange={setNavLayout} />

      <div className="shell">
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
      </div>
    </div>
  )
}

function Gate() {
  const { user } = useAuth()
  const hash = useHashRoute()

  if (!user) return <Login />

  if (hash === 'corpoquindio' || hash.startsWith('corpoquindio-')) {
    return <CorpoquindioPage />
  }
  return <Intranet />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
