import Phaser from 'phaser';
import { asset } from '@/game/assets';

/** Single-frame texture entry. `file` is the path after `public/game/`. */
export type ManifestImage = { key: string; file: string };
/** Multi-frame spritesheet entry (frames packed left-to-right). */
export type ManifestSheet = { key: string; file: string; frameWidth: number; frameHeight: number };
/** Animation over a spritesheet's frames. */
export type ManifestSheetAnim = { key: string; sheet: string; frames: number; frameRate: number };
/** Animation assembled from single-image textures (one PNG per frame). */
export type ManifestFrameAnim = { key: string; frames: string[]; frameRate: number };

/**
 * Everything one world needs preloaded (ADR 0001 §4 — asset layer behind
 * GameKit). Worlds declare a manifest in `src/game/data/` and register it in
 * `src/game/data/manifests.ts`; `BootScene` preloads it and creates its anims.
 */
export type AssetManifest = {
  id: string;
  images: ManifestImage[];
  sheets: ManifestSheet[];
  sheetAnims: ManifestSheetAnim[];
  frameAnims: ManifestFrameAnim[];
};

/** Queue every texture in the manifest on the scene's loader. */
export function queueManifest(scene: Phaser.Scene, manifest: AssetManifest): void {
  for (const img of manifest.images) scene.load.image(img.key, asset(img.file));
  for (const s of manifest.sheets)
    scene.load.spritesheet(s.key, asset(s.file), { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
}

/** Create the manifest's animations (idempotent — anims are game-global). */
export function createManifestAnims(scene: Phaser.Scene, manifest: AssetManifest): void {
  for (const a of manifest.sheetAnims) {
    if (scene.anims.exists(a.key)) continue;
    scene.anims.create({
      key: a.key,
      frames: scene.anims.generateFrameNumbers(a.sheet, { start: 0, end: a.frames - 1 }),
      frameRate: a.frameRate,
      repeat: -1,
    });
  }
  for (const a of manifest.frameAnims) {
    if (scene.anims.exists(a.key)) continue;
    scene.anims.create({
      key: a.key,
      frames: a.frames.map((f) => ({ key: f })),
      frameRate: a.frameRate,
      repeat: -1,
    });
  }
}
