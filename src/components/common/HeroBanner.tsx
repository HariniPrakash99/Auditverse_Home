function HeroBanner() {
  return (
    <section className="hero-banner">
      {/* Subtle abstract geometric node-network background */}
      <div className="network-pattern-svg" aria-hidden="true">
        <svg
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <g opacity="0.18">
            {/* Network connection lines */}
            <line x1="80" y1="40" x2="220" y2="90" stroke="#60A5FA" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="220" y1="90" x2="380" y2="45" stroke="#60A5FA" strokeWidth="1" />
            <line x1="380" y1="45" x2="520" y2="120" stroke="#818CF8" strokeWidth="1" />
            <line x1="220" y1="90" x2="310" y2="150" stroke="#60A5FA" strokeWidth="1" />
            <line x1="520" y1="120" x2="680" y2="70" stroke="#60A5FA" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="680" y1="70" x2="840" y2="130" stroke="#818CF8" strokeWidth="1" />
            <line x1="840" y1="130" x2="990" y2="60" stroke="#60A5FA" strokeWidth="1" />
            <line x1="990" y1="60" x2="1140" y2="110" stroke="#60A5FA" strokeWidth="1" />
            <line x1="1140" y1="110" x2="1280" y2="40" stroke="#818CF8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="1280" y1="40" x2="1400" y2="95" stroke="#60A5FA" strokeWidth="1" />
            <line x1="990" y1="60" x2="1080" y2="160" stroke="#60A5FA" strokeWidth="0.8" />
            <line x1="680" y1="70" x2="720" y2="15" stroke="#60A5FA" strokeWidth="0.8" />
            <line x1="380" y1="45" x2="440" y2="15" stroke="#818CF8" strokeWidth="0.8" />

            {/* Network nodes */}
            <circle cx="80" cy="40" r="3" fill="#60A5FA" />
            <circle cx="220" cy="90" r="4" fill="#93C5FD" />
            <circle cx="310" cy="150" r="2.5" fill="#60A5FA" />
            <circle cx="380" cy="45" r="3.5" fill="#818CF8" />
            <circle cx="440" cy="15" r="2" fill="#60A5FA" />
            <circle cx="520" cy="120" r="4" fill="#93C5FD" />
            <circle cx="680" cy="70" r="3.5" fill="#60A5FA" />
            <circle cx="720" cy="15" r="2.5" fill="#818CF8" />
            <circle cx="840" cy="130" r="3" fill="#60A5FA" />
            <circle cx="990" cy="60" r="4" fill="#93C5FD" />
            <circle cx="1080" cy="160" r="2.5" fill="#60A5FA" />
            <circle cx="1140" cy="110" r="3.5" fill="#818CF8" />
            <circle cx="1280" cy="40" r="3" fill="#60A5FA" />
            <circle cx="1400" cy="95" r="3.5" fill="#93C5FD" />
          </g>
        </svg>
      </div>

      <div className="hero-content">
        <p className="hero-kicker">
          <span className="kicker-dash">—</span> GLOBAL AUDIT AND ASSURANCE
        </p>
        <h1 className="hero-title">GA&amp;A References</h1>
        <p className="hero-subtitle">
          Reference page for all training resources, guides, and information.
        </p>
      </div>
    </section>
  )
}

export default HeroBanner