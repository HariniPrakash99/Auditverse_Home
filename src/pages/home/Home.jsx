import { useEffect, useRef, useState } from 'react';
import LeftSidebar from './components/LeftSidebar';
import HeaderSidebarToggle from './components/HeaderSidebarToggle';
import MetricCard from './components/MetricCard';
import WidgetCard from './components/WidgetCard';
import CustomizeSidebarView from './components/CustomizeSidebarView';
import './styles/HomeLayout.css';

const METRIC_CARDS = [
  { id: 'announcements', title: 'Announcements', count: '13', subtitle: 'New Updates', variant: 'blue' },
  { id: 'org-updates', title: 'Org Updates', count: '02', subtitle: 'Recent Updates', variant: 'teal' },
  { id: 'training', title: 'Training', count: '04', subtitle: 'New Items', variant: 'purple' },
  { id: 'newsletters', title: 'Newsletters', count: '03', subtitle: 'Updates', variant: 'red' },
  { id: 'content-updates', title: 'Content Updates', count: '04', subtitle: 'Recently published', variant: 'gold' },
];

const MY_MENU_ITEMS = [
  { id: 'announcements', label: 'Announcements', count: 13 },
  { id: 'org-updates', label: 'Org Updates', count: 2 },
  { id: 'newsletter', label: 'Newsletter', count: 3 },
  { id: 'pinned-item-1', label: 'Pinned Item 1' },
  { id: 'training', label: 'Training', count: 4 },
];

const WIDGETS = [
  {
    id: 'recent-updated',
    title: 'Recent Updated Contents',
    items: [
      { id: 1, order: 1, title: 'SOX Controls Library', subtext: 'SOX PMO', date: '05/18/2026' },
      { id: 2, order: 2, title: 'Audit Analytics Playbook', subtext: 'RBR Review', date: '05/10/2026' },
      { id: 3, order: 3, title: 'Third Party Risk Framework', subtext: 'Resolved/Full', date: '05/08/2026' },
      { id: 4, order: 4, title: 'Testing Methodology', subtext: 'Resolved/Full', date: '05/08/2026' },
    ],
  },
  {
    id: 'it-audit-guides',
    title: 'IT Audit Guides',
    items: [
      { id: 1, order: 1, title: 'FY26 Annual Audit Plan released', subtext: 'Internal Audit', date: '05/18/2026' },
      { id: 2, order: 2, title: 'CIS Risk Assessment', subtext: 'IT Operations', date: '05/18/2026' },
      { id: 3, order: 3, title: 'Ethical AI Policy Update', subtext: 'Compliance', date: '05/18/2026' },
      { id: 4, order: 4, title: 'Risk Management System', subtext: 'Announcements', date: '05/18/2026' },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    items: [
      { id: 1, order: 1, title: 'Compliance Training Completion', subtext: 'Mandatory for all employees', date: '05/18/2026' },
      { id: 2, order: 2, title: 'FY25 Annual Audit Training', subtext: 'Updated findings & review dates', date: '05/10/2026' },
      { id: 3, order: 3, title: 'Compliance Training Completion', subtext: 'Scheduled Maintenance for IRIS', date: '05/08/2026' },
      { id: 4, order: 4, title: 'Data Privacy Refresher', subtext: 'Handling audit evidence', date: '05/01/2026' },
    ],
  },
  {
    id: 'stay-informed',
    title: 'Stay Informed',
    items: [
      { id: 1, order: 1, title: 'Asset Releases', subtext: 'SOX PMO', date: '05/18/2026' },
      { id: 2, order: 2, title: 'CPE Opportunities', subtext: 'RBR Review', date: '05/10/2026' },
      { id: 3, order: 3, title: 'References', subtext: 'Resolved/Full', date: '05/08/2026' },
      { id: 4, order: 4, title: 'Testing Methodology', subtext: 'Resolved/Full', date: '05/08/2026' },
    ],
  },
];

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function Home({ onScreenChange }) {
  const [activeItem, setActiveItem] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const layoutRef = useRef(null);

  useEffect(() => {
    onScreenChange?.(activeItem === 'customize' ? 'customize' : 'home');
  }, [activeItem, onScreenChange]);

  useEffect(() => {
    const root = layoutRef.current;
    if (!root) return undefined;

    const handlePointerMove = (event) => {
      const target = event.target instanceof Element
        ? event.target.closest('.home-tooltip-anchor')
        : null;
      if (!target) return;
      const x = event.clientX + 12;
      const y = event.clientY + 12;
      target.style.setProperty('--home-tooltip-x', `${x}px`);
      target.style.setProperty('--home-tooltip-y', `${y}px`);
    };

    root.addEventListener('pointermove', handlePointerMove);
    return () => {
      root.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div className="home-layout" ref={layoutRef}>
      <HeaderSidebarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <LeftSidebar
        isCollapsed={isCollapsed}
        activeItem={activeItem}
        menuItems={MY_MENU_ITEMS}
        onNavigate={setActiveItem}
        onCustomize={() => {}}
      />

      <main className="home-layout__main">
        {activeItem === 'customize' ? (
          <CustomizeSidebarView
            onCancel={() => setActiveItem('overview')}
            onSave={() => setActiveItem('overview')}
          />
        ) : (
          <>
        <section className="home-hero home-hero-section">
          <div className="home-hero__header">
            <div className="home-hero-header-row">
              <div className="home-hero__intro">
                <div className="home-hero__tag">— GLOBAL AUDIT AND ASSURANCE</div>
                <h1 className="home-hero__title">GA&amp;A Overview</h1>
                <p className="home-hero__text">
                  To become the best-in-class audit organization delivering data-driven, risk-based
                  audit and assurance projects, that develops talent and drives Johnson &amp; Johnson
                  compliance.
                </p>
              </div>
              <div className="page-header__actions">
                <button type="button" className="home-hero__edit">
                  <SettingsIcon />
                  <span>Edit Card &amp; Widgets</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="home-metrics-band" aria-label="Summary">
          <div className="home-metrics-band__inner">
            <div className="home-metrics">
              {METRIC_CARDS.map(({ id, ...card }) => (
                <MetricCard key={id} {...card} onViewAll={() => {}} />
              ))}
            </div>
          </div>
        </section>

        <section className="home-widgets">
          <div className="home-widgets__panel">
            <h2 className="home-widgets__heading">
              <span className="home-widgets__dash" aria-hidden="true" />
              WIDGETS
            </h2>
            <div className="home-widgets__grid">
              {WIDGETS.map(({ id, title, items }) => (
                <WidgetCard key={id} title={title} items={items} onViewAll={() => {}} />
              ))}
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
