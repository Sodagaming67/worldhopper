import { describe, it, expect } from 'vitest';
import { matteRgba, cropBounds, cropRgba, sampleBackground, unionBounds } from './matte.mjs';

/** 40×40 white canvas with a red square (10..29) that has a white 4×4 hole
 * in its middle — the classic matting trap: interior white must survive. */
function fixture() {
  const w = 40, h = 40;
  const rgba = new Uint8Array(w * h * 4);
  for (let p = 0; p < w * h; p++) rgba.set([255, 255, 255, 255], p * 4);
  for (let y = 10; y < 30; y++)
    for (let x = 10; x < 30; x++) rgba.set([200, 30, 30, 255], (y * w + x) * 4);
  for (let y = 18; y < 22; y++)
    for (let x = 18; x < 22; x++) rgba.set([255, 255, 255, 255], (y * w + x) * 4);
  return { rgba, w, h };
}

const alphaAt = (rgba: Uint8Array, w: number, x: number, y: number) => rgba[(y * w + x) * 4 + 3];

describe('matte-art', () => {
  it('samples the border as the background key', () => {
    const { rgba, w, h } = fixture();
    expect(sampleBackground(rgba, w, h)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('clears border-connected background but keeps interior white', () => {
    const { rgba, w, h } = fixture();
    matteRgba(rgba, w, h, { feather: 0 });
    expect(alphaAt(rgba, w, 0, 0)).toBe(0);
    expect(alphaAt(rgba, w, 39, 39)).toBe(0);
    expect(alphaAt(rgba, w, 9, 20)).toBe(0);        // just outside the square
    expect(alphaAt(rgba, w, 25, 25)).toBe(255);     // square body
    expect(alphaAt(rgba, w, 19, 19)).toBe(255);     // white hole INSIDE survives
  });

  it('global mode also clears enclosed background pockets', () => {
    const { rgba, w, h } = fixture();
    matteRgba(rgba, w, h, { feather: 0, global: true });
    expect(alphaAt(rgba, w, 0, 0)).toBe(0);
    expect(alphaAt(rgba, w, 19, 19)).toBe(0);       // hole INSIDE keyed out too
    expect(alphaAt(rgba, w, 25, 25)).toBe(255);     // square body survives
  });

  it('global magenta key sweeps shaded magenta but keeps art pinks', () => {
    const w = 20, h = 20;
    const rgba = new Uint8Array(w * h * 4);
    for (let p = 0; p < w * h; p++) rgba.set([255, 0, 255, 255], p * 4);   // magenta key
    for (let y = 5; y < 15; y++)
      for (let x = 5; x < 15; x++) rgba.set([200, 30, 30, 255], (y * w + x) * 4); // red square
    rgba.set([238, 25, 128, 255], (10 * w + 2) * 4);   // shaded/hot-pink magenta outside square
    rgba.set([240, 100, 160, 255], (10 * w + 10) * 4); // hibiscus pink INSIDE square
    matteRgba(rgba, w, h, { feather: 0, global: true });
    expect(alphaAt(rgba, w, 2, 10)).toBe(0);    // shaded magenta swept
    expect(alphaAt(rgba, w, 10, 10)).toBe(255); // flower pink survives
  });

  it('feathers the cutout edge with stepped alpha', () => {
    const { rgba, w, h } = fixture();
    matteRgba(rgba, w, h, { feather: 2 });
    const edge = alphaAt(rgba, w, 10, 20);   // square pixel touching background
    const ring2 = alphaAt(rgba, w, 11, 20);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(ring2);
    expect(ring2).toBeLessThan(255);
    expect(alphaAt(rgba, w, 13, 20)).toBe(255); // past the feather band
  });

  it('crops to padded content bounds', () => {
    const { rgba, w, h } = fixture();
    matteRgba(rgba, w, h, { feather: 0 });
    const rect = cropBounds(rgba, w, h, 2);
    expect(rect).toEqual({ x: 8, y: 8, w: 24, h: 24 });
    const out = cropRgba(rgba, w, rect!);
    expect(out.length).toBe(24 * 24 * 4);
    expect(alphaAt(out, 24, 12, 12)).toBe(255);
  });

  it('unionBounds spans multiple rects (for aligning an animation group)', () => {
    const a = { x: 10, y: 10, w: 20, h: 20 };  // covers 10..30, 10..30
    const b = { x: 15, y: 5, w: 10, h: 40 };   // covers 15..25, 5..45
    expect(unionBounds([a, b])).toEqual({ x: 10, y: 5, w: 20, h: 40 });
  });

  it('unionBounds ignores null rects and returns null if all are null', () => {
    const a = { x: 0, y: 0, w: 5, h: 5 };
    expect(unionBounds([a, null])).toEqual(a);
    expect(unionBounds([null, null])).toBeNull();
  });

  it('returns null bounds for a fully transparent result', () => {
    const w = 8, h = 8;
    const rgba = new Uint8Array(w * h * 4);
    for (let p = 0; p < w * h; p++) rgba.set([255, 255, 255, 255], p * 4);
    matteRgba(rgba, w, h);
    expect(cropBounds(rgba, w, h)).toBeNull();
  });
});
