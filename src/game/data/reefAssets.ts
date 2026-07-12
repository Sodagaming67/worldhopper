import { asset } from '@/game/assets';
import type { AssetManifest } from '@/game/kit/assets';

/** Single-frame reef textures. `file` is the path after `game/`. */
export const REEF_IMAGES: { key: string; file: string }[] = [
  // CraftPix painted parallax stack (bg/1 = opaque far water … bg/6 = nearest overlay)
  { key: 'bg-1', file: 'reef/bg/1.png' },
  { key: 'bg-2', file: 'reef/bg/2.png' },
  { key: 'bg-3', file: 'reef/bg/3.png' },
  { key: 'bg-4', file: 'reef/bg/4.png' },
  { key: 'bg-5', file: 'reef/bg/5.png' },
  { key: 'bg-6', file: 'reef/bg/6.png' },
  // Kenney Fish Pack pieces
  { key: 'angelfish', file: 'reef/angelfish.png' },
  { key: 'bubble', file: 'reef/bubble.png' },
  { key: 'seaweed-pink-a', file: 'reef/seaweed-pink-a.png' },
  { key: 'seaweed-pink-b', file: 'reef/seaweed-pink-b.png' },
  { key: 'seaweed-green-a', file: 'reef/seaweed-green-a.png' },
  { key: 'seaweed-green-b', file: 'reef/seaweed-green-b.png' },
  { key: 'seaweed-orange-a', file: 'reef/seaweed-orange-a.png' },
  { key: 'coral-a', file: 'reef/coral-a.png' },
  { key: 'rock-a', file: 'reef/rock-a.png' },
  { key: 'rock-b', file: 'reef/rock-b.png' },
  { key: 'sand', file: 'reef/sand.png' },
  // Cartoon Jelly Fish idle frames
  { key: 'jelly-0', file: 'reef/jelly/0.png' },
  { key: 'jelly-1', file: 'reef/jelly/1.png' },
  { key: 'jelly-2', file: 'reef/jelly/2.png' },
  { key: 'jelly-3', file: 'reef/jelly/3.png' },
  // AI-generated original art (docs/game/reef-hero-brief.md; background-matted + cropped)
  // Boy/girl variant chosen at runtime by SwimScene from settings.heroCharacter.
  { key: 'player-1', file: 'reef/player-1.png' },
  { key: 'player-2', file: 'reef/player-2.png' },
  { key: 'player-3', file: 'reef/player-3.png' },
  { key: 'player-4', file: 'reef/player-4.png' },
  { key: 'player-5', file: 'reef/player-5.png' },
  // Girl variant swim cycle (settings.heroCharacter, issue #4's picker) — matted from
  // docs/art-drops/reef/player-reef-{1..4}.png, same 4 poses as player-1..4
  { key: 'player-girl-1', file: 'reef/player-girl-1.png' },
  { key: 'player-girl-2', file: 'reef/player-girl-2.png' },
  { key: 'player-girl-3', file: 'reef/player-girl-3.png' },
  { key: 'player-girl-4', file: 'reef/player-girl-4.png' },
  { key: 'eel-1', file: 'reef/eel-1.png' },
  { key: 'eel-2', file: 'reef/eel-2.png' },
  { key: 'urchin', file: 'reef/urchin.png' },
  { key: 'urchin-wana', file: 'reef/urchin-wana.png' },
  { key: 'pearl', file: 'reef/pearl.png' },
  { key: 'buoy', file: 'reef/buoy.png' },
  { key: 'beacon', file: 'reef/beacon.png' },
  // AI-generated authentic Kahaluʻu Bay species (round 3, reef-hero-brief.md §6)
  { key: 'fish-triggerfish', file: 'reef/fish-triggerfish.png' },
  { key: 'fish-moorish-idol', file: 'reef/fish-moorish-idol.png' },
  { key: 'fish-yellow-tang', file: 'reef/fish-yellow-tang.png' },
  { key: 'fish-raccoon-butterfly', file: 'reef/fish-raccoon-butterfly.png' },
  { key: 'fish-parrotfish', file: 'reef/fish-parrotfish.png' },
  { key: 'fish-convict-tang', file: 'reef/fish-convict-tang.png' },
  { key: 'honu-1', file: 'reef/honu-1.png' },
  { key: 'honu-2', file: 'reef/honu-2.png' },
  { key: 'coral-head-a', file: 'reef/coral-head-a.png' },
  { key: 'coral-head-b', file: 'reef/coral-head-b.png' },
  { key: 'coral-head-c', file: 'reef/coral-head-c.png' },
  // M0 pixel interim (kept — AI-generated caustics wasn't tileable, see ATTRIBUTION.md)
  { key: 'caustics', file: 'reef/caustics.png' },
];

/** Multi-frame reef spritesheets (frames packed left-to-right). None currently — all animated art uses REEF_FRAME_ANIMS. */
export const REEF_SHEETS: { key: string; file: string; frameWidth: number; frameHeight: number }[] = [];

/** Sheet-based animation configs created in SwimScene.create(). None currently. */
export const REEF_ANIMS: { key: string; sheet: string; frames: number; frameRate: number }[] = [];

/** Animations assembled from single-image textures (one PNG per frame). */
export const REEF_FRAME_ANIMS: { key: string; frames: string[]; frameRate: number }[] = [
  { key: 'player-swim', frames: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'], frameRate: 6 },
  { key: 'player-swim-girl', frames: ['player-girl-1', 'player-girl-2', 'player-girl-3', 'player-girl-4'], frameRate: 6 },
  { key: 'eel-swim', frames: ['eel-1', 'eel-2'], frameRate: 4 },
  { key: 'jelly-idle', frames: ['jelly-0', 'jelly-1', 'jelly-2', 'jelly-3'], frameRate: 6 },
  { key: 'honu-swim', frames: ['honu-1', 'honu-2'], frameRate: 2 },
];

export function reefAssetPath(file: string): string {
  return asset(file);
}

/** The reef's manifest, registered in `src/game/data/manifests.ts`. */
export const REEF_MANIFEST: AssetManifest = {
  id: 'reef',
  images: REEF_IMAGES,
  sheets: REEF_SHEETS,
  sheetAnims: REEF_ANIMS,
  frameAnims: REEF_FRAME_ANIMS,
};
