import { describe, it, expect } from 'vitest';
import {
  project, perspective, laneScreenX, playerPlaneY, depthFor, projectLaneFrac,
  DEPTH, DASH_DEPTH, DRAW_DISTANCE, HORIZON_FRAC,
} from '@/game/kit/chaseProjection';

const VP = { width: 800, height: 600 };

describe('chaseProjection (pseudo-3D chase-cam math)', () => {
  it('scale is 1 at the player plane and strictly decreases with z', () => {
    expect(perspective(0)).toBe(1);
    let prev = 1;
    for (const z of [100, 300, 700, 1500, 2200]) {
      const s = perspective(z);
      expect(s).toBeLessThan(prev);
      expect(s).toBeGreaterThan(0);
      prev = s;
    }
  });

  it('clamps negative z to the player plane (never over-scales behind the player)', () => {
    expect(perspective(-80)).toBe(1);
    expect(project(0, -80, VP).scale).toBe(1);
  });

  it('lanes converge toward the vanishing point as z grows', () => {
    const nearSpread = project(2, 0, VP).x - project(0, 0, VP).x;
    const farSpread = project(2, 2000, VP).x - project(0, 2000, VP).x;
    expect(farSpread).toBeGreaterThan(0);
    expect(farSpread).toBeLessThan(nearSpread * 0.5);
  });

  it('center lane stays on the screen center line at every depth', () => {
    for (const z of [0, 500, 2000]) expect(project(1, z, VP).x).toBe(VP.width / 2);
  });

  it('objects rise from the player row toward (but never past) the horizon', () => {
    const near = project(1, 0, VP).y;
    const far = project(1, 2000, VP).y;
    expect(near).toBe(playerPlaneY(VP));
    expect(far).toBeLessThan(near);
    expect(far).toBeGreaterThan(VP.height * HORIZON_FRAC);
  });

  it('a widened depth (dash) makes distant objects loom larger', () => {
    expect(project(1, 1000, VP, DASH_DEPTH).scale).toBeGreaterThan(project(1, 1000, VP, DEPTH).scale);
  });

  it('depthFor sorts near above far and stays under the juice-popup range (19+)', () => {
    expect(depthFor(0)).toBeGreaterThan(depthFor(500));
    expect(depthFor(500)).toBeGreaterThan(depthFor(DRAW_DISTANCE));
    expect(depthFor(0)).toBeLessThan(19);
  });

  it('depthFor never drops below 10 within the draw distance — TramDashScene pins the companion tram to a fixed depth of 9 specifically so it always renders behind every obstacle/Kakamora/pickup regardless of distance; if this floor ever moves below 9, the tram would occlude oncoming hazards again (the exact bug fixed in ffd5b62)', () => {
    expect(depthFor(DRAW_DISTANCE)).toBe(10);
  });

  it('laneScreenX spreads lanes symmetrically around center', () => {
    expect(laneScreenX(1, VP)).toBe(VP.width / 2);
    expect(laneScreenX(1, VP) - laneScreenX(0, VP)).toBe(laneScreenX(2, VP) - laneScreenX(1, VP));
  });

  it('projectLaneFrac at a whole-number lane matches project exactly', () => {
    for (const lane of [0, 1, 2] as const) {
      expect(projectLaneFrac(lane, 500, VP)).toEqual(project(lane, 500, VP));
    }
  });

  it('projectLaneFrac at a fractional lane sits between its neighboring whole lanes', () => {
    const left = project(0, 500, VP).x;
    const mid = project(1, 500, VP).x;
    const frac = projectLaneFrac(0.5, 500, VP).x;
    expect(frac).toBeGreaterThan(left);
    expect(frac).toBeLessThan(mid);
    expect(frac).toBeCloseTo((left + mid) / 2, 5);
  });
});
