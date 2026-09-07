/* Iconos SVG de línea (outline). Sin emojis, sin dependencias.
   stroke 1.8, esquinas redondeadas, geometría simple. */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-3 3-4.5 5.5-4.5S13.8 16 14.5 19" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17 14.6c2 .6 3.4 2.1 4 4.4" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20c.9-3.4 3.5-5.2 6.5-5.2s5.6 1.8 6.5 5.2" />
    </svg>
  )
}

export function IconStar(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
    </svg>
  )
}

export function IconBuilding(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.6" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" />
      <path d="M5 20.5h14" />
    </svg>
  )
}

export function IconMegaphone(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l9 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M16 8.5a4 4 0 0 1 0 7" />
      <path d="M8 15v3.5a1.5 1.5 0 0 0 3 0V16" />
    </svg>
  )
}

export function IconShirt(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3.5 12 6l3-2.5 4.5 2.4-1.6 4-2.4-.7V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9.2l-2.4.7L4 5.9z" />
    </svg>
  )
}

export function IconPassport(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M9 10h6M12 6.8v6.4M9.5 17h5" />
    </svg>
  )
}

export function IconLeafPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 4c-7 0-13 3-13 10a6 6 0 0 0 6 6c6 0 9-8 7-16Z" />
      <path d="M9 18C11 12 15 8 19 6" />
      <path d="M17.5 13.5h4M19.5 11.5v4" />
    </svg>
  )
}

export function IconFileText(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M9 12.5h6M9 16h6M9 9h2" />
    </svg>
  )
}

export function IconGrid(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  )
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function IconChevronLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  )
}

export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  )
}

export function IconChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconNews(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h13v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z" />
      <path d="M17 8h2.5A1.5 1.5 0 0 1 21 9.5V19a1 1 0 0 1-1 1" />
      <path d="M7 9h7M7 12.5h7M7 16h4" />
    </svg>
  )
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function IconMapPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21c4-4.5 7-7.9 7-11a7 7 0 1 0-14 0c0 3.1 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  )
}

export function IconChecklist(props) {
  return (
    <svg {...base} {...props}>
      <path d="m3.5 7 2 2 3-3" />
      <path d="m3.5 16 2 2 3-3" />
      <path d="M12 7.5h8M12 17h8" />
    </svg>
  )
}

export function IconDownload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  )
}

export function IconFolders(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H9l2 2h6a1.5 1.5 0 0 1 1.5 1.5V17A1.5 1.5 0 0 1 17 18.5H5.5A1.5 1.5 0 0 1 4 17Z" />
      <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4H12l2 2h4.5A1.5 1.5 0 0 1 20 7.5V13" />
    </svg>
  )
}

export function IconDockLeft(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M10 4v16" />
      <path d="M6 9.5h1.5M6 12.5h1.5" />
    </svg>
  )
}

export function IconDockTop(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M7 6.7h1.5M11 6.7h1.5" />
    </svg>
  )
}

export function IconInstagram(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconExternal(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

export function IconLogout(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
      <path d="M10 8 6 12l4 4" />
      <path d="M6 12h12" />
    </svg>
  )
}

export function IconHeadset(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="7" rx="1.6" />
      <rect x="17" y="13" width="4" height="7" rx="1.6" />
      <path d="M20 19.5a3 3 0 0 1-3 3h-3" />
    </svg>
  )
}
