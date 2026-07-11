import { describe, it, expect } from 'vitest';
import { TRAM_DASH_LEVEL, TRAM_LANES, worstCaseLaneFeasibility, tramLaneAt, TRAM_DRIFT_DISTANCE, WARNING_LEAD_DISTANCE, type TramLaneWaypoint } from '@/game/data/levels/tramDash';

describe('TRAM_DASH_LEVEL (World 3 — Sunline Tram Dash)', () => {
  it('has three distinct lanes inside the world height', () => {
    expect(TRAM_LANES).toHaveLength(3);
    expect(new Set(TRAM_LANES).size).toBe(3);
    for (const y of TRAM_LANES) {
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(TRAM_DASH_LEVEL.worldH);
    }
  });

  it('is long, ramps speed, and ends past 90% of the world', () => {
    expect(TRAM_DASH_LEVEL.worldW).toBeGreaterThanOrEqual(4000);
    expect(TRAM_DASH_LEVEL.maxSpeed).toBeGreaterThan(TRAM_DASH_LEVEL.startSpeed);
    expect(TRAM_DASH_LEVEL.goalX).toBeGreaterThan(TRAM_DASH_LEVEL.worldW * 0.9);
  });

  it('every obstacle and pickup sits on a valid lane inside the world', () => {
    for (const o of TRAM_DASH_LEVEL.obstacles) {
      expect([0, 1, 2]).toContain(o.lane);
      expect(o.x).toBeGreaterThan(0);
      expect(o.x).toBeLessThan(TRAM_DASH_LEVEL.goalX);
    }
    for (const c of [...TRAM_DASH_LEVEL.coins, ...TRAM_DASH_LEVEL.stars]) {
      expect([0, 1, 2]).toContain(c.lane);
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(TRAM_DASH_LEVEL.worldW);
    }
  });

  it('places exactly 3 stars and a boarding wave in the middle third', () => {
    expect(TRAM_DASH_LEVEL.stars).toHaveLength(3);
    const w = TRAM_DASH_LEVEL.boardingWave;
    expect(w.fromX).toBeGreaterThan(TRAM_DASH_LEVEL.worldW / 4);
    expect(w.toX).toBeLessThan(TRAM_DASH_LEVEL.worldW * 0.8);
    expect(w.count).toBeGreaterThanOrEqual(3);
  });

  it('never blocks all three lanes at once (fairness — overheads excluded: cleared in-lane by sliding)', () => {
    const solid = TRAM_DASH_LEVEL.obstacles.filter((o) => o.kind !== 'overhead');
    const sorted = [...solid].sort((a, b) => a.x - b.x);
    for (let i = 0; i < sorted.length; i++) {
      const cluster = sorted.filter((o) => Math.abs(o.x - sorted[i].x) < 90);
      expect(new Set(cluster.map((o) => o.lane)).size).toBeLessThan(3);
    }
  });

  it('includes overhead (slide-under) obstacles: at least 2, at least 1 in the endgame past x=3400', () => {
    const overheads = TRAM_DASH_LEVEL.obstacles.filter((o) => o.kind === 'overhead');
    expect(overheads.length).toBeGreaterThanOrEqual(2);
    expect(overheads.some((o) => o.x > 3400)).toBe(true);
  });

  it('every overhead is slideable where it stands — no same-lane solid obstacle within 100 units', () => {
    // Sliding clears an overhead in-lane; that only works if the player can
    // legally BE in that lane at that x. Enforce breathing room from any
    // same-lane solid obstacle so the slide is a reflex, not a trap.
    const overheads = TRAM_DASH_LEVEL.obstacles.filter((o) => o.kind === 'overhead');
    const solid = TRAM_DASH_LEVEL.obstacles.filter((o) => o.kind !== 'overhead');
    for (const oh of overheads) {
      for (const s of solid.filter((o) => o.lane === oh.lane)) {
        expect(Math.abs(s.x - oh.x)).toBeGreaterThanOrEqual(100);
      }
    }
  });

  it('is beatable by lane-hopping alone, with real margin, no matter which free lane is picked at every fork', () => {
    // Regression guard: "never blocks all 3 lanes" alone doesn't guarantee a
    // level is actually playable — avoiding one obstacle can force a 0<->2
    // lane-skip (two sequential hops, since only adjacent-lane moves exist)
    // with too little real time before the next one. Verified against the
    // live game via .superpowers/sdd/tramdash-playtest-fix.mjs (scripted
    // Playwright run using this exact worst-case path cleared with 0 hits).
    const { allFeasible, worstCaseMinSlackMs } = worstCaseLaneFeasibility(TRAM_DASH_LEVEL);
    expect(allFeasible).toBe(true);
    // 150ms is roughly one human reaction+tap; below that a transition is
    // "technically possible" but not fair to ask of a player.
    expect(worstCaseMinSlackMs).toBeGreaterThanOrEqual(150);
  });
});

describe('tramLaneAt (in-lane companion tram schedule)', () => {
  const schedule: TramLaneWaypoint[] = [
    { atX: 0, lane: 1 },
    { atX: 1000, lane: 2 },
    { atX: 2000, lane: 0 },
  ];

  it('returns the starting lane before any drift begins', () => {
    expect(tramLaneAt(schedule, -500)).toEqual({ lane: 1 });
    expect(tramLaneAt(schedule, 1000 - TRAM_DRIFT_DISTANCE - 1)).toEqual({ lane: 1 });
  });

  it('interpolates during a drift, reporting the from-lane and 0..1 progress', () => {
    const midDrift = tramLaneAt(schedule, 1000 - TRAM_DRIFT_DISTANCE / 2);
    expect(midDrift.lane).toBe(2);
    expect(midDrift.driftFrom).toBe(1);
    expect(midDrift.driftProgress).toBeCloseTo(0.5, 5);
  });

  it('settles into the new lane exactly at atX and stays until the next drift', () => {
    expect(tramLaneAt(schedule, 1000)).toEqual({ lane: 2 });
    expect(tramLaneAt(schedule, 2000 - TRAM_DRIFT_DISTANCE - 1)).toEqual({ lane: 2 });
  });

  it('settles into the final waypoint lane and stays there past the last drift', () => {
    expect(tramLaneAt(schedule, 2000)).toEqual({ lane: 0 });
    expect(tramLaneAt(schedule, 99999)).toEqual({ lane: 0 });
  });

  it('with an empty schedule, defaults to lane 1 (defensive — real levels always author one)', () => {
    expect(tramLaneAt([], 500)).toEqual({ lane: 1 });
  });
});

describe('TRAM_DASH_LEVEL.tramSchedule (shape only — Task 3 authors the real content)', () => {
  it('starts from x=0', () => {
    expect(TRAM_DASH_LEVEL.tramSchedule.length).toBeGreaterThan(0);
    expect(TRAM_DASH_LEVEL.tramSchedule[0].atX).toBe(0);
  });
});

describe('TRAM_DASH_LEVEL.tramSchedule (real schedule)', () => {
  it('only ever drifts to an adjacent lane', () => {
    const sched = TRAM_DASH_LEVEL.tramSchedule;
    for (let i = 1; i < sched.length; i++) {
      expect(Math.abs(sched[i].lane - sched[i - 1].lane)).toBe(1);
    }
  });

  it('waypoints are spaced far enough apart that warnings never overlap', () => {
    const sched = TRAM_DASH_LEVEL.tramSchedule;
    const totalLead = TRAM_DRIFT_DISTANCE + WARNING_LEAD_DISTANCE;
    for (let i = 1; i < sched.length; i++) {
      expect(sched[i].atX - sched[i - 1].atX).toBeGreaterThan(totalLead);
    }
  });

  it('never requires jump (for the tram) and slide (for an overhead) in the same lane at once', () => {
    // The tram is only "solid" — i.e. requires an escape — while settled
    // (not mid-drift). Check a window around each overhead's x wide enough
    // to cover its own collision tolerance.
    const overheads = TRAM_DASH_LEVEL.obstacles.filter((o) => o.kind === 'overhead');
    for (const oh of overheads) {
      for (const x of [oh.x - 30, oh.x, oh.x + 30]) {
        const info = tramLaneAt(TRAM_DASH_LEVEL.tramSchedule, x);
        const tramSolid = info.driftProgress === undefined;
        expect(tramSolid && info.lane === oh.lane).toBe(false);
      }
    }
  });
});
