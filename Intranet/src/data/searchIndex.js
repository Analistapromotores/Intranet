/* Índice de búsqueda de toda la intranet.
   Se arma con los mismos datos que pintan las páginas, así que cuando se agrega
   un proyecto, un documento o un enlace, la búsqueda lo encuentra sin tocar nada más. */
import { navItems } from './navItems.js'
import { projects } from './projects.js'
import { RECURSOS as MCB_RECURSOS, SECCIONES as MCB_SECCIONES, PROJECT as MCB } from '../pages/promotores/data.js'
import {
  DOCUMENTOS as QE_DOCS,
  SECCIONES as QE_SECCIONES,
  SECTORES as QE_SECTORES,
  REDES as QE_REDES,
  PROJECT as QE,
} from '../pages/corpoquindio/data.js'
import { LINKS as GYS_LINKS, FORMATS, QUALITY, SST } from '../pages/gys/data.js'

/* tipo: acceso | proyecto | seccion | documento | enlace | plantilla | contacto */
const entradas = []

function add(entrada) {
  if (!entrada.href) return
  /* externo = se abre en otra pestaña: enlaces http y archivos (PDF, PPTX) del propio sitio. */
  const externo = entrada.externo ?? !entrada.href.startsWith('#')
  entradas.push({ ...entrada, externo })
}

/* --- accesos y menú --- */
navItems.forEach(({ id, label, href, external }) =>
  add({ id: `nav-${id}`, tipo: 'acceso', titulo: label, contexto: 'Intranet', href, externo: external }),
)

/* --- proyectos --- */
projects.forEach((p) => {
  add({ id: `proy-${p.id}`, tipo: 'proyecto', titulo: p.name, detalle: p.desc, contexto: 'Nuestros proyectos', href: p.href || '#inicio' })
  if (p.docsHref) {
    add({ id: `proy-${p.id}-docs`, tipo: 'seccion', titulo: `Documentos de ${p.name}`, contexto: p.name, href: p.docsHref })
  }
})

/* --- Promotores Mi Cali Bella --- */
MCB_SECCIONES.forEach((s) =>
  add({ id: `mcb-sec-${s.id}`, tipo: 'seccion', titulo: s.label, contexto: MCB.nombre, href: `#promotores-${s.id}` }),
)
MCB_RECURSOS.forEach((r) =>
  add({
    id: `mcb-rec-${r.id}`,
    tipo: /membrete|presentaci|logo/i.test(r.title) ? 'plantilla' : 'documento',
    titulo: r.title,
    detalle: r.desc,
    contexto: `${MCB.nombre} · ${r.tipo}`,
    href: r.url,
  }),
)
add({ id: 'mcb-contrato', tipo: 'contacto', titulo: `Contrato ${MCB.contrato}`, detalle: `${MCB.entidad} · ${MCB.contratista}`, contexto: MCB.nombre, href: '#promotores-proyecto' })

/* --- Quindío Emprendedor --- */
QE_SECCIONES.forEach((s) =>
  add({ id: `qe-sec-${s.id}`, tipo: 'seccion', titulo: s.label, contexto: 'Quindío Emprendedor', href: `#corpoquindio-${s.id}` }),
)
QE_DOCS.forEach((d) =>
  add({ id: `qe-doc-${d.id}`, tipo: 'documento', titulo: d.title, detalle: d.desc, contexto: `Quindío Emprendedor · ${QE.convocatoria}`, href: d.file }),
)
QE_SECTORES.forEach((s) =>
  add({ id: `qe-sector-${s.id}`, tipo: 'seccion', titulo: s.label, detalle: 'Sector que puede participar en la convocatoria', contexto: 'Quindío Emprendedor', href: '#corpoquindio-sectores' }),
)
QE_REDES.forEach((r) =>
  add({ id: `qe-red-${r.id}`, tipo: 'contacto', titulo: `${r.label} · ${r.handle}`, contexto: 'Quindío Emprendedor', href: r.url }),
)

/* --- Gestión y Servicios --- */
GYS_LINKS.forEach((l) =>
  add({ id: `gys-${l.href}`, tipo: 'seccion', titulo: l.title, detalle: l.text, contexto: 'Gestión y Servicios', href: l.href }),
)
const paresGys = [
  ['Formatos internos', FORMATS],
  ['Calidad', QUALITY],
  ['Seguridad y salud en el trabajo', SST],
]
paresGys.forEach(([grupo, lista]) =>
  lista.forEach(([titulo, url], i) =>
    add({ id: `gys-${grupo}-${i}`, tipo: 'documento', titulo, contexto: `Gestión y Servicios · ${grupo}`, href: url }),
  ),
)

export const searchIndex = entradas

/* ---------- búsqueda ---------- */
const sinTildes = (t) =>
  String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const indexado = entradas.map((e) => ({
  ...e,
  _busca: sinTildes([e.titulo, e.detalle, e.contexto, e.tipo].filter(Boolean).join(' ')),
  _titulo: sinTildes(e.titulo),
}))

/** Busca por palabras sueltas: todas tienen que aparecer en algún campo. */
export function buscar(consulta, limite = 12) {
  const palabras = sinTildes(consulta).split(/\s+/).filter(Boolean)
  if (!palabras.length) return []
  const resultados = []
  for (const e of indexado) {
    if (!palabras.every((p) => e._busca.includes(p))) continue
    let puntos = 0
    palabras.forEach((p) => {
      if (e._titulo.startsWith(p)) puntos += 6
      else if (e._titulo.includes(p)) puntos += 4
      else puntos += 1
    })
    if (e.tipo === 'acceso' || e.tipo === 'proyecto') puntos += 2
    resultados.push({ ...e, puntos })
  }
  return resultados.sort((a, b) => b.puntos - a.puntos || a.titulo.localeCompare(b.titulo)).slice(0, limite)
}

export const ETIQUETA_TIPO = {
  acceso: 'Acceso',
  proyecto: 'Proyecto',
  seccion: 'Sección',
  documento: 'Documento',
  plantilla: 'Plantilla',
  contacto: 'Contacto',
}
