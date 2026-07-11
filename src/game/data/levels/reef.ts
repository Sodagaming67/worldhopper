/**
 * World 4 — Kahaluʻu Reef (spec §4 row 4). Pure data, no Phaser.
 * Side-view buoyancy swim: gentle upward drift, air meter, bubble vents,
 * current zones, dolphin slipstreams (friendly — wildlife rule). The three
 * stars are rare-fish photo ops ("photo-collect rare fish for the secret star").
 */
export type ReefRect = { x: number; y: number; w: number; h: number };

export type ReefEnemy =
  | { kind: 'eel'; x: number; y: number; minX: number; maxX: number; speed: number }
  | { kind: 'jelly'; x: number; y: number; amplitude: number; periodMs: number }
  | { kind: 'urchin'; x: number; y: number };

export type ReefLevel = {
  id: 'reef';
  name: string;
  worldW: number;
  worldH: number;
  /** Air seconds at full tank. */
  airSeconds: number;
  /** Velocity zones: entering adds (vx, vy) to the swimmer. */
  currents: (ReefRect & { vx: number; vy: number })[];
  /** Friendly dolphin slipstream zones: strong forward push, never harm. */
  dolphinPaths: ReefRect[];
  /** Air refill vents. */
  bubbles: { x: number; y: number }[];
  enemies: ReefEnemy[];
  pearls: { x: number; y: number }[];
  stars: { x: number; y: number }[]; // exactly 3 — rare fish
  checkpoints: { x: number; y: number }[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
};

export const REEF_WORLD_H = 540;

const pearlLine = (fromX: number, toX: number, step: number, y: number) => {
  const out: { x: number; y: number }[] = [];
  for (let x = fromX; x <= toX; x += step) out.push({ x, y });
  return out;
};

export const REEF_LEVEL: ReefLevel = {
  id: 'reef',
  name: 'Kahaluʻu Reef',
  worldW: 4600,
  worldH: REEF_WORLD_H,
  airSeconds: 30,
  currents: [
    { x: 900, y: 120, w: 500, h: 200, vx: -60, vy: 0 },    // headwind current — swim low to avoid
    { x: 2200, y: 300, w: 400, h: 180, vx: 0, vy: -70 },   // upwelling — lifts you
    { x: 3400, y: 100, w: 500, h: 220, vx: 80, vy: 0 },    // tailwind near the end
  ],
  dolphinPaths: [
    { x: 1500, y: 180, w: 600, h: 120 },
    { x: 2900, y: 240, w: 500, h: 120 },
  ],
  bubbles: [
    { x: 700, y: 430 }, { x: 1600, y: 420 }, { x: 2500, y: 440 },
    { x: 3300, y: 430 }, { x: 4100, y: 420 },
  ],
  enemies: [
    { kind: 'urchin', x: 850, y: 500 },
    { kind: 'eel', x: 1100, y: 380, minX: 950, maxX: 1350, speed: 70 },
    { kind: 'jelly', x: 1900, y: 250, amplitude: 90, periodMs: 2600 },
    { kind: 'urchin', x: 2350, y: 500 },
    { kind: 'eel', x: 2700, y: 400, minX: 2550, maxX: 2950, speed: 85 },
    { kind: 'urchin', x: 3050, y: 505 },
    { kind: 'jelly', x: 3200, y: 220, amplitude: 110, periodMs: 2300 },
    { kind: 'urchin', x: 3700, y: 505 },
    { kind: 'eel', x: 4000, y: 350, minX: 3850, maxX: 4250, speed: 90 },
  ],
  pearls: [
    ...pearlLine(300, 1300, 200, 300),
    ...pearlLine(1550, 2050, 125, 240),  // along the first dolphin path
    ...pearlLine(2300, 3300, 200, 350),
    ...pearlLine(3500, 4300, 200, 260),
  ],
  stars: [
    { x: 1250, y: 150 },  // high above the headwind current
    { x: 2380, y: 480 },  // deep, next to (not on) the urchin
    { x: 4350, y: 140 },  // top corner before the goal
  ],
  checkpoints: [{ x: 1600, y: 300 }, { x: 3100, y: 300 }],
  start: { x: 80, y: 260 },
  goal: { x: 4480, y: 300 },
};
