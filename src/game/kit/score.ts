/** Pure scoring rules shared by every arcade game. No Phaser import. */
export const COIN_SCORE = 10;
export const STOMP_SCORE = 25;
export const LIVES_BONUS = 50;

export function scoreForRun(input: { coins: number; stomps: number; livesLeft: number }): number {
  return input.coins * COIN_SCORE + input.stomps * STOMP_SCORE + input.livesLeft * LIVES_BONUS;
}
