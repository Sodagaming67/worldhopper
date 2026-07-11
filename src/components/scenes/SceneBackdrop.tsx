import type { LocationId } from '@/types/game';

// Original drawn scene per location, shown behind the dialogue so every chapter
// feels like a place instead of a text box. viewBox 0 0 200 120 (banner).
// Animations are gated by `animate` (reduced-motion aware).

type Props = { locationId: LocationId; animate?: boolean; className?: string };

function Sky({ id, from, to }: { id: string; from: string; to: string }) {
  const gid = `sky-${id}`;
  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="120" fill={`url(#${gid})`} />
    </>
  );
}

function waveAnim(animate: boolean, dur = 3) {
  return animate ? (
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${dur}s`} repeatCount="indefinite" />
  ) : null;
}

function Lagoon({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="lagoon" from="var(--color-lagoon)" to="#BFEFF0" />
      <circle cx="168" cy="26" r="14" fill="var(--color-sun-gold)" />
      {/* water */}
      <rect x="0" y="64" width="200" height="56" fill="var(--color-tide)" />
      {[72, 84, 96, 108].map((y, i) => (
        <path key={y} d={`M0 ${y} q25 -4 50 0 t50 0 t50 0 t50 0`} fill="none" stroke="var(--color-cloud)" strokeWidth="1.5" opacity="0.5">
          {waveAnim(animate, 3 + i)}
        </path>
      ))}
      {/* turtle, watched from a respectful distance */}
      <g transform="translate(120 92)">
        <ellipse cx="0" cy="0" rx="11" ry="7" fill="var(--color-ocean-deep)" />
        <circle cx="12" cy="-1" r="3" fill="var(--color-ocean-deep)" />
        <path d="M-8 6 l-3 4 M8 6 l3 4 M-9 -4 l-4 -3 M9 -4 l4 -3" stroke="var(--color-ocean-deep)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* teal lens glow */}
      <circle cx="44" cy="80" r="7" fill="var(--color-cloud)" opacity="0.85">{waveAnim(animate, 2)}</circle>
      {/* palm */}
      <g transform="translate(18 64)">
        <rect x="-2" y="-22" width="4" height="22" fill="#8a5a2b" />
        <path d="M0 -22 q-14 -6 -20 2 M0 -22 q14 -6 20 2 M0 -22 q-8 -16 -2 -20 M0 -22 q8 -16 2 -20" stroke="#3C9A5F" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </>
  );
}

function Tram({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="tram" from="#8FD3DE" to="var(--color-sand)" />
      <circle cx="30" cy="28" r="12" fill="var(--color-sun-gold)" />
      {/* rails */}
      <rect x="0" y="92" width="200" height="4" fill="var(--color-ink)" opacity="0.6" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={6 + i * 16} y="96" width="4" height="8" fill="var(--color-ink)" opacity="0.4" />
      ))}
      {/* tram car */}
      <g transform="translate(70 60)">
        <g>
          {animate && <animateTransform attributeName="transform" type="translate" values="0 0; 12 0; 0 0" dur="4s" repeatCount="indefinite" />}
          <rect x="0" y="0" width="60" height="30" rx="8" fill="var(--color-route)" stroke="var(--color-ink)" strokeWidth="2" />
          <rect x="6" y="6" width="14" height="12" rx="3" fill="var(--color-ocean-deep)" />
          <rect x="24" y="6" width="14" height="12" rx="3" fill="var(--color-ocean-deep)" />
          <rect x="42" y="6" width="12" height="12" rx="3" fill="var(--color-ocean-deep)" />
          <circle cx="14" cy="32" r="5" fill="var(--color-ink)" />
          <circle cx="46" cy="32" r="5" fill="var(--color-ink)" />
        </g>
      </g>
      {/* station sign */}
      <g transform="translate(160 56)">
        <rect x="-1.5" y="0" width="3" height="36" fill="#8a5a2b" />
        <rect x="-16" y="-6" width="32" height="14" rx="3" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="1.5" />
      </g>
    </>
  );
}

function Hall({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="hall" from="#E7D7F2" to="var(--color-sand)" />
      {/* floor */}
      <rect x="0" y="96" width="200" height="24" fill="#D9C7A0" />
      {/* arches */}
      {[26, 100, 174].map((x) => (
        <g key={x}>
          <rect x={x - 6} y="44" width="12" height="52" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="1.5" />
          <path d={`M${x - 18} 44 a18 18 0 0 1 36 0`} fill="none" stroke="var(--color-ink)" strokeWidth="1.5" opacity="0.5" />
        </g>
      ))}
      {/* framed art */}
      {[{ x: 56, c: 'var(--color-coral)' }, { x: 130, c: 'var(--color-lagoon)' }].map(({ x, c }) => (
        <g key={x}>
          <rect x={x} y="50" width="22" height="22" rx="2" fill={c} stroke="var(--color-ink)" strokeWidth="2" />
          <circle cx={x + 11} cy="61" r="5" fill="var(--color-cloud)" opacity="0.6" />
        </g>
      ))}
      {/* violet lens glow */}
      <circle cx="100" cy="60" r="6" fill="var(--color-echo)" opacity="0.85">{waveAnim(animate, 2)}</circle>
    </>
  );
}

function Basin({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="basin" from="#9BE0DC" to="var(--color-sand)" />
      <circle cx="172" cy="26" r="12" fill="var(--color-sun-gold)" />
      {/* pool */}
      <rect x="0" y="78" width="200" height="42" fill="var(--color-spark)" opacity="0.55" />
      <rect x="0" y="78" width="200" height="42" fill="var(--color-tide)" opacity="0.4" />
      {/* rope bridge */}
      <g stroke="var(--color-ink)" strokeWidth="2" fill="none">
        <line x1="20" y1="52" x2="20" y2="84" />
        <line x1="180" y1="52" x2="180" y2="84" />
        <path d="M20 58 q80 18 160 0" />
        <path d="M20 70 q80 22 160 0" />
      </g>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={28 + i * 17} y={62 + Math.sin(i) * 2} width="11" height="4" fill="#8a5a2b" />
      ))}
      {/* coral lens glow */}
      <circle cx="100" cy="66" r="6" fill="var(--color-spark)" opacity="0.9">{waveAnim(animate, 2)}</circle>
    </>
  );
}

function Springs({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="springs" from="#BFE7F5" to="var(--color-sand)" />
      {/* four pools */}
      {[{ x: 44, y: 78 }, { x: 86, y: 92 }, { x: 128, y: 78 }, { x: 100, y: 104 }].map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx="22" ry="12" fill="var(--color-flow)" opacity="0.75" stroke="var(--color-ocean-deep)" strokeWidth="1.5">
          {waveAnim(animate, 2 + i)}
        </ellipse>
      ))}
      {/* central fountain */}
      <g transform="translate(100 58)">
        <rect x="-3" y="0" width="6" height="18" fill="var(--color-ocean-deep)" />
        <path d="M0 0 q-10 -10 -6 -16 M0 0 q10 -10 6 -16 M0 0 q0 -14 0 -18" stroke="var(--color-flow)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          {waveAnim(animate, 1.5)}
        </path>
      </g>
    </>
  );
}

function Paths({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="paths" from="#A9E5C0" to="var(--color-sand)" />
      <circle cx="30" cy="26" r="12" fill="var(--color-sun-gold)" />
      {/* winding path */}
      <path d="M70 120 C90 96 60 80 90 60 C112 46 96 34 110 20" fill="none" stroke="#E8C77A" strokeWidth="14" strokeLinecap="round" />
      <path d="M70 120 C90 96 60 80 90 60 C112 46 96 34 110 20" fill="none" stroke="#D9B45E" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 14" opacity="0.5" />
      {/* palms + flowers */}
      {[[150, 80], [40, 88], [170, 104]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-2" y="-20" width="4" height="20" fill="#8a5a2b" />
          <path d="M0 -20 q-12 -5 -17 2 M0 -20 q12 -5 17 2 M0 -20 q-6 -14 -1 -17 M0 -20 q6 -14 1 -17" stroke="#3C9A5F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ))}
      {[[120, 96, 'var(--color-coral)'], [60, 70, 'var(--color-sunset-rose)'], [135, 72, 'var(--color-route)']].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="3.5" fill={c as string} />
      ))}
      {/* butterfly */}
      <g transform="translate(96 44)">
        <g>
          {animate && <animateTransform attributeName="transform" type="translate" values="0 0; 8 -6; 0 0" dur="3s" repeatCount="indefinite" />}
          <path d="M0 0 q-6 -5 -8 1 q4 4 8 1 M0 0 q6 -5 8 1 q-4 4 -8 1" fill="var(--color-plumeria-violet)" />
        </g>
      </g>
    </>
  );
}

function Lanterns({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="lanterns" from="var(--color-plumeria-violet)" to="var(--color-lantern)" />
      {/* stars */}
      {[[24, 22], [60, 14], [150, 20], [184, 36]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.4" fill="var(--color-cloud)">{waveAnim(animate, 2 + i)}</circle>
      ))}
      {/* hanging lanterns (outer = position, inner = sway, so the animation
          doesn't clobber the translate) */}
      {[36, 76, 116, 156].map((x, i) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <g>
            {animate && <animateTransform attributeName="transform" type="rotate" values="-4 0 0; 4 0 0; -4 0 0" dur={`${3 + i}s`} repeatCount="indefinite" />}
            <line x1="0" y1="0" x2="0" y2="34" stroke="var(--color-ink)" strokeWidth="1" />
            <rect x="-8" y="34" width="16" height="22" rx="6" fill="var(--color-lantern)" stroke="var(--color-ink)" strokeWidth="1.5" />
            <circle cx="0" cy="45" r="5" fill="var(--color-sun-gold)" opacity="0.9" />
          </g>
        </g>
      ))}
      {/* ground */}
      <rect x="0" y="104" width="200" height="16" fill="#5A3E73" />
    </>
  );
}

function Courtyard({ animate }: { animate: boolean }) {
  const colors = ['--color-tide', '--color-route', '--color-echo', '--color-spark', '--color-flow', '--color-lantern', '--color-sunset'];
  return (
    <>
      <Sky id="courtyard" from="#FCE3B0" to="var(--color-sand)" />
      {/* festival flags */}
      <path d="M10 18 q95 -12 180 0" fill="none" stroke="var(--color-ink)" strokeWidth="1" />
      {colors.map((c, i) => (
        <path key={c} d={`M${24 + i * 24} 16 l8 0 l-4 8 z`} fill={`var(${c})`} stroke="var(--color-ink)" strokeWidth="0.8" />
      ))}
      {/* courtyard floor */}
      <rect x="0" y="96" width="200" height="24" fill="#E6D2A0" />
      {/* beacon tower */}
      <g transform="translate(100 30)">
        <rect x="-10" y="20" width="20" height="50" rx="4" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="2" />
        <rect x="-13" y="10" width="26" height="14" rx="4" fill="var(--color-ocean-deep)" stroke="var(--color-ink)" strokeWidth="2" />
        {/* rotating colored light */}
        <circle cx="0" cy="17" r="16" fill="var(--color-sun-gold)" opacity="0.3">{waveAnim(animate, 2)}</circle>
        <circle cx="0" cy="17" r="5" fill="var(--color-sun-gold)" />
      </g>
    </>
  );
}

function Expeditions({ animate }: { animate: boolean }) {
  return (
    <>
      <Sky id="expeditions" from="#9FD8E6" to="var(--color-lagoon)" />
      <circle cx="40" cy="28" r="11" fill="var(--color-sun-gold)" />
      {/* clouds */}
      {[[150, 24], [100, 18]].map(([x, y], i) => (
        <g key={i} fill="var(--color-cloud)" opacity="0.85">
          <ellipse cx={x} cy={y} rx="14" ry="7" />
          <ellipse cx={x + 10} cy={y + 2} rx="10" ry="6" />
        </g>
      ))}
      {/* distant islands / volcano */}
      <path d="M120 78 l24 -28 l24 28 z" fill="var(--color-plumeria-violet)" opacity="0.7" />
      <path d="M10 80 q20 -18 40 0 z" fill="var(--color-ocean-deep)" opacity="0.6" />
      {/* sea */}
      <rect x="0" y="80" width="200" height="40" fill="var(--color-ocean-deep)" opacity="0.85" />
      {/* boat */}
      <g transform="translate(70 86)">
        <g>
          {animate && <animateTransform attributeName="transform" type="translate" values="0 0; 4 2; 0 0" dur="3s" repeatCount="indefinite" />}
          <path d="M-14 0 l28 0 l-5 8 l-18 0 z" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="1.5" />
          <rect x="-1" y="-16" width="2" height="16" fill="var(--color-ink)" />
          <path d="M1 -16 l12 12 l-12 0 z" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="1" />
        </g>
      </g>
    </>
  );
}

const SCENES: Record<LocationId, (p: { animate: boolean }) => React.ReactNode> = {
  turtleglassLagoon: Lagoon,
  sunlineTram: Tram,
  hallOfEchoes: Hall,
  splashbridgeBasin: Basin,
  fourfoldSprings: Springs,
  palmwindPaths: Paths,
  lanternEvening: Lanterns,
  beaconCourtyard: Courtyard,
  outerIslandExpeditions: Expeditions,
};

export function SceneBackdrop({ locationId, animate = true, className = '' }: Props) {
  const Scene = SCENES[locationId];
  return (
    <svg
      viewBox="0 0 200 120"
      className={`w-full cartoon-border rounded-2xl ${className}`}
      style={{ aspectRatio: '5 / 3', display: 'block' }}
      role="img"
      aria-label="Scene illustration"
      preserveAspectRatio="xMidYMid slice"
    >
      {Scene ? <Scene animate={animate} /> : <Sky id="fallback" from="var(--color-lagoon)" to="var(--color-sand)" />}
    </svg>
  );
}
