/**
 * Sunline Rush — side-scroll auto-runner. Pure data, no Phaser import.
 * The player auto-runs right at a constant speed and only jumps. Dodge the
 * barriers rising from the floor, grab coins, reach the goal at the right edge.
 * Reuses `ArcadeTheme` (for parallax) and `PlatformRect` (the floor).
 */
import type { ArcadeTheme, PlatformRect } from './braveSteps';

export type Barrier = { x: number; w: number; h: number };

export type RushLevel = {
  name: string;
  worldW: number;
  worldH: number;
  theme: ArcadeTheme;
  floor: PlatformRect;
  barriers: Barrier[];
  coins: { x: number; y: number }[];
  start: { x: number; y: number };
  goal: PlatformRect;
  /** Auto-run speed for this level (ramps slightly per level). */
  runSpeed: number;
};

export const RUSH_WORLD_H = 540;
const FLOOR_Y = 500;

// Level 0 — Sunline Tram: warm gold daytime.
const THEME_TRAM: ArcadeTheme = {
  skyTop: '--color-lagoon', skyBottom: '--color-sand',
  ground: '--color-ocean-deep', plankTop: '--color-sun-gold', coin: '--color-sun-gold', hill: '--color-tide',
};
// Level 1 — Lantern Evening: dusk violets.
const THEME_LANTERN: ArcadeTheme = {
  skyTop: '--color-ocean-deep', skyBottom: '--color-plumeria-violet',
  ground: '--color-ink', plankTop: '--color-spark', coin: '--color-spark', hill: '--color-plumeria-violet',
};

const floor = (w: number): PlatformRect => ({ x: 0, y: FLOOR_Y, w, h: 40 });

export const SUNLINE_RUSH_LEVELS: RushLevel[] = [
  // ── Level 1 — Sunline Tram: 5 barriers, gentle spacing.
  {
    name: 'Sunline Tram',
    worldW: 2600, worldH: RUSH_WORLD_H, theme: THEME_TRAM,
    floor: floor(2600),
    barriers: [
      { x: 520, w: 36, h: 90 },
      { x: 880, w: 36, h: 110 },
      { x: 1280, w: 36, h: 90 },
      { x: 1680, w: 36, h: 120 },
      { x: 2080, w: 36, h: 100 },
    ],
    coins: [
      // Run-level coins (grabbed just by running) in the gaps between barriers.
      { x: 250, y: 470 }, { x: 1080, y: 470 }, { x: 1880, y: 470 },
      // Airborne coins — rewards for well-timed jumps.
      { x: 360, y: 430 }, { x: 700, y: 360 }, { x: 1480, y: 360 }, { x: 2260, y: 400 },
    ],
    start: { x: 80, y: 440 },
    goal: { x: 2480, y: 440, w: 26, h: 60 },
    runSpeed: 170,
  },
  // ── Level 2 — Lantern Evening: longer world, 8 barriers, tighter, faster.
  {
    name: 'Lantern Evening',
    worldW: 3200, worldH: RUSH_WORLD_H, theme: THEME_LANTERN,
    floor: floor(3200),
    barriers: [
      { x: 460, w: 36, h: 100 },
      { x: 760, w: 36, h: 120 },
      { x: 1080, w: 36, h: 100 },
      { x: 1400, w: 36, h: 130 },
      { x: 1740, w: 36, h: 110 },
      { x: 2080, w: 36, h: 130 },
      { x: 2440, w: 36, h: 110 },
      { x: 2800, w: 36, h: 130 },
    ],
    coins: [
      // Run-level coins (grabbed just by running) in the gaps between barriers.
      { x: 240, y: 470 }, { x: 940, y: 470 }, { x: 1920, y: 470 },
      // Airborne coins — rewards for well-timed jumps.
      { x: 620, y: 360 }, { x: 1260, y: 350 }, { x: 1580, y: 420 },
      { x: 2260, y: 420 }, { x: 2620, y: 360 }, { x: 2980, y: 410 },
    ],
    start: { x: 80, y: 440 },
    goal: { x: 3080, y: 440, w: 26, h: 60 },
    runSpeed: 195,
  },
];
