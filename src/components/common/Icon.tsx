import type { CSSProperties } from 'react'

export type IconName =
  | 'apps'
  | 'arrow'
  | 'arrow-down'
  | 'arrow-right'
  | 'arrow-up'
  | 'bell'
  | 'checklist'
  | 'chevron'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-up'
  | 'edit'
  | 'external'
  | 'eye'
  | 'file-pen'
  | 'folder'
  | 'folder-open'
  | 'folder-closed'
  | 'help'
  | 'link'
  | 'manage'
  | 'more'
  | 'more-vertical'
  | 'search'
  | 'shield-check'
  | 'sliders'
  | 'star'
  | 'trash'
  | 'plus'
  | 'x'
  | 'check'

interface IconProps {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}

function Icon({ name, size = 18, className = '', style, strokeWidth = 2 }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    apps: (
      <>
        <rect width="4" height="4" x="3" y="3" rx="1" />
        <rect width="4" height="4" x="10" y="3" rx="1" />
        <rect width="4" height="4" x="17" y="3" rx="1" />
        <rect width="4" height="4" x="3" y="10" rx="1" />
        <rect width="4" height="4" x="10" y="10" rx="1" />
        <rect width="4" height="4" x="17" y="10" rx="1" />
        <rect width="4" height="4" x="3" y="17" rx="1" />
        <rect width="4" height="4" x="10" y="17" rx="1" />
        <rect width="4" height="4" x="17" y="17" rx="1" />
      </>
    ),
    checklist: (
      <>
        <rect width="14" height="18" x="5" y="4" rx="2" />
        <path d="M8 2h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
        <path d="M9 10h6" />
        <path d="M9 14h6" />
        <path d="m9 18 1.5 1.5L14 16" />
      </>
    ),
    'shield-check': (
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    'chevron-up': <path d="m18 15-6-6-6 6" />,
    folder: (
      <>
        <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      </>
    ),
    'folder-open': (
      <>
        <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      </>
    ),
    'folder-closed': (
      <>
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
    link: (
      <>
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    'arrow-right': (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    'arrow-up': (
      <>
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </>
    ),
    'arrow-down': (
      <>
        <path d="M12 5v14" />
        <path d="m18 13-6 6-6-6" />
      </>
    ),
    edit: (
      <>
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
      </>
    ),
    'file-pen': (
      <>
        <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
      </>
    ),
    manage: (
      <>
        <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
      </>
    ),
    more: (
      <>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
      </>
    ),
    'more-vertical': (
      <>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
      </>
    ),
    sliders: (
      <>
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="2" x2="6" y1="14" y2="14" />
        <line x1="10" x2="14" y1="8" y2="8" />
        <line x1="18" x2="22" y1="16" y2="16" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </>
    ),
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    external: (
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    eye: (
      <>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    plus: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    check: (
      <path d="M20 6 9 17l-5-5" />
    ),
  }

  const isManageIcon = name === 'manage' || name === 'file-pen'
  const computedStyle: CSSProperties = isManageIcon
    ? { color: '#eb1700', stroke: '#eb1700', ...style }
    : (style ?? {})

  return (
    <svg
      className={`icon icon-${name} ${isManageIcon ? 'lucide lucide-file-pen preview-icon' : ''} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isManageIcon ? '#eb1700' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={computedStyle}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default Icon