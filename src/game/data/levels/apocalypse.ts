/**
 * Apocalypse Run — burning-city superhero platformer levels.
 * Pure data, no Phaser import. World is 540 tall; wide enough to scroll (~6000).
 * Each level has a full-width floor plus a mid tier and a high climb up the
 * right, denser/faster on level 1. Rising lava forces upward progress.
 */
export type ApocPlatformRect = { x: number; y: number; w: number; h: number };

/** Enemy union for the apocalypse scene. */
export type ApocEnemy =
  | { kind: 'archer'; x: number; y: number; minX: number; maxX: number; speed: number }
  | { kind: 'zombie'; x: number; y: number; minX: number; maxX: number; speed: number };

/** Sky-zombie spawner: drops a falling zombie above the player on an interval. */
export type SkySpawn = { intervalMs: number; speed: number; patrolRange: number };

/** Rising lava: a rectangle that climbs from startY upward at riseSpeed px/s. */
export type LavaConfig = { startY: number; riseSpeed: number };

/** Burning-city parallax theme — 4 layers of hex colour bands. */
export type ApocTheme = {
  sky: [number, number, number, number]; // dark → ember gradient bands
  far: number; // far building silhouettes
  mid: number; // mid building silhouettes
  midWindow: number; // dim mid windows
  near: number; // near (darkest) buildings
  nearWindow: number; // bright near windows
  flame: [number, number, number]; // rooftop flame triangle colours
};

export type ApocLevel = {
  name: string;
  worldW: number;
  worldH: number;
  theme: ApocTheme;
  platforms: ApocPlatformRect[];
  enemies: ApocEnemy[];
  skySpawn: SkySpawn;
  coins: { x: number; y: number }[];
  stars: { x: number; y: number }[];
  health: { x: number; y: number }[];
  checkpoints: { x: number; y: number }[];
  lava: LavaConfig;
  start: { x: number; y: number };
  goal: ApocPlatformRect;
};

export const APOC_WORLD_H = 540;

const THEME_HALL: ApocTheme = {
  sky: [0x0d0200, 0x2b0500, 0x5c0e00, 0x8b1a00],
  far: 0x130404,
  mid: 0x1e0800,
  midWindow: 0x8a4a00,
  near: 0x0a0808,
  nearWindow: 0xff8c00,
  flame: [0xff4400, 0xff7700, 0xffbb00],
};
const THEME_INFERNO: ApocTheme = {
  sky: [0x140100, 0x3a0600, 0x731000, 0xb02000],
  far: 0x1a0505,
  mid: 0x260a00,
  midWindow: 0xa85800,
  near: 0x0d0a0a,
  nearWindow: 0xffa520,
  flame: [0xff3300, 0xff8800, 0xffcc22],
};

// Helper: a full-width floor for a given world width.
const floor = (w: number): ApocPlatformRect => ({ x: 0, y: 500, w, h: 40 });

// Build a regular mid-tier + high-climb platform set across a world width.
function buildPlatforms(worldW: number, step: number): ApocPlatformRect[] {
  const out: ApocPlatformRect[] = [floor(worldW)];
  // Mid tier: rooftops scattered at varying heights.
  let x = 260;
  let up = true;
  while (x < worldW - 360) {
    const y = up ? 410 : 350;
    out.push({ x, y, w: 150, h: 22 });
    up = !up;
    x += step;
  }
  // High climb up the right: ascending ledges to the goal.
  const climbStartX = worldW - 1100;
  for (let i = 0; i < 11; i++) {
    out.push({ x: climbStartX + i * 90, y: 440 - i * 30, w: 120, h: 20 });
  }
  return out;
}

export const APOC_LEVELS: ApocLevel[] = [
  // ── Level 0 — Echoes in the Hall: burning gallery district. ──────────────
  {
    name: 'Echoes in the Hall',
    worldW: 6000,
    worldH: APOC_WORLD_H,
    theme: THEME_HALL,
    platforms: buildPlatforms(6000, 300),
    enemies: [
      { kind: 'zombie', x: 700, y: 470, minX: 520, maxX: 980, speed: 70 },
      { kind: 'archer', x: 1500, y: 470, minX: 1300, maxX: 1760, speed: 80 },
      { kind: 'zombie', x: 2300, y: 470, minX: 2100, maxX: 2560, speed: 70 },
      { kind: 'archer', x: 3100, y: 470, minX: 2900, maxX: 3360, speed: 80 },
      { kind: 'zombie', x: 3900, y: 470, minX: 3700, maxX: 4160, speed: 70 },
      { kind: 'archer', x: 4700, y: 470, minX: 4500, maxX: 4960, speed: 80 },
      { kind: 'zombie', x: 5400, y: 470, minX: 5200, maxX: 5660, speed: 70 },
    ],
    skySpawn: { intervalMs: 3500, speed: 60, patrolRange: 220 },
    coins: [
      { x: 335, y: 378 }, { x: 635, y: 318 }, { x: 935, y: 378 },
      { x: 1235, y: 318 }, { x: 1535, y: 378 }, { x: 1835, y: 318 },
      { x: 2135, y: 378 }, { x: 2435, y: 318 }, { x: 2735, y: 378 },
      { x: 3035, y: 318 }, { x: 3335, y: 378 }, { x: 3635, y: 318 },
      { x: 4235, y: 378 }, { x: 4835, y: 318 }, { x: 5135, y: 378 },
      { x: 200, y: 468 }, { x: 1700, y: 468 }, { x: 3200, y: 468 },
      { x: 4400, y: 468 }, { x: 5600, y: 468 },
    ],
    stars: [
      { x: 935, y: 330 }, { x: 2735, y: 330 }, { x: 4235, y: 330 },
      { x: 5750, y: 200 },
    ],
    health: [
      { x: 1835, y: 290 }, { x: 4100, y: 470 },
    ],
    checkpoints: [
      { x: 1500, y: 470 }, { x: 3100, y: 470 }, { x: 4700, y: 470 },
    ],
    lava: { startY: 560, riseSpeed: 12 },
    start: { x: 80, y: 460 },
    goal: { x: 5860, y: 120, w: 26, h: 60 },
  },
  // ── Level 1 — Inferno Ascent: denser enemies, faster lava, harder climb. ──
  {
    name: 'Inferno Ascent',
    worldW: 6200,
    worldH: APOC_WORLD_H,
    theme: THEME_INFERNO,
    platforms: buildPlatforms(6200, 280),
    enemies: [
      { kind: 'zombie', x: 600, y: 470, minX: 440, maxX: 900, speed: 90 },
      { kind: 'archer', x: 1200, y: 470, minX: 1020, maxX: 1480, speed: 100 },
      { kind: 'zombie', x: 1800, y: 470, minX: 1620, maxX: 2080, speed: 90 },
      { kind: 'archer', x: 2400, y: 470, minX: 2220, maxX: 2680, speed: 100 },
      { kind: 'zombie', x: 3000, y: 470, minX: 2820, maxX: 3280, speed: 90 },
      { kind: 'archer', x: 3600, y: 470, minX: 3420, maxX: 3880, speed: 100 },
      { kind: 'zombie', x: 4200, y: 470, minX: 4020, maxX: 4480, speed: 90 },
      { kind: 'archer', x: 4800, y: 470, minX: 4620, maxX: 5080, speed: 100 },
      { kind: 'zombie', x: 5400, y: 470, minX: 5220, maxX: 5680, speed: 90 },
      { kind: 'archer', x: 5800, y: 470, minX: 5640, maxX: 6000, speed: 100 },
    ],
    skySpawn: { intervalMs: 2600, speed: 80, patrolRange: 260 },
    coins: [
      { x: 335, y: 378 }, { x: 615, y: 318 }, { x: 895, y: 378 },
      { x: 1175, y: 318 }, { x: 1455, y: 378 }, { x: 1735, y: 318 },
      { x: 2015, y: 378 }, { x: 2295, y: 318 }, { x: 2575, y: 378 },
      { x: 2855, y: 318 }, { x: 3135, y: 378 }, { x: 3415, y: 318 },
      { x: 3695, y: 378 }, { x: 3975, y: 318 }, { x: 4255, y: 378 },
      { x: 4535, y: 318 }, { x: 4815, y: 378 }, { x: 5095, y: 318 },
      { x: 200, y: 468 }, { x: 2000, y: 468 }, { x: 4000, y: 468 }, { x: 5800, y: 468 },
    ],
    stars: [
      { x: 895, y: 330 }, { x: 2575, y: 330 }, { x: 4255, y: 330 },
      { x: 5500, y: 330 }, { x: 5950, y: 200 },
    ],
    health: [
      { x: 1455, y: 330 }, { x: 3695, y: 330 }, { x: 5095, y: 270 },
    ],
    checkpoints: [
      { x: 1200, y: 470 }, { x: 2400, y: 470 }, { x: 3600, y: 470 }, { x: 4800, y: 470 },
    ],
    lava: { startY: 560, riseSpeed: 18 },
    start: { x: 80, y: 460 },
    goal: { x: 6060, y: 120, w: 26, h: 60 },
  },
];
