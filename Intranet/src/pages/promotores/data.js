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

/* Resultados de la operación, tomados de las cordatas de los tres ejes y de la
   matriz de puntos intervenidos (mayo de 2025 a septiembre de 2026). */
export const CIFRAS_PERIODO = 'Mayo 2025 – septiembre 2026'

export const CIFRAS = [
  { value: '40.829+', unit: 'jornadas en territorio', label: 'Actividades realizadas', tone: 'dark' },
  { value: '514.708+', unit: 'metros cuadrados', label: 'Espacio público recuperado en Cali', tone: 'lime' },
  { value: '173.369+', unit: 'personas', label: 'Sensibilizadas en pedagogía', tone: 'mid' },
  { value: '169.546+', unit: 'personas', label: 'Sensibilizadas por cuidadores', tone: 'dark' },
  { value: '95+', unit: 'con 5.028 participantes', label: 'Talleres de pedagogía', tone: 'lime' },
  { value: '22/22', unit: '377 barrios y sectores', label: 'Comunas de Cali con presencia', tone: 'mid' },
]

/* Resumen ejecutivo: cuatro indicadores para la lectura inicial. */
export const CIFRAS_RESUMEN = [
  { value: '514.708+', unit: 'metros cuadrados', label: 'Espacio público recuperado', tone: 'lime' },
  { value: '173.369+', unit: 'personas', label: 'Sensibilizadas en pedagogía', tone: 'mid' },
  { value: '169.546+', unit: 'personas', label: 'Sensibilizadas por cuidadores', tone: 'dark' },
  { value: '22/22', unit: '377 barrios y sectores', label: 'Comunas de Cali con presencia', tone: 'mid' },
]

export const EJES = [
  {
    id: 'rep',
    title: 'Recuperación del espacio público',
    text: 'Intervenimos puntos críticos con limpieza, recuperación y embellecimiento para devolverlos a la comunidad.',
  },
  {
    id: 'cuidadores',
    title: 'Cuidadores',
    text: 'Acompañamos los espacios recuperados y a sus comunidades para promover su cuidado continuo y prevenir nuevos puntos críticos.',
  },
  {
    id: 'pedagogia',
    title: 'Pedagogía',
    text: 'Conversamos y enseñamos en territorio sobre separación en la fuente y manejo responsable de residuos.',
  },
]

export const OBJETIVO_GENERAL =
  'Nuestro propósito es recuperar la gobernanza del espacio público en Santiago de Cali. Lo hacemos atendiendo la ciudad de manera integral, con acciones de pedagogía, prevención y control en el manejo adecuado de los residuos sólidos.'

export const OBJETIVOS = [
  {
    n: '01',
    title: 'Cultura ciudadana',
    text: 'Queremos que separar y reciclar sea parte del día a día de las y los caleños. Por eso llevamos pedagogía a calles, barrios y espacios públicos sobre el manejo adecuado de los residuos.',
  },
  {
    n: '02',
    title: 'Comunidad empoderada',
    text: 'Buscamos que cada comunidad cuide lo suyo. Acompañamos a los barrios con estrategias pedagógicas, de recuperación y de embellecimiento para que sus espacios se mantengan libres de residuos.',
  },
]

export const LINEAS = [
  {
    id: 'pedagogia',
    title: 'Pedagogía ciudadana',
    text: 'Salimos a territorio a enseñar cómo separar en la fuente y por qué el reciclaje cambia la ciudad.',
  },
  {
    id: 'cualificacion',
    title: 'Cualificación del equipo',
    text: 'Formamos a cada promotor con jornadas presenciales y virtuales antes de salir a la calle.',
  },
  {
    id: 'difusion',
    title: 'Difusión y sensibilización',
    text: 'Llegamos a más gente con campañas digitales y material impreso en las zonas priorizadas.',
  },
  {
    id: 'intervencion',
    title: 'Intervención de zonas',
    text: 'Recuperamos y embellecemos los puntos críticos, y los devolvemos a la ciudad transformados.',
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
    desc: 'Úsala para tus comunicaciones internas y externas. Ya trae la marca aplicada y la tipografía Poppins.',
    tipo: 'Google Docs',
    url: 'https://docs.google.com/document/d/1nts6SiRfBZO4y551qb7L6Z_MBg_5EA9_/edit',
    externo: true,
  },
  {
    id: 'presentacion',
    title: 'Plantilla de presentaciones',
    desc: 'Arma tus presentaciones sobre esta base: la marca y la tipografía ya están aplicadas.',
    tipo: 'Google Slides',
    url: 'https://docs.google.com/presentation/d/1CE-U5D-UKM1Avyw01b3VIN-i7o7MV02Z/edit',
    externo: true,
  },
  {
    id: 'logos',
    title: 'Logos en PNG',
    desc: 'Descarga la versión que necesites: principal, transparente o en blanco y negro.',
    tipo: 'Google Drive',
    url: 'https://drive.google.com/drive/folders/1XdO3OXDlc-tMDk-MXa43Gpjm9mMBG001',
    externo: true,
  },
  {
    id: 'manual',
    title: 'Manual de marca',
    desc: 'Consúltalo antes de diseñar cualquier pieza: logosímbolo, colores, tipografía, mascota y usos correctos.',
    tipo: 'PDF · 2,9 MB',
    url: `${DOCS}manual-de-marca.pdf`,
  },
  {
    id: 'plan',
    title: 'Plan de trabajo',
    desc: 'Aquí está el detalle del contrato: objetivos, obligaciones, componente operativo y verificables.',
    tipo: 'PDF · 407 KB',
    url: `${DOCS}plan-de-trabajo.pdf`,
  },
  {
    id: 'cualificacion',
    title: 'Cualificación virtual',
    desc: 'Material con el que formamos al equipo en gestión integral de residuos sólidos.',
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
