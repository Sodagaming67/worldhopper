/**
 * Big Island Arcade — platformer world data (spec §4). Pure data, no Phaser.
 * Same conventions as apocalypse.ts: world 540 tall, wide scroll, full-width
 * floor + mid tier + high climb to the goal.
 */
export type IslandRect = { x: number; y: number; w: number; h: number };

export type IslandEnemySkin =
  | 'kakamora' | 'jelly' | 'lavaCrab' | 'fireSprite'
  | 'ghostCrab' | 'frigate' | 'bat' | 'caveSprite';

/** kind = engine behavior archetype; skin = island look. */
export type IslandEnemy = {
  kind: 'melee' | 'ranged';
  skin: IslandEnemySkin;
  x: number; y: number; minX: number; maxX: number; speed: number;
};

export type IslandSkySpawn = { intervalMs: number; speed: number; patrolRange: number; skin: IslandEnemySkin };
export type IslandLava = { startY: number; riseSpeed: number };

export type IslandBackdrop = 'lagoon' | 'volcano' | 'blackSand' | 'lavaTube';

export type IslandLevel = {
  id: 'lagoon' | 'blackSand' | 'lavaTube' | 'kilauea';
  name: string;
  worldW: number;
  worldH: number;
  backdrop: IslandBackdrop;
  platforms: IslandRect[];
  /** Kayak platforms get a visual bob (graphics only; bodies stay static). */
  kayaks: IslandRect[];
  enemies: IslandEnemy[];
  skySpawn: IslandSkySpawn | null;
  coins: { x: number; y: number }[];
  stars: { x: number; y: number }[]; // exactly 3 per world
  health: { x: number; y: number }[];
  checkpoints: { x: number; y: number }[];
  checkpointStyle: 'seal' | 'flag';
  lava: IslandLava | null;
  ambient: { dolphins: boolean; fish: boolean };
  /** Sneaker-wave surge: every periodMs the water floods up to floodY for surgeMs (spec §4 row 5). */
  waveFlood: { periodMs: number; surgeMs: number; floodY: number } | null;
  /** Darkness with a light circle around the player; lanterns add fixed circles (spec §4 row 6). */
  lightRadius: { base: number; lanternRadius: number; lanterns: { x: number; y: number }[] } | null;
  /** Steam vents: standing on one boosts you upward. */
  vents: IslandRect[];
  /** Dripping lava: an ember falls from (x, y) every periodMs. */
  drips: { x: number; y: number; periodMs: number }[];
  /** Friendly shell-thief cameo (never a hazard). */
  mongoose: { x: number; minX: number; maxX: number; speed: number } | null;
  /** Turtle-hatchling escort: nest → sea (never harmed). */
  hatchlings: { nest: { x: number; y: number }; sea: { x: number; y: number } } | null;
  start: { x: number; y: number };
  goal: IslandRect;
};

export const ISLAND_WORLD_H = 540;

const floor = (w: number): IslandRect => ({ x: 0, y: 500, w, h: 40 });

/** Mid-tier hop line + an ascending climb to the goal on the right. The hop
 * line runs to worldW - 360 so it interleaves with the climb (matching the
 * apocalypse builder) — ending it earlier strands the player when lava floods
 * the floor. */
function buildPlatforms(worldW: number, step: number): IslandRect[] {
  const out: IslandRect[] = [floor(worldW)];
  let x = 260;
  let up = true;
  while (x < worldW - 360) {
    out.push({ x, y: up ? 410 : 350, w: 150, h: 22 });
    up = !up;
    x += step;
  }
  const climbStartX = worldW - 1100;
  for (let i = 0; i < 11; i++) {
    out.push({ x: climbStartX + i * 90, y: 440 - i * 30, w: 120, h: 20 });
  }
  return out;
}

function coinLine(fromX: number, toX: number, step: number, y: (x: number) => number) {
  const out: { x: number; y: number }[] = [];
  for (let x = fromX; x <= toX; x += step) out.push({ x, y: y(x) });
  return out;
}

export type PlatformerWorldId = IslandLevel['id'];
export const ISLAND_LEVELS: Record<PlatformerWorldId, IslandLevel> = {
  // ── World 1 — Lagoon of First Light: gentle intro (spec §4 row 1). ────────
  lagoon: {
    id: 'lagoon',
    name: 'Lagoon of First Light',
    worldW: 4800,
    worldH: ISLAND_WORLD_H,
    backdrop: 'lagoon',
    platforms: buildPlatforms(4800, 340),
    kayaks: [
      { x: 900, y: 440, w: 110, h: 16 },
      { x: 1900, y: 430, w: 110, h: 16 },
      { x: 2900, y: 440, w: 110, h: 16 },
    ],
    enemies: [
      { kind: 'melee', skin: 'kakamora', x: 800, y: 470, minX: 620, maxX: 1060, speed: 55 },
      { kind: 'melee', skin: 'jelly', x: 1600, y: 470, minX: 1450, maxX: 1840, speed: 45 },
      { kind: 'melee', skin: 'kakamora', x: 2400, y: 470, minX: 2220, maxX: 2660, speed: 55 },
      { kind: 'melee', skin: 'jelly', x: 3200, y: 470, minX: 3050, maxX: 3440, speed: 45 },
      { kind: 'melee', skin: 'kakamora', x: 4000, y: 470, minX: 3820, maxX: 4260, speed: 60 },
    ],
    skySpawn: null,
    coins: [
      ...coinLine(335, 3395, 340, (x) => ((x - 335) / 340) % 2 === 0 ? 378 : 318),
      ...coinLine(500, 4200, 740, () => 468),
    ],
    stars: [
      { x: 955, y: 400 },  // above the first kayak — jump practice
      { x: 2955, y: 400 }, // above the last kayak
      { x: 4620, y: 140 }, // top of the climb, just before the beacon
    ],
    health: [{ x: 1700, y: 468 }, { x: 3600, y: 468 }],
    checkpoints: [{ x: 1600, y: 500 }, { x: 3200, y: 500 }],
    checkpointStyle: 'seal',
    lava: null,
    ambient: { dolphins: true, fish: true },
    waveFlood: null,
    lightRadius: null,
    vents: [],
    drips: [],
    mongoose: null,
    hatchlings: null,
    start: { x: 80, y: 420 },
    goal: { x: 4680, y: 60, w: 30, h: 90 },
  },

  // ── World 5 — Punaluʻu Black Sands: dusk beach, sneaker waves (spec §4 row 5).
  blackSand: {
    id: 'blackSand',
    name: 'Punaluʻu Black Sands',
    worldW: 5200,
    worldH: ISLAND_WORLD_H,
    backdrop: 'blackSand',
    platforms: buildPlatforms(5200, 320),
    kayaks: [],
    enemies: [
      { kind: 'melee', skin: 'ghostCrab', x: 700, y: 470, minX: 520, maxX: 960, speed: 60 },
      { kind: 'melee', skin: 'kakamora', x: 1500, y: 470, minX: 1320, maxX: 1760, speed: 65 },
      { kind: 'melee', skin: 'ghostCrab', x: 2300, y: 470, minX: 2120, maxX: 2560, speed: 65 },
      { kind: 'melee', skin: 'kakamora', x: 3100, y: 470, minX: 2920, maxX: 3360, speed: 70 },
      { kind: 'melee', skin: 'ghostCrab', x: 3900, y: 470, minX: 3720, maxX: 4160, speed: 70 },
      // Adapted from the brief's x=2700/minX=2560/maxX=2860: buildPlatforms(5200, 320)
      // has no y=410 tile spanning that range (nearest tiles are 2180-2330 and
      // 2820-2970) — the elevated-enemy seating test requires minX/maxX to fit
      // inside a single platform. Reseated onto the 2820-2970 tile.
      { kind: 'melee', skin: 'kakamora', x: 2895, y: 380, minX: 2830, maxX: 2960, speed: 60 },
      // Adapted from the brief's x=4400/minX=4260/maxX=4560 for the same reason
      // — reseated onto the 4100-4250 tile (y=410).
      { kind: 'melee', skin: 'kakamora', x: 4175, y: 380, minX: 4110, maxX: 4240, speed: 60 },
    ],
    skySpawn: { intervalMs: 5200, speed: 55, patrolRange: 200, skin: 'frigate' },
    coins: [
      ...coinLine(335, 3855, 320, (x) => ((x - 335) / 320) % 2 === 0 ? 378 : 318),
      ...coinLine(400, 4800, 800, () => 468),
    ],
    stars: [
      { x: 1295, y: 280 },   // mid-tier hop line
      { x: 3200, y: 468 },   // LOW route — grab it between wave surges
      { x: 4900, y: 468 },   // at the sea zone: finish the hatchling walk
    ],
    health: [{ x: 1800, y: 468 }, { x: 3600, y: 468 }],
    checkpoints: [{ x: 1700, y: 500 }, { x: 3400, y: 500 }],
    checkpointStyle: 'seal',
    lava: null,
    ambient: { dolphins: false, fish: true },
    waveFlood: { periodMs: 7000, surgeMs: 1800, floodY: 430 },
    lightRadius: null,
    vents: [],
    drips: [],
    mongoose: { x: 2000, minX: 1500, maxX: 2600, speed: 170 },
    hatchlings: { nest: { x: 3550, y: 480 }, sea: { x: 4900, y: 480 } },
    start: { x: 80, y: 420 },
    goal: { x: 5080, y: 70, w: 30, h: 90 },
  },

  // ── World 7 — Kīlauea Ascent: rising lava finale (spec §4 row 7). ─────────
  kilauea: {
    id: 'kilauea',
    name: 'Kīlauea Ascent',
    worldW: 6000,
    worldH: ISLAND_WORLD_H,
    backdrop: 'volcano',
    platforms: buildPlatforms(6000, 300),
    kayaks: [],
    enemies: [
      { kind: 'melee', skin: 'lavaCrab', x: 700, y: 470, minX: 520, maxX: 980, speed: 70 },
      { kind: 'ranged', skin: 'fireSprite', x: 1500, y: 470, minX: 1300, maxX: 1760, speed: 80 },
      { kind: 'melee', skin: 'kakamora', x: 2300, y: 470, minX: 2100, maxX: 2560, speed: 75 },
      { kind: 'ranged', skin: 'fireSprite', x: 3100, y: 470, minX: 2900, maxX: 3360, speed: 80 },
      { kind: 'melee', skin: 'lavaCrab', x: 3900, y: 470, minX: 3700, maxX: 4160, speed: 75 },
      { kind: 'ranged', skin: 'fireSprite', x: 4700, y: 470, minX: 4500, maxX: 4960, speed: 85 },
      { kind: 'melee', skin: 'lavaCrab', x: 5400, y: 470, minX: 5200, maxX: 5660, speed: 75 },
      { kind: 'melee', skin: 'kakamora', x: 2700, y: 380, minX: 2665, maxX: 2805, speed: 60 },
      { kind: 'melee', skin: 'kakamora', x: 4300, y: 320, minX: 4165, maxX: 4305, speed: 60 },
    ],
    skySpawn: { intervalMs: 3200, speed: 60, patrolRange: 220, skin: 'lavaCrab' },
    coins: [
      ...coinLine(335, 4535, 300, (x) => ((x - 335) / 300) % 2 === 0 ? 378 : 318),
      ...coinLine(200, 5600, 680, () => 468),
    ],
    stars: [
      { x: 1235, y: 280 },
      { x: 3335, y: 280 },
      { x: 5480, y: 130 },
    ],
    health: [{ x: 1400, y: 468 }, { x: 3000, y: 468 }, { x: 4600, y: 468 }],
    checkpoints: [{ x: 1500, y: 500 }, { x: 3000, y: 500 }, { x: 4500, y: 500 }],
    checkpointStyle: 'flag',
    // 5 px/s keeps the slowest hero (200 px/s) ~5s ahead of the flood on every
    // platform of the route — see the beatability tests in island.test.ts.
    lava: { startY: 620, riseSpeed: 5 },
    ambient: { dolphins: false, fish: false },
    waveFlood: null,
    lightRadius: null,
    vents: [],
    drips: [],
    mongoose: null,
    hatchlings: null,
    start: { x: 80, y: 420 },
    goal: { x: 5880, y: 80, w: 30, h: 90 },
  },

  // ── World 6 — Nāhuku Dark Tube: PLACEHOLDER pending Task 4 (spec §4 row 6).
  // `ISLAND_LEVELS` is typed `Record<PlatformerWorldId, IslandLevel>`, and
  // `IslandLevel['id']` already includes 'lavaTube' (needed now so the type
  // widening in this task is forward-compatible) — so a key must exist here
  // for the object literal to satisfy the Record type. This is inert data:
  // world 6's status is 'soon' in worlds.ts, so WorldScreen never reaches
  // IslandPlatformerGame for it. Task 4 replaces this entry with the real
  // lightRadius/lantern cave design; it is deliberately NOT covered by
  // island.test.ts's LEVELS array (which only gained `blackSand` this task).
  lavaTube: {
    id: 'lavaTube',
    name: 'Nāhuku Dark Tube',
    worldW: 4000,
    worldH: ISLAND_WORLD_H,
    backdrop: 'lavaTube',
    platforms: buildPlatforms(4000, 300),
    kayaks: [],
    enemies: [],
    skySpawn: null,
    coins: [],
    stars: [],
    health: [],
    checkpoints: [],
    checkpointStyle: 'flag',
    lava: null,
    ambient: { dolphins: false, fish: false },
    waveFlood: null,
    lightRadius: null,
    vents: [],
    drips: [],
    mongoose: null,
    hatchlings: null,
    start: { x: 80, y: 420 },
    goal: { x: 3880, y: 80, w: 30, h: 90 },
  },
};
