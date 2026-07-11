/**
 * Pure scoring logic for the Tram Dash runner (spec
 * 2026-07-10-tramdash-excitement-design.md). No Phaser imports — unit-testable.
 */

/** Pickups needed per +0.5x multiplier step. */
export const COMBO_STEP = 5;
/** Multiplier ceiling. */
export const COMBO_MAX = 3;
/** Max |playerX - obstacleX| for a pass to count as a near miss. */
export const NEAR_MISS_X = 30;
/** Score awarded per near miss. */
export const NEAR_MISS_BONUS = 15;

/** Score multiplier for a chain of consecutive pickups without a hit. */
export function comboMultiplier(chain: number): number {
  return Math.min(COMBO_MAX, 1 + Math.floor(chain / COMBO_STEP) * 0.5);
}

/**
 * A near miss is a *narrow* escape, not any pass: same lane requires being
 * airborne over a jumpable obstacle; adjacent lane requires a recent lane hop
 * (a last-moment dodge). Two lanes away is never close.
 */
export function isNearMiss(laneGap: number, dx: number, airborne: boolean, recentHop: boolean): boolean {
  if (dx > NEAR_MISS_X) return false;
  if (laneGap === 0) return airborne;
  return laneGap === 1 && recentHop;
}
