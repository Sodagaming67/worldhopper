import { describe, it, expect } from 'vitest';
import { APOC_LEVELS, APOC_WORLD_H } from '@/game/data/levels/apocalypse';

describe('APOC_LEVELS', () => {
  it('has two levels', () => {
    expect(APOC_LEVELS).toHaveLength(2);
  });

  it('each level is a wide scrolling world with a full-width floor', () => {
    for (const l of APOC_LEVELS) {
      expect(l.worldH).toBe(APOC_WORLD_H);
      expect(l.worldW).toBeGreaterThanOrEqual(5000);
      const floor = l.platforms.find((p) => p.x === 0 && p.w === l.worldW);
      expect(floor, `${l.name} needs a full-width floor`).toBeTruthy();
    }
  });

  it('keeps start and flag inside the world; flag near the right', () => {
    for (const l of APOC_LEVELS) {
      const inX = (v: number) => v >= 0 && v <= l.worldW;
      const inY = (v: number) => v >= 0 && v <= l.worldH;
      expect(inX(l.start.x) && inY(l.start.y)).toBe(true);
      expect(inX(l.goal.x) && inY(l.goal.y)).toBe(true);
      expect(l.goal.x).toBeGreaterThan(l.worldW * 0.9);
    }
  });

  it('keeps coins, stars, health and checkpoints inside the world', () => {
    for (const l of APOC_LEVELS) {
      const inBounds = (p: { x: number; y: number }) =>
        p.x >= 0 && p.x <= l.worldW && p.y >= 0 && p.y <= l.worldH;
      for (const c of l.coins) expect(inBounds(c)).toBe(true);
      for (const s of l.stars) expect(inBounds(s)).toBe(true);
      for (const h of l.health) expect(inBounds(h)).toBe(true);
      for (const cp of l.checkpoints) expect(inBounds(cp)).toBe(true);
    }
  });

  it('level 1 has at least as many enemies as level 0', () => {
    expect(APOC_LEVELS[1].enemies.length).toBeGreaterThanOrEqual(APOC_LEVELS[0].enemies.length);
  });

  it('has valid enemy patrol bounds and a rising-lava config', () => {
    for (const l of APOC_LEVELS) {
      for (const e of l.enemies) {
        expect(e.minX).toBeLessThan(e.maxX);
        expect(e.speed).toBeGreaterThan(0);
      }
      expect(l.lava.riseSpeed).toBeGreaterThan(0);
      expect(l.skySpawn.intervalMs).toBeGreaterThan(0);
    }
  });
});
