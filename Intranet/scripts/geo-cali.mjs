/* Descarga los polígonos oficiales de Cali (IDESC, Alcaldía de Santiago de Cali) y los simplifica
   para el mapa de Promotores. Comunas, barrios y sectores, y corregimientos.
   Uso: npm run geo:cali   → escribe src/pages/promotores/geo/{comunas,barrios,corregimientos}.json
   Fuente: https://idesc.cali.gov.co (Acuerdo 0636 de 2026, división político-administrativa). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(raiz, 'src', 'pages', 'promotores', 'geo')
const WFS = 'https://ws-idesc.cali.gov.co/geoserver/dapm/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&srsName=EPSG:4326&maxFeatures=1000&typeName='

/* Douglas-Peucker sobre un anillo (lista de [lng, lat]). */
function simplificar(pts, tol) {
  if (pts.length <= 4) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const pila = [[0, pts.length - 1]]
  const t2 = tol * tol
  while (pila.length) {
    const [a, b] = pila.pop()
    let max = 0
    let idx = -1
    const [ax, ay] = pts[a]
    const [bx, by] = pts[b]
    const dx = bx - ax
    const dy = by - ay
    const l2 = dx * dx + dy * dy
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i]
      let d2
      if (l2 === 0) d2 = (px - ax) ** 2 + (py - ay) ** 2
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
        d2 = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2
      }
      if (d2 > max) { max = d2; idx = i }
    }
    if (max > t2 && idx > 0) { keep[idx] = 1; pila.push([a, idx], [idx, b]) }
  }
  const out = pts.filter((_, i) => keep[i])
  return out.length >= 4 ? out : pts
}
const redondear = (p) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]
const anillo = (r, tol) => simplificar(r.map(redondear), tol)
function geometria(g, tol) {
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map((r) => anillo(r, tol)) }
  return { type: 'MultiPolygon', coordinates: g.coordinates.map((p) => p.map((r) => anillo(r, tol))) }
}

async function capa(nombre, salida, tol, props) {
  const res = await fetch(WFS + nombre)
  if (!res.ok) throw new Error(`${nombre}: HTTP ${res.status}`)
  const j = await res.json()
  const features = j.features.map((f) => ({ type: 'Feature', properties: props(f.properties), geometry: geometria(f.geometry, tol) }))
  fs.mkdirSync(dir, { recursive: true })
  const archivo = path.join(dir, salida)
  fs.writeFileSync(archivo, JSON.stringify({ type: 'FeatureCollection', features }))
  console.log(`${salida}: ${features.length} polígonos, ${(fs.statSync(archivo).size / 1024).toFixed(0)} KB`)
}

await capa('dapm:pdt_dpa_comunas', 'comunas.json', 0.00006, (p) => ({ c: String(Number(p.comcodigo)), n: `Comuna ${Number(p.comcodigo)}` }))
await capa('dapm:pdt_dpa_barrios_sectores', 'barrios.json', 0.00005, (p) => ({ n: p.barnombre, c: String(Number(p.barcomuna)), t: p.barcategor }))
await capa('dapm:pdt_dpa_corregimientos', 'corregimientos.json', 0.0003, (p) => ({ n: p.corrnombre }))
