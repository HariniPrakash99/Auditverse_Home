import { useState } from 'react'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearchSubmit?: (value: string) => void
  onClear?: () => void
  onAiClick?: () => void
}

function SearchBar({ searchTerm, onSearchChange, onSearchSubmit, onClear, onAiClick }: SearchBarProps) {
  const [isClearPressed, setIsClearPressed] = useState(false)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSearchSubmit?.(searchTerm)
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onSearchChange('')
      onSearchSubmit?.('')
    }
  }

  return (
    <div className="hero-search search-bar">
      <style>{`
        .search-clear-button {
          appearance: none !important;
          -webkit-appearance: none !important;
          outline: none !important;
          box-shadow: none !important;
        }

        .search-clear-button:focus,
        .search-clear-button:focus-visible,
        .search-clear-button:active,
        .search-clear-button:hover:active,
        .search-clear-button:hover:focus {
          border: 1px solid #fca5a5 !important;
          border-color: #fca5a5 !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <button
        type="button"
        className="hero-search__submit search-badge-btn"
        onClick={() => onSearchSubmit?.(searchTerm)}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          data-lucide="search"
          aria-hidden="true"
          className="lucide lucide-search icon icon--md"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <input
        type="text"
        className="hero-search__input search-input"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search References, folders, files, links..."
        aria-label="Search References, folders, files, links"
      />

      {searchTerm.trim() ? (
        <button
          type="button"
          className="search-clear-button has-nav-tooltip"
          onClick={handleClear}
          onMouseDown={() => setIsClearPressed(true)}
          onMouseUp={() => setIsClearPressed(false)}
          onMouseLeave={() => setIsClearPressed(false)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            boxShadow: 'none',
            ...(isClearPressed
              ? {
                  border: '1px solid #fca5a5',
                  borderColor: '#fca5a5',
                  outline: 'none',
                  boxShadow: 'none',
                }
              : {}),
          }}
          aria-label="Clear search"
        >
          <span className="search-clear-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </span>
          <span className="search-clear-text">Clear</span>
          <span className="nav-tooltip nav-tooltip-box" role="tooltip">Clear search</span>
        </button>
      ) : null}

      <button
        type="button"
        className="hero-search__chip ai-badge-btn"
        title="AI"
        onClick={onAiClick}
        aria-label="Ask AI assistant"
      >
        AI
      </button>
    </div>
  )
}

export default SearchBar