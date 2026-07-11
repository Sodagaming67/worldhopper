import type { Role } from '@/types/game';

// One little explorer per role — original art, distinct color + hat + tool so each
// family member has their own character on the map and in the levels.
type Look = { body: string; hat: string; tool: 'wrench' | 'star' | 'shell' | 'compass' };

export const ROLE_LOOK: Record<Role, Look> = {
  inventor: { body: 'var(--color-lagoon)', hat: 'var(--color-sun-gold)', tool: 'wrench' },
  pathfinder: { body: 'var(--color-coral)', hat: 'var(--color-plumeria-violet)', tool: 'star' },
  oceanGuardian: { body: 'var(--color-tide)', hat: 'var(--color-ocean-deep)', tool: 'shell' },
  trailRanger: { body: 'var(--color-sun-gold)', hat: '#3C9A5F', tool: 'compass' },
};

// CSS color for a role's body — used to tint the platformer hero.
export const ROLE_BODY_VAR: Record<Role, string> = {
  inventor: '--color-lagoon',
  pathfinder: '--color-coral',
  oceanGuardian: '--color-tide',
  trailRanger: '--color-sun-gold',
};

function Tool({ kind }: { kind: Look['tool'] }) {
  switch (kind) {
    case 'wrench':
      return <path d="M0 4 l4 -4 a2 2 0 0 1 0 3 l-3 3 a2 2 0 0 1 -3 0 z" fill="#C9CDD2" stroke="var(--color-ink)" strokeWidth="0.6" />;
    case 'star':
      return <path d="M2 -3 l1 2.4 2.6 .2 -2 1.6 .7 2.5 -2.3 -1.4 -2.3 1.4 .7 -2.5 -2 -1.6 2.6 -.2 z" fill="var(--color-sun-gold)" stroke="var(--color-ink)" strokeWidth="0.4" />;
    case 'shell':
      return <path d="M0 4 a4 4 0 0 1 8 0 z M2 4 l1 -3 M4 4 v-3.6 M6 4 l-1 -3" fill="var(--color-sunset-rose)" stroke="var(--color-ink)" strokeWidth="0.5" />;
    case 'compass':
      return <g><circle cx="3" cy="2" r="3.4" fill="var(--color-cloud)" stroke="var(--color-ink)" strokeWidth="0.6" /><path d="M3 0 l1 2 -1 2 -1 -2 z" fill="var(--color-coral)" /></g>;
  }
}

type Props = { role: Role; size?: number; animate?: boolean; walking?: boolean; className?: string };

export function PlayerAvatar({ role, size = 56, animate = true, walking = false, className = '' }: Props) {
  const look = ROLE_LOOK[role];
  return (
    <svg
      width={size}
      height={(size * 52) / 40}
      viewBox="0 0 40 52"
      className={className}
      role="img"
      aria-label={`${role} explorer`}
      style={{ animation: animate && !walking ? 'float 2.8s ease-in-out infinite' : undefined, overflow: 'visible' }}
    >
      {/* shadow */}
      <ellipse cx="20" cy="50" rx="9" ry="2.5" fill="#0C2837" opacity="0.18" />

      {/* legs (swing when walking) */}
      <g fill="var(--color-ink)">
        <rect x="14" y="40" width="4.5" height="9" rx="1.6" style={walking && animate ? { animation: 'sway 0.5s ease-in-out infinite', transformOrigin: '16px 40px' } : undefined} />
        <rect x="21.5" y="40" width="4.5" height="9" rx="1.6" style={walking && animate ? { animation: 'sway 0.5s ease-in-out infinite reverse', transformOrigin: '24px 40px' } : undefined} />
      </g>

      {/* body */}
      <rect x="11" y="22" width="18" height="22" rx="8" fill={look.body} stroke="var(--color-ink)" strokeWidth="1.6" />
      {/* strap */}
      <path d="M20 24 v18" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />

      {/* arms */}
      <rect x="7" y="25" width="4.5" height="12" rx="2.2" fill={look.body} stroke="var(--color-ink)" strokeWidth="1.2" />
      <rect x="28.5" y="25" width="4.5" height="12" rx="2.2" fill={look.body} stroke="var(--color-ink)" strokeWidth="1.2" />

      {/* tool in hand */}
      <g transform="translate(28 33)"><Tool kind={look.tool} /></g>

      {/* head */}
      <circle cx="20" cy="15" r="9" fill="#F7D9A0" stroke="var(--color-ink)" strokeWidth="1.4" />
      {/* eyes + smile */}
      <circle cx="17" cy="15" r="1.3" fill="var(--color-ink)" />
      <circle cx="23" cy="15" r="1.3" fill="var(--color-ink)" />
      <path d="M17 18.5 q3 2.4 6 0" fill="none" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinecap="round" />

      {/* hat */}
      <ellipse cx="20" cy="8" rx="12" ry="3" fill={look.hat} stroke="var(--color-ink)" strokeWidth="1.4" />
      <path d="M13 8 q7 -9 14 0 z" fill={look.hat} stroke="var(--color-ink)" strokeWidth="1.4" />
    </svg>
  );
}
