import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { TIDE_POOLS_LEVELS, TIDE_POOLS_WORLD_H, type TidePoolLevel } from '@/game/data/levels/tidePools';
import { buildSkinTexture, type SkinId } from '@/game/kit/skins';
import { cssToHex, buildParallax } from '@/game/kit/parallax';
import { spawnEnemy, stepEnemies, type EnemyMeta } from '@/game/kit/enemies';
import { coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { scoreForRun } from '@/game/kit/score';
import { advanceLevel, loseLife } from '@/lib/gameRules';

type Body = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

const SWIM_SPEED = 150;

export class DiveScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private startLevel = 0;

  private player!: Body;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyMeta = new Map<Phaser.GameObjects.GameObject, EnemyMeta>();
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private pearlObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];

  private levelIndex = 0;
  private lives = 3;
  private pearls = 0;
  private invulnUntil = 0;
  private won = false;
  private level!: TidePoolLevel;

  private dirState = { up: false, down: false, left: false, right: false };
  private readonly onDir = (p: { up: boolean; down: boolean; left: boolean; right: boolean }) => { this.dirState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };

  constructor() { super('Dive'); }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.startLevel = (this.game.registry.get('levelStart') as number) ?? 0;
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    this.enemies = this.physics.add.group();
    this.player = this.physics.add.image(0, 0, buildSkinTexture(this, this.skin)) as Body;
    this.player.setDepth(5); this.player.setScale(1.6); this.player.setGravityY(0);
    this.player.setMaxVelocity(SWIM_SPEED, SWIM_SPEED);
    this.physics.add.overlap(this.player, this.enemies, () => this.hurt());

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, TIDE_POOLS_WORLD_H)); };
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

    this.startRun();
  }

  private startRun() {
    this.lives = 3; this.pearls = 0; this.won = false;
    this.buildLevel(this.startLevel);
  }

  private clearLevel() {
    for (const o of this.levelGfx) o.destroy();
    this.levelGfx = [];
    this.enemies.clear(true, true);
    this.enemyMeta.clear();
    this.pearlObjs = [];
  }

  private buildLevel(index: number) {
    this.clearLevel();
    this.levelIndex = index;
    this.level = TIDE_POOLS_LEVELS[index];
    const t = this.level.theme;

    buildParallax(this, this.level);

    const pearlColor = cssToHex(t.coin);
    this.pearlObjs = this.level.pearls.map((c, i) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(pearlColor, 0.3); gfx.fillCircle(0, 0, 12);
      gfx.fillStyle(0xeaf6f7, 1); gfx.fillCircle(0, 0, 7);
      gfx.fillStyle(pearlColor, 1); gfx.fillCircle(0, 0, 4);
      gfx.fillStyle(0xffffff, 1); gfx.fillCircle(-2.5, -2.5, 1.6);
      gfx.setPosition(c.x, c.y);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, scale: 1.15, duration: 760 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 110 });
      this.levelGfx.push(gfx);
      return { x: c.x, y: c.y, collected: false, gfx };
    });

    // Top-down: spawn patrollers with 0 gravity so they glide, not sink.
    for (const e of this.level.enemies) spawnEnemy(this, this.enemies, e, this.enemyMeta, 0);

    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    this.player.setAlpha(1); this.invulnUntil = 0;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, TIDE_POOLS_WORLD_H));
    cam.startFollow(this.player, true, 0.12, 0.12);

    this.emitHud();
  }

  private emitHud() {
    EventBus.emit('arcade:hud', {
      lives: this.lives, coins: this.pearls,
      score: scoreForRun({ coins: this.pearls, stomps: 0, livesLeft: 0 }),
      level: this.levelIndex, totalLevels: TIDE_POOLS_LEVELS.length,
    });
  }

  update() {
    if (this.won) return;
    const body = this.player.body;
    const vx = (this.dirState.left ? -SWIM_SPEED : 0) + (this.dirState.right ? SWIM_SPEED : 0);
    const vy = (this.dirState.up ? -SWIM_SPEED : 0) + (this.dirState.down ? SWIM_SPEED : 0);
    body.setVelocity(vx, vy);

    stepEnemies(this.enemies, this.enemyMeta, { x: this.player.x, y: this.player.y });

    const pearlColor = cssToHex(this.level.theme.coin);
    let remaining = 0;
    for (const c of this.pearlObjs) {
      if (c.collected) continue;
      const dx = this.player.x - c.x; const dy = this.player.y - c.y;
      // Generous pickup: pearls float in open water and top-down aiming is
      // imprecise for kids, so swimming near a pearl should grab it.
      if (dx * dx + dy * dy < 38 * 38) {
        c.collected = true; c.gfx.setVisible(false);
        this.pearls++; this.emitHud();
        coinPop(this, c.x, c.y, pearlColor, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      } else {
        remaining++;
      }
    }

    if (remaining === 0) {
      const { level, finished } = advanceLevel(this.levelIndex, TIDE_POOLS_LEVELS.length);
      if (finished) {
        this.won = true;
        EventBus.emit('arcade:done', { success: true, score: scoreForRun({ coins: this.pearls, stomps: 0, livesLeft: this.lives }) });
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
      EventBus.emit('arcade:gameover', { score: scoreForRun({ coins: this.pearls, stomps: 0, livesLeft: 0 }) });
      return;
    }
    // Respawn at level start with a brief invulnerable flash.
    this.invulnUntil = this.time.now + 1100;
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    hitFlash(this, this.player, this.reducedMotion);
  }
}
