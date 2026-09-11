import {
  GlyphArtesania,
  GlyphCafe,
  GlyphCelular,
  GlyphComunicacion,
  GlyphConfeccion,
  GlyphMarroquineria,
  GlyphPapeleria,
  GlyphTecnologia,
} from './glyphs.jsx'
import {
  IconFacebook,
  IconInstagram,
  IconWhatsapp,
  IconExternal,
} from '../../components/Icons.jsx'

const DOCS = `${import.meta.env.BASE_URL}docs/corpoquindio/`

export const WHATSAPP = '3175118221'
export const WHATSAPP_URL = `https://wa.me/57${WHATSAPP}?text=${encodeURIComponent(
  'Hola, tengo una consulta sobre la convocatoria Quindío Emprendedor.',
)}`

export const PROJECT = {
  bpin: '2025003630005',
  convocatoria: 'Convocatoria 2026 · Gobernación del Quindío',
  nombreLargo:
    'Fortalecimiento integral de las capacidades del ecosistema de emprendimiento a través de asesoría técnica especializada y provisión de activos productivos en el departamento del Quindío',
}

export const STATS = [
  { value: '600', label: 'Beneficiarios a seleccionar', tone: 'orange' },
  { value: '12', label: 'Municipios del Quindío', tone: 'green' },
  { value: '1 año', label: 'Funcionamiento mínimo requerido', tone: 'teal' },
]

export const SECTORES = [
  { id: 'artesanos', label: 'Artesanos', Glyph: GlyphArtesania, tone: 'yellow' },
  { id: 'cafeterias', label: 'Cafeterías', Glyph: GlyphCafe, tone: 'green-dark' },
  { id: 'confeccion', label: 'Confección y moda', Glyph: GlyphConfeccion, tone: 'green' },
  { id: 'papelerias', label: 'Papelerías y misceláneas', Glyph: GlyphPapeleria, tone: 'red' },
  { id: 'marroquineria', label: 'Marroquinería y calzado', Glyph: GlyphMarroquineria, tone: 'red-bright' },
  { id: 'celulares', label: 'Venta de celulares', Glyph: GlyphCelular, tone: 'blue' },
  { id: 'influencers', label: 'Influencers', Glyph: GlyphTecnologia, tone: 'teal' },
  { id: 'periodistas', label: 'Periodistas independientes', Glyph: GlyphComunicacion, tone: 'orange' },
]

export const PASOS = [
  {
    n: '01',
    title: 'Inscríbete',
    text: 'Registra tu unidad productiva y completa tu postulación con los formatos requeridos.',
  },
  {
    n: '02',
    title: 'Evaluación',
    text: 'Se realiza la evaluación y validación del cumplimiento de requisitos.',
  },
  {
    n: '03',
    title: 'Selección',
    text: 'Los mejores puntajes acceden al programa de fortalecimiento.',
  },
  {
    n: '04',
    title: 'Fortalecimiento',
    text: 'Asesoría técnica especializada, acompañamiento empresarial y activos productivos.',
  },
]

export const DOCUMENTOS = [
  {
    id: 'tdr',
    tag: 'Base',
    title: 'Términos de referencia',
    desc: 'Documento principal: requisitos, criterios de evaluación y cronograma de la convocatoria.',
    file: `${DOCS}terminos-de-referencia.pdf`,
    destacado: true,
  },
  {
    id: 'adenda1',
    tag: 'Adenda 01',
    title: 'Adenda 01',
    desc: 'Modificación oficial a los términos de referencia.',
    file: `${DOCS}adenda-01.pdf`,
  },
  {
    id: 'adenda2',
    tag: 'Adenda 02',
    title: 'Adenda 02',
    desc: 'Modificación oficial a los términos de referencia.',
    file: `${DOCS}adenda-02.pdf`,
  },
  {
    id: 'adenda3',
    tag: 'Adenda 03',
    title: 'Adenda 03',
    desc: 'Modificación oficial a los términos de referencia.',
    file: `${DOCS}adenda-03.pdf`,
  },
  {
    id: 'anexo5',
    tag: 'Anexo 5',
    title: 'Declaración de pertenencia al Quindío',
    desc: 'Certifica que la unidad productiva pertenece al departamento del Quindío.',
    file: `${DOCS}anexo-5-pertenencia-unidad-productiva.pdf`,
  },
  {
    id: 'anexo6',
    tag: 'Anexo 6',
    title: 'Declaración de madre cabeza de familia',
    desc: 'Aplica únicamente para quienes cumplan esta condición.',
    file: `${DOCS}anexo-6-madre-cabeza-de-familia.pdf`,
    condicional: true,
  },
  {
    id: 'anexo7',
    tag: 'Anexo 7',
    title: 'Declaración comunidad LGTBIQ+',
    desc: 'Aplica únicamente para quienes cumplan esta condición.',
    file: `${DOCS}anexo-7-comunidad-lgtbiq.pdf`,
    condicional: true,
  },
  {
    id: 'anexo8',
    tag: 'Anexo 8',
    title: 'Declaración de operación de unidad productiva',
    desc: 'Declara la operación y el tiempo de funcionamiento del emprendimiento.',
    file: `${DOCS}anexo-8-operacion-unidad-productiva.pdf`,
  },
]

export { QUINDIO_MUNICIPIOS as MUNICIPIOS } from './quindioGeo.js'

export const SECCIONES = [
  { id: 'proyecto', label: 'Conoce el proyecto' },
  { id: 'sectores', label: 'Quiénes participan' },
  { id: 'proceso', label: 'Proceso de fortalecimiento' },
  { id: 'territorio', label: 'Cobertura' },
  { id: 'documentos', label: 'Recursos y documentos' },
]

/* Redes del proyecto. Reemplaza las URLs por las cuentas oficiales. */
export const REDES = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: WHATSAPP,
    url: WHATSAPP_URL,
    Icon: IconWhatsapp,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@quindioemprendedor',
    url: 'https://www.instagram.com/quindioemprendedor/',
    Icon: IconInstagram,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'Quindío Emprendedor',
    url: 'https://www.facebook.com/GobernacionQuindio',
    Icon: IconFacebook,
  },
  {
    id: 'web',
    label: 'Sitio oficial',
    handle: 'quindio.gov.co',
    url: 'https://www.quindio.gov.co/',
    Icon: IconExternal,
  },
]
