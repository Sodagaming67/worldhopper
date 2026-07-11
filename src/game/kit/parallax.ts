import type Phaser from 'phaser';
import type { ArcadeTheme } from '@/game/data/levels/braveSteps';

/** Minimal shape every arcade level shares so all games can reuse the parallax. */
export type ParallaxLevel = { worldW: number; worldH: number; theme: ArcadeTheme };

/** Convert a CSS custom property name or hex to a Phaser 0xRRGGBB number. */
export function cssToHex(cssVarOrHex: string): number {
  let hex = cssVarOrHex;
  if (hex.startsWith('--')) hex = getComputedStyle(document.documentElement).getPropertyValue(hex).trim();
  const n = parseInt(hex.replace('#', ''), 16);
  return Number.isNaN(n) ? 0x000000 : n;
}

/** Sky gradient + two scroll-factored hill layers across the whole world. */
export function buildParallax(scene: Phaser.Scene, level: ParallaxLevel): void {
  const { worldW, worldH, theme } = level;
  const top = cssToHex(theme.skyTop); const bot = cssToHex(theme.skyBottom);
  const sky = scene.add.graphics().setDepth(0).setScrollFactor(0);
  sky.fillGradientStyle(top, top, bot, bot, 1);
  sky.fillRect(0, 0, scene.scale.width, scene.scale.height);

  const hill = cssToHex(theme.hill);
  const far = scene.add.graphics().setDepth(0).setScrollFactor(0.3);
  far.fillStyle(hill, 0.35);
  for (let x = 0; x < worldW; x += 320) far.fillEllipse(x, worldH - 70, 360, 220);
  const near = scene.add.graphics().setDepth(1).setScrollFactor(0.6);
  near.fillStyle(hill, 0.55);
  for (let x = 160; x < worldW; x += 300) near.fillEllipse(x, worldH - 40, 320, 200);
}
