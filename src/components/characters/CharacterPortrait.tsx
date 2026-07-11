import { Nori } from './Nori';
import { Glint } from './Glint';
import { Beaconkeeper } from './Beaconkeeper';
import { ROLE_BY_ID } from '@/data/roles';
import { Icon } from '@/components/ui/Icon';
import type { Role } from '@/types/game';

export type SpeakerId = 'nori' | 'glint' | 'beaconkeeper' | 'team' | Role;

const SPEAKER_NAME: Record<string, string> = {
  nori: 'Nori',
  glint: 'Glint',
  beaconkeeper: 'Beaconkeeper',
  team: 'Your Team',
};

export function speakerName(id: SpeakerId, teamName?: string): string {
  if (id === 'team') return teamName || 'Your Team';
  if (id in SPEAKER_NAME) return SPEAKER_NAME[id];
  if (id in ROLE_BY_ID) return ROLE_BY_ID[id as Role].name;
  return 'Narrator';
}

export function CharacterPortrait({ id, size = 88, animate = true }: { id: SpeakerId; size?: number; animate?: boolean }) {
  switch (id) {
    case 'nori':
      return <Nori size={size} animate={animate} />;
    case 'glint':
      return <Glint size={size} animate={animate} />;
    case 'beaconkeeper':
      return <Beaconkeeper size={size} animate={animate} />;
    default: {
      // Player role or team: colored disc with the role icon.
      const role = ROLE_BY_ID[id as Role];
      const accent = role ? 'var(--color-plumeria-violet)' : 'var(--color-sun-gold)';
      return (
        <div
          className="rounded-full cartoon-border flex items-center justify-center"
          style={{ width: size, height: size, background: accent }}
          aria-label={speakerName(id)}
        >
          <Icon name={role?.icon ?? 'star'} size={size * 0.5} className="text-[var(--color-cloud)]" />
        </div>
      );
    }
  }
}
