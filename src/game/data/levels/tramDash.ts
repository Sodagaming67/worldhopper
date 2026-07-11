/**
 * World 3 — Sunline Tram Dash (spec §4 row 3, D8). Pure data, no Phaser.
 * Sonic-Dash-style chase-cam runner: auto-run into the screen along three
 * rails — left (0), middle (1), right (2). Kakamora board mid-level.
 */
export type TramLane = 0 | 1 | 2;

export type TramObstacle = {
  lane: TramLane;
  x: number;
  /** 'sign' = static low sign (jump); 'kakamora' = boarder (jump to defeat it,
   * Sonic Dash-style stomp, or lane-switch to dodge); 'gap' = hole,
   * track-side lanes (jump); 'overhead' = low signage bar (slide under). */
  kind: 'sign' | 'kakamora' | 'gap' | 'overhead';
};

export type TramLaneWaypoint = { atX: number; lane: TramLane };

/** Track-distance span a lane drift takes, ending exactly at a waypoint's atX. */
export const TRAM_DRIFT_DISTANCE = 350;
/** Extra distance before a drift visually starts where the lead-in warning cue fires. */
export const WARNING_LEAD_DISTANCE = 300;

export type TramDashLevel = {
  id: 'tramDash';
  name: string;
  worldW: number;
  worldH: number;
  startSpeed: number;
  maxSpeed: number;
  /** Speed gain per second of survival. */
  accel: number;
  obstacles: TramObstacle[];
  /** Mid-level Kakamora boarding spike: `count` extra boarders spawn across [fromX, toX] on lane 1. */
  boardingWave: { fromX: number; toX: number; count: number };
  /** Sorted by atX ascending. schedule[0]'s lane is the tram's starting lane
   * from x=0 (its own atX is not used for drift timing — there is no "drift
   * into" the first entry). Every entry from index 1 onward describes a real
   * drift, ending exactly at that entry's atX, that starts TRAM_DRIFT_DISTANCE
   * track-units earlier. Consecutive lanes must differ by exactly 1. */
  tramSchedule: TramLaneWaypoint[];
  coins: { lane: TramLane; x: number }[];
  stars: { lane: TramLane; x: number }[]; // exactly 3
  goalX: number;
};

/** Legacy side-view lane y-rows (roof / car windows / track-side), kept for
 * historical tests; the chase-cam view renders lanes as left/middle/right
 * rails via `laneScreenX` instead. */
export const TRAM_LANES: [number, number, number] = [310, 390, 470];
export const TRAM_WORLD_H = 540;
/** Single lane-hop tween duration (ms) — TramDashScene imports this, single source of truth for the feasibility check below. */
export const LANE_HOP_MS = 140;

const coinRow = (lane: TramLane, fromX: number, toX: number, step: number) => {
  const out: { lane: TramLane; x: number }[] = [];
  for (let x = fromX; x <= toX; x += step) out.push({ lane, x });
  return out;
};

export const TRAM_DASH_LEVEL: TramDashLevel = {
  id: 'tramDash',
  name: 'Sunline Tram Dash',
  worldW: 5200,
  worldH: TRAM_WORLD_H,
  startSpeed: 180,
  maxSpeed: 430,
  accel: 9,
  obstacles: [
    // Roster intentionally sparse — the tram (see tramSchedule above) is now
    // the primary hazard. These are occasional variety, not the main
    // challenge. Every placement below is checked against the tram's
    // settled-lane windows to avoid a same-lane jump-vs-slide conflict
    // (overhead needs slide; tram needs jump — never require both at once).
    { lane: 0, x: 500, kind: 'sign' },
    { lane: 2, x: 1200, kind: 'gap' },
    { lane: 0, x: 2000, kind: 'overhead' },
    { lane: 2, x: 3450, kind: 'sign' },
    { lane: 0, x: 3600, kind: 'gap' },
    { lane: 0, x: 4300, kind: 'overhead' },
    { lane: 2, x: 4850, kind: 'sign' },
  ],
  boardingWave: { fromX: 2600, toX: 3400, count: 4 },
  tramSchedule: [
    { atX: 0, lane: 1 },
    { atX: 900, lane: 2 },
    { atX: 1700, lane: 1 },
    { atX: 2500, lane: 0 },
    { atX: 3300, lane: 1 },
    { atX: 4000, lane: 2 },
    { atX: 4700, lane: 1 },
  ],
  coins: [
    ...coinRow(1, 300, 900, 250),
    ...coinRow(0, 1100, 1550, 225),
    ...coinRow(2, 1800, 2250, 225),
    ...coinRow(0, 2600, 3400, 260), // roof is the safe(ish) lane through the wave
    ...coinRow(1, 3600, 4100, 250),
    ...coinRow(2, 4300, 4900, 260),
  ],
  stars: [
    { lane: 0, x: 2050 },  // roof while roof+car are blocked — thread it
    { lane: 2, x: 3100 },  // track-side during the boarding wave
    { lane: 0, x: 4760 },  // final sign hop
  ],
  goalX: 5000,
};

/**
 * Lane-timing feasibility check (regression guard for a real bug: a level
 * can pass the "never blocks all 3 lanes" fairness test yet still be
 * effectively unbeatable, if avoiding one obstacle forces a lane-skip
 * transition — e.g. lane 0 to lane 2 needs TWO sequential hops, since
 * TramDashScene only allows moving to an adjacent lane per input — with too
 * little real time before the next obstacle. Verified against the actual
 * running game via .superpowers/sdd/tramdash-playtest-fix.mjs (a scripted
 * Playwright run using this exact schedule cleared with 0 hits taken).
 *
 * Deterministic no-hit speed profile: x(t) = 80 + startSpeed*t + accel/2*t^2
 * (the level never reaches maxSpeed before the goal in a no-hit run).
 */
function timeAtX(level: TramDashLevel, x: number): number {
  const { startSpeed, accel } = level;
  const dx = x - 80;
  return (-startSpeed + Math.sqrt(startSpeed ** 2 + 2 * accel * dx)) / accel;
}

type LaneCluster = { x: number; free: TramLane[] };

/** Group all obstacles (incl. the generated boarding wave) into x-proximity clusters (same 90px rule as the fairness test), each reduced to its free (unblocked) lanes. */
export function clusterLevelObstacles(level: TramDashLevel): LaneCluster[] {
  const bw = level.boardingWave;
  // Overheads are cleared in-lane by sliding, and sliding does not block lane
  // hops (unlike jumping) — so they impose no lane-timing constraints and are
  // excluded from the blocking-cluster model.
  const all = [...level.obstacles.filter((o) => o.kind !== 'overhead')];
  for (let i = 0; i < bw.count; i++) {
    all.push({ lane: 1, x: bw.fromX + ((bw.toX - bw.fromX) / (bw.count - 1)) * i, kind: 'kakamora' });
  }
  all.sort((a, b) => a.x - b.x);

  const clusters: { xs: number[]; blocked: Set<TramLane> }[] = [];
  for (const o of all) {
    const last = clusters[clusters.length - 1];
    if (last && o.x - Math.min(...last.xs) < 90) { last.blocked.add(o.lane); last.xs.push(o.x); }
    else clusters.push({ xs: [o.x], blocked: new Set([o.lane]) });
  }
  return clusters.map((c) => ({
    x: c.xs.reduce((a, b) => a + b, 0) / c.xs.length,
    free: ([0, 1, 2] as TramLane[]).filter((l) => !c.blocked.has(l)),
  }));
}

/**
 * Pure — no Phaser. Given the tram's lane schedule and the hero's current
 * track distance, returns the tram's current lane and, if a drift is in
 * progress, the lane it's drifting FROM and a 0..1 progress value for
 * interpolating its screen position between the two lanes.
 */
export function tramLaneAt(schedule: TramLaneWaypoint[], x: number): { lane: TramLane; driftFrom?: TramLane; driftProgress?: number } {
  if (!schedule.length) return { lane: 1 };
  let lane = schedule[0].lane;
  for (let i = 1; i < schedule.length; i++) {
    const wp = schedule[i];
    const driftStart = wp.atX - TRAM_DRIFT_DISTANCE;
    if (x < driftStart) return { lane };
    if (x < wp.atX) return { lane: wp.lane, driftFrom: lane, driftProgress: (x - driftStart) / TRAM_DRIFT_DISTANCE };
    lane = wp.lane;
  }
  return { lane };
}

/**
 * Exhaustively checks every combination of choices at ambiguous (multi-free-lane)
 * clusters. Returns the WORST-case minimum slack across all of them — i.e. even
 * if the player picks the least convenient (but still valid) free lane at every
 * fork, is every required transition still physically completable in time, and
 * with how much margin? A negative value means some choice combination is
 * mechanically impossible; a small positive value (e.g. under ~150ms) means it's
 * technically possible but requires near-frame-perfect input.
 */
export function worstCaseLaneFeasibility(level: TramDashLevel): { allFeasible: boolean; worstCaseMinSlackMs: number } {
  const clusters = clusterLevelObstacles(level);
  const hopsBetween = (a: TramLane, b: TramLane) => Math.abs(a - b);

  function evalPath(choice: Record<number, TramLane>): { feasible: boolean; minSlackMs: number } {
    let lane: TramLane = 1, earliestNextStart = 0, prevT = 0, minSlackMs = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      const t = timeAtX(level, c.x);
      const target: TramLane = c.free.includes(lane) ? lane : (choice[i] ?? c.free[0]);
      const transitionMs = hopsBetween(lane, target) * LANE_HOP_MS;
      const startAt = Math.max(earliestNextStart, prevT);
      const finishAt = startAt + transitionMs / 1000;
      const slackMs = (t - finishAt) * 1000;
      if (slackMs < minSlackMs) minSlackMs = slackMs;
      if (slackMs < 0) return { feasible: false, minSlackMs };
      lane = target; earliestNextStart = finishAt; prevT = t;
    }
    return { feasible: true, minSlackMs };
  }

  const ambiguousIdx = clusters.map((c, i) => (c.free.length > 1 ? i : -1)).filter((i) => i >= 0);
  function* combos(idx: number[]): Generator<Record<number, TramLane>> {
    if (!idx.length) { yield {}; return; }
    const [head, ...rest] = idx;
    for (const o of clusters[head].free) for (const sub of combos(rest)) yield { ...sub, [head]: o };
  }

  let allFeasible = true, worstCaseMinSlackMs = Infinity;
  for (const choice of combos(ambiguousIdx)) {
    const r = evalPath(choice);
    if (!r.feasible) allFeasible = false;
    if (r.minSlackMs < worstCaseMinSlackMs) worstCaseMinSlackMs = r.minSlackMs;
  }
  return { allFeasible, worstCaseMinSlackMs: Math.round(worstCaseMinSlackMs) };
}
