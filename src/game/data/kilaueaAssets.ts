import type { AssetManifest } from '@/game/kit/assets';

/** Single-frame Kīlauea textures. `file` is the path after `game/`. */
export const KILAUEA_IMAGES: { key: string; file: string }[] = [
  // AI-generated painted parallax stack (docs/game/kilauea-art-brief.md §5).
  // bg-far is opaque (no matte needed); bg-mid/bg-near are matted ridge strips.
  { key: 'k-bg-far', file: 'kilauea/bg-far.png' },
  { key: 'k-bg-mid', file: 'kilauea/bg-mid.png' },
  { key: 'k-bg-near', file: 'kilauea/bg-near.png' },
  // Hero (single AI-generated character replaces the 6 procedural skins in
  // this scene only — skins still set move/jump/hp tuning).
  { key: 'k-player-run-1', file: 'kilauea/player-run-1.png' },
  { key: 'k-player-run-2', file: 'kilauea/player-run-2.png' },
  { key: 'k-player-run-3', file: 'kilauea/player-run-3.png' },
  { key: 'k-player-run-4', file: 'kilauea/player-run-4.png' },
  { key: 'k-player-jump', file: 'kilauea/player-jump.png' },
  { key: 'k-player-idle', file: 'kilauea/player-idle.png' },
  // Enemies.
  { key: 'k-kakamora-1', file: 'kilauea/kakamora-1.png' },
  { key: 'k-kakamora-2', file: 'kilauea/kakamora-2.png' },
  { key: 'k-lava-crab-1', file: 'kilauea/lava-crab-1.png' },
  { key: 'k-lava-crab-2', file: 'kilauea/lava-crab-2.png' },
  { key: 'k-fire-sprite-1', file: 'kilauea/fire-sprite-1.png' },
  { key: 'k-fire-sprite-2', file: 'kilauea/fire-sprite-2.png' },
  { key: 'k-ember', file: 'kilauea/ember.png' },
  // Theme props + pickups.
  { key: 'k-steam-vent', file: 'kilauea/steam-vent.png' },
  { key: 'k-sulphur-rock', file: 'kilauea/sulphur-rock.png' },
  { key: 'k-checkpoint-banner', file: 'kilauea/checkpoint-banner.png' },
  { key: 'k-beacon', file: 'kilauea/beacon.png' },
  { key: 'k-ohelo-berries', file: 'kilauea/ohelo-berries.png' },
  { key: 'k-platform-wide', file: 'kilauea/platform-wide.png' },
  { key: 'k-platform-mid', file: 'kilauea/platform-mid.png' },
  { key: 'k-platform-small', file: 'kilauea/platform-small.png' },
  // Set pieces.
  { key: 'k-ohia-tree', file: 'kilauea/ohia-tree.png' },
  { key: 'k-hapuu-fern', file: 'kilauea/hapuu-fern.png' },
  { key: 'k-lava-tube-mouth', file: 'kilauea/lava-tube-mouth.png' },
  { key: 'k-grass-tuft', file: 'kilauea/grass-tuft.png' },
  // Friendly ambient wildlife (never a hazard — wildlife-respect rule).
  { key: 'k-nene-1', file: 'kilauea/nene-1.png' },
  { key: 'k-nene-2', file: 'kilauea/nene-2.png' },
  { key: 'k-koae-kea-1', file: 'kilauea/koae-kea-1.png' },
  { key: 'k-koae-kea-2', file: 'kilauea/koae-kea-2.png' },
];

export const KILAUEA_SHEETS: { key: string; file: string; frameWidth: number; frameHeight: number }[] = [];
export const KILAUEA_SHEET_ANIMS: { key: string; sheet: string; frames: number; frameRate: number }[] = [];

/** Animations assembled from single-image textures (one PNG per frame). */
export const KILAUEA_FRAME_ANIMS: { key: string; frames: string[]; frameRate: number }[] = [
  { key: 'k-player-run', frames: ['k-player-run-1', 'k-player-run-2', 'k-player-run-3', 'k-player-run-4'], frameRate: 8 },
  { key: 'k-kakamora-walk', frames: ['k-kakamora-1', 'k-kakamora-2'], frameRate: 4 },
  { key: 'k-lava-crab-walk', frames: ['k-lava-crab-1', 'k-lava-crab-2'], frameRate: 3 },
  { key: 'k-fire-sprite-flicker', frames: ['k-fire-sprite-1', 'k-fire-sprite-2'], frameRate: 6 },
  { key: 'k-nene-walk', frames: ['k-nene-1', 'k-nene-2'], frameRate: 1.8 },
  { key: 'k-koae-kea-soar', frames: ['k-koae-kea-1', 'k-koae-kea-2'], frameRate: 1.2 },
];

export const KILAUEA_MANIFEST: AssetManifest = {
  id: 'kilauea',
  images: KILAUEA_IMAGES,
  sheets: KILAUEA_SHEETS,
  sheetAnims: KILAUEA_SHEET_ANIMS,
  frameAnims: KILAUEA_FRAME_ANIMS,
};
