import type { Lens, LensId } from '@/types/game';

// The seven Signal Lenses, in the order the family learns them.
export const LENSES: Lens[] = [
  { id: 'tideLens', name: 'Tide Lens', color: 'var(--color-tide)', theme: 'Care for water and wildlife' },
  { id: 'routeLens', name: 'Route Lens', color: 'var(--color-route)', theme: 'Navigation and patterns' },
  { id: 'echoLens', name: 'Echo Lens', color: 'var(--color-echo)', theme: 'Art and memory' },
  { id: 'sparkLens', name: 'Spark Lens', color: 'var(--color-spark)', theme: 'Courage and trying' },
  { id: 'flowLens', name: 'Flow Lens', color: 'var(--color-flow)', theme: 'Teamwork' },
  { id: 'lanternLens', name: 'Lantern Lens', color: 'var(--color-lantern)', theme: 'Listening and appreciation' },
  { id: 'sunsetLens', name: 'Sunset Lens', color: 'var(--color-sunset)', theme: 'Creativity and sharing' },
];

export const LENS_BY_ID: Record<LensId, Lens> = Object.fromEntries(
  LENSES.map((l) => [l.id, l]),
) as Record<LensId, Lens>;

export const TOTAL_LENSES = LENSES.length;
