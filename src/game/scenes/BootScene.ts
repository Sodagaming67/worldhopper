import Phaser from 'phaser';
import { MANIFESTS } from '@/game/data/manifests';
import { createManifestAnims, queueManifest, type AssetManifest } from '@/game/kit/assets';

/**
 * Real preloader (ADR 0001 §4, issue #4): loads the asset manifests named in
 * the game registry's `manifests` entry (all registered manifests when
 * unset) behind a progress bar, creates their animations, then hands off to
 * the scene named by the `startScene` registry entry.
 *
 * Converted worlds mount as `[BootScene, TheirScene]` with
 * `registry: { manifests: [...], startScene: '...' }`; unconverted worlds
 * keep mounting their scene directly.
 */
export class BootScene extends Phaser.Scene {
  private manifests: AssetManifest[] = [];

  constructor() { super('Boot'); }

  preload() {
    const ids = this.game.registry.get('manifests') as string[] | undefined;
    this.manifests = (ids ?? Object.keys(MANIFESTS))
      .map((id) => MANIFESTS[id])
      .filter((m): m is AssetManifest => Boolean(m));

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0E5E78');
    this.add.text(width / 2, height / 2 - 28, 'Island loading…', {
      fontFamily: 'Baloo 2, sans-serif', fontSize: '20px', color: '#EAF6F7',
    }).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2 + 8, 240, 12, 0xffffff, 0.18);
    const bar = this.add.rectangle(width / 2 - 120, height / 2 + 8, 1, 12, 0xf6c453).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => { bar.width = Math.max(1, 240 * v); });

    for (const m of this.manifests) queueManifest(this, m);
  }

  create() {
    for (const m of this.manifests) createManifestAnims(this, m);
    const next = this.game.registry.get('startScene') as string | undefined;
    if (next) this.scene.start(next);
  }
}
