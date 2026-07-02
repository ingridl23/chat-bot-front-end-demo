// Íconos de línea reutilizables (reemplazan a los emoji).
// stroke = currentColor, así heredan el color del contenedor.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconHome = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const IconDoc = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h5" />
  </svg>
)

export const IconChat = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" />
  </svg>
)

export const IconLogout = ({ size = 17, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
)

export const IconSend = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8} {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </svg>
)

export const IconSun = ({ size = 13, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const IconMoon = ({ size = 13, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
)

export const IconClock = ({ size = 26, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.6} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const IconUpload = ({ size = 15, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
)

export const IconTrash = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const IconUser = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

export const IconBuilding = ({ size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
    <path d="M15 10h4a1 1 0 0 1 1 1v10" />
    <path d="M2 21h20" />
    <path d="M8 8h.01M8 12h.01M8 16h.01M18 14h.01M18 17h.01" />
  </svg>
)
