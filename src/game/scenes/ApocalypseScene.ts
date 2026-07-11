import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { APOC_LEVELS, APOC_WORLD_H, type ApocLevel, type ApocEnemy } from '@/game/data/levels/apocalypse';
import { buildSkinTexture, SKIN_SUIT, type SkinId } from '@/game/kit/skins';
import { coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { advanceLevel, loseLife } from '@/lib/gameRules';

type Body = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

type EnemyKind = 'archer' | 'zombie' | 'sky';
type EnemyState = {
  kind: EnemyKind;
  minX: number;
  maxX: number;
  speed: number;
  dir: number;
  nextShot: number;
  landed: boolean; // sky zombies patrol only after landing
};

type WeaponId = 'missile' | 'repulsor' | 'unibeam' | 'smartbomb';
type WeaponDef = { id: WeaponId; name: string; cooldown: number; ammo: number; speed: number };

const WEAPONS: Record<WeaponId, WeaponDef> = {
  missile: { id: 'missile', name: 'Missile', cooldown: 200, ammo: Infinity, speed: 700 },
  repulsor: { id: 'repulsor', name: 'Repulsor', cooldown: 350, ammo: Infinity, speed: 550 },
  unibeam: { id: 'unibeam', name: 'Unibeam', cooldown: 700, ammo: 15, speed: 450 },
  smartbomb: { id: 'smartbomb', name: 'Smartbomb', cooldown: 2000, ammo: 3, speed: 0 },
};
const ARSENAL: WeaponId[] = ['missile', 'repulsor', 'unibeam', 'smartbomb'];

type HeroTuning = { move: number; jump: number; hp: number };
const HERO_TUNING: Record<SkinId, HeroTuning> = {
  bolt: { move: 260, jump: -480, hp: 90 },
  titan: { move: 200, jump: -520, hp: 150 },
  comet: { move: 230, jump: -460, hp: 110 },
  aegis: { move: 210, jump: -470, hp: 130 },
  mystic: { move: 220, jump: -470, hp: 100 },
  blaze: { move: 240, jump: -490, hp: 110 },
};

const GRAVITY = 1100;

export class ApocalypseScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private startLevel = 0;

  private player!: Body;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private arrows!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private enemyState = new Map<Phaser.GameObjects.GameObject, EnemyState>();
  private shotPierce = new Map<Phaser.GameObjects.GameObject, number>();
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private coinObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private starObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private healthObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private checkpointObjs: Array<{ x: number; y: number; reached: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private lavaRect!: Phaser.GameObjects.Rectangle;

  private level!: ApocLevel;
  private levelIndex = 0;
  private lives = 3;
  private hp = 100;
  private maxHp = 100;
  private coins = 0;
  private stars = 0;
  private kills = 0;
  private scoreBonus = 0;
  private invulnUntil = 0;
  private won = false;
  private facing = 1;
  private goalRect = { x: 0, y: 0, w: 0, h: 0 };
  private respawn = { x: 0, y: 0 };
  private lavaY = 560;

  // Weapons / abilities
  private weapon: WeaponId = 'missile';
  private ammo: Record<WeaponId, number> = { missile: Infinity, repulsor: Infinity, unibeam: 15, smartbomb: 3 };
  private nextFire = 0;
  private peakFallVy = 0;
  private wasGrounded = true;
  private slowUntil = 0;
  private nextPower = 0;
  private dashUntil = 0;
  private shieldActive = false;
  private nextSky = 0;

  private inputState = { left: false, right: false, jump: false };
  private readonly onInput = (p: { left: boolean; right: boolean; jump: boolean }) => { this.inputState = p; };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };
  private readonly onFire = () => { if (this.sys.isActive()) this.fire(); };
  private readonly onPower = () => { if (this.sys.isActive()) this.power(); };
  private readonly onWeapon = (p: { index: number }) => { if (this.sys.isActive()) this.selectWeapon(p.index); };

  constructor() { super('Apoc'); }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.startLevel = (this.game.registry.get('levelStart') as number) ?? 0;
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.arrows = this.physics.add.group();
    this.shots = this.physics.add.group();

    this.player = this.physics.add.image(0, 0, buildSkinTexture(this, this.skin)) as Body;
    this.player.setDepth(5); this.player.setScale(1.6); this.player.setGravityY(GRAVITY);
    this.player.setMaxVelocity(1000, 1200);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms, (e) => this.onEnemyLand(e as Body));
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onEnemyTouch(e as Body));
    this.physics.add.overlap(this.player, this.arrows, (_p, a) => this.onArrowHit(a as Body));
    this.physics.add.overlap(this.shots, this.enemies, (s, e) => this.onShotHit(s as Body, e as Body));

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, APOC_WORLD_H)); };
    this.scale.on(Phaser.Scale.Events.RESIZE, fit, this);

    EventBus.on('arcade:input', this.onInput);
    EventBus.on('arcade:restart', this.onRestart);
    EventBus.on('apoc:fire', this.onFire);
    EventBus.on('apoc:power', this.onPower);
    EventBus.on('apoc:weapon', this.onWeapon);
    const cleanup = () => {
      EventBus.off('arcade:input', this.onInput);
      EventBus.off('arcade:restart', this.onRestart);
      EventBus.off('apoc:fire', this.onFire);
      EventBus.off('apoc:power', this.onPower);
      EventBus.off('apoc:weapon', this.onWeapon);
      this.scale.off(Phaser.Scale.Events.RESIZE, fit, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.startRun();
  }

  private startRun() {
    this.lives = 3; this.coins = 0; this.stars = 0; this.kills = 0; this.scoreBonus = 0; this.won = false;
    this.maxHp = HERO_TUNING[this.skin].hp; this.hp = this.maxHp;
    this.weapon = 'missile';
    this.ammo = { missile: Infinity, repulsor: Infinity, unibeam: 15, smartbomb: 3 };
    this.buildLevel(this.startLevel);
  }

  private clearLevel() {
    for (const o of this.levelGfx) o.destroy();
    this.levelGfx = [];
    this.platforms.clear(true, true);
    this.enemies.clear(true, true);
    this.arrows.clear(true, true);
    this.shots.clear(true, true);
    this.enemyState.clear();
    this.shotPierce.clear();
    this.coinObjs = []; this.starObjs = []; this.healthObjs = []; this.checkpointObjs = [];
  }

  private buildLevel(index: number) {
    this.clearLevel();
    this.levelIndex = index;
    this.level = APOC_LEVELS[index];

    this.buildBurningCity();

    // Platforms (rooftops).
    for (const p of this.level.platforms) {
      const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
      const gfx = this.add.graphics().setDepth(2);
      gfx.fillStyle(0x241010, 1); gfx.fillRoundedRect(p.x, p.y, p.w, p.h, 4);
      gfx.fillStyle(0x5a2410, 1); gfx.fillRoundedRect(p.x, p.y, p.w, 5, 2);
      this.levelGfx.push(gfx);
    }

    // Lava (rising rectangle spanning the world width).
    this.lavaY = this.level.lava.startY;
    this.lavaRect = this.add.rectangle(
      this.level.worldW / 2, this.lavaY + 300, this.level.worldW, 600, 0xff3300, 0.88,
    ).setDepth(4);
    this.levelGfx.push(this.lavaRect);
    if (!this.reducedMotion) {
      this.tweens.add({ targets: this.lavaRect, alpha: 0.7, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Coins.
    this.coinObjs = this.level.coins.map((c, i) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0xffbb22, 0.3); gfx.fillCircle(0, 0, 11);
      gfx.fillStyle(0xffbb22, 1); gfx.fillCircle(0, 0, 7);
      gfx.fillStyle(0xfff3c0, 1); gfx.fillCircle(-2.5, -2.5, 2);
      gfx.setPosition(c.x, c.y);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, y: c.y - 4, duration: 800 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 90 });
      this.levelGfx.push(gfx);
      return { x: c.x, y: c.y, collected: false, gfx };
    });

    // Stars.
    this.starObjs = this.level.stars.map((s, i) => {
      const gfx = this.add.graphics().setDepth(3);
      this.drawStar(gfx, 0xfff066);
      gfx.setPosition(s.x, s.y);
      if (!this.reducedMotion) this.tweens.add({ targets: gfx, angle: 360, duration: 4000, repeat: -1, ease: 'Linear', delay: i * 100 });
      this.levelGfx.push(gfx);
      return { x: s.x, y: s.y, collected: false, gfx };
    });

    // Health pickups (red cross).
    this.healthObjs = this.level.health.map((h) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.fillStyle(0x33cc55, 1); gfx.fillRoundedRect(-8, -8, 16, 16, 3);
      gfx.fillStyle(0xffffff, 1); gfx.fillRect(-2, -6, 4, 12); gfx.fillRect(-6, -2, 12, 4);
      gfx.setPosition(h.x, h.y);
      this.levelGfx.push(gfx);
      return { x: h.x, y: h.y, collected: false, gfx };
    });

    // Checkpoints (banner pole).
    this.checkpointObjs = this.level.checkpoints.map((cp) => {
      const gfx = this.add.graphics().setDepth(3);
      gfx.lineStyle(3, 0x7a4a20, 1);
      gfx.beginPath(); gfx.moveTo(0, 0); gfx.lineTo(0, -50); gfx.strokePath();
      gfx.fillStyle(0x888888, 0.9); gfx.fillTriangle(0, -50, 20, -44, 0, -34);
      gfx.setPosition(cp.x, cp.y);
      this.levelGfx.push(gfx);
      return { x: cp.x, y: cp.y, reached: false, gfx };
    });

    // Enemies.
    for (const e of this.level.enemies) this.spawnEnemy(e);

    // Goal flag.
    const g = this.level.goal;
    this.goalRect = { x: g.x, y: g.y, w: g.w, h: g.h };
    const flag = this.add.graphics().setDepth(3);
    flag.lineStyle(3, 0xeaeaea, 1);
    flag.beginPath(); flag.moveTo(g.x, g.y); flag.lineTo(g.x, g.y + g.h); flag.strokePath();
    flag.fillStyle(0x33cc55, 1); flag.fillTriangle(g.x + 1, g.y + 1, g.x + 26, g.y + 9, g.x + 1, g.y + 18);
    this.levelGfx.push(flag);

    // Player + camera.
    this.respawn = { x: this.level.start.x, y: this.level.start.y };
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    this.player.setAlpha(1); this.invulnUntil = 0;
    this.facing = 1;
    this.nextSky = this.time.now + this.level.skySpawn.intervalMs;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, APOC_WORLD_H));
    cam.startFollow(this.player, true, 0.1, 0.1);

    this.emitHud();
  }

  private drawStar(gfx: Phaser.GameObjects.Graphics, color: number) {
    gfx.fillStyle(color, 1);
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 10 : 4.5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
    gfx.fillPoints(pts, true);
  }

  // ── Burning-city parallax (4 layers, drawn with Graphics) ────────────────
  private buildBurningCity() {
    const { worldW, theme } = this.level;
    const h = this.scale.height;
    const w = this.scale.width;

    const sky = this.add.graphics().setDepth(-3).setScrollFactor(0);
    const [b0, b1, b2, b3] = theme.sky;
    sky.fillStyle(b0, 1); sky.fillRect(0, 0, w, h * 0.4);
    sky.fillStyle(b1, 1); sky.fillRect(0, h * 0.4, w, h * 0.25);
    sky.fillStyle(b2, 1); sky.fillRect(0, h * 0.65, w, h * 0.2);
    sky.fillStyle(b3, 1); sky.fillRect(0, h * 0.85, w, h * 0.15);
    this.levelGfx.push(sky);

    const far = this.add.graphics().setDepth(-2).setScrollFactor(0.2);
    far.fillStyle(theme.far, 1);
    for (let x = 0; x < worldW; x += 180) {
      const bh = 120 + ((x * 53) % 110);
      far.fillRect(x, APOC_WORLD_H - bh, 130, bh);
    }
    this.levelGfx.push(far);

    const mid = this.add.graphics().setDepth(-1).setScrollFactor(0.5);
    for (let x = 60; x < worldW; x += 220) {
      const bh = 180 + ((x * 71) % 150);
      mid.fillStyle(theme.mid, 1);
      mid.fillRect(x, APOC_WORLD_H - bh, 150, bh);
      mid.fillStyle(theme.midWindow, 0.8);
      for (let wy = APOC_WORLD_H - bh + 16; wy < APOC_WORLD_H - 12; wy += 28) {
        for (let wx = x + 16; wx < x + 134; wx += 30) mid.fillRect(wx, wy, 8, 12);
      }
    }
    this.levelGfx.push(mid);

    const near = this.add.graphics().setDepth(1).setScrollFactor(0.8);
    for (let x = 120; x < worldW; x += 280) {
      const bh = 220 + ((x * 97) % 170);
      const top = APOC_WORLD_H - bh;
      near.fillStyle(theme.near, 1);
      near.fillRect(x, top, 170, bh);
      near.fillStyle(theme.nearWindow, 0.9);
      for (let wy = top + 18; wy < APOC_WORLD_H - 14; wy += 30) {
        for (let wx = x + 18; wx < x + 152; wx += 34) near.fillRect(wx, wy, 9, 13);
      }
      // Rooftop flames.
      const [f0, f1, f2] = theme.flame;
      near.fillStyle(f0, 0.9); near.fillTriangle(x + 30, top, x + 18, top + 22, x + 42, top + 22);
      near.fillStyle(f1, 0.9); near.fillTriangle(x + 90, top - 6, x + 80, top + 18, x + 100, top + 18);
      near.fillStyle(f2, 0.9); near.fillTriangle(x + 140, top + 4, x + 132, top + 22, x + 148, top + 22);
    }
    this.levelGfx.push(near);
  }

  // ── Enemies ──────────────────────────────────────────────────────────────
  private spawnEnemy(e: ApocEnemy) {
    const color = e.kind === 'archer' ? 0xb0b0b0 : 0x4a7a3a;
    const key = `apoc-enemy-${e.kind}`;
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(color, 1); g.fillRoundedRect(2, 4, 14, 16, 3);
      g.fillStyle(0xe8d8b0, 1); g.fillCircle(9, 5, 4);
      g.fillStyle(0x000000, 1); g.fillRect(6, 10, 2, 2); g.fillRect(11, 10, 2, 2);
      g.generateTexture(key, 18, 22);
      g.destroy();
    }
    const body = this.physics.add.image(e.x, e.y, key) as Body;
    body.setDepth(4); body.setScale(1.5);
    body.setGravityY(GRAVITY);
    body.setCollideWorldBounds(false);
    this.enemies.add(body);
    body.body.setVelocityX(e.speed);
    this.enemyState.set(body, {
      kind: e.kind, minX: e.minX, maxX: e.maxX, speed: e.speed,
      dir: 1, nextShot: this.time.now + 2000 + Math.random() * 1500,
      landed: true,
    });
  }

  private spawnSkyZombie() {
    const cfg = this.level.skySpawn;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-120, 120), 40, this.level.worldW - 40);
    const key = 'apoc-enemy-zombie';
    const body = this.physics.add.image(x, this.player.y - 320, key) as Body;
    body.setDepth(4); body.setScale(1.5);
    body.setGravityY(GRAVITY);
    this.enemies.add(body);
    this.enemyState.set(body, {
      kind: 'sky', minX: x - cfg.patrolRange / 2, maxX: x + cfg.patrolRange / 2,
      speed: cfg.speed, dir: 1, nextShot: 0, landed: false,
    });
  }

  private onEnemyLand(e: Body) {
    const st = this.enemyState.get(e);
    if (st && st.kind === 'sky' && !st.landed) {
      st.landed = true;
      st.minX = Math.max(20, e.x - this.level.skySpawn.patrolRange / 2);
      st.maxX = e.x + this.level.skySpawn.patrolRange / 2;
      e.body.setVelocityX(st.speed);
    }
  }

  private stepEnemies() {
    const now = this.time.now;
    const slow = now < this.slowUntil ? 0.15 : 1;
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Body;
      if (!e.active) continue;
      const st = this.enemyState.get(e);
      if (!st) continue;
      if (st.kind === 'sky' && !st.landed) continue; // falling; physics handles it

      // Patrol within bounds.
      if (e.x <= st.minX) st.dir = 1;
      else if (e.x >= st.maxX) st.dir = -1;
      e.body.setVelocityX(st.speed * st.dir * slow);
      e.setFlipX(st.dir < 0);

      // Archer shooting.
      if (st.kind === 'archer' && now >= st.nextShot) {
        st.nextShot = now + (2000 + Math.random() * 1500) / Math.max(slow, 0.15);
        this.shootArrow(e);
      }
    }

    // Cull off-world enemies.
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Body;
      if (e.active && e.y > this.level.worldH + 200) { this.enemyState.delete(e); e.destroy(); }
    }
  }

  private shootArrow(e: Body) {
    const dir = this.player.x < e.x ? -1 : 1;
    const key = 'apoc-arrow';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffe08a, 1); g.fillRect(0, 0, 14, 3);
      g.fillStyle(0xff7733, 1); g.fillTriangle(14, -2, 14, 5, 20, 1.5);
      g.generateTexture(key, 20, 6);
      g.destroy();
    }
    const arrow = this.physics.add.image(e.x, e.y - 6, key) as Body;
    arrow.setDepth(4);
    arrow.body.setAllowGravity(false);
    arrow.setFlipX(dir < 0);
    arrow.body.setVelocityX(350 * dir);
    this.arrows.add(arrow);
  }

  // ── Player input / movement ───────────────────────────────────────────────
  update() {
    if (this.won) return;
    const body = this.player.body;
    const now = this.time.now;
    const tuning = HERO_TUNING[this.skin];

    const grounded = body.blocked.down;

    // Bolt dash overrides horizontal control briefly.
    if (now < this.dashUntil) {
      // velocity already set by dash; leave it.
    } else {
      const vx = (this.inputState.left ? -tuning.move : 0) + (this.inputState.right ? tuning.move : 0);
      body.setVelocityX(vx);
      if (vx < 0) this.facing = -1; else if (vx > 0) this.facing = 1;
      this.player.setFlipX(this.facing < 0);
    }

    if (this.inputState.jump && grounded) body.setVelocityY(tuning.jump);

    // Comet flight: while jump held in air, near-float.
    if (this.skin === 'comet' && this.inputState.jump && !grounded) {
      this.player.setGravityY(GRAVITY * 0.12);
    } else {
      this.player.setGravityY(GRAVITY);
    }

    // Titan ground smash: track peak fall velocity, trigger on landing.
    if (!grounded) {
      this.peakFallVy = Math.max(this.peakFallVy, body.velocity.y);
    }
    if (grounded && !this.wasGrounded) {
      if (this.skin === 'titan' && this.peakFallVy > 520) this.titanSmash();
      this.peakFallVy = 0;
    }
    this.wasGrounded = grounded;

    this.stepEnemies();

    // Sky-zombie spawner.
    if (now >= this.nextSky) {
      this.nextSky = now + this.level.skySpawn.intervalMs;
      this.spawnSkyZombie();
    }

    // Rising lava.
    this.lavaY -= (this.level.lava.riseSpeed * this.game.loop.delta) / 1000;
    this.lavaRect.y = this.lavaY + 300;
    if (this.player.y + 12 >= this.lavaY) { this.die(); return; }

    // Cull arrows off-world; arrow-enemy ignore.
    for (const obj of this.arrows.getChildren()) {
      const a = obj as Body;
      if (a.active && (a.x < -50 || a.x > this.level.worldW + 50)) a.destroy();
    }
    for (const obj of this.shots.getChildren()) {
      const s = obj as Body;
      if (s.active && (s.x < -50 || s.x > this.level.worldW + 50)) { this.shotPierce.delete(s); s.destroy(); }
    }

    // Fall off bottom.
    if (this.player.y > this.level.worldH + 80) { this.die(); return; }

    this.collectPickups();
    this.checkGoal();
  }

  private collectPickups() {
    for (const c of this.coinObjs) {
      if (c.collected) continue;
      if (this.near(c.x, c.y, 30)) {
        c.collected = true; c.gfx.setVisible(false);
        this.coins++; this.emitHud();
        coinPop(this, c.x, c.y, 0xffbb22, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }
    for (const s of this.starObjs) {
      if (s.collected) continue;
      if (this.near(s.x, s.y, 30)) {
        s.collected = true; s.gfx.setVisible(false);
        this.stars++; this.emitHud();
        coinPop(this, s.x, s.y, 0xfff066, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
      }
    }
    for (const h of this.healthObjs) {
      if (h.collected) continue;
      if (this.near(h.x, h.y, 30)) {
        h.collected = true; h.gfx.setVisible(false);
        this.hp = Math.min(this.maxHp, this.hp + 35); this.emitHud();
        EventBus.emit('sfx', { key: 'select' });
      }
    }
    for (const cp of this.checkpointObjs) {
      if (cp.reached) continue;
      if (this.near(cp.x, cp.y, 40)) {
        cp.reached = true;
        this.respawn = { x: cp.x, y: cp.y - 30 };
        this.goldFlash();
        EventBus.emit('sfx', { key: 'arrive' });
      }
    }
  }

  private near(x: number, y: number, r: number): boolean {
    const dx = this.player.x - x; const dy = this.player.y - y;
    return dx * dx + dy * dy < r * r;
  }

  private checkGoal() {
    const g = this.goalRect;
    const gx = this.player.x - (g.x + g.w / 2); const gy = this.player.y - (g.y + g.h / 2);
    if (Math.abs(gx) < g.w / 2 + 16 && Math.abs(gy) < g.h / 2 + 24) {
      const { level, finished } = advanceLevel(this.levelIndex, APOC_LEVELS.length);
      if (finished) {
        this.won = true;
        EventBus.emit('arcade:done', { success: true, score: this.score(true) });
      } else {
        EventBus.emit('sfx', { key: 'arrive' });
        this.buildLevel(level);
      }
    }
  }

  // ── Combat ────────────────────────────────────────────────────────────────
  private fire() {
    if (this.won) return;
    const now = this.time.now;
    if (now < this.nextFire) return;

    // Aegis throws a bouncing shield instead of a shot.
    if (this.skin === 'aegis') {
      if (this.shieldActive) return;
      this.nextFire = now + 500;
      this.throwShield();
      return;
    }

    const w = this.skin === 'blaze' ? this.weapon : 'missile';
    const def = WEAPONS[w];
    if (this.ammo[w] <= 0) return;
    this.nextFire = now + def.cooldown;
    if (this.ammo[w] !== Infinity) { this.ammo[w] -= 1; this.emitHud(); }
    EventBus.emit('sfx', { key: 'select' });

    if (w === 'smartbomb') { this.smartbomb(); return; }
    if (w === 'repulsor') {
      for (const da of [-0.25, 0, 0.25]) this.spawnShot(def.speed, da, 1, 30);
      return;
    }
    if (w === 'unibeam') { this.spawnShot(def.speed, 0, 3, 75); return; }
    this.spawnShot(def.speed, 0, 1, 50);
  }

  private spawnShot(speed: number, angleOffset: number, pierce: number, pts: number) {
    const key = 'apoc-shot';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x66e0ff, 1); g.fillCircle(5, 5, 5);
      g.fillStyle(0xffffff, 1); g.fillCircle(5, 5, 2);
      g.generateTexture(key, 10, 10);
      g.destroy();
    }
    const s = this.physics.add.image(this.player.x + this.facing * 14, this.player.y, key) as Body;
    s.setDepth(5);
    s.body.setAllowGravity(false);
    const ang = angleOffset * this.facing;
    s.body.setVelocity(Math.cos(ang) * speed * this.facing, Math.sin(ang) * speed);
    s.setData('pts', pts);
    this.shotPierce.set(s, pierce);
    this.shots.add(s);
  }

  private onShotHit(shot: Body, enemy: Body) {
    if (!shot.active || !enemy.active) return;
    const pts = (shot.getData('pts') as number) ?? 50;
    this.killEnemy(enemy, pts);
    let pierce = this.shotPierce.get(shot) ?? 1;
    pierce -= 1;
    if (pierce <= 0) { this.shotPierce.delete(shot); shot.destroy(); }
    else this.shotPierce.set(shot, pierce);
  }

  private smartbomb() {
    for (const obj of this.enemies.getChildren().slice()) {
      const e = obj as Body;
      if (e.active && this.onScreen(e)) this.killEnemy(e, 50);
    }
    if (!this.reducedMotion) {
      this.cameras.main.shake(300, 0.02);
      this.flashScreen(0xffff66, 150);
    }
  }

  private throwShield() {
    const key = 'apoc-shield';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(SKIN_SUIT.aegis, 1); g.fillCircle(9, 9, 9);
      g.fillStyle(0xbcd3ef, 1); g.fillCircle(9, 9, 5);
      g.generateTexture(key, 18, 18);
      g.destroy();
    }
    const shield = this.physics.add.image(this.player.x + this.facing * 14, this.player.y, key) as Body;
    shield.setDepth(5);
    shield.body.setAllowGravity(false);
    shield.setBounce(1);
    shield.setCollideWorldBounds(true);
    shield.body.setVelocity(420 * this.facing, -120);
    this.shieldActive = true;
    const col = this.physics.add.collider(shield, this.platforms);
    const ov = this.physics.add.overlap(shield, this.enemies, (_s, e) => this.killEnemy(e as Body, 50));
    EventBus.emit('sfx', { key: 'select' });
    this.time.delayedCall(4000, () => {
      col.destroy(); ov.destroy();
      shield.destroy();
      this.shieldActive = false;
    });
  }

  private titanSmash() {
    for (const obj of this.enemies.getChildren().slice()) {
      const e = obj as Body;
      if (e.active && Math.abs(e.x - this.player.x) < 160 && Math.abs(e.y - this.player.y) < 160) {
        this.killEnemy(e, 35);
      }
    }
    if (!this.reducedMotion) this.cameras.main.shake(300, 0.022);
  }

  private killEnemy(enemy: Body, pts: number) {
    if (!enemy.active) return;
    this.enemyState.delete(enemy);
    const x = enemy.x; const y = enemy.y;
    enemy.destroy();
    this.kills += pts > 0 ? 1 : 0;
    if (!this.reducedMotion) this.explosion(x, y);
    this.emitHud();
    EventBus.emit('sfx', { key: 'select' });
    // pts tracked via score(); kills counter just bumps for HUD parity.
    this.scoreBonus += pts;
  }

  // ── Abilities (Power button) ──────────────────────────────────────────────
  private power() {
    if (this.won) return;
    const now = this.time.now;
    if (this.skin === 'mystic') {
      if (now < this.nextPower) return;
      this.nextPower = now + 20000;
      this.slowUntil = now + 4000;
      if (!this.reducedMotion) this.flashScreen(0x3fa9f5, 200);
      EventBus.emit('sfx', { key: 'select' });
    } else if (this.skin === 'bolt') {
      if (now < this.nextPower) return;
      this.nextPower = now + 1000;
      this.dashUntil = now + 280;
      this.invulnUntil = Math.max(this.invulnUntil, now + 280);
      this.player.body.setVelocityX(960 * this.facing);
      this.player.setAlpha(0.5);
      this.time.delayedCall(280, () => { if (this.time.now >= this.invulnUntil) this.player.setAlpha(1); });
      EventBus.emit('sfx', { key: 'select' });
    }
  }

  private selectWeapon(index: number) {
    if (this.skin !== 'blaze') return;
    const id = ARSENAL[index - 1];
    if (!id) return;
    this.weapon = id;
    this.emitHud();
  }

  // ── Damage / death ────────────────────────────────────────────────────────
  private onEnemyTouch(enemy: Body) {
    if (this.won || !enemy.active) return;
    const st = this.enemyState.get(enemy);
    const falling = this.player.body.velocity.y > 20;
    const above = this.player.y < enemy.y - 4;
    if (falling && above) {
      this.killEnemy(enemy, 50);
      this.player.body.setVelocityY(-320);
      return;
    }
    const dmg = st?.kind === 'zombie' || st?.kind === 'sky' ? 30 : 20;
    this.damage(dmg);
  }

  private onArrowHit(arrow: Body) {
    if (this.won || !arrow.active) return;
    arrow.destroy();
    this.damage(20);
  }

  private damage(amount: number) {
    if (this.time.now < this.invulnUntil) return;
    this.hp -= amount;
    this.invulnUntil = this.time.now + 1200;
    hitFlash(this, this.player, this.reducedMotion);
    shake(this, this.reducedMotion);
    EventBus.emit('sfx', { key: 'arrive' });
    if (this.hp <= 0) { this.die(); return; }
    this.emitHud();
  }

  private die() {
    if (this.won) return;
    const { lives, gameOver } = loseLife(this.lives);
    this.lives = lives;
    if (gameOver) {
      this.won = true; this.player.body.setVelocity(0, 0);
      this.emitHud();
      EventBus.emit('arcade:gameover', { score: this.score(false) });
      return;
    }
    this.hp = this.maxHp;
    this.invulnUntil = this.time.now + 1200;
    this.player.setPosition(this.respawn.x, this.respawn.y);
    this.player.body.setVelocity(0, 0);
    this.player.setAlpha(1);
    if (!this.reducedMotion) this.flashScreen(0xff3b30, 200);
    hitFlash(this, this.player, this.reducedMotion);
    this.emitHud();
  }

  // ── Juice helpers ─────────────────────────────────────────────────────────
  private explosion(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const c = this.add.circle(x, y, 8 + i * 4, [0xff7733, 0xffbb22, 0xffffff][i], 0.7).setDepth(18);
      this.tweens.add({ targets: c, scale: 2.4, alpha: 0, duration: 340, delay: i * 30, onComplete: () => c.destroy() });
    }
  }

  private flashScreen(color: number, duration: number) {
    const cam = this.cameras.main;
    const r = (color >> 16) & 0xff; const g = (color >> 8) & 0xff; const b = color & 0xff;
    cam.flash(duration, r, g, b);
  }

  private goldFlash() {
    if (!this.reducedMotion) this.flashScreen(0xf7c84b, 200);
  }

  private onScreen(e: Body): boolean {
    const cam = this.cameras.main;
    const view = cam.worldView;
    return e.x >= view.x - 20 && e.x <= view.right + 20 && e.y >= view.y - 20 && e.y <= view.bottom + 20;
  }

  // ── Score / HUD ───────────────────────────────────────────────────────────
  private score(withLives: boolean): number {
    return this.coins * 10 + this.stars * 25 + this.scoreBonus + (withLives ? this.lives * 50 : 0);
  }

  private emitHud() {
    const w = this.skin === 'blaze' ? this.weapon : 'missile';
    const ammoVal = this.skin === 'blaze' ? this.ammo[this.weapon] : this.ammo.missile;
    const ammo = ammoVal === Infinity ? -1 : ammoVal;
    const weaponName = this.skin === 'blaze' ? WEAPONS[w].name : 'Missile';
    EventBus.emit('apoc:hud', {
      hp: Math.max(0, Math.round(this.hp)), maxHp: this.maxHp,
      lives: this.lives, score: this.score(false), stars: this.stars, coins: this.coins,
      weapon: weaponName, ammo,
    });
  }
}
