/* Convierte el Excel «MAPA DE INTERVENCIONES» de Promotores en el JSON que lee el mapa de la intranet.
   Uso:  npm run mapa:promotores            (usa el Excel de la raíz del proyecto)
         npm run mapa:promotores -- ruta\al\archivo.xlsx
   Genera src/pages/promotores/geo/intervenciones.json (compacto: una fila por punto). */
import ExcelJS from 'exceljs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origen = process.argv[2] || path.join(raiz, 'MAPA DE INTERVENCIONES - TODAS LAS CUOTAS Y EJES.xlsx')
const salida = path.join(raiz, 'src', 'pages', 'promotores', 'geo', 'intervenciones.json')

const valor = (c) => {
  if (c === null || c === undefined) return ''
  if (typeof c === 'object') return c.result !== undefined ? c.result : c.text !== undefined ? c.text : c.richText ? c.richText.map((r) => r.text).join('') : ''
  return c
}
const txt = (c) => String(valor(c)).replace(/\s+/g, ' ').trim()
const num = (c) => {
  const n = Number(String(valor(c)).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(origen)
const ws = wb.getWorksheet('MAPA') || wb.worksheets[0]
const cab = ws.getRow(1).values.slice(1).map((v) => txt(v).toLowerCase())
const col = (...nombres) => cab.findIndex((c) => nombres.some((n) => c.startsWith(n))) + 1
const C = {
  eje: col('eje'), cuota: col('cuota'), comuna: col('comuna'), barrio: col('barrio'), dir: col('direcci'), zona: col('zona'),
  tipo: col('tipo'), hicimos: col('qué hicimos', 'que hicimos'), mat: col('materiales'), veces: col('veces'), fechas: col('fechas'),
  lat: col('latitud'), lng: col('longitud'),
}

const puntos = []
let sinCoord = 0
ws.eachRow((row, i) => {
  if (i === 1) return
  const lat = num(row.getCell(C.lat).value)
  const lng = num(row.getCell(C.lng).value)
  if (lat === null || lng === null || lat < 3 || lat > 3.8 || lng < -76.8 || lng > -76.3) { sinCoord++; return }
  puntos.push([
    txt(row.getCell(C.eje).value),
    txt(row.getCell(C.cuota).value).replace(/^cuota\s*/i, ''),
    txt(row.getCell(C.comuna).value),
    txt(row.getCell(C.barrio).value),
    txt(row.getCell(C.dir).value),
    txt(row.getCell(C.tipo).value),
    txt(row.getCell(C.hicimos).value),
    txt(row.getCell(C.mat).value),
    num(row.getCell(C.veces).value) ?? 1,
    txt(row.getCell(C.fechas).value),
    Math.round(lat * 1e6) / 1e6,
    Math.round(lng * 1e6) / 1e6,
    txt(row.getCell(C.zona).value),
  ])
})

fs.mkdirSync(path.dirname(salida), { recursive: true })
fs.writeFileSync(salida, JSON.stringify({
  campos: ['eje', 'cuota', 'comuna', 'barrio', 'direccion', 'tipo', 'hicimos', 'materiales', 'veces', 'fechas', 'lat', 'lng', 'zona'],
  generado: new Date().toISOString().slice(0, 10),
  puntos,
}))
console.log(`Listo: ${puntos.length} puntos en el mapa (${sinCoord} filas sin coordenadas válidas) → ${path.relative(raiz, salida)}`)
