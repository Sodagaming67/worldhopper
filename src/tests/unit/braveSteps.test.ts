import { describe, it, expect } from 'vitest';
import { BRAVE_LEVELS, BRAVE_WORLD_H } from '@/game/data/levels/braveSteps';

describe('BRAVE_LEVELS', () => {
  it('has three progressively harder levels', () => {
    expect(BRAVE_LEVELS).toHaveLength(3);
    const enemyCounts = BRAVE_LEVELS.map((l) => l.enemies.length);
    expect(enemyCounts[0]).toBeGreaterThanOrEqual(1);
    expect(enemyCounts[1]).toBeGreaterThanOrEqual(2);
    expect(enemyCounts[2]).toBeGreaterThanOrEqual(3);
  });

  it('each level is a wide scrolling world with a full-width floor', () => {
    for (const l of BRAVE_LEVELS) {
      expect(l.worldH).toBe(BRAVE_WORLD_H);
      expect(l.worldW).toBeGreaterThanOrEqual(1400);
      const floor = l.platforms.find((p) => p.x === 0 && p.w === l.worldW);
      expect(floor, `${l.name} needs a full-width floor`).toBeTruthy();
    }
  });

  it('keeps start, coins and goal inside the world; goal near the right', () => {
    for (const l of BRAVE_LEVELS) {
      const inX = (v: number) => v >= 0 && v <= l.worldW;
      const inY = (v: number) => v >= 0 && v <= l.worldH;
      expect(inX(l.start.x) && inY(l.start.y)).toBe(true);
      expect(l.goal.x).toBeGreaterThan(l.worldW * 0.7);
      for (const c of l.coins) expect(inX(c.x) && inY(c.y)).toBe(true);
    }
  });

  it('has valid patroller bounds', () => {
    for (const l of BRAVE_LEVELS) {
      for (const e of l.enemies) {
        if (e.kind === 'patroller') {
          expect(e.minX).toBeLessThan(e.maxX);
          expect(e.speed).toBeGreaterThan(0);
        }
      }
    }
  });
});
