import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import './mapa.css'

/* Mapa real de intervenciones de Promotores Mi Cali Bella.
   Base: OpenStreetMap. Polígonos oficiales de comunas, barrios y corregimientos: IDESC, Alcaldía de Cali.
   Puntos: «Mapa de intervenciones» (Excel del proyecto → npm run mapa:promotores). */

const EJES = {
  REP: { nombre: 'Recuperación del espacio público', corto: 'Recuperación', color: '#215c53' },
  'PEDAGOGÍA': { nombre: 'Pedagogía', corto: 'Pedagogía', color: '#7fb02c' },
  CUIDADORES: { nombre: 'Cuidadores', corto: 'Cuidadores', color: '#e59a00' },
}
const ORDEN_EJES = Object.keys(EJES)
const CAMPOS = ['eje', 'cuota', 'comuna', 'barrio', 'direccion', 'tipo', 'hicimos', 'materiales', 'veces', 'fechas', 'lat', 'lng', 'zona']

const norm = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const nf = (n) => Number(n).toLocaleString('es-CO')
const cuotaTxt = (c) => (/^\d+$/.test(c) ? `Cuota ${c}` : c)
/* «8, 9» → ['8', '9'];  CORREGIMIENTO → []. */
const comunasDe = (c) => (String(c).match(/\d+/g) || []).map((n) => String(Number(n)))

const ESCALA = ['#eef5e0', '#d5e8b0', '#b3d67a', '#8ec050', '#5f9a3a', '#2f6f3c']
const colorEscala = (v, max) => (v ? ESCALA[Math.min(ESCALA.length - 1, Math.ceil((v / max) * (ESCALA.length - 1)))] : '#f3f5f1')

function popupHtml(p) {
  const eje = EJES[p.eje] || { nombre: p.eje, color: '#215c53' }
  const fila = (k, v) => (v ? `<p><b>${k}</b> ${esc(v)}</p>` : '')
  const mat = p.materiales ? `<details><summary>Materiales y herramientas</summary><p>${esc(p.materiales)}</p></details>` : ''
  return `<div class="pm-pop"><span class="pm-pop__eje" style="--c:${eje.color}">${esc(eje.nombre)}</span>
    <h4>${esc(p.barrio || 'Sin barrio')}</h4>
    ${p.direccion ? `<p class="pm-pop__dir">${esc(p.direccion)}</p>` : ''}
    ${fila('Intervención:', p.tipo && p.tipo.charAt(0) + p.tipo.slice(1).toLowerCase())}
    ${p.hicimos ? `<p class="pm-pop__hicimos">${esc(p.hicimos)}</p>` : ''}
    ${fila('Cuota:', cuotaTxt(p.cuota))}${fila('Fecha:', p.fechas)}
    ${p.veces > 1 ? fila('Visitas:', String(p.veces)) : ''}${mat}</div>`
}

export default function PromotoresMap() {
  const nodo = useRef(null)
  const mapa = useRef(null)
  const capas = useRef({})
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)
  const [ejes, setEjes] = useState(() => new Set(ORDEN_EJES))
  const [comuna, setComuna] = useState('')
  const [cuota, setCuota] = useState('')
  const [barrioQ, setBarrioQ] = useState('')
  const [verBarrios, setVerBarrios] = useState(true)
  const [zoom, setZoom] = useState(11)

  /* Carga diferida de los datos (pesan ~0,9 MB en total). */
  useEffect(() => {
    let vivo = true
    Promise.all([import('./geo/comunas.json'), import('./geo/barrios.json'), import('./geo/corregimientos.json'), import('./geo/intervenciones.json')])
      .then(([c, b, r, i]) => {
        if (!vivo) return
        const puntos = i.default.puntos.map((row) => Object.fromEntries(CAMPOS.map((k, n) => [k, row[n]])))
        setDatos({ comunas: c.default, barrios: b.default, corregimientos: r.default, puntos, generado: i.default.generado })
      })
      .catch(() => vivo && setError(true))
    return () => { vivo = false }
  }, [])

  /* Puntos que pasan los filtros. */
  const visibles = useMemo(() => {
    if (!datos) return []
    const q = norm(barrioQ)
    return datos.puntos.filter((p) =>
      ejes.has(p.eje) &&
      (!comuna || comunasDe(p.comuna).includes(comuna)) &&
      (!cuota || String(p.cuota).includes(cuota)) &&
      (!q || norm(p.barrio).includes(q) || norm(p.direccion).includes(q)),
    )
  }, [datos, ejes, comuna, cuota, barrioQ])

  /* Conteo por comuna (con los filtros de eje/cuota/barrio, para pintar el mapa). */
  const porComuna = useMemo(() => {
    const m = {}
    if (!datos) return m
    const q = norm(barrioQ)
    for (const p of datos.puntos) {
      if (!ejes.has(p.eje) || (cuota && !String(p.cuota).includes(cuota)) || (q && !norm(p.barrio).includes(q))) continue
      for (const c of comunasDe(p.comuna)) m[c] = (m[c] || 0) + 1
    }
    return m
  }, [datos, ejes, cuota, barrioQ])

  const porBarrio = useMemo(() => {
    const m = {}
    for (const p of visibles) { const k = norm(p.barrio); m[k] = (m[k] || 0) + 1 }
    return m
  }, [visibles])

  const cuotas = useMemo(() => (datos ? [...new Set(datos.puntos.map((p) => String(p.cuota).match(/\d+/)?.[0]).filter(Boolean))].sort() : []), [datos])

  /* Mapa: se crea una vez. */
  useEffect(() => {
    if (!datos || mapa.current) return
    const m = L.map(nodo.current, { zoomControl: false, minZoom: 10, maxZoom: 19, preferCanvas: true, scrollWheelZoom: false }).setView([3.4205, -76.5225], 12)
    L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> · Polígonos: <a href="https://idesc.cali.gov.co" target="_blank" rel="noreferrer">IDESC Cali</a>',
    }).addTo(m)
    m.createPane('poligonos').style.zIndex = 300
    m.createPane('barrios').style.zIndex = 320
    /* La rueda del ratón solo hace zoom después de hacer clic en el mapa (no atrapa el scroll de la página). */
    m.on('focus', () => m.scrollWheelZoom.enable())
    m.on('blur', () => m.scrollWheelZoom.disable())
    m.on('zoomend', () => setZoom(m.getZoom()))
    capas.current.corregimientos = L.geoJSON(datos.corregimientos, {
      pane: 'poligonos',
      style: { color: '#7a8a72', weight: 1, dashArray: '4 4', fillColor: '#eaf0e2', fillOpacity: 0.55 },
      onEachFeature: (f, l) => l.bindTooltip(`Corregimiento ${f.properties.n}`, { sticky: true, className: 'pm-tip' }),
    }).addTo(m)
    capas.current.cluster = L.markerClusterGroup({
      showCoverageOnHover: false, maxClusterRadius: 46, spiderfyOnMaxZoom: true, chunkedLoading: true,
      iconCreateFunction: (c) => {
        const n = c.getChildCount()
        const tam = n > 200 ? 54 : n > 40 ? 46 : 38
        return L.divIcon({ html: `<span>${n}</span>`, className: 'pm-cluster', iconSize: [tam, tam] })
      },
    }).addTo(m)
    mapa.current = m
    return () => { m.remove(); mapa.current = null; capas.current = {} }
  }, [datos])

  /* Comunas: relleno según cantidad de intervenciones. */
  useEffect(() => {
    const m = mapa.current
    if (!m || !datos) return
    if (capas.current.comunas) m.removeLayer(capas.current.comunas)
    const max = Math.max(1, ...Object.values(porComuna))
    capas.current.comunas = L.geoJSON(datos.comunas, {
      pane: 'poligonos',
      style: (f) => ({ color: comuna === f.properties.c ? '#0f3a33' : '#3d6b58', weight: comuna === f.properties.c ? 3 : 1.4, fillColor: colorEscala(porComuna[f.properties.c] || 0, max), fillOpacity: 0.62 }),
      onEachFeature: (f, l) => {
        const n = porComuna[f.properties.c] || 0
        l.bindTooltip(`<b>${f.properties.n}</b><br>${nf(n)} intervención${n === 1 ? '' : 'es'}`, { sticky: true, className: 'pm-tip' })
        l.on('click', () => setComuna((c) => (c === f.properties.c ? '' : f.properties.c)))
        l.on('mouseover', () => l.setStyle({ weight: 3, fillOpacity: 0.8 }))
        l.on('mouseout', () => capas.current.comunas?.resetStyle(l))
      },
    }).addTo(m)
    capas.current.comunas.bringToBack()
    capas.current.corregimientos?.bringToBack()
  }, [datos, porComuna, comuna])

  /* Barrios: contorno fino visible al acercarse (o si el usuario lo pide y hay suficiente zoom). */
  useEffect(() => {
    const m = mapa.current
    if (!m || !datos) return
    if (capas.current.barrios) { m.removeLayer(capas.current.barrios); capas.current.barrios = null }
    if (!verBarrios || zoom < 13) return
    const feats = comuna ? { ...datos.barrios, features: datos.barrios.features.filter((f) => f.properties.c === comuna) } : datos.barrios
    capas.current.barrios = L.geoJSON(feats, {
      pane: 'barrios',
      style: (f) => ({ color: '#215c53', weight: 1, fillColor: '#92c03a', fillOpacity: porBarrio[norm(f.properties.n)] ? 0.28 : 0.03 }),
      onEachFeature: (f, l) => {
        const n = porBarrio[norm(f.properties.n)] || 0
        l.bindTooltip(`<b>${esc(f.properties.n)}</b><br>${f.properties.t} · Comuna ${f.properties.c}<br>${n ? `${nf(n)} intervención${n === 1 ? '' : 'es'}` : 'Sin intervenciones registradas'}`, { sticky: true, className: 'pm-tip' })
      },
    }).addTo(m)
  }, [datos, verBarrios, zoom, comuna, porBarrio])

  /* Puntos. */
  useEffect(() => {
    const cl = capas.current.cluster
    if (!cl || !datos) return
    cl.clearLayers()
    cl.addLayers(visibles.map((p) => {
      const c = EJES[p.eje]?.color || '#215c53'
      return L.circleMarker([p.lat, p.lng], { radius: 6.5, weight: 2, color: '#fff', fillColor: c, fillOpacity: 0.95 }).bindPopup(popupHtml(p), { maxWidth: 320, className: 'pm-popup' })
    }))
  }, [datos, visibles])

  /* Al elegir una comuna, el mapa la encuadra. */
  useEffect(() => {
    const m = mapa.current
    if (!m || !datos) return
    if (!comuna) { m.flyTo([3.4205, -76.5225], 12, { duration: 0.6 }); return }
    const f = datos.comunas.features.find((x) => x.properties.c === comuna)
    if (f) m.flyToBounds(L.geoJSON(f).getBounds(), { padding: [30, 30], duration: 0.6 })
  }, [datos, comuna])

  const toggleEje = (e) => setEjes((s) => { const n = new Set(s); if (n.has(e)) { if (n.size > 1) n.delete(e) } else n.add(e); return n })

  /* Resumen del panel: qué hicimos en la selección. */
  const resumen = useMemo(() => {
    const barrios = new Set(visibles.map((p) => norm(p.barrio)).filter(Boolean))
    const comunasSet = new Set(visibles.flatMap((p) => comunasDe(p.comuna)))
    const visitas = visibles.reduce((n, p) => n + (p.veces || 1), 0)
    const porEje = {}
    const porTipo = {}
    for (const p of visibles) {
      porEje[p.eje] = (porEje[p.eje] || 0) + 1
      if (p.eje === 'REP' && p.tipo) porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1
    }
    const m2 = visibles.reduce((n, p) => n + (Number((/([\d.]+)\s*m²/.exec(p.hicimos) || [])[1]) || 0), 0)
    const topBarrios = Object.entries(visibles.reduce((a, p) => { if (p.barrio) a[p.barrio] = (a[p.barrio] || 0) + (p.veces || 1); return a }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { barrios: barrios.size, comunas: comunasSet.size, visitas, porEje, porTipo, m2, topBarrios }
  }, [visibles])

  const reiniciar = () => { setEjes(new Set(ORDEN_EJES)); setComuna(''); setCuota(''); setBarrioQ('') }
  const hayFiltros = comuna || cuota || barrioQ || ejes.size < ORDEN_EJES.length

  if (error) return <p className="pm-msg">No se pudo cargar el mapa. Revisa tu conexión e inténtalo de nuevo.</p>

  return (
    <div className="pm">
      <div className="pm-bar" role="group" aria-label="Filtros del mapa">
        <div className="pm-chips">
          {ORDEN_EJES.map((e) => (
            <button key={e} type="button" className={`pm-chip ${ejes.has(e) ? 'is-on' : ''}`} style={{ '--c': EJES[e].color }} aria-pressed={ejes.has(e)} onClick={() => toggleEje(e)}>
              <i /> {EJES[e].corto}
            </button>
          ))}
        </div>
        <label className="pm-field"><span>Comuna</span>
          <select value={comuna} onChange={(e) => setComuna(e.target.value)}>
            <option value="">Las 22 comunas</option>
            {datos?.comunas.features.map((f) => f.properties.c).sort((a, b) => a - b).map((c) => <option key={c} value={c}>Comuna {c}</option>)}
          </select>
        </label>
        <label className="pm-field"><span>Cuota</span>
          <select value={cuota} onChange={(e) => setCuota(e.target.value)}>
            <option value="">Todas</option>
            {cuotas.map((c) => <option key={c} value={c}>Cuota {c}</option>)}
          </select>
        </label>
        <label className="pm-field pm-field--grow"><span>Buscar barrio o dirección</span>
          <input type="search" value={barrioQ} onChange={(e) => setBarrioQ(e.target.value)} placeholder="Ej. Siloé, Aguablanca…" />
        </label>
        <label className="pm-switch"><input type="checkbox" checked={verBarrios} onChange={(e) => setVerBarrios(e.target.checked)} /><i aria-hidden="true" /> Barrios</label>
        {hayFiltros && <button type="button" className="pm-reset" onClick={reiniciar}>Quitar filtros</button>}
      </div>

      <div className="pm-grid">
        <div className="pm-mapwrap">
          <div ref={nodo} className="pm-map" tabIndex={0} role="region" aria-label="Mapa de intervenciones de Promotores en Santiago de Cali" />
          {!datos && <div className="pm-loading" aria-busy="true"><span /> Cargando mapa…</div>}
          <div className="pm-legend" aria-hidden="true">
            <b>Intervenciones por comuna</b>
            <span className="pm-legend__scale">{ESCALA.map((c) => <i key={c} style={{ background: c }} />)}</span>
            <span className="pm-legend__ends"><small>menos</small><small>más</small></span>
          </div>
          {zoom < 13 && verBarrios && <p className="pm-hint">Acércate para ver los barrios</p>}
        </div>

        <aside className="pm-panel" aria-live="polite">
          <p className="pm-panel__eyebrow">{comuna ? `Comuna ${comuna}` : 'Toda la ciudad'}</p>
          <h3 className="pm-panel__title"><b>{nf(visibles.length)}</b> puntos intervenidos</h3>
          <ul className="pm-kpis">
            <li><b>{nf(resumen.visitas)}</b><span>visitas</span></li>
            <li><b>{nf(resumen.barrios)}</b><span>barrios y sectores</span></li>
            <li><b>{nf(resumen.comunas)}</b><span>comuna{resumen.comunas === 1 ? '' : 's'}</span></li>
          </ul>

          <div className="pm-eje-bars">
            {ORDEN_EJES.filter((e) => ejes.has(e)).map((e) => {
              const n = resumen.porEje[e] || 0
              return (
                <div key={e} style={{ '--c': EJES[e].color }}>
                  <p><span>{EJES[e].nombre}</span><b>{nf(n)}</b></p>
                  <i><u style={{ width: `${visibles.length ? Math.max(3, (n / visibles.length) * 100) : 0}%` }} /></i>
                </div>
              )
            })}
          </div>

          {Object.keys(resumen.porTipo).length > 0 && (
            <div className="pm-block">
              <h4>Qué hicimos en recuperación</h4>
              <ul className="pm-tipos">
                {Object.entries(resumen.porTipo).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => <li key={t}><span>{t.charAt(0) + t.slice(1).toLowerCase()}</span><b>{nf(n)}</b></li>)}
              </ul>
              {resumen.m2 > 0 && <p className="pm-m2"><b>{nf(Math.round(resumen.m2))} m²</b> recuperados con medición registrada</p>}
            </div>
          )}

          {resumen.topBarrios.length > 0 && (
            <div className="pm-block">
              <h4>Barrios con más visitas</h4>
              <ol className="pm-top">
                {resumen.topBarrios.map(([b, n]) => <li key={b}><button type="button" onClick={() => setBarrioQ(b)}>{b.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())}</button><b>{nf(n)}</b></li>)}
              </ol>
            </div>
          )}
          <p className="pm-note">Haz clic en un punto para ver qué se hizo, cuándo y con qué materiales. Datos hasta {datos?.generado ? datos.generado.split('-').reverse().join('/') : '…'}.</p>
        </aside>
      </div>
    </div>
  )
}
