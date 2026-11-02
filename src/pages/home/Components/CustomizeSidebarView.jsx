import { useEffect, useRef } from 'react';
import ConfigurationCard from './ConfigurationCard';
import '../styles/CustomizeSidebar.css';

const toItems = (labels) => labels.map((label) => ({ id: label, label }));

const DEFAULT_MENU_ITEMS = toItems([
  'Announcements',
  'Org Updates',
  'Newsletter',
  'Pinned Item 1',
  'Training',
]);

const MENU_OPTIONS = [
  'Announcements',
  'Org Updates',
  'Newsletter',
  'Pinned Item 1',
  'Training',
  'Content Updates',
  'References',
  'Quick Links',
  'About Us',
];

const DEFAULT_APP_ITEMS = toItems([
  'ARA',
  'RBR',
  'CPR',
  'SOX',
  'Teammate',
  'Tempus',
  'Digital Intake',
  'Ask Joe',
]);

const APP_OPTIONS = [
  'ARA',
  'RBR',
  'CPR',
  'SOX',
  'Intake',
  'Teammate',
  'Tempus',
  'Digital Intake',
  'Ask Joe',
];

export default function CustomizeSidebarView({ onCancel, onSave }) {
  const config = useRef({
    menu: { items: DEFAULT_MENU_ITEMS, collapseByDefault: true },
    applications: { items: DEFAULT_APP_ITEMS, collapseByDefault: true },
  });

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-customize-screen-only', 'true');
    styleEl.textContent = `
      .header-sidebar-toggle-host,
      .user-role-badge-container {
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, []);

  return (
    <div className="customize-sidebar">
      <header className="page-header">
        <div className="page-header__text">
          <p className="page-header__eyebrow">— GLOBAL AUDIT AND ASSURANCE</p>
          <h1 className="page-header__title">Personalize your sidebar</h1>
          <p className="page-header__subtitle">
            Choose and arrange your menu and pinned contents to be displayed on the sidebar
          </p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="page-header__btn page-header__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="page-header__btn page-header__btn--save"
            onClick={() => onSave?.(config.current)}
          >
            Save
          </button>
        </div>
      </header>

      <div className="customize-sidebar__body">
        <ConfigurationCard
          title="Custom My Menu"
          description="Manage the “Your Menu” list by either adding the url for the contents or choosing options from dropdown"
          initialItems={DEFAULT_MENU_ITEMS}
          optionsList={MENU_OPTIONS}
          hasUrlInput
          addSectionLabel="Add Contents"
          listSectionLabel="Menu Items"
          selectPlaceholder="Select"
          urlPlaceholder="Paste a link or resou..."
          onChange={(value) => {
            config.current.menu = value;
          }}
        />
        <ConfigurationCard
          title="My Application Configuration"
          description="Manage the applications shown on your sidebar by choosing options from dropdown"
          initialItems={DEFAULT_APP_ITEMS}
          optionsList={APP_OPTIONS}
          addSectionLabel="Applications"
          listSectionLabel="Application Items"
          selectPlaceholder="Select"
          onChange={(value) => {
            config.current.applications = value;
          }}
        />
      </div>
    </div>
  );
}
