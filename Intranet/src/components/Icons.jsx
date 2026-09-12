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

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 19 6v5.4c0 4.4-2.7 7.7-7 9.4-4.3-1.7-7-5-7-9.4V6Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
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

export function IconFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

export function IconWhatsapp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.9.5 3.68 1.37 5.22L2 22l5.06-1.5a9.8 9.8 0 0 0 4.98 1.35h.01c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2Zm0 1.86c2.13 0 4.14.83 5.65 2.34a7.94 7.94 0 0 1 2.34 5.66c0 4.41-3.58 7.99-8 7.99a8 8 0 0 1-4.07-1.11l-.29-.17-3 .79.8-2.93-.19-.3a7.94 7.94 0 0 1-1.22-4.27c0-4.41 3.59-8 8-8Zm-2.6 4.3c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.12.1.14 1.44 2.28 3.55 3.11 1.75.69 2.11.55 2.49.51.38-.03 1.22-.49 1.4-.97.17-.48.17-.89.12-.98-.05-.08-.19-.14-.4-.24-.21-.11-1.22-.6-1.41-.67-.19-.07-.33-.1-.47.1-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.1-.88-.32-1.68-1.03-.62-.55-1.04-1.24-1.16-1.44-.12-.21-.01-.32.09-.42.09-.1.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.36-.05-.1-.46-1.12-.63-1.53-.17-.4-.34-.35-.47-.35Z" />
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

export function IconMountain(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 19.5h18" />
      <path d="M4.5 19.5 10 8.6l3.7 7" />
      <path d="M12.2 13.4 15.6 7.5l4.4 12" />
      <path d="M8.3 11.9h3.2" opacity=".55" />
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
