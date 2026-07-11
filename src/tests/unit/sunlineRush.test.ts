import { describe, it, expect } from 'vitest';
import { SUNLINE_RUSH_LEVELS, RUSH_WORLD_H } from '@/game/data/levels/sunlineRush';

describe('SUNLINE_RUSH_LEVELS', () => {
  it('has two levels, the second longer with more obstacles', () => {
    expect(SUNLINE_RUSH_LEVELS).toHaveLength(2);
    expect(SUNLINE_RUSH_LEVELS[1].worldW).toBeGreaterThan(SUNLINE_RUSH_LEVELS[0].worldW);
    expect(SUNLINE_RUSH_LEVELS[1].barriers.length).toBeGreaterThan(SUNLINE_RUSH_LEVELS[0].barriers.length);
  });

  it('each level has a full-width floor and a goal near the right edge', () => {
    for (const l of SUNLINE_RUSH_LEVELS) {
      expect(l.worldH).toBe(RUSH_WORLD_H);
      expect(l.floor.x).toBe(0);
      expect(l.floor.w).toBe(l.worldW);
      expect(l.goal.x).toBeGreaterThan(l.worldW * 0.7);
    }
  });

  it('keeps start, barriers and coins inside the world; run speed ramps up', () => {
    for (const l of SUNLINE_RUSH_LEVELS) {
      const inX = (v: number) => v >= 0 && v <= l.worldW;
      const inY = (v: number) => v >= 0 && v <= l.worldH;
      expect(inX(l.start.x) && inY(l.start.y)).toBe(true);
      for (const b of l.barriers) {
        expect(inX(b.x) && inX(b.x + b.w)).toBe(true);
        expect(b.h).toBeGreaterThan(0);
      }
      for (const c of l.coins) expect(inX(c.x) && inY(c.y)).toBe(true);
      expect(l.runSpeed).toBeGreaterThan(0);
    }
    expect(SUNLINE_RUSH_LEVELS[1].runSpeed).toBeGreaterThan(SUNLINE_RUSH_LEVELS[0].runSpeed);
  });
});
