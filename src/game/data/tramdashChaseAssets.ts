import type { AssetManifest } from '@/game/kit/assets';

/** Single-frame Tram Dash chase-cam textures. `file` is the path after `game/`. */
export const TRAMDASH_CHASE_IMAGES: { key: string; file: string }[] = [
  // Opaque vanishing-point backdrop (docs/game/tramdash-chase-art-brief.md).
  { key: 'tc-bg-horizon', file: 'tramdash-chase/bg-horizon.png' },
  // Hero seen from behind: run cycle, jump, slide.
  { key: 'tc-hero-run-1', file: 'tramdash-chase/hero-run-1.png' },
  { key: 'tc-hero-run-2', file: 'tramdash-chase/hero-run-2.png' },
  { key: 'tc-hero-jump', file: 'tramdash-chase/hero-jump.png' },
  { key: 'tc-hero-slide', file: 'tramdash-chase/hero-slide.png' },
  // Kakamora boarders, facing the camera.
  { key: 'tc-kakamora-1', file: 'tramdash-chase/kakamora-1.png' },
  { key: 'tc-kakamora-2', file: 'tramdash-chase/kakamora-2.png' },
  // Obstacles + pickups + goal, all facing the camera.
  { key: 'tc-sign', file: 'tramdash-chase/sign.png' },
  { key: 'tc-overhead', file: 'tramdash-chase/overhead.png' },
  { key: 'tc-gap', file: 'tramdash-chase/gap.png' },
  { key: 'tc-coin', file: 'tramdash-chase/coin.png' },
  { key: 'tc-star', file: 'tramdash-chase/star.png' },
  { key: 'tc-goal-car', file: 'tramdash-chase/goal-car.png' },
  // Trackside props, swept past by updateProps().
  { key: 'tc-palm', file: 'tramdash-chase/palm.png' },
  { key: 'tc-pole', file: 'tramdash-chase/pole.png' },
];

export const TRAMDASH_CHASE_SHEETS: { key: string; file: string; frameWidth: number; frameHeight: number }[] = [];
export const TRAMDASH_CHASE_SHEET_ANIMS: { key: string; sheet: string; frames: number; frameRate: number }[] = [];

/** Animations assembled from single-image textures (one PNG per frame). */
export const TRAMDASH_CHASE_FRAME_ANIMS: { key: string; frames: string[]; frameRate: number }[] = [
  { key: 'tc-hero-run', frames: ['tc-hero-run-1', 'tc-hero-run-2'], frameRate: 6 },
  { key: 'tc-kakamora-bob', frames: ['tc-kakamora-1', 'tc-kakamora-2'], frameRate: 4 },
];

export const TRAMDASH_CHASE_MANIFEST: AssetManifest = {
  id: 'tramdash-chase',
  images: TRAMDASH_CHASE_IMAGES,
  sheets: TRAMDASH_CHASE_SHEETS,
  sheetAnims: TRAMDASH_CHASE_SHEET_ANIMS,
  frameAnims: TRAMDASH_CHASE_FRAME_ANIMS,
};
