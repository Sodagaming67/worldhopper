import { describe, it, expect } from 'vitest';
import { ART_CREDITS } from './artCredits';

describe('art credits', () => {
  it('lists every attribution-required pack (CraftPix) plus voluntary credits', () => {
    expect(ART_CREDITS.length).toBeGreaterThanOrEqual(3);
    expect(ART_CREDITS.some((c) => c.author.includes('CraftPix'))).toBe(true);
    expect(ART_CREDITS.some((c) => c.author.includes('Kenney'))).toBe(true);
  });

  it('has complete rows', () => {
    for (const c of ART_CREDITS) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.author.length).toBeGreaterThan(0);
      expect(c.license.length).toBeGreaterThan(0);
      expect(c.url).toMatch(/^https:\/\//);
    }
  });
});
