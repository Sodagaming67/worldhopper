import { describe, it, expect } from 'vitest';
import { ISLAND_LEVELS, ISLAND_WORLD_H } from '@/game/data/levels/island';

const LEVELS = [ISLAND_LEVELS.lagoon, ISLAND_LEVELS.blackSand, ISLAND_LEVELS.kilauea];

describe('ISLAND_LEVELS', () => {
  it('are wide scrolling worlds with a full-width floor', () => {
    for (const l of LEVELS) {
      expect(l.worldH).toBe(ISLAND_WORLD_H);
      expect(l.worldW).toBeGreaterThanOrEqual(4500);
      expect(l.platforms.find((p) => p.x === 0 && p.w === l.worldW)).toBeTruthy();
    }
  });

  it('keeps start and goal in-world; goal near the right edge', () => {
    for (const l of LEVELS) {
      expect(l.start.x).toBeGreaterThanOrEqual(0);
      expect(l.goal.x).toBeGreaterThan(l.worldW * 0.9);
    }
  });

  it('places exactly 3 stars per world (3-star loop, spec §4)', () => {
    for (const l of LEVELS) expect(l.stars).toHaveLength(3);
  });

  it('keeps all pickups and checkpoints inside the world', () => {
    for (const l of LEVELS) {
      const inBounds = (p: { x: number; y: number }) =>
        p.x >= 0 && p.x <= l.worldW && p.y >= 0 && p.y <= l.worldH;
      for (const c of [
        ...l.coins,
        ...l.stars,
        ...l.health,
        ...l.checkpoints,
        ...l.vents,
        ...l.drips,
        ...(l.lightRadius?.lanterns ?? []),
      ]) {
        expect(inBounds(c)).toBe(true);
      }
    }
  });

  it('lagoon is the gentle intro: no lava, no sky spawner, seal checkpoints', () => {
    const l = ISLAND_LEVELS.lagoon;
    expect(l.lava).toBeNull();
    expect(l.skySpawn).toBeNull();
    expect(l.checkpointStyle).toBe('seal');
    expect(l.backdrop).toBe('lagoon');
    expect(l.ambient.dolphins).toBe(true);
    for (const e of l.enemies) expect(['kakamora', 'jelly']).toContain(e.skin);
  });

  it('kilauea is the finale: rising lava, ember sky spawner, denser enemies', () => {
    const k = ISLAND_LEVELS.kilauea;
    expect(k.lava).not.toBeNull();
    expect(k.lava!.riseSpeed).toBeGreaterThan(0);
    expect(k.skySpawn).not.toBeNull();
    expect(k.backdrop).toBe('volcano');
    expect(k.enemies.length).toBeGreaterThan(ISLAND_LEVELS.lagoon.enemies.length);
    for (const e of k.enemies) expect(['lavaCrab', 'fireSprite', 'kakamora']).toContain(e.skin);
  });

  it('elevated enemies patrol within a single platform tile', () => {
    for (const l of LEVELS) {
      for (const e of l.enemies) {
        if (e.y >= 460) continue; // ground enemies live on the floor
        const tile = l.platforms.find(
          (p) =>
            !(p.x === 0 && p.w === l.worldW) && // exclude full-width floor
            p.y === e.y + 30 &&
            e.minX >= p.x &&
            e.maxX <= p.x + p.w
        );
        expect(tile, `enemy at x=${e.x},y=${e.y} in ${l.id} has no seating tile`).toBeTruthy();
      }
    }
  });

  it('has valid patrol bounds everywhere', () => {
    for (const l of LEVELS) {
      for (const e of l.enemies) {
        expect(e.minX).toBeLessThan(e.maxX);
        expect(e.speed).toBeGreaterThan(0);
      }
    }
  });

  it('lagoon and kilauea are untouched by the new hazard systems', () => {
    for (const l of [ISLAND_LEVELS.lagoon, ISLAND_LEVELS.kilauea]) {
      expect(l.waveFlood).toBeNull();
      expect(l.lightRadius).toBeNull();
      expect(l.vents).toEqual([]);
      expect(l.drips).toEqual([]);
      expect(l.mongoose).toBeNull();
      expect(l.hatchlings).toBeNull();
    }
  });

  it('blackSand is the dusk beach: sneaker waves, escort, mongoose, seal checkpoints', () => {
    const b = ISLAND_LEVELS.blackSand;
    expect(b.backdrop).toBe('blackSand');
    expect(b.waveFlood).not.toBeNull();
    expect(b.waveFlood!.floodY).toBeGreaterThan(300); // only the LOW route floods
    expect(b.waveFlood!.periodMs).toBeGreaterThan(b.waveFlood!.surgeMs);
    expect(b.checkpointStyle).toBe('seal');
    expect(b.lava).toBeNull();
    expect(b.hatchlings).not.toBeNull();
    expect(b.hatchlings!.sea.x).toBeGreaterThan(b.hatchlings!.nest.x);
    expect(b.mongoose).not.toBeNull();
    expect(b.skySpawn?.skin).toBe('frigate');
    for (const e of b.enemies) expect(['kakamora', 'ghostCrab']).toContain(e.skin);
  });
});

// Beatability invariants — the slowest hero (titan: move 200, jump -520 vs
// gravity 1100 → ~189px max jump reach) must have a survivable route. These
// mirror the scene's tuning constants; update together if tuning changes.
const SLOWEST_MOVE = 200;
const MAX_JUMP_GAP = 160; // level design bound, safely under 189px reach

/** Merge non-floor platforms into x-coverage intervals, sorted by x. */
function elevatedCoverage(l: (typeof LEVELS)[number]): Array<[number, number]> {
  const spans = l.platforms
    .filter((p) => !(p.x === 0 && p.w === l.worldW))
    .map((p): [number, number] => [p.x, p.x + p.w])
    .sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [a, b] of spans) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}

describe('ISLAND_LEVELS beatability', () => {
  it('lava worlds: elevated route has no gap wider than a jump, all the way to the goal', () => {
    // Where the floor floods, the elevated route is the only way — it must be
    // continuous. Lava-free worlds can always fall back to the floor.
    for (const l of LEVELS.filter((w) => w.lava)) {
      const cover = elevatedCoverage(l);
      for (let i = 1; i < cover.length; i++) {
        const gap = cover[i][0] - cover[i - 1][1];
        expect(
          gap,
          `${l.id}: ${gap}px gap at x=${cover[i - 1][1]} exceeds jump reach`,
        ).toBeLessThanOrEqual(MAX_JUMP_GAP);
      }
      // Route must reach under the goal flag.
      expect(cover[cover.length - 1][1]).toBeGreaterThanOrEqual(l.goal.x);
    }
  });

  it('kilauea: slowest hero reaches every elevated platform before the lava does', () => {
    const k = ISLAND_LEVELS.kilauea;
    const { startY, riseSpeed } = k.lava!;
    for (const p of k.platforms) {
      if (p.x === 0 && p.w === k.worldW) continue; // floor is meant to flood
      const arrival = (p.x + p.w) / SLOWEST_MOVE; // run from x=0 to far edge
      const submerged = (startY - p.y) / riseSpeed; // lava top hits platform top
      expect(
        arrival + 5, // ≥5s of slack for hops, enemies, and hesitation
        `platform at x=${p.x},y=${p.y} floods at ${submerged.toFixed(1)}s but is reached at ${arrival.toFixed(1)}s`,
      ).toBeLessThanOrEqual(submerged);
    }
  });
});
