import { useEffect, useMemo, useState } from 'react';
import '../styles/LeftSidebar.css';

const Svg = ({ children }) => (
  <svg
    className="left-sidebar__icon"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NewspaperIcon = () => (
  <Svg>
    <path d="M15 18h-5" />
    <path d="M18 14h-8" />
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2" />
    <rect width="8" height="4" x="10" y="6" rx="1" />
  </Svg>
);

const ListIcon = () => (
  <Svg>
    <path d="M3 5h.01" />
    <path d="M3 12h.01" />
    <path d="M3 19h.01" />
    <path d="M8 5h13" />
    <path d="M8 12h13" />
    <path d="M8 19h13" />
  </Svg>
);

const SettingsIcon = () => (
  <Svg>
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

const ChevronIcon = () => (
  <svg
    className="left-sidebar__chevron"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function LeftSidebar({
  isCollapsed = false,
  activeItem = 'overview',
  menuItems = [],
  onNavigate,
  onCustomize,
}) {
  const menuItemIds = useMemo(() => menuItems.map((item) => item.id), [menuItems]);
  const isMyMenuChildActive = menuItemIds.includes(activeItem);
  const [menuOpen, setMenuOpen] = useState(isMyMenuChildActive);

  useEffect(() => {
    if (isMyMenuChildActive) {
      setMenuOpen(true);
    }
  }, [isMyMenuChildActive]);

  const overviewActive = activeItem === 'overview';
  const customizeActive = activeItem === 'customize';

  return (
    <aside
      className={`left-sidebar home-left-sidebar${isCollapsed ? ' left-sidebar--collapsed' : ''}`}
      aria-hidden={isCollapsed}
      inert={isCollapsed}
    >
      <nav className="left-sidebar__nav" aria-label="Home navigation">
        <button
          type="button"
          className={`left-sidebar__item home-tooltip-anchor${overviewActive ? ' left-sidebar__item--active' : ''}`}
          aria-current={overviewActive ? 'page' : undefined}
          onClick={() => onNavigate?.('overview')}
        >
          {overviewActive && <span className="active-indicator-bar" />}
          <span className="left-sidebar__row">
            <NewspaperIcon />
            <span className="left-sidebar__label">Overview</span>
          </span>
          <span className="home-tooltip-box" role="tooltip">Overview</span>
        </button>

        <button
          type="button"
          className={`left-sidebar__item home-tooltip-anchor${isMyMenuChildActive ? ' left-sidebar__item--active' : ''}`}
          aria-expanded={menuOpen}
          aria-controls="left-sidebar-my-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {isMyMenuChildActive && <span className="active-indicator-bar" />}
          <span className="left-sidebar__row">
            <ListIcon />
            <span className="left-sidebar__label">My Menu</span>
            <span className={`left-sidebar__toggle${menuOpen ? ' left-sidebar__toggle--open' : ''}`}>
              <ChevronIcon />
            </span>
          </span>
          <span className="home-tooltip-box" role="tooltip">My Menu</span>
        </button>

        {menuOpen && (
          <ul id="left-sidebar-my-menu" className="left-sidebar__submenu">
            {menuItems.length === 0 && (
              <li className="left-sidebar__empty">No items</li>
            )}
            {menuItems.map((item) => {
              const selected = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`left-sidebar__subitem home-tooltip-anchor${selected ? ' left-sidebar__subitem--active' : ''}`}
                    onClick={() => onNavigate?.(item.id)}
                  >
                    {selected && <span className="active-indicator-bar" />}
                    <span className="left-sidebar__subrow">
                      <span>{item.label}</span>
                      {item.count !== undefined && (
                        <span className="left-sidebar__count">[{item.count}]</span>
                      )}
                    </span>
                    <span className="home-tooltip-box" role="tooltip">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <hr className="left-sidebar__separator" />

        <button
          type="button"
          className={`left-sidebar__item home-tooltip-anchor${customizeActive ? ' left-sidebar__item--active' : ''}`}
          aria-current={customizeActive ? 'page' : undefined}
          onClick={() => {
            onNavigate?.('customize');
            onCustomize?.();
          }}
        >
          {customizeActive && <span className="active-indicator-bar" />}
          <span className="left-sidebar__row">
            <SettingsIcon />
            <span className="left-sidebar__label">Customize Sidebar</span>
          </span>
          <span className="home-tooltip-box" role="tooltip">Customize Sidebar</span>
        </button>
      </nav>
    </aside>
  );
}
