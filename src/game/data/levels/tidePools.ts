/**
 * Tide Pools — top-down "collect-and-dodge" reefs. Pure data, no Phaser import.
 * Swim a large scrolling reef, collect every pearl, dodge patrollers + chasers.
 * Reuses `ArcadeTheme` (for parallax) and `ArcadeEnemy` (patroller + chaser).
 */
import type { ArcadeTheme, ArcadeEnemy } from './braveSteps';

export type TidePoolLevel = {
  name: string;
  worldW: number;
  worldH: number;
  theme: ArcadeTheme;
  pearls: { x: number; y: number }[];
  enemies: ArcadeEnemy[];
  start: { x: number; y: number };
};

// Level 0 — Turtleglass Lagoon: calm teals.
const THEME_LAGOON: ArcadeTheme = {
  skyTop: '--color-lagoon', skyBottom: '--color-tide',
  ground: '--color-ocean-deep', plankTop: '--color-sun-gold', coin: '--color-sun-gold', hill: '--color-tide',
};
// Level 1 — Fourfold Springs: deeper blues.
const THEME_SPRINGS: ArcadeTheme = {
  skyTop: '--color-tide', skyBottom: '--color-ocean-deep',
  ground: '--color-ink', plankTop: '--color-spark', coin: '--color-spark', hill: '--color-ocean-deep',
};

export const TIDE_POOLS_LEVELS: TidePoolLevel[] = [
  // ── Level 1 — Turtleglass Lagoon: 8 pearls, 1 patroller + 1 chaser.
  {
    name: 'Turtleglass Lagoon',
    worldW: 1600, worldH: 900, theme: THEME_LAGOON,
    pearls: [
      { x: 260, y: 200 }, { x: 560, y: 160 }, { x: 880, y: 240 },
      { x: 1200, y: 200 }, { x: 1380, y: 480 }, { x: 980, y: 640 },
      { x: 560, y: 700 }, { x: 240, y: 560 },
    ],
    enemies: [
      { kind: 'patroller', x: 700, y: 450, minX: 480, maxX: 1100, speed: 70 },
      { kind: 'chaser', x: 1300, y: 760, speed: 55 },
    ],
    start: { x: 200, y: 450 },
  },
  // ── Level 2 — Fourfold Springs: 11 pearls, 1 patroller + 2 chasers, bigger world.
  {
    name: 'Fourfold Springs',
    worldW: 2000, worldH: 1000, theme: THEME_SPRINGS,
    pearls: [
      { x: 300, y: 180 }, { x: 640, y: 140 }, { x: 980, y: 200 },
      { x: 1340, y: 160 }, { x: 1700, y: 240 }, { x: 1780, y: 560 },
      { x: 1440, y: 760 }, { x: 1040, y: 820 }, { x: 640, y: 760 },
      { x: 280, y: 700 }, { x: 1000, y: 500 },
    ],
    enemies: [
      { kind: 'patroller', x: 900, y: 480, minX: 560, maxX: 1500, speed: 90 },
      { kind: 'chaser', x: 1700, y: 880, speed: 70 },
      { kind: 'chaser', x: 320, y: 200, speed: 65 },
    ],
    start: { x: 250, y: 500 },
  },
];

export const TIDE_POOLS_WORLD_H = 1000;
