import { describe, it, expect } from 'vitest';
import { TIDE_POOLS_LEVELS } from '@/game/data/levels/tidePools';

describe('TIDE_POOLS_LEVELS', () => {
  it('has two levels, the second harder than the first', () => {
    expect(TIDE_POOLS_LEVELS).toHaveLength(2);
    expect(TIDE_POOLS_LEVELS[1].enemies.length).toBeGreaterThan(TIDE_POOLS_LEVELS[0].enemies.length);
  });

  it('each level has an explicit world size and enough pearls', () => {
    for (const l of TIDE_POOLS_LEVELS) {
      expect(l.worldW).toBeGreaterThanOrEqual(1600);
      expect(l.worldH).toBeGreaterThanOrEqual(900);
      expect(l.pearls.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('keeps start and every pearl inside the world bounds', () => {
    for (const l of TIDE_POOLS_LEVELS) {
      const inX = (v: number) => v >= 0 && v <= l.worldW;
      const inY = (v: number) => v >= 0 && v <= l.worldH;
      expect(inX(l.start.x) && inY(l.start.y)).toBe(true);
      for (const p of l.pearls) expect(inX(p.x) && inY(p.y)).toBe(true);
    }
  });

  it('mixes patroller and chaser enemies with positive speeds', () => {
    for (const l of TIDE_POOLS_LEVELS) {
      for (const e of l.enemies) {
        expect(e.speed).toBeGreaterThan(0);
        if (e.kind === 'patroller') expect(e.minX).toBeLessThan(e.maxX);
      }
    }
    // Level 1 should include at least one chaser.
    expect(TIDE_POOLS_LEVELS[1].enemies.some((e) => e.kind === 'chaser')).toBe(true);
  });
});
