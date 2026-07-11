import { describe, it, expect } from 'vitest';
import { REEF_IMAGES, REEF_SHEETS, REEF_ANIMS, REEF_FRAME_ANIMS, reefAssetPath } from './reefAssets';

describe('reef asset manifest', () => {
  const all = [...REEF_IMAGES, ...REEF_SHEETS];

  it('has unique keys across images and sheets', () => {
    const keys = all.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('points every file under the reef/ folder', () => {
    for (const a of all) expect(a.file).toMatch(/^reef\/[a-z0-9/-]+\.png$/);
  });

  it('lists the painted background stack bg-1..bg-6', () => {
    const keys = new Set(REEF_IMAGES.map((i) => i.key));
    for (let n = 1; n <= 6; n++) expect(keys.has(`bg-${n}`)).toBe(true);
  });

  it('keeps the scene-logic keys stable', () => {
    const keys = new Set(all.map((a) => a.key));
    for (const k of ['urchin', 'angelfish', 'bubble', 'pearl', 'buoy', 'beacon', 'caustics', 'player-1', 'eel-1', 'sand'])
      expect(keys.has(k)).toBe(true);
  });

  it('gives sheets positive frame dimensions', () => {
    for (const s of REEF_SHEETS) {
      expect(s.frameWidth).toBeGreaterThan(0);
      expect(s.frameHeight).toBeGreaterThan(0);
    }
  });

  it('references only defined sheets from sheet animations', () => {
    const sheetKeys = new Set(REEF_SHEETS.map((s) => s.key));
    for (const anim of REEF_ANIMS) expect(sheetKeys.has(anim.sheet)).toBe(true);
  });

  it('references only defined image keys from frame animations', () => {
    const imageKeys = new Set(REEF_IMAGES.map((i) => i.key));
    for (const anim of REEF_FRAME_ANIMS) {
      expect(anim.frames.length).toBeGreaterThan(1);
      for (const f of anim.frames) expect(imageKeys.has(f)).toBe(true);
    }
  });

  it('resolves paths through the asset() base helper', () => {
    expect(reefAssetPath('reef/bg/1.png')).toContain('/game/reef/bg/1.png');
  });
});
