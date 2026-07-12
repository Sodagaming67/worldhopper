// src/game/scenes/SwimScene.ts
import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { REEF_LEVEL, REEF_WORLD_H, type ReefLevel } from '@/game/data/levels/reef';
import { ambientGrade, coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { loseLife } from '@/lib/gameRules';

const SWIM_SPEED = 170;
const BUOYANCY_VY = -28;
const DOLPHIN_PUSH = 130;
const SURFACE_Y = 60;
/** Girl swim frames were matted/cropped to a much larger native canvas than
 * the boy set — same uniform `setScale` rendered the girl hero far too big.
 * `girl` is hand-tuned against the boy's on-screen size, not a pure
 * crop-dimension ratio (that undershot and read as too small). */
const PLAYER_SCALE = { boy: 0.24, girl: 0.14 } as const;

export class SwimScene extends Phaser.Scene {
  private reducedMotion = false;
  private level: ReefLevel = REEF_LEVEL;

  private player!: Phaser.GameObjects.Sprite;
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private bgLayers: Array<{ ts: Phaser.GameObjects.TileSprite; factor: number }> = [];
  private enemyObjs: Array<{ e: ReefLevel['enemies'][number]; dir: number; gfx: Phaser.GameObjects.Sprite }> = [];
  private pearlObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Image }> = [];
  private starObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Image }> = [];
  private bubbleObjs: Array<{ x: number; y: number; topped: boolean }> = [];

  private lives = 3;
  private pearls = 0;
  private stars = 0;
  private scoreBonus = 0;
  private air = 30;
  private invulnUntil = 0;
  private won = false;
  private respawn = { x: 0, y: 0 };

  private dirState = { up: false, down: false, left: false, right: false };
  private readonly onDir = (p: { up: boolean; down: boolean; left: boolean; right: boolean }) => { this.dirState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };

  constructor() { super('Swim'); }

  // Textures + anims come preloaded from BootScene (reef manifest,
  // src/game/data/reefAssets.ts) — this scene no longer preloads anything.

  create() {
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;
    const heroCharacter = useGameStore.getState().settings.heroCharacter;

    // AI-generated illustration (docs/game/reef-hero-brief.md) — a fully
    // rendered multi-color character, not a tintable white suit like the M0
    // pixel placeholder, so no per-skin setTint here (see ATTRIBUTION.md).
    const player = this.add.sprite(0, 0, heroCharacter === 'girl' ? 'player-girl-1' : 'player-1');
    player.setDepth(5); player.setScale(heroCharacter === 'girl' ? PLAYER_SCALE.girl : PLAYER_SCALE.boy);
    if (!this.reducedMotion) player.play(heroCharacter === 'girl' ? 'player-swim-girl' : 'player-swim');
    this.player = player;

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, REEF_WORLD_H)); };
    this.scale.on(Phaser.Scale.Events.RESIZE, fit, this);
    EventBus.on('arcade:dir', this.onDir);
    EventBus.on('arcade:restart', this.onRestart);
    const cleanup = () => {
      EventBus.off('arcade:dir', this.onDir);
      EventBus.off('arcade:restart', this.onRestart);
      this.scale.off(Phaser.Scale.Events.RESIZE, fit, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.buildLevel();
    this.startRun();

    // Deep-water ambient color grade across the whole camera.
    this.levelGfx.push(ambientGrade(this, 0x0a3550, 0.12, 6));
  }

  private buildLevel() {
    // Painted parallax stack: CraftPix layers pinned to the camera, drifting
    // against scroll in update(). Layer 1 is opaque water; 2-6 are overlays.
    this.bgLayers = [];
    const bgDefs = [
      { key: 'bg-1', factor: 0 },
      { key: 'bg-2', factor: 0.06 },
      { key: 'bg-3', factor: 0.12 },
      { key: 'bg-4', factor: 0.22 },
      { key: 'bg-5', factor: 0.36 },
      { key: 'bg-6', factor: 0.5 },
    ];
    bgDefs.forEach((d, i) => {
      const ts = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, d.key)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(-12 + i);
      ts.setTileScale(this.scale.height / 1080);
      this.bgLayers.push({ ts, factor: d.factor });
      this.levelGfx.push(ts);
    });

    // Sand floor strip along the world bottom.
    const sand = this.add.tileSprite(this.level.worldW / 2, REEF_WORLD_H, this.level.worldW, 64, 'sand')
      .setOrigin(0.5, 1).setDepth(-4);
    this.levelGfx.push(sand);

    // Seaweed/coral clusters + rocks (world-anchored set pieces, gentle sway).
    const clusterKeys = ['seaweed-pink-a', 'seaweed-green-a', 'seaweed-orange-a', 'seaweed-pink-b', 'seaweed-green-b', 'coral-a'];
    for (let x = 60, i = 0; x < this.level.worldW; x += 180, i++) {
      const s = this.add.image(x, REEF_WORLD_H - 30, clusterKeys[i % clusterKeys.length])
        .setOrigin(0.5, 1).setDepth(-3).setScrollFactor(0.85).setScale(0.9 + (i % 3) * 0.25);
      this.levelGfx.push(s);
      if (!this.reducedMotion)
        this.tweens.add({ targets: s, angle: 3, duration: 2400 + (i % 4) * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    for (let x = 150, i = 0; x < this.level.worldW; x += 420, i++) {
      const r = this.add.image(x, REEF_WORLD_H - 26, i % 2 ? 'rock-a' : 'rock-b')
        .setOrigin(0.5, 1).setDepth(-3).setScrollFactor(0.85).setScale(0.8);
      this.levelGfx.push(r);
    }
    // AI-generated coral heads (reef-hero-brief.md §6) — clustered in pairs
    // at each spawn point, closer together, for the dense "coral wall" look
    // of a real reef (docs/photos/reef/24.jpg) instead of sparse singles.
    const coralKeys = ['coral-head-a', 'coral-head-b', 'coral-head-c'];
    for (let x = 260, i = 0; x < this.level.worldW; x += 380, i++) {
      const c1 = this.add.image(x, REEF_WORLD_H - 28, coralKeys[i % coralKeys.length])
        .setOrigin(0.5, 1).setDepth(-3).setScrollFactor(0.85).setScale(0.4);
      const c2 = this.add.image(x + 46, REEF_WORLD_H - 26, coralKeys[(i + 1) % coralKeys.length])
        .setOrigin(0.5, 1).setDepth(-3).setScrollFactor(0.85).setScale(0.3);
      this.levelGfx.push(c1, c2);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: c1, angle: 2, duration: 2800 + (i % 3) * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: c2, angle: -2, duration: 2400 + (i % 4) * 250, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
    // Caustic light overlay: tiled, additive, drifting — sells "underwater".
    const caustics = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'caustics')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2).setAlpha(0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.levelGfx.push(caustics);
    if (!this.reducedMotion)
      this.tweens.add({ targets: caustics, tilePositionX: 64, tilePositionY: 32, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Ambient fish SCHOOLS (tight clustered groups, not evenly-spaced
    // singles) — authentic Kahaluʻu Bay species (reef-hero-brief.md §6, from
    // a photo of the bay's real interpretive sign). Real reef photos
    // (docs/photos/reef/24.jpg, school-yellow-tang-hawaii.jpg) show fish
    // schooling in dense same-species clusters with open water between, so
    // yellow tang — the most commonly-schooling species here — gets a big
    // signature school; the rest get small 2-3 fish groups. All species were
    // prompted/generated facing right, so no flip on the forward leg.
    if (!this.reducedMotion) {
      const schools: { key: string; scale: number; count: number; x: number; y: number }[] = [
        { key: 'fish-yellow-tang', scale: 0.32, count: 5, x: 500, y: 150 },
        { key: 'fish-triggerfish', scale: 0.34, count: 2, x: 1100, y: 260 },
        { key: 'fish-moorish-idol', scale: 0.28, count: 2, x: 1700, y: 130 },
        { key: 'fish-raccoon-butterfly', scale: 0.34, count: 3, x: 2400, y: 200 },
        { key: 'fish-yellow-tang', scale: 0.32, count: 4, x: 3000, y: 160 },
        { key: 'fish-parrotfish', scale: 0.32, count: 2, x: 3600, y: 240 },
        { key: 'fish-convict-tang', scale: 0.34, count: 3, x: 4150, y: 150 },
      ];
      let fishIndex = 0;
      for (const school of schools) {
        for (let j = 0; j < school.count; j++) {
          const fx = school.x + (j % 3) * 34 - 34;
          const fy = school.y + Math.floor(j / 3) * 30 + (j % 2) * 14;
          const fish = this.add.image(fx, fy, school.key);
          fish.setDepth(-2).setScrollFactor(0.7).setScale(school.scale).setFlipX(false);
          this.tweens.add({
            targets: fish, x: fish.x + 140, duration: 3000 + fishIndex * 120, yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut',
            onYoyo: () => fish.setFlipX(true),
            onRepeat: () => fish.setFlipX(false),
          });
          this.levelGfx.push(fish);
          fishIndex++;
        }
      }

      // Honu (Hawaiian green sea turtle) — friendly ambient wildlife, same
      // never-harm spirit as the dolphin slipstreams. Slow wide drift, larger
      // and higher up than the fish schools.
      for (let i = 0; i < 2; i++) {
        const honu = this.add.sprite(900 + i * 2200, 100 + i * 40, 'honu-1');
        honu.setDepth(-2).setScrollFactor(0.75).setScale(0.42).setFlipX(false).play('honu-swim');
        this.tweens.add({
          targets: honu, x: honu.x + 300, duration: 7000 + i * 900, yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
          onYoyo: () => honu.setFlipX(true),
          onRepeat: () => honu.setFlipX(false),
        });
        this.levelGfx.push(honu);
      }
    }

    // Currents (arrow-hatched translucent zones).
    for (const c of this.level.currents) {
      const gfx = this.add.graphics().setDepth(1);
      gfx.fillStyle(0xffffff, 0.1); gfx.fillRect(c.x, c.y, c.w, c.h);
      gfx.lineStyle(2, 0xffffff, 0.35);
      const ang = Math.atan2(c.vy, c.vx);
      for (let i = 0; i < 5; i++) {
        const ax = c.x + (c.w / 5) * i + 20; const ay = c.y + c.h / 2;
        gfx.beginPath(); gfx.moveTo(ax, ay);
        gfx.lineTo(ax + Math.cos(ang) * 24, ay + Math.sin(ang) * 24); gfx.strokePath();
      }
      this.levelGfx.push(gfx);
    }

    // Dolphin slipstreams: dolphin silhouette + sparkle band.
    for (const d of this.level.dolphinPaths) {
      const gfx = this.add.graphics().setDepth(1);
      gfx.fillStyle(0x9adcf0, 0.16); gfx.fillRoundedRect(d.x, d.y, d.w, d.h, 24);
      gfx.fillStyle(0x3fa9f5, 0.9);
      gfx.fillEllipse(d.x + 40, d.y + d.h / 2, 34, 12);
      gfx.fillEllipse(d.x + 58, d.y + d.h / 2 - 8, 14, 8);
      this.levelGfx.push(gfx);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, alpha: 0.7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Bubble vents: rising-bubble particle emitters.
    for (const b of this.level.bubbles) {
      const emitter = this.add.particles(b.x, b.y, 'bubble', {
        speedY: { min: -40, max: -70 }, speedX: { min: -8, max: 8 },
        lifespan: 1600, frequency: this.reducedMotion ? -1 : 260,
        scale: { start: 0.35, end: 0.12 }, alpha: { start: 0.9, end: 0 },
        quantity: 1,
      });
      emitter.setDepth(3);
      this.levelGfx.push(emitter);
    }
    this.bubbleObjs = this.level.bubbles.map((b) => ({ x: b.x, y: b.y, topped: false }));

    // Enemies. Urchins alternate between the two AI-generated variants
    // (round 2 purple urchin, round 3 black long-spined waʻawaʻa) by index
    // for visual variety — both are kept, neither replaces the other.
    let urchinCount = 0;
    const enemyTexture = { eel: 'eel-1', jelly: 'jelly-0', urchin: 'urchin' } as const;
    this.enemyObjs = this.level.enemies.map((e) => {
      const texKey = e.kind === 'urchin' && urchinCount++ % 2 === 1 ? 'urchin-wana' : enemyTexture[e.kind];
      const gfx = this.add.sprite(e.x, e.y, texKey).setDepth(4);
      if (e.kind === 'eel') { gfx.setScale(0.38); if (!this.reducedMotion) gfx.play('eel-swim'); }
      else if (e.kind === 'jelly') { gfx.setScale(0.22); if (!this.reducedMotion) gfx.play('jelly-idle'); }
      else gfx.setScale(texKey === 'urchin-wana' ? 0.4 : 0.5);
      this.levelGfx.push(gfx);
      return { e, dir: 1, gfx };
    });

    // Pearls + rare-fish stars.
    this.pearlObjs = this.level.pearls.map((c, i) => {
      const gfx = this.add.image(c.x, c.y, 'pearl').setDepth(3).setScale(0.34);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, scale: 0.38, duration: 760 + i * 50, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.levelGfx.push(gfx);
      return { x: c.x, y: c.y, collected: false, gfx };
    });
    this.starObjs = this.level.stars.map((s) => {
      // Rare fish: bright angelfish, gently pulsing (camera-flash ring on collect).
      const gfx = this.add.image(s.x, s.y, 'angelfish').setDepth(3).setScale(0.68);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, scale: 0.78, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.levelGfx.push(gfx);
      return { x: s.x, y: s.y, collected: false, gfx };
    });

    // Checkpoint buoys + goal beacon.
    for (const cp of this.level.checkpoints) {
      const gfx = this.add.image(cp.x, cp.y, 'buoy').setOrigin(0.5, 1).setDepth(3).setScale(0.4);
      this.levelGfx.push(gfx);
    }
    const g = this.level.goal;
    const goal = this.add.image(g.x, g.y, 'beacon').setDepth(3).setScale(0.5);
    if (!this.reducedMotion) this.tweens.add({ targets: goal, scale: 0.56, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.levelGfx.push(goal);
  }

  private startRun() {
    this.lives = 3; this.pearls = 0; this.stars = 0; this.scoreBonus = 0;
    this.air = this.level.airSeconds;
    this.won = false; this.invulnUntil = 0;
    this.respawn = { ...this.level.start };
    for (const p of this.pearlObjs) { p.collected = false; p.gfx.setVisible(true); }
    for (const s of this.starObjs) { s.collected = false; s.gfx.setVisible(true); }
    for (const b of this.bubbleObjs) { b.topped = false; }
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.setAlpha(1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, REEF_WORLD_H));
    cam.startFollow(this.player, true, 0.12, 0.12);
    this.emitHud();
  }

  update(_t: number, deltaMs: number) {
    for (const l of this.bgLayers) l.ts.tilePositionX = this.cameras.main.scrollX * l.factor;
    if (this.won) return;
    const dt = deltaMs / 1000;

    // Buoyancy swim: inputs + idle upward drift + zone pushes.
    let vx = (this.dirState.left ? -SWIM_SPEED : 0) + (this.dirState.right ? SWIM_SPEED : 0);
    let vy = (this.dirState.up ? -SWIM_SPEED : 0) + (this.dirState.down ? SWIM_SPEED : 0);
    if (!this.dirState.up && !this.dirState.down) vy = BUOYANCY_VY;
    for (const c of this.level.currents) {
      if (this.inRect(c)) { vx += c.vx; vy += c.vy; }
    }
    for (const d of this.level.dolphinPaths) {
      if (this.inRect(d)) vx += DOLPHIN_PUSH;
    }
    this.player.x = Phaser.Math.Clamp(this.player.x + vx * dt, 16, this.level.worldW - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y + vy * dt, 20, this.level.worldH - 16);
    this.player.setFlipX(vx < 0);

    // Air: depletes underwater, refills fast at the surface strip.
    if (this.player.y < SURFACE_Y) this.air = Math.min(this.level.airSeconds, this.air + 10 * dt);
    else this.air -= dt;
    if (this.air <= 0) { this.air = this.level.airSeconds * 0.5; this.hurt(); }

    // Bubbles refill. `topped` latches so sfx/HUD fire once per visit, not every frame.
    for (const b of this.bubbleObjs) {
      const inRange = Math.abs(this.player.x - b.x) < 26 && Math.abs(this.player.y - b.y) < 30;
      if (!inRange) { b.topped = false; continue; }
      if (this.air < this.level.airSeconds) {
        this.air = this.level.airSeconds;
        if (!b.topped) { b.topped = true; EventBus.emit('sfx', { key: 'select' }); this.emitHud(); }
      }
    }

    // Enemies move + hurt on touch.
    const now = this.time.now;
    for (const eo of this.enemyObjs) {
      const e = eo.e;
      if (e.kind === 'eel') {
        eo.gfx.x += e.speed * eo.dir * dt;
        if (eo.gfx.x <= e.minX) eo.dir = 1;
        else if (eo.gfx.x >= e.maxX) eo.dir = -1;
        eo.gfx.setFlipX(eo.dir < 0);
      } else if (e.kind === 'jelly') {
        eo.gfx.y = e.y + Math.sin((now / e.periodMs) * Math.PI * 2) * e.amplitude;
      }
      const r = e.kind === 'urchin' ? 20 : 22;
      if (Math.abs(this.player.x - eo.gfx.x) < r && Math.abs(this.player.y - eo.gfx.y) < r) this.hurt();
    }

    // Pearls / rare fish / checkpoints / goal.
    for (const p of this.pearlObjs) {
      if (!p.collected && Math.abs(this.player.x - p.x) < 34 && Math.abs(this.player.y - p.y) < 34) {
        p.collected = true; p.gfx.setVisible(false);
        this.pearls++; this.emitHud();
        coinPop(this, p.x, p.y, 0xeaf6f7, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }
    for (const s of this.starObjs) {
      if (!s.collected && Math.abs(this.player.x - s.x) < 30 && Math.abs(this.player.y - s.y) < 30) {
        s.collected = true; s.gfx.setVisible(false);
        this.stars++; this.emitHud();
        if (!this.reducedMotion) this.cameras.main.flash(120, 255, 255, 255); // camera snap!
        EventBus.emit('sfx', { key: 'arrive' });
      }
    }
    for (const cp of this.level.checkpoints) {
      if (Math.abs(this.player.x - cp.x) < 34 && Math.abs(this.player.y - cp.y) < 60 && this.respawn.x < cp.x) {
        this.respawn = { ...cp };
        EventBus.emit('sfx', { key: 'arrive' });
      }
    }
    const g = this.level.goal;
    if (Math.abs(this.player.x - g.x) < 30 && Math.abs(this.player.y - g.y) < 40) {
      this.won = true;
      EventBus.emit('arcade:done', { success: true, score: this.score(true) });
    }
    this.emitAirHud(dt);
  }

  private airHudAccum = 0;
  /** Throttle HUD emits for the constantly-draining air gauge (≈4/s). */
  private emitAirHud(dt: number) {
    this.airHudAccum += dt;
    if (this.airHudAccum >= 0.25) { this.airHudAccum = 0; this.emitHud(); }
  }

  private inRect(r: { x: number; y: number; w: number; h: number }): boolean {
    return this.player.x >= r.x && this.player.x <= r.x + r.w && this.player.y >= r.y && this.player.y <= r.y + r.h;
  }

  private hurt() {
    if (this.won || this.time.now < this.invulnUntil) return;
    const { lives, gameOver } = loseLife(this.lives);
    this.lives = lives; this.emitHud();
    shake(this, this.reducedMotion);
    EventBus.emit('sfx', { key: 'arrive' });
    if (gameOver) {
      this.won = true;
      EventBus.emit('arcade:gameover', { score: this.score(false) });
      return;
    }
    this.invulnUntil = this.time.now + 1200;
    this.player.setPosition(this.respawn.x, this.respawn.y);
    this.air = this.level.airSeconds;
    hitFlash(this, this.player, this.reducedMotion);
  }

  private score(withLives: boolean): number {
    return this.pearls * 10 + this.stars * 25 + this.scoreBonus + (withLives ? this.lives * 50 : 0);
  }

  private emitHud() {
    EventBus.emit('blitz:hud', {
      lives: this.lives, score: this.score(false), stars: this.stars, coins: this.pearls,
      gauge: Math.max(0, this.air / this.level.airSeconds), gaugeLabel: 'AIR',
    });
  }
}
