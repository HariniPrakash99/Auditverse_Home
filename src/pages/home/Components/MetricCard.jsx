import '../styles/MetricCard.css';

const VARIANTS = ['blue', 'teal', 'purple', 'red', 'gold'];

export default function MetricCard({
  title,
  count,
  subtitle,
  variant = 'blue',
  onViewAll,
}) {
  const theme = VARIANTS.includes(variant) ? variant : 'blue';
  const slot = VARIANTS.indexOf(theme) + 1;

  return (
    <div className={`metric-card stat-card metric-card--${theme} stat-card--c${slot}`}>
      <div className="card-circle-decoration big" aria-hidden="true" />
      <div className="card-circle-decoration small" aria-hidden="true" />

      <div className="metric-card__body">
        <h3 className="metric-card__title">{title}</h3>
        <div className="metric-card__count">{count}</div>
        <div className="metric-card__subtitle">{subtitle}</div>
      </div>

      <button type="button" className="metric-card__action home-tooltip-anchor" onClick={onViewAll}>
        <span>View All</span>
        <span className="metric-card__arrow" aria-hidden="true">→</span>
        <span className="home-tooltip-box home-tooltip-box--top" role="tooltip">View All</span>
      </button>
    </div>
  );
}
