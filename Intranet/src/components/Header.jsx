import { useEffect, useMemo, useRef, useState } from 'react'
import gysLogo from '../assets/gys_logo.png'
import { IconSearch, IconExternal, IconClose } from './Icons.jsx'
import { buscar, ETIQUETA_TIPO } from '../data/searchIndex.js'

export default function Header() {
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const caja = useRef(null)

  const resultados = useMemo(() => buscar(texto), [texto])

  /* Cierra la lista al hacer clic afuera. */
  useEffect(() => {
    const fuera = (e) => {
      if (caja.current && !caja.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  const ir = (r) => {
    if (!r) return
    setAbierto(false)
    setTexto('')
    if (r.href.startsWith('#')) window.location.hash = r.href.slice(1)
    else window.open(r.href, '_blank', 'noreferrer')
  }

  const teclas = (e) => {
    if (!resultados.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((i) => (i + 1) % resultados.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => (i - 1 + resultados.length) % resultados.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      ir(resultados[activo])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  const hayTexto = texto.trim().length > 0

  return (
    <header className="topbar">
      <a href="#inicio" className="topbar__brand" aria-label="Gestión y Servicios · Intranet">
        <img className="topbar__logo" src={gysLogo} alt="Gestión y Servicios" />
        <span className="topbar__divider" aria-hidden="true" />
        <span className="topbar__intranet">Intranet</span>
      </a>

      <div className="search-box" ref={caja}>
        <label className="search">
          <IconSearch className="search__icon" width={20} height={20} />
          <input
            className="search__input"
            type="search"
            value={texto}
            placeholder="Buscar proyectos, documentos, plantillas, enlaces..."
            aria-label="Buscar en la intranet"
            aria-expanded={abierto && hayTexto}
            autoComplete="off"
            onChange={(e) => {
              setTexto(e.target.value)
              setActivo(0)
              setAbierto(true)
            }}
            onFocus={() => setAbierto(true)}
            onKeyDown={teclas}
          />
          {hayTexto && (
            <button
              type="button"
              className="search__clear"
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setTexto('')
                setAbierto(false)
              }}
            >
              <IconClose width={16} height={16} />
            </button>
          )}
        </label>

        {abierto && hayTexto && (
          <div className="search-res" role="listbox" aria-label="Resultados de búsqueda">
            {resultados.length === 0 && (
              <p className="search-res__empty">Sin resultados para «{texto}».</p>
            )}
            {resultados.map((r, i) => (
              <button
                type="button"
                key={r.id}
                role="option"
                aria-selected={i === activo}
                className={`search-res__item ${i === activo ? 'is-active' : ''}`}
                onMouseEnter={() => setActivo(i)}
                onClick={() => ir(r)}
              >
                <span className={`search-res__tag search-res__tag--${r.tipo}`}>
                  {ETIQUETA_TIPO[r.tipo] || r.tipo}
                </span>
                <span className="search-res__text">
                  <strong>{r.titulo}</strong>
                  {r.detalle && <em>{r.detalle}</em>}
                  {r.contexto && <small>{r.contexto}</small>}
                </span>
                {r.externo && <IconExternal className="search-res__go" width={15} height={15} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
