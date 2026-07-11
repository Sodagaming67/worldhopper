// src/game/scenes/SlideScene.ts
import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { SLIDE_LEVEL, SLIDE_WORLD_H, type SlideLevel } from '@/game/data/levels/slides';
import { buildSkinTexture, type SkinId } from '@/game/kit/skins';
import { coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { loseLife } from '@/lib/gameRules';

const BASE_SPEED = 200;
const MAX_SPEED = 520;
const SLOPE_ACCEL = 640;   // px/s² per unit slope (dy/dx)
const FLAT_DRAG = 40;      // px/s² pull back toward BASE_SPEED on flats
const JUMP_VY = -430;
const GRAVITY = 1150;
const BOOST_KICK = 120;
const RING_KICK = 40;

export class SlideScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private level: SlideLevel = SLIDE_LEVEL;

  private player!: Phaser.GameObjects.Image;
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private sprinklerGfx: Phaser.GameObjects.Graphics[] = [];
  private coinObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private starObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private ringObjs: Array<{ x: number; y: number; passed: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private boostsHit = new Set<number>();

  private lives = 3;
  private coins = 0;
  private stars = 0;
  private scoreBonus = 0;
  private speed = BASE_SPEED;
  private vy = 0;
  private airborne = false;
  private invulnUntil = 0;
  private won = false;
  private respawnX = 0;

  private inputState = { left: false, right: false, jump: false };
  private readonly onInput = (p: { left: boolean; right: boolean; jump: boolean }) => { this.inputState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };

  constructor() { super('Slide'); }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    this.player = this.add.image(0, 0, buildSkinTexture(this, this.skin));
    this.player.setDepth(5); this.player.setScale(1.6);

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, SLIDE_WORLD_H)); };
    this.scale.on(Phaser.Scale.Events.RESIZE, fit, this);
    EventBus.on('arcade:input', this.onInput);
    EventBus.on('arcade:restart', this.onRestart);
    const cleanup = () => {
      EventBus.off('arcade:input', this.onInput);
      EventBus.off('arcade:restart', this.onRestart);
      this.scale.off(Phaser.Scale.Events.RESIZE, fit, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.buildLevel();
    this.startRun();
  }

  /** Floor y at x, or null when x is over a gap / past the level. */
  private floorY(x: number): number | null {
    for (const run of this.level.runs) {
      const pts = run.points;
      if (x < pts[0].x || x > pts[pts.length - 1].x) continue;
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i].x) {
          const t = (x - pts[i - 1].x) / (pts[i].x - pts[i - 1].x);
          return pts[i - 1].y + t * (pts[i].y - pts[i - 1].y);
        }
      }
    }
    return null;
  }

  /** Slope dy/dx at x (0 over gaps). Positive = downhill. */
  private slopeAt(x: number): number {
    for (const run of this.level.runs) {
      const pts = run.points;
      if (x < pts[0].x || x > pts[pts.length - 1].x) continue;
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i].x) return (pts[i].y - pts[i - 1].y) / (pts[i].x - pts[i - 1].x);
      }
    }
    return 0;
  }

  private buildLevel() {
    // Sky: pool-party noon — bright aqua bands.
    const w = this.scale.width; const h = this.scale.height;
    const sky = this.add.graphics().setDepth(-3).setScrollFactor(0);
    sky.fillStyle(0x8fe0f7, 1); sky.fillRect(0, 0, w, h * 0.5);
    sky.fillStyle(0xbdeefb, 1); sky.fillRect(0, h * 0.5, w, h * 0.3);
    sky.fillStyle(0xffe9b0, 1); sky.fillRect(0, h * 0.8, w, h * 0.2);
    this.levelGfx.push(sky);

    // Far layer: umbrellas + towers.
    const far = this.add.graphics().setDepth(-2).setScrollFactor(0.3);
    for (let x = 100; x < this.level.worldW; x += 340) {
      far.fillStyle(0xf0786a, 0.5); far.fillTriangle(x, 360, x - 34, 396, x + 34, 396);
      far.fillStyle(0x9adcf0, 0.4); far.fillRect(x + 120, 300, 26, 140);
    }
    this.levelGfx.push(far);

    // Slide runs: blue flume with white rim.
    for (const run of this.level.runs) {
      const gfx = this.add.graphics().setDepth(2);
      const pts = run.points;
      gfx.lineStyle(14, 0x1e7ba8, 1);
      gfx.beginPath(); gfx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) gfx.lineTo(pts[i].x, pts[i].y);
      gfx.strokePath();
      gfx.lineStyle(4, 0xeaf6f7, 1);
      gfx.beginPath(); gfx.moveTo(pts[0].x, pts[0].y - 7);
      for (let i = 1; i < pts.length; i++) gfx.lineTo(pts[i].x, pts[i].y - 7);
      gfx.strokePath();
      this.levelGfx.push(gfx);
    }

    // Boost pads: gold chevrons on the flume.
    for (const b of this.level.boosts) {
      const y = this.floorY(b.x)!;
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0xf6c453, 1);
      gfx.fillTriangle(b.x - 14, y - 4, b.x, y - 14, b.x, y - 4);
      gfx.fillTriangle(b.x, y - 4, b.x + 14, y - 14, b.x + 14, y - 4);
      this.levelGfx.push(gfx);
    }

    // Sprinkler posts (the jet itself is drawn per-frame in update()).
    this.sprinklerGfx = this.level.sprinklers.map((s) => {
      const y = this.floorY(s.x)!;
      const post = this.add.graphics().setDepth(3);
      post.fillStyle(0x888888, 1); post.fillRect(s.x - 3, y - 10, 6, 10);
      this.levelGfx.push(post);
      const jet = this.add.graphics().setDepth(3);
      this.levelGfx.push(jet);
      return jet;
    });

    // Rings.
    this.ringObjs = this.level.rings.map((r) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.lineStyle(5, 0xf6c453, 1); gfx.strokeCircle(0, 0, 18);
      gfx.setPosition(r.x, r.y);
      this.levelGfx.push(gfx);
      return { x: r.x, y: r.y, passed: false, gfx };
    });

    // Coins + stars (same look as the platformer).
    this.coinObjs = this.level.coins.map((c, i) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0xffbb22, 0.3); gfx.fillCircle(0, 0, 11);
      gfx.fillStyle(0xffbb22, 1); gfx.fillCircle(0, 0, 7);
      gfx.setPosition(c.x, c.y);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, y: c.y - 4, duration: 800 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 90 });
      this.levelGfx.push(gfx);
      return { x: c.x, y: c.y, collected: false, gfx };
    });
    this.starObjs = this.level.stars.map((s) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0xfff066, 1);
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 10 : 4.5;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r));
      }
      gfx.fillPoints(pts, true);
      gfx.setPosition(s.x, s.y);
      this.levelGfx.push(gfx);
      return { x: s.x, y: s.y, collected: false, gfx };
    });

    // Goal: splash pool.
    const g = this.level.goal;
    const pool = this.add.graphics().setDepth(3);
    pool.fillStyle(0x3fa9f5, 0.9); pool.fillEllipse(g.x, g.y + 14, 120, 30);
    pool.fillStyle(0xeaf6f7, 1); pool.fillEllipse(g.x, g.y + 8, 90, 14);
    this.levelGfx.push(pool);
  }

  private startRun() {
    this.lives = 3; this.coins = 0; this.stars = 0; this.scoreBonus = 0;
    this.speed = BASE_SPEED; this.vy = 0; this.airborne = false;
    this.won = false; this.invulnUntil = 0;
    this.respawnX = this.level.start.x;
    this.boostsHit.clear();
    for (const c of this.coinObjs) { c.collected = false; c.gfx.setVisible(true); }
    for (const s of this.starObjs) { s.collected = false; s.gfx.setVisible(true); }
    for (const r of this.ringObjs) { r.passed = false; r.gfx.setAlpha(1); }
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.setAlpha(1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, SLIDE_WORLD_H));
    cam.startFollow(this.player, true, 0.12, 0.12);
    this.emitHud();
  }

  update(_t: number, deltaMs: number) {
    if (this.won) return;
    const dt = deltaMs / 1000;
    const x = this.player.x;
    const fy = this.floorY(x);

    // Horizontal: slope drives speed; drag pulls back to BASE on flats/uphill.
    const slope = this.airborne ? 0 : this.slopeAt(x);
    this.speed += slope * SLOPE_ACCEL * dt;
    if (this.speed > BASE_SPEED) this.speed -= FLAT_DRAG * dt;
    this.speed = Phaser.Math.Clamp(this.speed, BASE_SPEED * 0.7, MAX_SPEED);
    this.player.x += this.speed * dt;

    // Vertical: snap to floor unless jumping/over a gap.
    if (!this.airborne && fy !== null) {
      this.player.y = fy - 14;
      if (this.inputState.jump) { this.airborne = true; this.vy = JUMP_VY; }
    } else {
      this.vy += GRAVITY * dt;
      this.player.y += this.vy * dt;
      const fy2 = this.floorY(this.player.x);
      if (fy2 !== null && this.vy > 0 && this.player.y >= fy2 - 14) {
        this.player.y = fy2 - 14; this.vy = 0; this.airborne = false;
      }
    }
    if (!this.airborne && fy === null) { this.airborne = true; this.vy = Math.min(this.vy, 0); }

    // Fell into a gap.
    if (this.player.y > this.level.worldH + 60) { this.hurt(true); return; }

    // Boosts.
    this.level.boosts.forEach((b, i) => {
      if (!this.boostsHit.has(i) && !this.airborne && Math.abs(x - b.x) < 18) {
        this.boostsHit.add(i);
        this.speed = Math.min(MAX_SPEED, this.speed + BOOST_KICK);
        shake(this, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    });

    // Sprinklers: draw jets, damage while on.
    const now = this.time.now;
    this.level.sprinklers.forEach((s, i) => {
      const on = now % s.periodMs < s.onMs;
      const jet = this.sprinklerGfx[i];
      jet.clear();
      const yTop = this.floorY(s.x)! - 90;
      if (on) {
        jet.fillStyle(0x9adcf0, 0.8); jet.fillRect(s.x - 5, yTop, 10, 80);
        if (Math.abs(this.player.x - s.x) < 14 && this.player.y > yTop) this.hurt(false);
      }
    });

    // Rings / coins / stars.
    for (const r of this.ringObjs) {
      if (!r.passed && Math.abs(this.player.x - r.x) < 16 && Math.abs(this.player.y - r.y) < 22) {
        r.passed = true; r.gfx.setAlpha(0.25);
        this.scoreBonus += 50;
        this.speed = Math.min(MAX_SPEED, this.speed + RING_KICK);
        coinPop(this, r.x, r.y, 0xf6c453, this.reducedMotion);
        this.emitHud();
      }
    }
    for (const c of this.coinObjs) {
      if (!c.collected && Math.abs(this.player.x - c.x) < 26 && Math.abs(this.player.y - c.y) < 30) {
        c.collected = true; c.gfx.setVisible(false);
        this.coins++; this.emitHud();
        coinPop(this, c.x, c.y, 0xffbb22, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }
    for (const s of this.starObjs) {
      if (!s.collected && Math.abs(this.player.x - s.x) < 28 && Math.abs(this.player.y - s.y) < 32) {
        s.collected = true; s.gfx.setVisible(false);
        this.stars++; this.emitHud();
        coinPop(this, s.x, s.y, 0xfff066, this.reducedMotion);
      }
    }

    // Checkpoints (advance respawn).
    for (const cp of this.level.checkpoints) {
      if (this.player.x >= cp.x && this.respawnX < cp.x) this.respawnX = cp.x;
    }

    // Goal.
    if (this.player.x >= this.level.goal.x) {
      this.won = true;
      EventBus.emit('arcade:done', { success: true, score: this.score(true) });
    }
  }

  private hurt(fell: boolean) {
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
    if (fell) {
      const y = this.floorY(this.respawnX + 4) ?? 300;
      this.player.setPosition(this.respawnX + 4, y - 14);
      this.vy = 0; this.airborne = false; this.speed = BASE_SPEED;
      // Re-arm boost pads: a respawned run starts at BASE_SPEED and needs
      // them to make the gap jumps (spent pads made gap 2 unclearable).
      this.boostsHit.clear();
    }
    hitFlash(this, this.player, this.reducedMotion);
  }

  private score(withLives: boolean): number {
    return this.coins * 10 + this.stars * 25 + this.scoreBonus + (withLives ? this.lives * 50 : 0);
  }

  private emitHud() {
    EventBus.emit('blitz:hud', {
      lives: this.lives, score: this.score(false), stars: this.stars, coins: this.coins,
      gauge: (this.speed - BASE_SPEED * 0.7) / (MAX_SPEED - BASE_SPEED * 0.7),
      gaugeLabel: 'SPEED',
    });
  }
}
