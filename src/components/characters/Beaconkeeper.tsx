// The Beaconkeeper — a cheerful caretaker who speaks through old radio notes.
// Shown as a warm vintage radio with a friendly glowing dial. Original artwork.
export function Beaconkeeper({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="The Beaconkeeper's radio"
      style={{ animation: animate ? 'float 3.4s ease-in-out infinite' : undefined, overflow: 'visible' }}
    >
      {/* antenna */}
      <line x1="72" y1="26" x2="86" y2="10" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="87" cy="9" r="3.5" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="2"
        style={{ animation: animate ? 'twinkle 1.5s ease-in-out infinite' : undefined }} />
      {/* radio body */}
      <rect x="16" y="26" width="68" height="52" rx="12" fill="var(--color-sun-gold)" stroke="var(--color-ink)" strokeWidth="3" />
      {/* speaker grille */}
      <rect x="22" y="34" width="30" height="36" rx="8" fill="var(--color-ocean-deep)" stroke="var(--color-ink)" strokeWidth="2.5" />
      <g stroke="var(--color-lagoon)" strokeWidth="2" opacity="0.7">
        <line x1="27" y1="40" x2="47" y2="40" />
        <line x1="27" y1="46" x2="47" y2="46" />
        <line x1="27" y1="52" x2="47" y2="52" />
        <line x1="27" y1="58" x2="47" y2="58" />
        <line x1="27" y1="64" x2="47" y2="64" />
      </g>
      {/* glowing dial = friendly face */}
      <circle cx="68" cy="52" r="11" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="2.5" />
      <circle cx="68" cy="52" r="11" fill="var(--color-sun-gold)" opacity="0.35"
        style={{ animation: animate ? 'twinkle 2.2s ease-in-out infinite' : undefined }} />
      <circle cx="65" cy="50" r="1.8" fill="var(--color-ink)" />
      <circle cx="71" cy="50" r="1.8" fill="var(--color-ink)" />
      <path d="M64 55 Q68 58 72 55" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      {/* feet */}
      <rect x="26" y="78" width="10" height="6" rx="3" fill="var(--color-ink)" />
      <rect x="64" y="78" width="10" height="6" rx="3" fill="var(--color-ink)" />
    </svg>
  );
}
