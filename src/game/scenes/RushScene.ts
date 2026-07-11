import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { SUNLINE_RUSH_LEVELS, RUSH_WORLD_H, type RushLevel } from '@/game/data/levels/sunlineRush';
import { type SkinId, SKIN_SUIT } from '@/game/kit/skins';
import { cssToHex, buildParallax } from '@/game/kit/parallax';
import { coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { scoreForRun } from '@/game/kit/score';
import { advanceLevel, loseLife } from '@/lib/gameRules';

type Body = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

export class RushScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private startLevel = 0;

  private player!: Body;
  private floor!: Phaser.Physics.Arcade.StaticGroup;
  private barriers!: Phaser.Physics.Arcade.StaticGroup;
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private coinObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];

  private levelIndex = 0;
  private lives = 3;
  private coins = 0;
  private invulnUntil = 0;
  private won = false;
  private level!: RushLevel;
  private goalRect = { x: 0, y: 0, w: 0, h: 0 };

  private inputState = { left: false, right: false, jump: false };
  private readonly onInput = (p: { left: boolean; right: boolean; jump: boolean }) => { this.inputState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };

  constructor() { super('Rush'); }

  /** A little tram car with the chosen hero riding in the window. */
  private tramTextureKey(): string {
    const key = `rush-tram-${this.skin}`;
    if (this.textures.exists(key)) return key;
    const suit = SKIN_SUIT[this.skin];
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    // pole / pantograph
    g.lineStyle(1.5, 0x17323a, 1); g.beginPath(); g.moveTo(16, 0); g.lineTo(16, 6); g.strokePath();
    // tram body
    g.fillStyle(0xf0786a, 1); g.fillRoundedRect(2, 6, 28, 16, 4);          // coral tram shell
    g.fillStyle(0xeaf6f7, 1); g.fillRoundedRect(2, 14, 28, 8, 2);          // cream lower band
    // windows
    g.fillStyle(0x9fd9e4, 1); g.fillRoundedRect(5, 9, 7, 5, 1); g.fillRoundedRect(20, 9, 7, 5, 1);
    // rider (hero) in the middle window, costume-coloured
    g.fillStyle(suit, 1); g.fillRoundedRect(14, 8, 4, 6, 1);               // hero torso
    g.fillStyle(0xf2d2a9, 1); g.fillCircle(16, 8, 2.4);                    // hero head
    // headlight + wheels
    g.fillStyle(0xf6c453, 1); g.fillCircle(29, 18, 1.6);
    g.fillStyle(0x17323a, 1); g.fillCircle(9, 23, 2.4); g.fillCircle(23, 23, 2.4);
    g.generateTexture(key, 32, 26);
    g.destroy();
    return key;
  }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.startLevel = (this.game.registry.get('levelStart') as number) ?? 0;
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    this.floor = this.physics.add.staticGroup();
    this.barriers = this.physics.add.staticGroup();
    this.player = this.physics.add.image(0, 0, this.tramTextureKey()) as Body;
    this.player.setDepth(5); this.player.setScale(1.3); this.player.setGravityY(1100);
    this.player.setMaxVelocity(260, 800);
    this.physics.add.collider(this.player, this.floor);
    // Overlap (not collide) with barriers so a hit costs a life but the run continues.
    this.physics.add.overlap(this.player, this.barriers, () => this.hurt());

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, RUSH_WORLD_H)); };
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

    this.startRun();
  }

  private startRun() {
    this.lives = 3; this.coins = 0; this.won = false;
    this.buildLevel(this.startLevel);
  }

  private clearLevel() {
    for (const o of this.levelGfx) o.destroy();
    this.levelGfx = [];
    this.floor.clear(true, true);
    this.barriers.clear(true, true);
    this.coinObjs = [];
  }

  private buildLevel(index: number) {
    this.clearLevel();
    this.levelIndex = index;
    this.level = SUNLINE_RUSH_LEVELS[index];
    const t = this.level.theme;

    buildParallax(this, this.level);

    const groundColor = cssToHex(t.ground); const plankColor = cssToHex(t.plankTop);
    const f = this.level.floor;
    const floorRect = this.add.rectangle(f.x + f.w / 2, f.y + f.h / 2, f.w, f.h, 0x000000, 0);
    this.physics.add.existing(floorRect, true);
    this.floor.add(floorRect);
    const floorGfx = this.add.graphics().setDepth(2);
    floorGfx.fillStyle(groundColor, 1); floorGfx.fillRect(f.x, f.y, f.w, f.h);
    floorGfx.fillStyle(plankColor, 1); floorGfx.fillRect(f.x, f.y, f.w, 6);
    this.levelGfx.push(floorGfx);

    const barrierColor = cssToHex(t.ground);
    for (const b of this.level.barriers) {
      const by = f.y - b.h; // standing on the floor
      const rect = this.add.rectangle(b.x + b.w / 2, by + b.h / 2, b.w, b.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.barriers.add(rect);
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(barrierColor, 1); gfx.fillRoundedRect(b.x, by, b.w, b.h, 4);
      gfx.fillStyle(0xc0392b, 1); gfx.fillRect(b.x, by, b.w, 5);
      this.levelGfx.push(gfx);
    }

    const coinColor = cssToHex(t.coin);
    this.coinObjs = this.level.coins.map((c, i) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(coinColor, 0.3); gfx.fillCircle(0, 0, 11);
      gfx.fillStyle(coinColor, 1); gfx.fillCircle(0, 0, 7);
      gfx.fillStyle(0xeaf6f7, 1); gfx.fillCircle(-2.5, -2.5, 2);
      gfx.setPosition(c.x, c.y);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, y: c.y - 4, duration: 800 + i * 70, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 120 });
      this.levelGfx.push(gfx);
      return { x: c.x, y: c.y, collected: false, gfx };
    });

    const g = this.level.goal;
    this.goalRect = { x: g.x, y: g.y, w: g.w, h: g.h };
    const flag = this.add.graphics().setDepth(3);
    flag.lineStyle(3, 0x17323a, 1);
    flag.beginPath(); flag.moveTo(g.x, g.y); flag.lineTo(g.x, g.y + g.h); flag.strokePath();
    flag.fillStyle(0xf0786a, 1); flag.fillTriangle(g.x + 1, g.y + 1, g.x + 26, g.y + 9, g.x + 1, g.y + 18);
    this.levelGfx.push(flag);

    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    this.player.setAlpha(1); this.invulnUntil = 0;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, RUSH_WORLD_H));
    cam.startFollow(this.player, true, 0.12, 0.12);

    this.emitHud();
  }

  private emitHud() {
    EventBus.emit('arcade:hud', {
      lives: this.lives, coins: this.coins,
      score: scoreForRun({ coins: this.coins, stomps: 0, livesLeft: 0 }),
      level: this.levelIndex, totalLevels: SUNLINE_RUSH_LEVELS.length,
    });
  }

  update() {
    if (this.won) return;
    const body = this.player.body;
    // Auto-run right at a constant speed; left/right input is ignored.
    body.setVelocityX(this.level.runSpeed);
    if (this.inputState.jump && body.blocked.down) body.setVelocityY(-430);

    if (this.player.y > this.level.worldH + 60) this.hurt();

    const coinColor = cssToHex(this.level.theme.coin);
    for (const c of this.coinObjs) {
      if (c.collected) continue;
      const dx = this.player.x - c.x; const dy = this.player.y - c.y;
      if (dx * dx + dy * dy < 30 * 30) {
        c.collected = true; c.gfx.setVisible(false);
        this.coins++; this.emitHud();
        coinPop(this, c.x, c.y, coinColor, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }

    const g = this.goalRect;
    const gx = this.player.x - (g.x + g.w / 2); const gy = this.player.y - (g.y + g.h / 2);
    if (Math.abs(gx) < g.w / 2 + 12 && Math.abs(gy) < g.h / 2 + 30) {
      const { level, finished } = advanceLevel(this.levelIndex, SUNLINE_RUSH_LEVELS.length);
      if (finished) {
        this.won = true;
        EventBus.emit('arcade:done', { success: true, score: scoreForRun({ coins: this.coins, stomps: 0, livesLeft: this.lives }) });
      } else {
        EventBus.emit('sfx', { key: 'arrive' });
        this.buildLevel(level);
      }
    }
  }

  private hurt() {
    if (this.won || this.time.now < this.invulnUntil) return;
    const { lives, gameOver } = loseLife(this.lives);
    this.lives = lives; this.emitHud();
    shake(this, this.reducedMotion);
    EventBus.emit('sfx', { key: 'arrive' });
    if (gameOver) {
      this.won = true; this.player.body.setVelocity(0, 0);
      EventBus.emit('arcade:gameover', { score: scoreForRun({ coins: this.coins, stomps: 0, livesLeft: 0 }) });
      return;
    }
    // Brief invuln; the player keeps running (do NOT reset to start).
    this.invulnUntil = this.time.now + 1100;
    hitFlash(this, this.player, this.reducedMotion);
  }
}
