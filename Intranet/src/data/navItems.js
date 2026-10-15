import {
  IconHome,
  IconUser,
  IconStar,
  IconMegaphone,
  IconFileText,
  IconMountain,
  IconCone,
  IconPassport,
  IconCake,
  IconPhone,
  IconHeadset,
  IconNews,
  IconShield,
} from '../components/Icons.jsx'
import { GLPI_URL } from '../config.js'
import { PLATAFORMAS } from './plataformas.js'

/* Fuente única: sidebar + accesos rápidos.
   `accent` define el color del icono en los accesos rápidos (azul | rojo).
   `plataforma`: al pasar el ratón por el ítem del menú aparece «Ir a la plataforma».
   `quickAccess: false` deja el ítem solo en el menú, fuera de la fila de accesos.
   En los accesos rápidos solo van: Solicitudes, Extensiones, Cumpleaños y GLPI. */
export const navItems = [
  { id: 'inicio', label: 'Inicio', href: '#inicio', Icon: IconHome, accent: 'blue', quickAccess: false },
  { id: 'solicitudes', label: 'Solicitudes', href: '#solicitudes', Icon: IconFileText, accent: 'blue' },
  { id: 'noticias', label: 'Noticias', href: '#noticias', Icon: IconNews, accent: 'blue', quickAccess: false },
  { id: 'cumpleanos', label: 'Cumpleaños', href: '#cumpleanos', Icon: IconCake, accent: 'red' },
  /* `menu: false`: el GLPI ya tiene su botón al pie del menú, aquí solo va en los accesos. */
  { id: 'glpi', label: 'GLPI', href: GLPI_URL, Icon: IconHeadset, accent: 'blue', external: true, menu: false },

  /* Proyectos agrupados por la empresa que los ejecuta (`grupo`): el menú lateral pinta un encabezado por empresa.
     Quedan en el menú, fuera de la fila de accesos rápidos. */
  { id: 'corpoquindio', grupo: 'Corpopaís', label: 'Quindío Emprendedor', href: '#corpoquindio', Icon: IconMountain, accent: 'red', quickAccess: false, plataforma: PLATAFORMAS.corpoquindio },

  { id: 'pasaportes', grupo: 'Corpores', label: 'Pasaportes', href: '#pasaportes', Icon: IconPassport, accent: 'blue', quickAccess: false },

  { id: 'gys', grupo: 'Gestión y Servicios', label: 'G&S', href: '#gys', Icon: IconStar, accent: 'red', quickAccess: false },
  { id: 'promotores', grupo: 'Gestión y Servicios', label: 'Promotores', href: '#promotores', Icon: IconMegaphone, accent: 'red', quickAccess: false, plataforma: PLATAFORMAS.promotores },
  { id: 'mediadores', grupo: 'Gestión y Servicios', label: 'Mediadores', href: '#mediadores', Icon: IconUser, accent: 'blue', quickAccess: false },
  { id: 'infraestructura', grupo: 'Gestión y Servicios', label: 'Infraestructura', href: '#infraestructura', Icon: IconCone, accent: 'blue', quickAccess: false },

  /* Directorio: siempre de último en el menú. */
  /* Solo para el rol TI (y admin): alertas y seguimiento. */
  { id: 'ti', label: 'Panel TI', href: '#ti', Icon: IconShield, accent: 'blue', quickAccess: false, roles: ['ti', 'admin'] },
  { id: 'extensiones', label: 'Extensiones', href: '#extensiones', Icon: IconPhone, accent: 'blue' },
]
