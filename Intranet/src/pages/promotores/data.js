const DOCS = `${import.meta.env.BASE_URL}docs/promotores/`

export const PROJECT = {
  nombre: 'Promotores Mi Cali Bella',
  sub: 'Residuos Cero',
  lema: 'Recuperar a Cali es tarea de todas y todos.',
  contrato: '4182.010.26.1. 1159-2025',
  entidad: 'Unidad Administrativa Especial de Servicios Públicos Municipales (UAESPM)',
  contratista: 'Gestión y Servicios – Corporativos E.S.T. SAS',
  nit: '900.158.315-9',
  ciudad: 'Santiago de Cali',
  pbx: '6026614040',
  direccion: 'Calle 13 Nro. 64-30, B/ Limonar',
}

/* Cifras tomadas del plan de trabajo del contrato. */
export const FICHA = [
  { value: '$3.000', unit: 'millones', label: 'Valor del contrato', tone: 'dark' },
  { value: '2', unit: 'específicos', label: 'Objetivos del contrato', tone: 'lime' },
  { value: '2025', unit: '10 sep – 5 nov', label: 'Plazo de ejecución', tone: 'mid' },
]

export const OBJETIVO_GENERAL =
  'Recuperar la gobernanza a través de la atención integral de los espacios públicos con acciones de pedagogía, prevención y control en el manejo adecuado de residuos sólidos en la ciudad de Santiago de Cali.'

export const OBJETIVOS = [
  {
    n: '01',
    title: 'Cultura ciudadana',
    text: 'Fomentar la cultura ciudadana hacia el manejo adecuado de los residuos sólidos y el reciclaje.',
  },
  {
    n: '02',
    title: 'Comunidad empoderada',
    text: 'Empoderar a la comunidad para la conservación de los espacios libres de residuos mediante estrategias pedagógicas, de recuperación y de embellecimiento.',
  },
]

export const LINEAS = [
  {
    id: 'pedagogia',
    title: 'Pedagogía ciudadana',
    text: 'Despliegue de la estrategia de educación en el manejo adecuado de residuos y cultura de reciclaje.',
  },
  {
    id: 'cualificacion',
    title: 'Cualificación del equipo',
    text: 'Jornadas de formación presenciales y virtuales para el equipo de promotores.',
  },
  {
    id: 'difusion',
    title: 'Difusión y sensibilización',
    text: 'Campañas con medios digitales y material POP para las zonas identificadas como prioritarias.',
  },
  {
    id: 'intervencion',
    title: 'Intervención de zonas',
    text: 'Recuperación y embellecimiento de los puntos críticos priorizados de la ciudad.',
  },
]

/* Colorimetría oficial del manual de marca. */
export const COLORES = [
  { hex: '#215C53', name: 'Verde oscuro', detail: 'C99 M34 Y65 K34' },
  { hex: '#92C03A', name: 'Verde lima', detail: 'C58 M0 Y98 K0' },
  { hex: '#A6C64E', name: 'Lima claro', detail: 'Gama de apoyo' },
  { hex: '#2C6B1F', name: 'Verde bosque', detail: 'Gama de apoyo' },
]

export const RECURSOS = [
  {
    id: 'membrete',
    title: 'Plantilla de membrete',
    desc: 'Papelería corporativa para comunicaciones internas y externas. Tipografía Poppins.',
    tipo: 'Google Docs',
    url: 'https://docs.google.com/document/d/1nts6SiRfBZO4y551qb7L6Z_MBg_5EA9_/edit',
    externo: true,
  },
  {
    id: 'presentacion',
    title: 'Plantilla de presentaciones',
    desc: 'Aplicación de la marca en PowerPoint para comunicaciones internas y externas.',
    tipo: 'Google Slides',
    url: 'https://docs.google.com/presentation/d/1CE-U5D-UKM1Avyw01b3VIN-i7o7MV02Z/edit',
    externo: true,
  },
  {
    id: 'logos',
    title: 'Logos en PNG',
    desc: 'Versión principal, transparente y en blanco y negro para distintos formatos.',
    tipo: 'Google Drive',
    url: 'https://drive.google.com/drive/folders/1XdO3OXDlc-tMDk-MXa43Gpjm9mMBG001',
    externo: true,
  },
  {
    id: 'manual',
    title: 'Manual de marca',
    desc: 'Logosímbolo, colorimetría, tipografía, mascota, usos correctos e incorrectos.',
    tipo: 'PDF · 2,9 MB',
    url: `${DOCS}manual-de-marca.pdf`,
  },
  {
    id: 'plan',
    title: 'Plan de trabajo',
    desc: 'Objetivos, obligaciones, componente operativo y matriz de verificables del contrato.',
    tipo: 'PDF · 407 KB',
    url: `${DOCS}plan-de-trabajo.pdf`,
  },
  {
    id: 'cualificacion',
    title: 'Cualificación virtual',
    desc: 'Gestión integral de residuos sólidos: material de formación para el equipo.',
    tipo: 'PPTX · 18 MB',
    url: `${DOCS}cualificacion-virtual-gestion-residuos.pptx`,
  },
]

export const DOTACION = [
  '1 chaleco',
  '3 polos',
  '3 jeans',
  '1 gorra',
  '1 par de zapatos',
  '2 overoles',
  '1 tula',
]

export const SECCIONES = [
  { id: 'proyecto', label: 'El proyecto' },
  { id: 'objetivos', label: 'Objetivos' },
  { id: 'bella', label: 'Bella' },
  { id: 'marca', label: 'Identidad' },
  { id: 'recursos', label: 'Recursos' },
]
