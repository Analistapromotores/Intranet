/* Iconos de línea del centro de servicios (mismo trazo que components/Icons.jsx). */

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconUserSearch = (p) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c.6-3.4 3-5.5 6-5.5 1.3 0 2.5.4 3.4 1" /><circle cx="17" cy="16" r="3" /><path d="m21 20-1.8-1.8" /></svg>
export const IconHeadset = (p) => <svg {...base} {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M19 20c0 1.1-1.8 2-4 2h-2" /></svg>
export const IconLaptop = (p) => <svg {...base} {...p}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>
export const IconClipboard = (p) => <svg {...base} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></svg>
export const IconUserCheck = (p) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 11l2 2 4-4" /></svg>
export const IconArrowLeft = (p) => <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
export const IconArrowRight = (p) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
export const IconCheck = (p) => <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 6.5" /></svg>
export const IconCheckCircle = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.5 3 3 5-6" /></svg>
export const IconX = (p) => <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
export const IconXCircle = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
export const IconAlert = (p) => <svg {...base} {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg>
export const IconInfo = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
export const IconMail = (p) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
export const IconClock = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
export const IconSearch = (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
export const IconExternal = (p) => <svg {...base} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
export const IconShield = (p) => <svg {...base} {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
export const IconFishing = (p) => <svg {...base} {...p}><path d="M12 3v10a4 4 0 1 1-4-4" /><path d="M12 3h4" /></svg>
export const IconCloud = (p) => <svg {...base} {...p}><path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7Z" /><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5" /></svg>
export const IconGauge = (p) => <svg {...base} {...p}><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 18 4-5" /></svg>
export const IconRadar = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12 18 6" /></svg>
export const IconRemote = (p) => <svg {...base} {...p}><rect x="2" y="4" width="12" height="9" rx="1.5" /><rect x="14" y="11" width="8" height="9" rx="1.5" /><path d="M6 16h4M10 8l3 3" /></svg>
export const IconBook = (p) => <svg {...base} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></svg>
export const IconFileText = (p) => <svg {...base} {...p}><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
export const IconDownload = (p) => <svg {...base} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
export const IconPlus = (p) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
export const IconTrash = (p) => <svg {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
export const IconSend = (p) => <svg {...base} {...p}><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" /></svg>
export const IconEraser = (p) => <svg {...base} {...p}><path d="m7 21-4-4L14 6l6 6-9 9H7ZM11 21h10" /></svg>
export const IconRefresh = (p) => <svg {...base} {...p}><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4" /></svg>
export const IconLock = (p) => <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
export const IconLogout = (p) => <svg {...base} {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg>
export const IconList = (p) => <svg {...base} {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
export const IconCalendarPlus = (p) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5" /></svg>
export const IconUserClock = (p) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c.6-3.4 3-5.5 6-5.5 1.2 0 2.3.3 3.2.9" /><circle cx="17.5" cy="16.5" r="4" /><path d="M17.5 14.5v2l1.3 1" /></svg>
export const IconPrinter = (p) => <svg {...base} {...p}><path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="7" y="14" width="10" height="7" rx="1" /></svg>
export const IconMedical = (p) => <svg {...base} {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></svg>
export const IconEye = (p) => <svg {...base} {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
