import type { AssetManifest } from '@/game/kit/assets';

/** Single-frame Tram Dash textures. `file` is the path after `game/`. */
export const TRAMDASH_IMAGES: { key: string; file: string }[] = [
  // Parallax stack (docs/game/tramdash-art-brief.md) — bg-far opaque, strips matted.
  { key: 't-bg-far', file: 'tramdash/bg-far.png' },
  { key: 't-bg-mid', file: 'tramdash/bg-mid.png' },
  { key: 't-bg-near', file: 'tramdash/bg-near.png' },
  // Hero riding the coral tram car.
  { key: 't-hero-ride-1', file: 'tramdash/hero-ride-1.png' },
  { key: 't-hero-ride-2', file: 'tramdash/hero-ride-2.png' },
  { key: 't-hero-jump', file: 'tramdash/hero-jump.png' },
  // Kakamora boarders.
  { key: 't-kakamora-1', file: 'tramdash/kakamora-1.png' },
  { key: 't-kakamora-2', file: 'tramdash/kakamora-2.png' },
  // Obstacles + pickups + goal.
  { key: 't-sign', file: 'tramdash/sign.png' },
  { key: 't-gap', file: 'tramdash/gap.png' },
  { key: 't-coin', file: 'tramdash/coin.png' },
  { key: 't-star', file: 'tramdash/star.png' },
  { key: 't-goal-car', file: 'tramdash/goal-car.png' },
];

export const TRAMDASH_SHEETS: { key: string; file: string; frameWidth: number; frameHeight: number }[] = [];
export const TRAMDASH_SHEET_ANIMS: { key: string; sheet: string; frames: number; frameRate: number }[] = [];

/** Animations assembled from single-image textures (one PNG per frame). */
export const TRAMDASH_FRAME_ANIMS: { key: string; frames: string[]; frameRate: number }[] = [
  { key: 't-hero-ride', frames: ['t-hero-ride-1', 't-hero-ride-2'], frameRate: 6 },
  { key: 't-kakamora-bob', frames: ['t-kakamora-1', 't-kakamora-2'], frameRate: 4 },
];

export const TRAMDASH_MANIFEST: AssetManifest = {
  id: 'tramdash',
  images: TRAMDASH_IMAGES,
  sheets: TRAMDASH_SHEETS,
  sheetAnims: TRAMDASH_SHEET_ANIMS,
  frameAnims: TRAMDASH_FRAME_ANIMS,
};
