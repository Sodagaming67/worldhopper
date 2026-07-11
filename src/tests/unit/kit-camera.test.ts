import { describe, it, expect } from 'vitest';
import { followZoom } from '@/game/kit/camera';

describe('followZoom', () => {
  it('fits world height to the viewport', () => {
    expect(followZoom(1080, 540)).toBe(2); // 1080/540
  });
  it('clamps to a max of 4', () => {
    expect(followZoom(4000, 540)).toBe(4);
  });
  it('never goes below 1', () => {
    expect(followZoom(300, 540)).toBe(1);
  });
});
