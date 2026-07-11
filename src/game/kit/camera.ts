/**
 * Pure camera zoom for a follow camera: fill the world's full HEIGHT in the
 * viewport, leaving the wider-than-tall world free to scroll horizontally.
 * Clamped to [1, 4]. No Phaser import — the scene applies this to its camera.
 */
export function followZoom(viewportHeight: number, worldHeight: number): number {
  const raw = viewportHeight / worldHeight;
  return Math.max(1, Math.min(4, raw));
}
