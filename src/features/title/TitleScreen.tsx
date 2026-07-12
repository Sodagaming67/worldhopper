import { useLocation } from 'wouter';

export function TitleScreen() {
  const [, navigate] = useLocation();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'var(--color-ink)' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="title-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" />
            <stop offset="55%" stopColor="var(--color-ocean-deep)" />
            <stop offset="100%" stopColor="var(--color-sunset-rose)" />
          </linearGradient>
          <linearGradient id="title-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="300" fill="url(#title-sky)" />
        <circle cx="322" cy="58" r="22" fill="var(--color-sand)" opacity="0.8" />

        {/* Abandoned skyline — flat silhouette towers, one crumbled */}
        <g fill="var(--color-ink)">
          <rect x="6" y="150" width="38" height="150" />
          <rect x="50" y="110" width="32" height="190" />
          <polygon points="88,128 122,128 118,96 108,112 100,90 92,118" />
          <rect x="88" y="128" width="34" height="172" />
          <rect x="130" y="76" width="46" height="224" />
          <rect x="182" y="156" width="28" height="144" />
          <rect x="216" y="116" width="40" height="184" />
          <rect x="262" y="164" width="26" height="136" />
          <rect x="292" y="94" width="42" height="206" />
          <rect x="338" y="134" width="34" height="166" />
        </g>

        {/* Sparse windows — most dark, a few flickering survivors */}
        <g fill="var(--color-sun-gold)">
          <rect x="14" y="170" width="6" height="8" opacity="0.85" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />
          <rect x="140" y="104" width="6" height="8" opacity="0.7" />
          <rect x="152" y="140" width="6" height="8" opacity="0.6" />
          <rect x="224" y="146" width="6" height="8" opacity="0.8" style={{ animation: 'twinkle 4s ease-in-out infinite 0.5s' }} />
          <rect x="300" y="118" width="6" height="8" opacity="0.65" />
        </g>

        <rect x="0" y="190" width="400" height="110" fill="url(#title-fog)" />
      </svg>

      <div className="relative z-10 flex flex-col h-full items-center justify-end gap-6 p-8 pb-20 text-center">
        <h1
          className="text-4xl sm:text-5xl leading-tight drop-shadow"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cloud)' }}
        >
          THE ABANDONED RESORT
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-sand)' }}>The Seven Signals</p>
        <button
          onClick={() => navigate('/map')}
          aria-label="Play"
          className="tap-target cartoon-border cartoon-shadow-hover rounded-2xl px-8 py-3 text-lg font-bold bg-[var(--color-sun-gold)] text-[var(--color-ocean-deep)]"
        >
          Play ▸
        </button>
      </div>
    </div>
  );
}
