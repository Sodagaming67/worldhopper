/**
 * World 2 — Sunsplash Slides (spec §4 row 2). Pure data, no Phaser.
 * The floor is a set of downhill polylines ("runs"); the space between runs
 * is a fall gap. Slope drives speed in SlideScene (downhill accelerates).
 */
export type SlidePoint = { x: number; y: number };
export type SlideRun = { points: SlidePoint[] };

export type SlideLevel = {
  id: 'poolSlides';
  name: string;
  worldW: number;
  worldH: number;
  runs: SlideRun[];
  /** Boost pads: touching one at floor level adds speed. */
  boosts: { x: number }[];
  /** Timed water jets: damage while on (periodMs cycle, first onMs of it). */
  sprinklers: { x: number; periodMs: number; onMs: number }[];
  /** Air rings: passing through gives +50 score and a small speed kick. */
  rings: { x: number; y: number }[];
  coins: { x: number; y: number }[];
  stars: { x: number; y: number }[]; // exactly 3
  checkpoints: { x: number }[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
};

export const SLIDE_WORLD_H = 540;

const coinArc = (fromX: number, toX: number, step: number, y: number) => {
  const out: { x: number; y: number }[] = [];
  for (let x = fromX; x <= toX; x += step) out.push({ x, y });
  return out;
};

export const SLIDE_LEVEL: SlideLevel = {
  id: 'poolSlides',
  name: 'Sunsplash Slides',
  worldW: 4400,
  worldH: SLIDE_WORLD_H,
  // Three descending half-pipe runs with two jump gaps. Gap landings sit
  // BELOW their takeoff edges so the jumps clear at respawn speed (playtest
  // sim: takeoff-above-landing made gap 2 unclearable after a death).
  runs: [
    { points: [ // Run A: gentle intro dip and rise
      { x: 0, y: 300 }, { x: 400, y: 380 }, { x: 800, y: 340 },
      { x: 1200, y: 430 }, { x: 1500, y: 410 },
    ] },
    { points: [ // Run B: steeper, one big scoop
      { x: 1700, y: 430 }, { x: 2100, y: 470 }, { x: 2500, y: 400 },
      { x: 2800, y: 460 }, { x: 3000, y: 430 },
    ] },
    { points: [ // Run C: final descent to the splash pool goal
      { x: 3220, y: 440 }, { x: 3600, y: 470 }, { x: 4000, y: 440 },
      { x: 4400, y: 480 },
    ] },
  ],
  boosts: [{ x: 500 }, { x: 1900 }, { x: 2600 }, { x: 3500 }],
  sprinklers: [
    { x: 1000, periodMs: 2400, onMs: 900 },
    { x: 2300, periodMs: 2000, onMs: 800 },
    { x: 3800, periodMs: 1800, onMs: 800 },
  ],
  rings: [
    { x: 1600, y: 320 },  // over gap 1 — jump through it (sits on the jump arc)
    { x: 3110, y: 330 },  // over gap 2
    { x: 2450, y: 320 }, { x: 700, y: 280 },
  ],
  coins: [
    ...coinArc(200, 1400, 200, 330),
    ...coinArc(1800, 2900, 200, 370),
    ...coinArc(3300, 4200, 200, 380),
  ],
  stars: [
    { x: 1600, y: 310 },  // over gap 1 — apex of a boosted jump (max reach ~316)
    { x: 2100, y: 380 },  // in the big scoop
    { x: 4150, y: 350 },  // final descent air
  ],
  checkpoints: [{ x: 1700 }, { x: 3220 }], // start of runs B and C
  start: { x: 60, y: 280 },
  goal: { x: 4320, y: 460 },
};
