import { useId, useRef, useState } from 'react';
import '../styles/CustomizeSidebar.css';

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ArrowUpIcon = () => (
  <svg {...iconProps}>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg {...iconProps}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg {...iconProps}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg {...iconProps}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function ConfigurationCard({
  title,
  description,
  initialItems = [],
  optionsList = [],
  hasUrlInput = false,
  addSectionLabel = 'Add Contents',
  listSectionLabel = 'Items',
  selectPlaceholder = 'Select',
  urlPlaceholder = 'Paste a link or resou...',
  onChange,
}) {
  const [items, setItems] = useState(initialItems);
  const [collapseByDefault, setCollapseByDefault] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const linkCounter = useRef(0);
  const uid = useId();

  const commit = (nextItems, nextCollapse = collapseByDefault) => {
    setItems(nextItems);
    onChange?.({ items: nextItems, collapseByDefault: nextCollapse });
  };

  const availableOptions = optionsList.filter(
    (option) => !items.some((item) => item.id === option),
  );

  const handleAdd = () => {
    const trimmedUrl = url.trim();

    if (hasUrlInput && trimmedUrl) {
      if (!isHttpUrl(trimmedUrl)) {
        setError('Enter a valid http(s) link.');
        return;
      }
      linkCounter.current += 1;
      commit([
        ...items,
        { id: `link-${linkCounter.current}`, label: trimmedUrl, href: trimmedUrl },
      ]);
    } else if (selectedOption) {
      commit([...items, { id: selectedOption, label: selectedOption }]);
    } else {
      return;
    }

    setSelectedOption('');
    setUrl('');
    setError('');
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const handleDelete = (index) => {
    commit(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, nextLabel) => {
    const next = [...items];
    next[index] = { ...next[index], label: nextLabel };
    commit(next);
  };

  const handleCollapseToggle = (event) => {
    const next = event.target.checked;
    setCollapseByDefault(next);
    onChange?.({ items, collapseByDefault: next });
  };

  const canAdd = Boolean(selectedOption) || (hasUrlInput && Boolean(url.trim()));

  return (
    <section className="card cfg-card" aria-labelledby={`${uid}-title`}>
      <header className="cfg-card__head">
        <div className="cfg-card__intro">
          <h2 className="cfg-card__title" id={`${uid}-title`}>{title}</h2>
          {description && <p className="cfg-card__desc">{description}</p>}
        </div>
        <div className="cfg-card__head-right">
          <span className="cfg-pill">{items.length} items</span>
          <label className="cfg-check">
            <input type="checkbox" checked={collapseByDefault} onChange={handleCollapseToggle} />
            Collapse by default
          </label>
        </div>
      </header>

      <div className="cfg-card__body">
        <label className="cfg-label" htmlFor={`${uid}-select`}>{addSectionLabel}</label>
        <div className="cfg-add">
          <div className="cfg-select-wrap">
            <select
              id={`${uid}-select`}
              className="cfg-field form-select"
              aria-label={`Select an item to add to ${title}`}
              value={selectedOption}
              onChange={(event) => setSelectedOption(event.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {availableOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="cfg-select-wrap__icon" aria-hidden="true">
              <ChevronDownIcon />
            </span>
          </div>

          {hasUrlInput && (
            <>
              <span className="cfg-add__or">OR</span>
              <div className="cfg-url-wrap">
                <svg
                  className="cfg-url-wrap__icon"
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.84 5" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12.16 19" />
                </svg>
                <input
                  type="text"
                  className="cfg-field form-input cfg-field--url"
                  placeholder={urlPlaceholder}
                  aria-label={urlPlaceholder}
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAdd();
                  }}
                />
              </div>
            </>
          )}

          <button type="button" className="cfg-add__btn" onClick={handleAdd} disabled={!canAdd}>
            Add
          </button>

          {error && <p className="cfg-error" role="alert">{error}</p>}
        </div>

        <label className="cfg-label">{listSectionLabel}</label>

        {items.length === 0 ? (
          <p className="cfg-empty">No items added yet.</p>
        ) : (
          <ul className="cfg-list">
            {items.map((item, index) => (
              <li key={item.id} className="cfg-row">
                <span className="cfg-row__num">{index + 1}</span>
                <div className="cfg-row__ctrl-wrap">
                  <select
                    className="cfg-row__ctrl"
                    value={item.label}
                    onChange={(event) => handleItemChange(index, event.target.value)}
                    aria-label={`${listSectionLabel} ${index + 1}`}
                  >
                    {optionsList.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {!optionsList.includes(item.label) && (
                      <option value={item.label}>{item.label}</option>
                    )}
                  </select>
                  <span className="cfg-select-wrap__icon" aria-hidden="true">
                    <ChevronDownIcon />
                  </span>
                </div>
                <span className="cfg-row__acts">
                  <button
                    type="button"
                    className="cfg-row__act icon-btn"
                    aria-label={`Move ${item.label} up`}
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    className="cfg-row__act icon-btn"
                    aria-label={`Move ${item.label} down`}
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 1)}
                  >
                    <ArrowDownIcon />
                  </button>
                  <button
                    type="button"
                    className="cfg-row__act icon-btn cfg-row__act--del"
                    aria-label={`Remove ${item.label}`}
                    onClick={() => handleDelete(index)}
                  >
                    <TrashIcon />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
