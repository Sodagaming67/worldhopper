import type Phaser from 'phaser';

export function coinPop(scene: Phaser.Scene, x: number, y: number, color: number, reduced: boolean): void {
  if (reduced) return;
  const t = scene.add.text(x, y, '+10', { fontFamily: 'Baloo 2, sans-serif', fontSize: '14px', color: '#FDE68A' }).setOrigin(0.5).setDepth(20);
  scene.tweens.add({ targets: t, y: y - 22, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  burst(scene, x, y, color, reduced);
}

export function burst(scene: Phaser.Scene, x: number, y: number, color: number, reduced: boolean): void {
  if (reduced) return;
  for (let i = 0; i < 6; i++) {
    const p = scene.add.circle(x, y, 2, color).setDepth(19);
    const ang = (Math.PI * 2 * i) / 6;
    scene.tweens.add({ targets: p, x: x + Math.cos(ang) * 18, y: y + Math.sin(ang) * 18, alpha: 0, duration: 360, onComplete: () => p.destroy() });
  }
}

export function hitFlash(scene: Phaser.Scene, target: Phaser.GameObjects.Components.AlphaSingle, reduced: boolean): void {
  if (reduced) return;
  scene.tweens.add({ targets: target, alpha: 0.3, duration: 120, yoyo: true, repeat: 3, onComplete: () => target.setAlpha(1) });
}

export function squashBounce(scene: Phaser.Scene, target: Phaser.GameObjects.Components.Transform, reduced: boolean): void {
  if (reduced) return;
  scene.tweens.add({ targets: target, scaleX: 1.3, scaleY: 0.7, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
}

export function shake(scene: Phaser.Scene, reduced: boolean): void {
  if (reduced) return;
  scene.cameras.main.shake(160, 0.006);
}

/** Full-screen ambient color tint pinned to the camera (deep-water grade,
 * volcano warmth, etc.) — a fixed-position tinted rectangle above the world
 * but below the HUD depth range. */
export function ambientGrade(scene: Phaser.Scene, color: number, alpha: number, depth: number): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, color, alpha)
    .setOrigin(0, 0).setScrollFactor(0).setDepth(depth);
}

/** Floating score/callout text (generalises coinPop's '+10' label). */
export function textPop(scene: Phaser.Scene, x: number, y: number, msg: string, color: string, reduced: boolean): void {
  if (reduced) return;
  const t = scene.add.text(x, y, msg, { fontFamily: 'Baloo 2, sans-serif', fontSize: '14px', color }).setOrigin(0.5).setDepth(20);
  scene.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 600, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
}

/** One fading afterimage of the player — call on a timer while dashing. */
export function dashTrailGhost(scene: Phaser.Scene, player: Phaser.GameObjects.Image, reduced: boolean): void {
  if (reduced) return;
  const g = scene.add.image(player.x, player.y, player.texture.key)
    .setScale(player.scaleX, player.scaleY).setAlpha(0.35).setDepth(player.depth - 1);
  scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
}

/**
 * Ambient speed streaks pinned to the camera. Call update(speed/maxSpeed)
 * every frame; streaks fade in above ~55% speed and thicken toward max.
 */
export function speedLines(scene: Phaser.Scene, depth: number): { update(intensity: number): void; destroy(): void } {
  const gfx = scene.add.graphics().setScrollFactor(0).setDepth(depth);
  let phase = 0;
  return {
    update(intensity: number) {
      gfx.clear();
      if (intensity <= 0.55) return;
      const n = Math.round((intensity - 0.55) * 18);
      phase = (phase + 24 * intensity) % scene.scale.width;
      for (let i = 0; i < n; i++) {
        const y = (i * 131) % scene.scale.height;
        const x = scene.scale.width - ((phase + i * 173) % scene.scale.width);
        gfx.fillStyle(0xffffff, 0.1 + 0.12 * intensity);
        gfx.fillRect(x, y, 46 + 40 * intensity, 2);
      }
    },
    destroy() { gfx.destroy(); },
  };
}

/** Small camera zoom pulse — dash activation kick. */
export function zoomPunch(scene: Phaser.Scene, reduced: boolean): void {
  if (reduced) return;
  const cam = scene.cameras.main;
  scene.tweens.add({ targets: cam, zoom: cam.zoom * 1.06, duration: 110, yoyo: true, ease: 'Quad.easeOut' });
}
