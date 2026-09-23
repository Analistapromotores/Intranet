import {
  IconHome,
  IconUser,
  IconStar,
  IconMegaphone,
  IconFileText,
  IconMountain,
  IconCone,
  IconCake,
  IconPhone,
  IconHeadset,
} from '../components/Icons.jsx'
import { GLPI_URL } from '../config.js'

/* Fuente única: sidebar + accesos rápidos.
   `accent` define el color del icono en los accesos rápidos (azul | rojo).
   `quickAccess: false` deja el ítem solo en el menú, fuera de la fila de accesos.
   En los accesos rápidos solo van: Solicitudes, Extensiones, Cumpleaños y GLPI. */
export const navItems = [
  { id: 'inicio', label: 'Inicio', href: '#inicio', Icon: IconHome, accent: 'blue', quickAccess: false },
  { id: 'solicitudes', label: 'Solicitudes', href: '#solicitudes', Icon: IconFileText, accent: 'blue' },
  { id: 'cumpleanos', label: 'Cumpleaños', href: '#cumpleanos', Icon: IconCake, accent: 'red' },
  /* `menu: false`: el GLPI ya tiene su botón al pie del menú, aquí solo va en los accesos. */
  { id: 'glpi', label: 'GLPI', href: GLPI_URL, Icon: IconHeadset, accent: 'blue', external: true, menu: false },

  /* Proyectos: quedan en el menú, fuera de la fila de accesos rápidos. */
  { id: 'gys', label: 'G&S', href: '#gys', Icon: IconStar, accent: 'red', quickAccess: false },
  { id: 'promotores', label: 'Promotores', href: '#promotores', Icon: IconMegaphone, accent: 'red', quickAccess: false },
  { id: 'corpoquindio', label: 'Corpoquindío', href: '#corpoquindio', Icon: IconMountain, accent: 'red', quickAccess: false },
  { id: 'mediadores', label: 'Mediadores', href: '#mediadores', Icon: IconUser, accent: 'blue', quickAccess: false },
  { id: 'infraestructura', label: 'Infraestructura', href: '#infraestructura', Icon: IconCone, accent: 'blue', quickAccess: false },

  /* Directorio: siempre de último en el menú. */
  { id: 'extensiones', label: 'Extensiones', href: '#extensiones', Icon: IconPhone, accent: 'blue' },
]
