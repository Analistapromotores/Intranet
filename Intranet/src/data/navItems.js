import {
  IconHome,
  IconUsers,
  IconUser,
  IconStar,
  IconBuilding,
  IconMegaphone,
  IconShirt,
  IconPassport,
  IconLeafPlus,
  IconFileText,
  IconMountain,
} from '../components/Icons.jsx'

/* Fuente única: sidebar + accesos rápidos.
   `accent` define el color del icono en los accesos rápidos (azul | rojo).
   `quickAccess: false` deja el ítem solo en el menú, fuera de la fila de accesos. */
export const navItems = [
  { id: 'inicio', label: 'Inicio', href: '#inicio', Icon: IconHome, accent: 'blue' },
  { id: 'portal', label: 'Portal Colaborador', href: '#portal', Icon: IconUsers, accent: 'blue' },
  { id: 'gys', label: 'G&S', href: '#gys', Icon: IconStar, accent: 'red' },
  { id: 'corporativo', label: 'Corporativo', href: '#corporativo', Icon: IconBuilding, accent: 'blue' },
  { id: 'promotores', label: 'Promotores', href: '#promotores', Icon: IconMegaphone, accent: 'red' },
  { id: 'corporeos', label: 'Corpóreos', href: '#corporeos', Icon: IconShirt, accent: 'red' },
  {
    id: 'corpoquindio',
    label: 'Corpoquindío',
    href: '#corpoquindio',
    Icon: IconMountain,
    accent: 'red',
    quickAccess: false,
  },
  { id: 'gestores', label: 'Gestores', href: '#gestores', Icon: IconUser, accent: 'blue' },
  { id: 'pasaportes', label: 'Pasaportes', href: '#pasaportes', Icon: IconPassport, accent: 'blue' },
  { id: 'valleinn', label: 'ValleInn', href: '#valleinn', Icon: IconLeafPlus, accent: 'red' },
  { id: 'solicitudes', label: 'Solicitudes', href: '#solicitudes', Icon: IconFileText, accent: 'blue' },
  { id: 'equipo', label: 'Equipo', href: '#equipo', Icon: IconUsers, accent: 'blue' },
]
