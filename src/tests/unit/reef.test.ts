import { describe, it, expect } from 'vitest';
import { REEF_LEVEL, REEF_WORLD_H } from '@/game/data/levels/reef';

describe('REEF_LEVEL (World 4 — Kahaluʻu Reef)', () => {
  it('is a wide underwater world', () => {
    expect(REEF_LEVEL.worldH).toBe(REEF_WORLD_H);
    expect(REEF_LEVEL.worldW).toBeGreaterThanOrEqual(4000);
    expect(REEF_LEVEL.goal.x).toBeGreaterThan(REEF_LEVEL.worldW * 0.9);
  });

  it('places exactly 3 rare-fish stars and keeps everything in-world', () => {
    expect(REEF_LEVEL.stars).toHaveLength(3);
    const inBounds = (p: { x: number; y: number }) =>
      p.x >= 0 && p.x <= REEF_LEVEL.worldW && p.y >= 0 && p.y <= REEF_LEVEL.worldH;
    for (const p of [...REEF_LEVEL.pearls, ...REEF_LEVEL.stars, ...REEF_LEVEL.bubbles, ...REEF_LEVEL.checkpoints]) {
      expect(inBounds(p)).toBe(true);
    }
  });

  it('has breathable spacing: a bubble or checkpoint at least every 1200px', () => {
    const airX = [...REEF_LEVEL.bubbles, ...REEF_LEVEL.checkpoints].map((b) => b.x).sort((a, b) => a - b);
    let prev = 0;
    for (const x of airX) { expect(x - prev).toBeLessThanOrEqual(1200); prev = x; }
    expect(REEF_LEVEL.worldW - prev).toBeLessThanOrEqual(1200);
  });

  it('enemies have valid kinds and patrol ranges', () => {
    for (const e of REEF_LEVEL.enemies) {
      expect(['eel', 'jelly', 'urchin']).toContain(e.kind);
      if (e.kind === 'eel') expect(e.minX).toBeLessThan(e.maxX);
    }
  });

  it('dolphin slipstreams exist and are friendly zones (no overlap with urchins)', () => {
    expect(REEF_LEVEL.dolphinPaths.length).toBeGreaterThanOrEqual(1);
    for (const d of REEF_LEVEL.dolphinPaths) {
      for (const e of REEF_LEVEL.enemies.filter((e) => e.kind === 'urchin')) {
        const inside = e.x >= d.x && e.x <= d.x + d.w && e.y >= d.y && e.y <= d.y + d.h;
        expect(inside).toBe(false);
      }
    }
  });
});
