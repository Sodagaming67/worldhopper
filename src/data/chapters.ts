import type { LensId, LocationId } from '@/types/game';

export type Chapter = {
  id: string; // 'ch0'..'ch7', 'finale'
  number: number;
  title: string;
  locationId: LocationId;
  lensId?: LensId;
  summary: string;
  isOptional?: boolean;
};

// Chapter metadata (spec §8). Quest content lives in quests.ts (one quest per
// story chapter, id-matched). Ch0 is onboarding (handled by Player Setup).
export const CHAPTERS: Chapter[] = [
  {
    id: 'ch0',
    number: 0,
    title: 'The Beacon Flickers',
    locationId: 'beaconCourtyard',
    summary: 'Choose your names, roles, and team emblem. Nori introduces the Seven Signals.',
  },
  {
    id: 'ch1',
    number: 1,
    title: 'The Quiet Shell',
    locationId: 'turtleglassLagoon',
    lensId: 'tideLens',
    summary: 'Slow down at the lagoon and care for the water and its wildlife.',
  },
  {
    id: 'ch2',
    number: 2,
    title: 'The Station That Moved',
    locationId: 'sunlineTram',
    lensId: 'routeLens',
    summary: 'Unscramble the Beaconkeeper’s route and follow the Sunline Tram.',
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Echoes in the Hall',
    locationId: 'hallOfEchoes',
    lensId: 'echoLens',
    summary: 'Notice art and patterns, and name a discovery of your own.',
  },
  {
    id: 'ch4',
    number: 4,
    title: 'The Bridge of Brave Steps',
    locationId: 'splashbridgeBasin',
    lensId: 'sparkLens',
    summary: 'Take a brave step — your way — and cross the Splashbridge.',
  },
  {
    id: 'ch5',
    number: 5,
    title: 'The Fourfold Flow',
    locationId: 'fourfoldSprings',
    lensId: 'flowLens',
    summary: 'Work together to guide four water paths into one shared fountain.',
  },
  {
    id: 'ch6',
    number: 6,
    title: 'The Lantern Listens',
    locationId: 'lanternEvening',
    lensId: 'lanternLens',
    summary: 'Listen closely and appreciate the moment without rushing to capture it.',
  },
  {
    id: 'ch7',
    number: 7,
    title: 'The Sunset Nobody Keeps',
    locationId: 'palmwindPaths',
    lensId: 'sunsetLens',
    summary: 'Create a shared sunset memory to keep forever.',
  },
  {
    id: 'finale',
    number: 8,
    title: 'Relight the Wayfinder',
    locationId: 'beaconCourtyard',
    summary: 'Return all seven lenses and put the festival’s lessons in order.',
  },
];

export const CHAPTER_BY_ID: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c]),
);

// The three chapters that gate the middle of the game (spec §6 progress gates).
export const EARLY_CHAPTER_IDS = ['ch1', 'ch2', 'ch3'] as const;
