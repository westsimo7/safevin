const PaisleyPattern = ({ className = "", opacity = 0.05 }: { className?: string; opacity?: number }) => {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="paisley" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Main paisley teardrop */}
          <path
            d="M60 20 Q80 40 70 70 Q60 90 40 80 Q20 70 30 50 Q40 30 60 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Inner curl */}
          <path
            d="M55 35 Q65 45 60 60 Q55 70 45 65 Q35 60 40 50 Q45 40 55 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Decorative dots */}
          <circle cx="50" cy="50" r="2" fill="currentColor" />
          <circle cx="45" cy="55" r="1.5" fill="currentColor" />
          <circle cx="55" cy="45" r="1.5" fill="currentColor" />
          {/* Small leaf accents */}
          <path
            d="M75 85 Q85 90 80 100 Q75 95 75 85"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <path
            d="M25 15 Q35 20 30 30 Q25 25 25 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Circuit-like lines */}
          <line x1="0" y1="60" x2="20" y2="60" stroke="currentColor" strokeWidth="0.3" />
          <line x1="100" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="0.3" />
          <line x1="60" y1="0" x2="60" y2="15" stroke="currentColor" strokeWidth="0.3" />
          <line x1="60" y1="95" x2="60" y2="120" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#paisley)" />
    </svg>
  );
};

export default PaisleyPattern;
