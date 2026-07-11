import type Phaser from 'phaser';

/**
 * Moana-inspired island hero roster (original characters; spec §5, D5).
 * Persisted ids are unchanged for save compatibility — only the identity
 * layered on each power archetype changes:
 *   bolt → ocean dash, titan → ground smash, comet → glide/float,
 *   aegis → shell shield, mystic → tide slow, blaze → full arsenal.
 */
export type SkinId = 'bolt' | 'titan' | 'comet' | 'aegis' | 'mystic' | 'blaze';

export const SKINS: { id: SkinId; label: string; emoji: string; power: string }[] = [
  { id: 'bolt', label: 'Kaia the Wayfinder', emoji: '🌊', power: 'Ocean dash' },
  { id: 'titan', label: 'Hoku the Demigod', emoji: '🗿', power: 'Ground smash' },
  { id: 'comet', label: 'Lani the Manta Spirit', emoji: '🌬️', power: 'Wind glide' },
  { id: 'aegis', label: 'Koa the Reef Guardian', emoji: '🐚', power: 'Shell shield' },
  { id: 'mystic', label: 'Nalu the Kahuna', emoji: '🌀', power: 'Tide slow' },
  { id: 'blaze', label: "Pele's Ember", emoji: '🔥', power: 'Full arsenal' },
];

export const DEFAULT_SKIN: SkinId = 'bolt';

/** Primary outfit colour per hero — island palette. */
export const SKIN_SUIT: Record<SkinId, number> = {
  bolt: 0x0e7ba8,  // ocean teal
  titan: 0x7a4a20, // koa wood brown
  comet: 0x9adcf0, // sky/wind pale blue
  aegis: 0x2e8b6e, // reef green
  mystic: 0x5a4fcf,// deep-sea violet
  blaze: 0xe8702a, // lava ember (unchanged)
};

const SKIN_TONE = 0xf2d2a9;

/** Build (once) and return an 18×24 superhero texture for a skin. */
export function buildSkinTexture(scene: Phaser.Scene, skin: SkinId): string {
  const key = `arcade-player-${skin}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  const draw = (
    suit: number, cape: number | null, emblem: () => void,
  ) => {
    if (cape !== null) { g.fillStyle(cape, 1); g.fillTriangle(3, 6, 15, 6, 9, 22); }     // cape behind
    g.fillStyle(suit, 1); g.fillRoundedRect(2, 7, 14, 12, 3);                            // costume body
    g.fillStyle(SKIN_TONE, 1); g.fillCircle(9, 6, 5);                                    // head
    g.fillStyle(0x2b1a10, 1); g.fillEllipse(9, 3.5, 11, 5);                              // dark hair cap
    emblem();                                                                             // chest emblem
  };

  switch (skin) {
    case 'titan': // koa-wood brown — ground smash, fish-hook (makau) emblem
      draw(0x7a4a20, null, () => { g.fillStyle(0xf6c453, 1); g.fillRoundedRect(8, 10, 2, 7, 1); g.fillCircle(7, 17, 2.2); g.fillStyle(0x7a4a20, 1); g.fillCircle(7.4, 17, 1); });
      break;
    case 'comet': // pale wind-blue + manta-wing cape — wind glide, wing-chevron emblem
      draw(0x9adcf0, 0xcfeffc, () => { g.fillStyle(0xeaf6f7, 1); g.fillTriangle(6, 12, 9, 15, 9, 12); g.fillTriangle(12, 12, 9, 15, 9, 12); g.fillTriangle(6, 15, 9, 18, 9, 15); g.fillTriangle(12, 15, 9, 18, 9, 15); });
      break;
    case 'aegis': // reef green — shell shield, shell-spiral emblem
      draw(0x2e8b6e, null, () => { g.fillStyle(0xeaf6f7, 1); g.fillCircle(9, 13, 3); g.fillStyle(0x2e8b6e, 1); g.fillCircle(9, 13, 2); g.fillStyle(0xeaf6f7, 1); g.fillCircle(9.8, 12.2, 1); });
      break;
    case 'mystic': // deep-sea violet + cape — tide slow, spiral-tide emblem
      draw(0x5a4fcf, 0x3d2e6b, () => { g.fillStyle(0xf6c453, 1); g.fillCircle(9, 13, 2.4); g.fillStyle(0x5a4fcf, 1); g.fillCircle(9, 13, 1); });
      break;
    case 'blaze': // lava ember — full arsenal, flame emblem (unchanged)
      draw(0xe8702a, null, () => { g.fillStyle(0xf6c453, 1); g.fillTriangle(9, 10, 7, 16, 11, 16); });
      break;
    default: // bolt — ocean teal — ocean dash, wave-curl emblem
      draw(0x0e7ba8, null, () => { g.fillStyle(0xeaf6f7, 1); g.fillCircle(9, 12.5, 2.6); g.fillStyle(0x0e7ba8, 1); g.fillTriangle(6, 15, 12, 15, 9, 11); });
  }

  g.generateTexture(key, 18, 24);
  g.destroy();
  return key;
}
