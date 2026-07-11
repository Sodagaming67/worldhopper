import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { BRAVE_LEVELS, BRAVE_WORLD_H, type BraveLevel } from '@/game/data/levels/braveSteps';
import { buildSkinTexture, type SkinId } from '@/game/kit/skins';
import { cssToHex, buildParallax } from '@/game/kit/parallax';
import { spawnEnemy, stepEnemies, type EnemyMeta } from '@/game/kit/enemies';
import { coinPop, hitFlash, squashBounce, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { scoreForRun } from '@/game/kit/score';
import { advanceLevel, loseLife } from '@/lib/gameRules';

type Body = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

export class PlatformerScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private startLevel = 0;

  private player!: Body;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyMeta = new Map<Phaser.GameObjects.GameObject, EnemyMeta>();
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private coinObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];

  private levelIndex = 0;
  private lives = 3;
  private coins = 0;
  private stomps = 0;
  private invulnUntil = 0;
  private won = false;
  private level!: BraveLevel;
  private goalRect = { x: 0, y: 0, w: 0, h: 0 };

  private inputState = { left: false, right: false, jump: false };
  private readonly onInput = (p: { left: boolean; right: boolean; jump: boolean }) => { this.inputState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };

  constructor() { super('Platformer'); }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.startLevel = (this.game.registry.get('levelStart') as number) ?? 0;
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.player = this.physics.add.image(0, 0, buildSkinTexture(this, this.skin)) as Body;
    this.player.setDepth(5); this.player.setScale(1.6); this.player.setGravityY(1100);
    this.player.setMaxVelocity(220, 800);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onEnemy(e as Body));

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, BRAVE_WORLD_H)); };
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
    this.lives = 3; this.coins = 0; this.stomps = 0; this.won = false;
    this.buildLevel(this.startLevel);
  }

  private clearLevel() {
    for (const o of this.levelGfx) o.destroy();
    this.levelGfx = [];
    this.platforms.clear(true, true);
    this.enemies.clear(true, true);
    this.enemyMeta.clear();
    this.coinObjs = [];
  }

  private buildLevel(index: number) {
    this.clearLevel();
    this.levelIndex = index;
    this.level = BRAVE_LEVELS[index];
    const t = this.level.theme;

    buildParallax(this, this.level);

    const groundColor = cssToHex(t.ground); const plankColor = cssToHex(t.plankTop);
    for (const p of this.level.platforms) {
      const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
      const gfx = this.add.graphics().setDepth(2);
      gfx.fillStyle(groundColor, 1); gfx.fillRoundedRect(p.x, p.y, p.w, p.h, 6);
      gfx.fillStyle(plankColor, 1); gfx.fillRoundedRect(p.x, p.y, p.w, 6, 3);
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

    for (const e of this.level.enemies) spawnEnemy(this, this.enemies, e, this.enemyMeta);

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
    cam.setZoom(followZoom(this.scale.height, BRAVE_WORLD_H));
    cam.startFollow(this.player, true, 0.12, 0.12);

    this.emitHud();
  }

  private emitHud() {
    // Live HUD score counts what you've earned by playing; the lives bonus is
    // only added to the final score on the win (`arcade:done`).
    EventBus.emit('arcade:hud', {
      lives: this.lives, coins: this.coins,
      score: scoreForRun({ coins: this.coins, stomps: this.stomps, livesLeft: 0 }),
      level: this.levelIndex, totalLevels: BRAVE_LEVELS.length,
    });
  }

  update() {
    if (this.won) return;
    const body = this.player.body;
    const vx = (this.inputState.left ? -150 : 0) + (this.inputState.right ? 150 : 0);
    body.setVelocityX(vx);
    if (this.inputState.jump && body.blocked.down) body.setVelocityY(-430);

    stepEnemies(this.enemies, this.enemyMeta);

    if (this.player.y > this.level.worldH + 60) this.hurt();

    const coinColor = cssToHex(this.level.theme.coin);
    for (const c of this.coinObjs) {
      if (c.collected) continue;
      const dx = this.player.x - c.x; const dy = this.player.y - c.y;
      // Forgiving pickup radius: coins float ~20-32px above their surface and
      // the player's physics centre sits ~20px below a coin when standing, so
      // anything tighter than this never collects ground/ledge coins.
      if (dx * dx + dy * dy < 30 * 30) {
        c.collected = true; c.gfx.setVisible(false);
        this.coins++; this.emitHud();
        coinPop(this, c.x, c.y, coinColor, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }

    const g = this.goalRect;
    const gx = this.player.x - (g.x + g.w / 2); const gy = this.player.y - (g.y + g.h / 2);
    if (Math.abs(gx) < g.w / 2 + 12 && Math.abs(gy) < g.h / 2 + 18) {
      const { level, finished } = advanceLevel(this.levelIndex, BRAVE_LEVELS.length);
      if (finished) {
        this.won = true;
        EventBus.emit('arcade:done', { success: true, score: scoreForRun({ coins: this.coins, stomps: this.stomps, livesLeft: this.lives }) });
      } else {
        EventBus.emit('sfx', { key: 'arrive' });
        this.buildLevel(level);
      }
    }
  }

  private onEnemy(enemy: Body) {
    if (this.won) return;
    const falling = this.player.body.velocity.y > 20;
    const above = this.player.y < enemy.y - 2;
    if (falling && above) {
      this.enemyMeta.delete(enemy); enemy.destroy();
      this.player.body.setVelocityY(-300);
      this.stomps++; this.emitHud();
      squashBounce(this, this.player, this.reducedMotion);
      EventBus.emit('sfx', { key: 'select' });
      return;
    }
    this.hurt();
  }

  private hurt() {
    if (this.time.now < this.invulnUntil) return;
    const { lives, gameOver } = loseLife(this.lives);
    this.lives = lives; this.emitHud();
    shake(this, this.reducedMotion);
    EventBus.emit('sfx', { key: 'arrive' });
    if (gameOver) {
      this.won = true; this.player.body.setVelocity(0, 0);
      EventBus.emit('arcade:gameover', { score: scoreForRun({ coins: this.coins, stomps: this.stomps, livesLeft: 0 }) });
      return;
    }
    this.invulnUntil = this.time.now + 1100;
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    hitFlash(this, this.player, this.reducedMotion);
  }
}
