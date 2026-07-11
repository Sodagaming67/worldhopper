import { describe, it, expect } from 'vitest';
import { WORLDS, WORLD_BY_ID } from '@/game/data/worlds';

describe('WORLDS registry', () => {
  it('has the 8 trip stops in order (spec §4)', () => {
    expect(WORLDS.map((w) => w.id)).toEqual([
      'lagoon', 'poolSlides', 'tramDash', 'reef',
      'blackSand', 'lavaTube', 'lavaFlow', 'kilauea',
    ]);
  });

  it('worlds 1–5 and 7 are ready; 6 and 6.5 are coming soon', () => {
    const ready = new Set(['lagoon', 'poolSlides', 'tramDash', 'reef', 'blackSand', 'kilauea']);
    for (const w of WORLDS) {
      expect(w.status).toBe(ready.has(w.id) ? 'ready' : 'soon');
    }
  });

  it('no three consecutive worlds share a genre (variety rule)', () => {
    for (let i = 2; i < WORLDS.length; i++) {
      const window = [WORLDS[i - 2], WORLDS[i - 1], WORLDS[i]];
      const allSame = window.every((w) => w.genre === window[0].genre);
      expect(allSame).toBe(false);
    }
  });

  it('every world has a one-line intro and a real place', () => {
    for (const w of WORLDS) {
      expect(w.introLine.length).toBeGreaterThan(10);
      expect(w.place.length).toBeGreaterThan(3);
      expect(WORLD_BY_ID[w.id]).toBe(w);
    }
  });
});
