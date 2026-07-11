import Phaser from 'phaser';

export function makeConfig(
  parent: HTMLElement,
  scenes: Phaser.Types.Scenes.SceneType[],
  callbacks?: { preBoot?: (game: Phaser.Game) => void },
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,            // WebGL with Canvas fallback
    parent,
    backgroundColor: '#0E5E78',
    scale: {
      mode: Phaser.Scale.RESIZE,  // fill the parent; React controls the box
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }, // top-down: no gravity
    },
    pixelArt: true,
    roundPixels: true,
    scene: scenes,
    callbacks: callbacks ?? {},
  };
}
