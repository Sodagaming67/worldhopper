import { describe, it, expect } from 'vitest';
import { patrolVelocity } from '@/game/kit/patrol';

describe('patrolVelocity', () => {
  it('turns right at or past the left bound', () => {
    expect(patrolVelocity(40, -50, 40, 200, 50)).toBe(50);
    expect(patrolVelocity(30, -50, 40, 200, 50)).toBe(50);
  });
  it('turns left at or past the right bound', () => {
    expect(patrolVelocity(200, 50, 40, 200, 50)).toBe(-50);
  });
  it('keeps current velocity between bounds', () => {
    expect(patrolVelocity(120, -50, 40, 200, 50)).toBe(-50);
    expect(patrolVelocity(120, 50, 40, 200, 50)).toBe(50);
  });
});
