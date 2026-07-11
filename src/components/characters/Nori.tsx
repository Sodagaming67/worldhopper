// Nori — a friendly reef-rover helper robot with a shell-shaped scanner.
// Original artwork (no brand assets). Gentle bob animation, reduced-motion aware.
export function Nori({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Nori, the reef-rover robot"
      style={{ animation: animate ? 'float 3s ease-in-out infinite' : undefined, overflow: 'visible' }}
    >
      {/* antenna */}
      <line x1="50" y1="16" x2="50" y2="6" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="5" r="4" fill="var(--color-sun-gold)" stroke="var(--color-ink)" strokeWidth="2.5" />
      {/* head/body shell */}
      <rect x="20" y="18" width="60" height="56" rx="22" fill="var(--color-lagoon)" stroke="var(--color-ink)" strokeWidth="3" />
      {/* shell scanner ridges */}
      <path d="M50 28 Q40 40 50 52 Q60 40 50 28Z" fill="var(--color-cloud)" opacity="0.5" />
      <path d="M34 34 Q30 46 38 56" fill="none" stroke="var(--color-cloud)" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
      <path d="M66 34 Q70 46 62 56" fill="none" stroke="var(--color-cloud)" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
      {/* face screen */}
      <rect x="32" y="36" width="36" height="22" rx="11" fill="var(--color-ocean-deep)" stroke="var(--color-ink)" strokeWidth="2.5" />
      {/* eyes */}
      <circle cx="43" cy="47" r="3.5" fill="var(--color-sun-gold)" />
      <circle cx="57" cy="47" r="3.5" fill="var(--color-sun-gold)" />
      {/* smile */}
      <path d="M44 52 Q50 56 56 52" fill="none" stroke="var(--color-sun-gold)" strokeWidth="2.5" strokeLinecap="round" />
      {/* little wheels/feet */}
      <circle cx="34" cy="78" r="6" fill="var(--color-ink)" />
      <circle cx="66" cy="78" r="6" fill="var(--color-ink)" />
    </svg>
  );
}
