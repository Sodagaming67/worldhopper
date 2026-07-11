import { describe, it, expect } from 'vitest';
import { scoreForRun, COIN_SCORE, STOMP_SCORE, LIVES_BONUS } from '@/game/kit/score';

describe('scoreForRun', () => {
  it('sums coins, stomps and a per-life bonus', () => {
    expect(scoreForRun({ coins: 3, stomps: 2, livesLeft: 3 })).toBe(
      3 * COIN_SCORE + 2 * STOMP_SCORE + 3 * LIVES_BONUS,
    );
  });
  it('is zero for an empty run with no lives', () => {
    expect(scoreForRun({ coins: 0, stomps: 0, livesLeft: 0 })).toBe(0);
  });
});
