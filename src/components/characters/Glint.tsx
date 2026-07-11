// Glint — a curious floating weather-spark shaped like a tiny kite of light.
// Twinkles and drifts. Original artwork.
export function Glint({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Glint, the friendly weather-spark"
      style={{ animation: animate ? 'drift 4s ease-in-out infinite' : undefined, overflow: 'visible' }}
    >
      {/* glow halo */}
      <circle cx="50" cy="44" r="30" fill="var(--color-sun-gold)" opacity="0.22" />
      {/* kite diamond */}
      <path d="M50 16 L70 44 L50 72 L30 44 Z" fill="var(--color-sun-gold)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 16 L50 72 M30 44 L70 44" stroke="var(--color-ink)" strokeWidth="2" opacity="0.6" />
      {/* little face */}
      <circle cx="45" cy="42" r="2.6" fill="var(--color-ink)" />
      <circle cx="55" cy="42" r="2.6" fill="var(--color-ink)" />
      <path d="M45 49 Q50 53 55 49" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
      {/* kite tail with bows */}
      <path d="M50 72 Q44 82 52 88 Q60 92 54 99" fill="none" stroke="var(--color-coral)" strokeWidth="2.5" strokeLinecap="round"
        style={{ animation: animate ? 'sway 2.5s ease-in-out infinite' : undefined, transformOrigin: '50px 72px' }} />
      <circle cx="50" cy="80" r="3" fill="var(--color-coral)" />
      <circle cx="54" cy="90" r="3" fill="var(--color-sunset-rose)" />
      {/* sparkles */}
      <g style={{ animation: animate ? 'twinkle 1.8s ease-in-out infinite' : undefined }}>
        <path d="M78 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="var(--color-sun-gold)" />
        <path d="M20 60 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" fill="var(--color-sun-gold)" />
      </g>
    </svg>
  );
}
