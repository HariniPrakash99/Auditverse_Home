import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/HeaderSidebarToggle.css';

const PanelRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right preview-icon" aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </svg>
);

const PanelLeftCloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-close preview-icon" aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

// Header has no slot, so the button is portaled in before the logo; it unmounts with the Home screen.
export default function HeaderSidebarToggle({ isCollapsed, onToggle }) {
  const [host, setHost] = useState(null);

  useLayoutEffect(() => {
    const lockup = document.querySelector('.top-navigation .brand-lockup');
    if (!lockup) return undefined;
    const el = document.createElement('span');
    el.className = 'header-sidebar-toggle-host';
    lockup.insertBefore(el, lockup.firstChild);
    setHost(el);
    return () => {
      el.remove();
      setHost(null);
    };
  }, []);

  if (!host) return null;

  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return createPortal(
    <button
      key={isCollapsed ? 'collapsed' : 'open'}
      type="button"
      className="navbar__sidebar-toggle"
      aria-label={label}
      title={label}
      aria-expanded={!isCollapsed}
      onClick={onToggle}
    >
      {isCollapsed ? <PanelRightIcon /> : <PanelLeftCloseIcon />}
    </button>,
    host,
  );
}
