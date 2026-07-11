/**
 * Brave Steps — three large, scrolling platformer levels themed to the island.
 * Pure data, no Phaser import. World is 540 tall; wide enough to scroll.
 * Each level has a full-width floor so a fall is recoverable, but gaps between
 * raised platforms and patrolling enemies still punish sloppy jumps.
 */
export type PlatformRect = { x: number; y: number; w: number; h: number };

export type ArcadeEnemy =
  | { kind: 'patroller'; x: number; y: number; minX: number; maxX: number; speed: number }
  | { kind: 'faller'; x: number; minY: number; maxY: number; speed: number }
  | { kind: 'chaser'; x: number; y: number; speed: number };

export type ArcadeTheme = {
  skyTop: string; skyBottom: string; ground: string; plankTop: string; coin: string; hill: string;
};

export type BraveLevel = {
  name: string;
  worldW: number;
  worldH: number;
  theme: ArcadeTheme;
  platforms: PlatformRect[];
  coins: { x: number; y: number }[];
  enemies: ArcadeEnemy[];
  start: { x: number; y: number };
  goal: PlatformRect;
};

export const BRAVE_WORLD_H = 540;

const THEME_BASIN: ArcadeTheme = {
  skyTop: '--color-lagoon', skyBottom: '--color-sand',
  ground: '--color-ocean-deep', plankTop: '--color-sun-gold', coin: '--color-sun-gold', hill: '--color-tide',
};
const THEME_HALL: ArcadeTheme = {
  skyTop: '--color-plumeria-violet', skyBottom: '--color-coral',
  ground: '--color-ocean-deep', plankTop: '--color-sun-gold', coin: '--color-sun-gold', hill: '--color-plumeria-violet',
};
const THEME_PATHS: ArcadeTheme = {
  skyTop: '--color-ocean-deep', skyBottom: '--color-plumeria-violet',
  ground: '--color-ink', plankTop: '--color-spark', coin: '--color-spark', hill: '--color-ocean-deep',
};

// Helper: a full-width floor for a given world width.
const floor = (w: number): PlatformRect => ({ x: 0, y: 500, w, h: 40 });

export const BRAVE_LEVELS: BraveLevel[] = [
  // ── Level 1 — Splashbridge Basin: gentle ramp, one crab, generous platforms.
  {
    name: 'Splashbridge Basin',
    worldW: 1600, worldH: BRAVE_WORLD_H, theme: THEME_BASIN,
    platforms: [
      floor(1600),
      { x: 220, y: 420, w: 160, h: 22 },
      { x: 470, y: 360, w: 150, h: 22 },
      { x: 720, y: 420, w: 150, h: 22 },
      { x: 980, y: 350, w: 160, h: 22 },
      { x: 1260, y: 300, w: 180, h: 22 },
    ],
    coins: [
      { x: 300, y: 388 }, { x: 545, y: 328 }, { x: 795, y: 388 },
      { x: 1060, y: 318 }, { x: 1340, y: 268 },
      { x: 120, y: 468 }, { x: 640, y: 468 }, { x: 1150, y: 468 },
    ],
    enemies: [
      { kind: 'patroller', x: 700, y: 470, minX: 560, maxX: 900, speed: 60 },
    ],
    start: { x: 60, y: 460 },
    goal: { x: 1500, y: 440, w: 26, h: 60 },
  },
  // ── Level 2 — Hall of Echoes: two crabs, a real gap, a high climb.
  {
    name: 'Hall of Echoes',
    worldW: 2000, worldH: BRAVE_WORLD_H, theme: THEME_HALL,
    platforms: [
      floor(2000),
      { x: 180, y: 430, w: 130, h: 22 },
      { x: 400, y: 360, w: 120, h: 22 },
      { x: 640, y: 300, w: 120, h: 22 },
      { x: 900, y: 360, w: 120, h: 22 },
      { x: 1150, y: 300, w: 130, h: 22 },
      { x: 1420, y: 250, w: 150, h: 22 },
      { x: 1700, y: 330, w: 150, h: 22 },
    ],
    coins: [
      { x: 245, y: 398 }, { x: 460, y: 328 }, { x: 700, y: 268 },
      { x: 960, y: 328 }, { x: 1215, y: 268 }, { x: 1495, y: 218 },
      { x: 1775, y: 298 }, { x: 320, y: 468 }, { x: 1300, y: 468 },
    ],
    enemies: [
      { kind: 'patroller', x: 500, y: 470, minX: 340, maxX: 760, speed: 70 },
      { kind: 'patroller', x: 1500, y: 470, minX: 1180, maxX: 1820, speed: 70 },
    ],
    start: { x: 60, y: 460 },
    goal: { x: 1900, y: 440, w: 26, h: 60 },
  },
  // ── Level 3 — Palmwind Paths: longest, three enemies (incl. a faller), tight steps.
  {
    name: 'Palmwind Paths',
    worldW: 2400, worldH: BRAVE_WORLD_H, theme: THEME_PATHS,
    platforms: [
      floor(2400),
      { x: 160, y: 430, w: 110, h: 20 },
      { x: 360, y: 360, w: 100, h: 20 },
      { x: 560, y: 300, w: 100, h: 20 },
      { x: 800, y: 350, w: 100, h: 20 },
      { x: 1040, y: 290, w: 110, h: 20 },
      { x: 1300, y: 240, w: 120, h: 20 },
      { x: 1560, y: 300, w: 120, h: 20 },
      { x: 1820, y: 250, w: 120, h: 20 },
      { x: 2080, y: 320, w: 140, h: 20 },
    ],
    coins: [
      { x: 215, y: 398 }, { x: 410, y: 328 }, { x: 610, y: 268 },
      { x: 850, y: 318 }, { x: 1095, y: 258 }, { x: 1360, y: 208 },
      { x: 1620, y: 268 }, { x: 1880, y: 218 }, { x: 2150, y: 288 },
      { x: 500, y: 468 }, { x: 1700, y: 468 },
    ],
    enemies: [
      { kind: 'patroller', x: 600, y: 470, minX: 300, maxX: 900, speed: 80 },
      { kind: 'patroller', x: 1700, y: 470, minX: 1400, maxX: 2000, speed: 80 },
      { kind: 'faller', x: 1300, minY: 120, maxY: 470, speed: 110 },
    ],
    start: { x: 60, y: 460 },
    goal: { x: 2300, y: 440, w: 26, h: 60 },
  },
];
