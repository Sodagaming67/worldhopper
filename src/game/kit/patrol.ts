/** Pure horizontal-patrol velocity. No Phaser import. */
export function patrolVelocity(
  x: number, currentVx: number, minX: number, maxX: number, speed: number,
): number {
  if (x <= minX) return speed;
  if (x >= maxX) return -speed;
  return currentVx;
}
