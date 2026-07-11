import { describe, it, expect } from 'vitest';
import { encodePng } from './png.mjs';
import { Raster } from './raster.mjs';

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('encodePng', () => {
  it('emits a valid PNG signature and IHDR for a 1x1 image', () => {
    const png = encodePng(1, 1, new Uint8Array([255, 0, 0, 255]));
    expect(png.subarray(0, 8).equals(PNG_SIG)).toBe(true);
    // IHDR length (13) then "IHDR"
    expect(png.readUInt32BE(8)).toBe(13);
    expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(png.readUInt32BE(16)).toBe(1); // width
    expect(png.readUInt32BE(20)).toBe(1); // height
    expect(png[24]).toBe(8);              // bit depth
    expect(png[25]).toBe(6);              // colour type 6 = RGBA
  });

  it('is byte-deterministic for identical input', () => {
    const rgba = new Uint8Array(2 * 2 * 4).fill(120);
    expect(encodePng(2, 2, rgba).equals(encodePng(2, 2, rgba))).toBe(true);
  });

  it('ends with an IEND chunk', () => {
    const png = encodePng(1, 1, new Uint8Array([0, 0, 0, 0]));
    // IEND chunk = length(4) + "IEND"(4) + CRC(4); the label is the middle 4 bytes.
    expect(png.subarray(png.length - 8, png.length - 4).toString('ascii')).toBe('IEND');
  });
});

describe('Raster', () => {
  it('sets a pixel and reads it back via toRgba', () => {
    const r = new Raster(2, 1);
    r.setPixel(1, 0, [10, 20, 30, 40]);
    const out = r.toRgba();
    expect([...out.subarray(0, 4)]).toEqual([0, 0, 0, 0]);
    expect([...out.subarray(4, 8)]).toEqual([10, 20, 30, 40]);
  });

  it('ignores out-of-bounds writes', () => {
    const r = new Raster(1, 1);
    expect(() => r.setPixel(5, 5, [1, 2, 3, 4])).not.toThrow();
    expect([...r.toRgba()]).toEqual([0, 0, 0, 0]);
  });

  it('fills a rect', () => {
    const r = new Raster(3, 1);
    r.rect(0, 0, 2, 1, [9, 9, 9, 255]);
    const out = r.toRgba();
    expect([...out.subarray(0, 4)]).toEqual([9, 9, 9, 255]);
    expect([...out.subarray(4, 8)]).toEqual([9, 9, 9, 255]);
    expect([...out.subarray(8, 12)]).toEqual([0, 0, 0, 0]);
  });
});
