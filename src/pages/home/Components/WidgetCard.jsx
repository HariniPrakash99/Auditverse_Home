import '../styles/WidgetCard.css';

const MAX_ITEMS = 4;

export default function WidgetCard({ title, items = [], onViewAll }) {
  return (
    <section className="widget-card">
      <header className="widget-card__header">
        <h3 className="widget-card__title">{title}</h3>
      </header>

      <ol className="widget-card__list">
        {items.slice(0, MAX_ITEMS).map((item) => (
          <li key={item.id} className="widget-card__row home-tooltip-anchor">
            <span className="widget-card__badge" aria-hidden="true">{item.order}</span>
            <div className="widget-card__text">
              <div className="widget-card__item-title">{item.title}</div>
              <div className="widget-card__subtext">{item.subtext}</div>
            </div>
            <time className="widget-card__date">{item.date}</time>
            <span className="home-tooltip-box home-tooltip-box--top" role="tooltip">{item.title}</span>
          </li>
        ))}
      </ol>

      <button type="button" className="widget-card__footer home-tooltip-anchor" onClick={onViewAll}>
        View All →
        <span className="home-tooltip-box home-tooltip-box--top" role="tooltip">View All</span>
      </button>
    </section>
  );
}
