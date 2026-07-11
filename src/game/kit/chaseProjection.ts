/**
 * Pure sprite-projection math for the Tram Dash pseudo-3D chase-cam (spec
 * 2026-07-11-tramdash-chase-cam-design.md). No Phaser imports — unit-testable.
 *
 * World model: a straight track; every object has a lane (0 left, 1 middle,
 * 2 right) and a z distance ahead of the player in track units (the same
 * units as level-data x). The camera sits behind the player looking at a
 * vanishing point on the horizon. Perspective factor s = D/(D+z) slides
 * everything from the player plane (s=1) toward the vanishing point (s→0).
 */

export type ChaseViewport = { width: number; height: number };
export type Projected = { x: number; y: number; scale: number };

/** Vanishing-point y as a fraction of viewport height. */
export const HORIZON_FRAC = 0.35;
/** Player row y as a fraction of viewport height. */
export const PLAYER_PLANE_FRAC = 0.86;
/** Fraction of viewport width between adjacent lane centers at the player plane. */
export const LANE_SPREAD_FRAC = 0.26;
/** Depth constant D. Bigger D = flatter (more zoomed-in) view. */
export const DEPTH = 1400;
/** Widened D during a dash — a subtle FOV kick so far objects loom sooner. */
export const DASH_DEPTH = 1650;
/** Objects farther ahead than this are hidden. */
export const DRAW_DISTANCE = 2600;
/** Objects stay visible this far behind the player before hiding. */
export const BEHIND_MARGIN = 120;

/** Perspective factor s in (0, 1]: 1 at the player plane, →0 at the horizon. */
export function perspective(z: number, depth: number = DEPTH): number {
  return depth / (depth + Math.max(0, z));
}

/** Like project(), but accepts a fractional lane — for smoothly interpolating
 * a hazard's screen position while it drifts from one lane to another. */
export function projectLaneFrac(laneFrac: number, z: number, vp: ChaseViewport, depth: number = DEPTH): Projected {
  const s = perspective(z, depth);
  const horizonY = vp.height * HORIZON_FRAC;
  const playerY = vp.height * PLAYER_PLANE_FRAC;
  const laneOffset = (laneFrac - 1) * vp.width * LANE_SPREAD_FRAC;
  return {
    x: vp.width / 2 + laneOffset * s,
    y: horizonY + (playerY - horizonY) * s,
    scale: s,
  };
}

/** Project a lane position z track-units ahead of the player onto the screen. */
export function project(lane: 0 | 1 | 2, z: number, vp: ChaseViewport, depth: number = DEPTH): Projected {
  return projectLaneFrac(lane, z, vp, depth);
}

/** Screen x of a lane center at the player plane (where the hero rides). */
export function laneScreenX(lane: 0 | 1 | 2, vp: ChaseViewport): number {
  return project(lane, 0, vp).x;
}

/** Screen y of the player row. */
export function playerPlaneY(vp: ChaseViewport): number {
  return vp.height * PLAYER_PLANE_FRAC;
}

/**
 * Render depth for a gameplay object at z: near objects draw over far ones.
 * Range (10, 18] keeps them under the juice popups (depth 19–20) and above
 * the track graphics (0–2). The player rides at 18.5.
 */
export function depthFor(z: number): number {
  return 18 - (Math.max(0, z) * 8) / DRAW_DISTANCE;
}
