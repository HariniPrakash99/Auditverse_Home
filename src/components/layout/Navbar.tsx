import { useEffect, useRef, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import JJLogo from '../common/JJLogo'
import type { UserRole } from '../../services/roleService'

interface HeaderProps {
  activeNav?: string
  onNavClick?: (nav: string) => void
  userName?: string
  role?: UserRole
  showRoleSelector?: boolean
  onRoleChange?: (role: UserRole) => void
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  content_manager: 'Content Manager',
  user: 'User',
}

export function getUserInitials(name?: string | null): string {
  if (!name || !name.trim()) {
    return 'HP'
  }

  const trimmed = name.trim()

  // Handle "Last, First" format
  if (trimmed.includes(',')) {
    const [last, first] = trimmed.split(',').map((s) => s.trim())
    if (first && last) {
      const firstInitial = first.charAt(0).toUpperCase()
      const lastInitial = last.charAt(0).toUpperCase()
      return `${firstInitial}${lastInitial}`
    }
  }

  // Handle standard "First Second" format
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const firstInitial = parts[0].charAt(0).toUpperCase()
    const secondInitial = parts[1].charAt(0).toUpperCase()
    return `${firstInitial}${secondInitial}`
  }

  if (parts.length === 1) {
    // Check if CamelCase like "HariniPrakash" or "HariniPrakash99"
    const uppercaseLetters = parts[0].replace(/[^A-Za-z]/g, '').match(/[A-Z]/g)
    if (uppercaseLetters && uppercaseLetters.length >= 2) {
      return `${uppercaseLetters[0]}${uppercaseLetters[1]}`.toUpperCase()
    }
    const clean = parts[0].replace(/[^A-Za-z]/g, '')
    if (clean.length >= 2) {
      return clean.slice(0, 2).toUpperCase()
    }
    if (clean.length === 1) {
      return clean.toUpperCase()
    }
  }

  return 'HP'
}

const NAV_TABS = [
  'Home',
  'Audit Focus',
  'About Us',
  'References',
]

const APPLICATION_ITEMS = [
  'ARA',
  'RBR',
  'CPR',
  'SOX',
  'Intake',
  'Teammate',
  'Tempus',
  'Digital Intake',
  'Ask Joe',
]

function Header({
  activeNav = 'References',
  onNavClick,
  userName,
  role,
  showRoleSelector = false,
  onRoleChange,
}: HeaderProps) {
  const [currentNav, setCurrentNav] = useState(activeNav)
  const [activeUtil, setActiveUtil] = useState<string | null>(null)
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false)
  const appDropdownRef = useRef<HTMLDivElement>(null)

  const [displayName, setDisplayName] = useState<string>(() => {
    const xrmName =
      (window as any).Xrm?.Utility?.getGlobalContext?.()?.userSettings
        ?.userName ||
      (window as any)._userSettings?.userName
    return userName || xrmName || 'Harini Prakash'
  })

  useEffect(() => {
    if (activeNav) {
      setCurrentNav(activeNav)
    }
  }, [activeNav])

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const xrmUser = (window as any).Xrm?.Utility?.getGlobalContext?.()
          ?.userSettings?.userName
        if (xrmUser && isMounted) {
          setDisplayName(xrmUser)
          return
        }

        const context = await getContext()
        const fullName = context?.user?.fullName
        if (fullName && isMounted) {
          setDisplayName(fullName)
        }
      } catch {
        // Defaults to initial displayName
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [userName])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (appDropdownRef.current && !appDropdownRef.current.contains(e.target as Node)) {
        setIsAppDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = getUserInitials(displayName)

  const handleNavClick = (item: string) => {
    setCurrentNav(item)
    onNavClick?.(item)
  }

  return (
    <header className="top-navigation navbar">
      {/* 1. Brand Logo & Title */}
      <div className="brand-lockup">
        <JJLogo className="jj-brand-logo" />
        <span className="brand-divider" aria-hidden="true">|</span>
        <span className="product-name">Audit Verse</span>
      </div>

      {/* 2. Primary Navigation Links */}
      <nav className="main-nav" aria-label="Main navigation">
        {NAV_TABS.map((item) => {
          const isActive = currentNav === item

          return (
            <button
              key={item}
              className={`nav-item has-nav-tooltip ${isActive ? 'active' : ''}`}
              type="button"
              onClick={() => handleNavClick(item)}
            >
              <span className="nav-item-text">{item}</span>
              {isActive && <span className="nav-active-bar" />}
              <span className="nav-tooltip nav-tooltip-box" role="tooltip">{item}</span>
            </button>
          )
        })}

        {/* 3. "My Applications" Dropdown Menu */}
        <div
          ref={appDropdownRef}
          className="nav-dropdown-wrapper"
          onMouseEnter={() => setIsAppDropdownOpen(true)}
          onMouseLeave={() => setIsAppDropdownOpen(false)}
        >
          <button
            className={`nav-item nav-dropdown-trigger has-nav-tooltip ${isAppDropdownOpen ? 'dropdown-open' : ''}`}
            type="button"
            onClick={() => setIsAppDropdownOpen((prev) => !prev)}
            aria-expanded={isAppDropdownOpen}
            aria-haspopup="true"
          >
            <span className="nav-item-text">My Applications</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`dropdown-chevron ${isAppDropdownOpen ? 'open' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {!isAppDropdownOpen && (
              <span className="nav-tooltip nav-tooltip-box" role="tooltip">My Applications</span>
            )}
          </button>

          {isAppDropdownOpen && (
            <div className="nav-dropdown-menu my-apps-dropdown" role="menu">
              {APPLICATION_ITEMS.map((app) => (
                <div
                  key={app}
                  className="nav-dropdown-item dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setIsAppDropdownOpen(false)
                  }}
                >
                  <span className="dropdown-item-label">{app}</span>
                  <span className="item-tooltip" role="tooltip">{app}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* 4. Right Utility Icons & User Avatar */}
      <div className="nav-actions">
        {role && showRoleSelector && onRoleChange && (
            <div className="user-role-badge-container" title="View as role">
              <span className={`user-role-badge role-${role}`}>
                {ROLE_LABELS[role]} ▾
              </span>
              <select
                className="user-role-select"
                aria-label="View as role"
                value={role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((value) => (
                  <option key={value} value={value}>
                    {ROLE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
        )}

        {/* Quick Links */}
        <button
          type="button"
          className={`nav-util-btn has-nav-tooltip ${activeUtil === 'quick-links' ? 'selected' : ''}`}
          data-tooltip="Quick links"
          onClick={() => setActiveUtil((prev) => (prev === 'quick-links' ? null : 'quick-links'))}
          aria-label="Quick links"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EB1700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grid-3x3 preview-icon"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
          <span className="nav-tooltip nav-tooltip-box" role="tooltip">Quick links</span>
        </button>

        {/* GA&A Tasklist */}
        <button
          type="button"
          className={`nav-util-btn has-nav-tooltip ${activeUtil === 'tasklist' ? 'selected' : ''}`}
          data-tooltip="GA&A tasklist"
          onClick={() => setActiveUtil((prev) => (prev === 'tasklist' ? null : 'tasklist'))}
          aria-label="GA&A tasklist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EB1700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-clipboard-check preview-icon"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
          </svg>
          <span className="nav-tooltip nav-tooltip-box" role="tooltip">GA&A tasklist</span>
        </button>

        {/* Help */}
        <button
          type="button"
          className={`nav-util-btn has-nav-tooltip ${activeUtil === 'help' ? 'selected' : ''}`}
          data-tooltip="Help"
          onClick={() => setActiveUtil((prev) => (prev === 'help' ? null : 'help'))}
          aria-label="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EB1700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-circle-question-mark preview-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span className="nav-tooltip nav-tooltip-box" role="tooltip">Help</span>
        </button>



        {/* User Avatar — Account (Non-Clickable / Info Only) */}
        <div className="user-avatar-wrap nav-user-avatar has-nav-tooltip">
          <div
            className="user-avatar"
            aria-label={`Account: ${displayName}`}
            role="img"
          >
            {initials}
          </div>
          <span className="nav-tooltip nav-tooltip-box" role="tooltip">
            Account: {displayName}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header