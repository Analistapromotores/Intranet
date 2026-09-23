import { useEffect, useMemo, useRef, useState } from 'react'
import { EXTENSIONES } from '../../data/extensiones.js'
import { IconPhone, IconSearch, IconClose } from '../../components/Icons.jsx'
import monograma from '../../assets/gys/GyS Logo(1).png'
import './extensiones.css'

/* Directorio de extensiones internas: tabla institucional por área. */

const sinTildes = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const IconPrint = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="7" y="14" width="10" height="7" rx="1" />
  </svg>
)

/* Agrupa filas consecutivas de la misma área para combinar la celda del área. */
function agrupar(filas) {
  const grupos = []
  filas.forEach((f) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.area === f.area) ultimo.filas.push(f)
    else grupos.push({ area: f.area, filas: [f] })
  })
  return grupos
}

export default function ExtensionesPage({ hash = '' }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const objetivo = Number((hash.match(/^extensiones-(\d+)$/) || [])[1]) || null

  /* Llegar desde el buscador general (#extensiones-103): lleva a la fila y la resalta. */
  useEffect(() => {
    if (!objetivo) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const t = setTimeout(() => document.getElementById(`ext-${objetivo}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    return () => clearTimeout(t)
  }, [objetivo])

  const palabras = useMemo(() => sinTildes(q).split(/\s+/).filter(Boolean), [q])
  const grupos = useMemo(() => {
    const filas = EXTENSIONES.filter((e) => {
      if (!palabras.length) return true
      const texto = sinTildes(`${e.area} ${e.contacto} ${e.ext}`)
      return palabras.every((p) => texto.includes(p))
    })
    return agrupar(filas)
  }, [palabras])
  const total = grupos.reduce((n, g) => n + g.filas.length, 0)

  return (
    <div className="ex">
      <div className="ex-wrap">
        <header className="ex-head">
          <img className="ex-head__logo" src={monograma} alt="Gestión y Servicios" />
          <div className="ex-head__band">
            <span className="ex-head__icon" aria-hidden="true"><IconPhone width={20} height={20} /></span>
            <h1><b>Estamos Conectados:</b> Extensiones Internas</h1>
          </div>
        </header>

        <p className="ex-lead">Marca la extensión desde cualquier teléfono fijo de la oficina. Si no sabes a quién dirigirte, comunícate con Recepción, <b>ext. 100</b>.</p>

        <div className="ex-tools">
          <label className="ex-search">
            <IconSearch width={18} height={18} aria-hidden="true" />
            <span className="ex-sr">Buscar por área, contacto o extensión</span>
            <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por área, contacto o extensión" autoComplete="off" />
            {q && (
              <button type="button" className="ex-clear" onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="Borrar búsqueda">
                <IconClose width={16} height={16} />
              </button>
            )}
          </label>
          <button type="button" className="ex-print" onClick={() => window.print()}>
            <IconPrint /> Imprimir
          </button>
        </div>

        <div className="ex-table-wrap">
          <table className="ex-table">
            <caption className="ex-sr">Extensiones internas de Gestión y Servicios por área</caption>
            <thead>
              <tr>
                <th scope="col">Área</th>
                <th scope="col">Contacto</th>
                <th scope="col" className="ex-table__ext">Ext.</th>
              </tr>
            </thead>
            <tbody>
              {total === 0 && (
                <tr>
                  <td colSpan={3} className="ex-empty">
                    No hay resultados para «{q}».{' '}
                    <button type="button" onClick={() => { setQ(''); inputRef.current?.focus() }}>Ver todas las extensiones</button>
                  </td>
                </tr>
              )}
              {grupos.map((g) =>
                g.filas.map((f, i) => (
                  <tr key={f.ext} id={`ext-${f.ext}`} className={f.ext === objetivo ? 'is-target' : ''}>
                    {i === 0 && (
                      <th scope="rowgroup" rowSpan={g.filas.length} className="ex-table__area">{g.area}</th>
                    )}
                    <td className="ex-table__contact">{f.contacto}</td>
                    <td className="ex-table__ext"><b>{f.ext}</b></td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>

        <p className="ex-note">
          {total === EXTENSIONES.length ? `${total} extensiones` : `${total} de ${EXTENSIONES.length} extensiones`} · ¿Encuentras un dato desactualizado? Escribe a{' '}
          <a href="mailto:soportegys@gestionyservicios.com.co">soportegys@gestionyservicios.com.co</a>.
        </p>
      </div>
    </div>
  )
}
