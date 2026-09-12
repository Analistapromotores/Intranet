import gys from '../assets/gys_logo.png'
import corpopais from '../assets/corpopais.png'
import corpores from '../assets/corpores.png'
import gestores from '../assets/gestores_024.png'
import pasaportes from '../assets/logo_pasaportes.png'
import valleinn from '../assets/valleINN.png'
import promotores from '../assets/promotores.png'
import quindioEmprendedor from '../assets/CORPOQUINDIO/quindio_emprendedor.png'

/* Las iniciativas corporativas. `logo` con la marca; si no, `monogram` + `color`.
   `href` / `docsHref` permiten enlazar a una vista interna del proyecto. */
export const projects = [
  {
    id: 'gys',
    name: 'Gestión y Servicios',
    logo: gys,
    href: '#gys',
    docsHref: '#gys-formatos',
    desc: 'Apoyo integral en talento humano para la operación y los proyectos del grupo.',
  },
  {
    id: 'corpoquindio',
    name: 'Quindío Emprendedor',
    logo: quindioEmprendedor,
    desc: 'UT Corpo Quindío: fortalecimiento de 600 unidades productivas en los 12 municipios del Quindío.',
    href: '#corpoquindio',
    docsHref: '#corpoquindio-documentos',
  },
  {
    id: 'corpopais',
    name: 'Corpopaís',
    logo: corpopais,
    desc: 'Ejecución de programas sociales y de desarrollo territorial en todo el país.',
  },
  {
    id: 'corpores',
    name: 'Corpores',
    logo: corpores,
    desc: 'Corporación Enlaces Sociales: gestión comunitaria y acompañamiento social.',
  },
  {
    id: 'gestores',
    name: 'UT Gestores 2024',
    logo: gestores,
    desc: 'Unión temporal para la gestión operativa de convenios y contratos 2024.',
  },
  {
    id: 'pasaportes',
    name: 'UT Gestión Pasaportes',
    logo: pasaportes,
    desc: 'Operación de las oficinas de expedición de pasaportes y atención al ciudadano.',
  },
  {
    id: 'valleinn',
    name: 'Fondo ValleINN',
    logo: valleinn,
    desc: 'Fondo de bienestar, salud y beneficios para colaboradores y sus familias.',
  },
  {
    id: 'promotores',
    name: 'Promotores Mi Cali Bella',
    logo: promotores,
    desc: 'Residuos Cero: pedagogía, prevención y control en el manejo de residuos sólidos en Santiago de Cali.',
    href: '#promotores',
    docsHref: '#promotores-recursos',
  },
]
