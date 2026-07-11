import { describe, it, expect } from 'vitest';
import { SLIDE_LEVEL, SLIDE_WORLD_H } from '@/game/data/levels/slides';

describe('SLIDE_LEVEL (World 2 — Sunsplash Slides)', () => {
  it('is a wide world with the standard height', () => {
    expect(SLIDE_LEVEL.worldH).toBe(SLIDE_WORLD_H);
    expect(SLIDE_LEVEL.worldW).toBeGreaterThanOrEqual(4000);
  });

  it('has ordered slide runs with ascending x and at least one gap', () => {
    expect(SLIDE_LEVEL.runs.length).toBeGreaterThanOrEqual(3); // ≥2 gaps
    for (const run of SLIDE_LEVEL.runs) {
      expect(run.points.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < run.points.length; i++) {
        expect(run.points[i].x).toBeGreaterThan(run.points[i - 1].x);
      }
    }
    for (let i = 1; i < SLIDE_LEVEL.runs.length; i++) {
      const prevEnd = SLIDE_LEVEL.runs[i - 1].points.at(-1)!.x;
      const nextStart = SLIDE_LEVEL.runs[i].points[0].x;
      expect(nextStart).toBeGreaterThan(prevEnd); // gap, not overlap
      expect(nextStart - prevEnd).toBeLessThanOrEqual(260); // jumpable
    }
  });

  it('places exactly 3 stars and keeps all pickups in-world', () => {
    expect(SLIDE_LEVEL.stars).toHaveLength(3);
    const inBounds = (p: { x: number; y: number }) =>
      p.x >= 0 && p.x <= SLIDE_LEVEL.worldW && p.y >= 0 && p.y <= SLIDE_LEVEL.worldH;
    for (const p of [...SLIDE_LEVEL.coins, ...SLIDE_LEVEL.stars, ...SLIDE_LEVEL.rings]) {
      expect(inBounds(p)).toBe(true);
    }
  });

  it('starts on the first run and ends past 90% of the world', () => {
    expect(SLIDE_LEVEL.start.x).toBeLessThan(SLIDE_LEVEL.runs[0].points.at(-1)!.x);
    expect(SLIDE_LEVEL.goal.x).toBeGreaterThan(SLIDE_LEVEL.worldW * 0.9);
  });

  it('sprinklers and boosts sit on some run (x covered by a polyline)', () => {
    const covered = (x: number) => SLIDE_LEVEL.runs.some(
      (r) => x >= r.points[0].x && x <= r.points.at(-1)!.x,
    );
    for (const s of SLIDE_LEVEL.sprinklers) expect(covered(s.x)).toBe(true);
    for (const b of SLIDE_LEVEL.boosts) expect(covered(b.x)).toBe(true);
    for (const c of SLIDE_LEVEL.checkpoints) expect(covered(c.x)).toBe(true);
  });
});
