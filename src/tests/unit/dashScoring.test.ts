import { describe, it, expect } from 'vitest';
import { comboMultiplier, isNearMiss, COMBO_STEP, COMBO_MAX, NEAR_MISS_X, NEAR_MISS_BONUS } from '@/game/kit/dashScoring';

describe('comboMultiplier', () => {
  it('starts at 1x and steps +0.5x every COMBO_STEP pickups', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(COMBO_STEP - 1)).toBe(1);
    expect(comboMultiplier(COMBO_STEP)).toBe(1.5);
    expect(comboMultiplier(COMBO_STEP * 2)).toBe(2);
  });
  it('caps at COMBO_MAX', () => {
    expect(comboMultiplier(1000)).toBe(COMBO_MAX);
  });
});

describe('isNearMiss', () => {
  it('rejects anything farther than NEAR_MISS_X in x', () => {
    expect(isNearMiss(1, NEAR_MISS_X + 1, false, true)).toBe(false);
  });
  it('same lane counts only when airborne (jumped clear)', () => {
    expect(isNearMiss(0, 10, true, false)).toBe(true);
    expect(isNearMiss(0, 10, false, false)).toBe(false);
  });
  it('adjacent lane counts only after a recent hop (narrow dodge, not a cruise-by)', () => {
    expect(isNearMiss(1, 10, false, true)).toBe(true);
    expect(isNearMiss(1, 10, false, false)).toBe(false);
  });
  it('two lanes away never counts', () => {
    expect(isNearMiss(2, 5, true, true)).toBe(false);
  });
  it('exports a positive bonus', () => {
    expect(NEAR_MISS_BONUS).toBeGreaterThan(0);
  });
});
