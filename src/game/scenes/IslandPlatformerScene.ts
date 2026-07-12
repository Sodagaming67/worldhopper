import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { ISLAND_LEVELS, ISLAND_WORLD_H, type IslandLevel, type IslandEnemy, type PlatformerWorldId } from '@/game/data/levels/island';
import { buildSkinTexture, SKIN_SUIT, type SkinId } from '@/game/kit/skins';
import { ambientGrade, coinPop, hitFlash, shake } from '@/game/kit/juice';
import { followZoom } from '@/game/kit/camera';
import { difficultyMods, lavaRespawnReset, loseLife } from '@/lib/gameRules';

// Sprite (not Image) throughout — enemies/hero need frame animation on
// Kīlauea's AI-generated art; a single-frame generated texture displays
// identically on a Sprite as it did on an Image.
type Body = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
/** Pickup/checkpoint decoration: procedural Graphics (other worlds) or a
 * placed AI-art Image (Kīlauea). Both expose the .x/.y/.setVisible used by
 * shared collection logic. */
type DecorGfx = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;

type EnemyKind = 'melee' | 'ranged' | 'sky';
type EnemyState = {
  kind: EnemyKind;
  minX: number;
  maxX: number;
  speed: number;
  dir: number;
  nextShot: number;
  landed: boolean; // sky enemies patrol only after landing
  /** Kīlauea AI-art display scale — set when this enemy's body needs
   * per-tick re-anchoring (see syncKilaueaEnemyBody). */
  kilaueaArtScale?: number;
};

type WeaponId = 'missile' | 'repulsor' | 'unibeam' | 'smartbomb';
type WeaponDef = { id: WeaponId; name: string; cooldown: number; ammo: number; speed: number };

// Display names only — ids/cooldowns/ammo/speeds/points unchanged (spec §6).
const WEAPONS: Record<WeaponId, WeaponDef> = {
  missile: { id: 'missile', name: 'Water Jet', cooldown: 200, ammo: Infinity, speed: 700 },
  repulsor: { id: 'repulsor', name: 'Shell Scatter', cooldown: 350, ammo: Infinity, speed: 550 },
  unibeam: { id: 'unibeam', name: 'Light Spear', cooldown: 700, ammo: 15, speed: 450 },
  smartbomb: { id: 'smartbomb', name: 'Conch Blast', cooldown: 2000, ammo: 3, speed: 0 },
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
/** Sneaker waves hold off this long after every spawn/respawn. */
const WAVE_GRACE_MS = 3000;

// ── Kīlauea AI art tuning (docs/game/kilauea-art-brief.md) ───────────────────
/** Native art is ~500-1100px; this scales the hero down to a human-sized sprite. */
const KILAUEA_HERO_SCALE = 0.085;
/** Hero physics footprint in world px — independent of visual scale/native
 * art size so jump arcs/gaps stay tuned to the original 18×24@1.6 hero. */
const KILAUEA_HERO_BODY_W = 24;
const KILAUEA_HERO_BODY_H = 34;
/** Same idea as the hero footprint, for enemy bodies (see setupKilaueaEnemyBody). */
const KILAUEA_ENEMY_BODY_W = 26;
const KILAUEA_ENEMY_BODY_H = 30;
/** Native pixel height of k-platform-wide.png, for tiling the level floor at correct aspect. */
const KILAUEA_PLATFORM_WIDE_NATIVE_H = 232;
/** AI enemy art keys + display scale, keyed by the 3 enemy skins this world uses. */
const KILAUEA_ENEMY_ART: Partial<Record<IslandEnemy['skin'], { frames: [string, string]; anim: string; scale: number }>> = {
  kakamora: { frames: ['k-kakamora-1', 'k-kakamora-2'], anim: 'k-kakamora-walk', scale: 0.07 },
  lavaCrab: { frames: ['k-lava-crab-1', 'k-lava-crab-2'], anim: 'k-lava-crab-walk', scale: 0.065 },
  fireSprite: { frames: ['k-fire-sprite-1', 'k-fire-sprite-2'], anim: 'k-fire-sprite-flicker', scale: 0.08 },
};

// ── Backdrop palettes (inlined — the scene no longer imports apocalypse data) ─
const VOLCANO_SKY: [number, number, number, number] = [0x140100, 0x3a0600, 0x731000, 0xb02000];
const VOLCANO_FAR = 0x1a0505;
const VOLCANO_MID = 0x260a00;
const VOLCANO_NEAR = 0x0d0a0a;
const VOLCANO_FLAME: [number, number, number] = [0xff3300, 0xff8800, 0xffcc22];

const LAGOON_SKY: [number, number, number, number] = [0x8fd8f0, 0xaee8f5, 0xffd9a0, 0xffb36b];
const LAGOON_SEA = 0x1e7ba8;
const LAGOON_PALM = 0x1a5c3a;
const LAGOON_DUNE = 0xd9c08a;

const BLACKSAND_SKY: [number, number, number, number] = [0x2a1a4a, 0x53306b, 0xb0527a, 0xf08a5a]; // dusk
const BLACKSAND_SEA = 0x0f3a52;
const BLACKSAND_PALM = 0x10331f;
const BLACKSAND_DUNE = 0x1c1c22; // black sand

export class IslandPlatformerScene extends Phaser.Scene {
  private skin: SkinId = 'bolt';
  private reducedMotion = false;
  private heroCharacter: 'boy' | 'girl' = 'boy';
  private worldId: PlatformerWorldId = 'lagoon';
  private mods = { hpMul: 1, lavaMul: 1, extraLives: 0 };

  private player!: Body;
  /** Kīlauea only: the visible, non-physics sprite that shows the actual
   * hero art (idle/run/jump). `this.player` stays on a single unchanging
   * texture and invisible — see setupKilaueaHeroBody for why the physics
   * body can't tolerate the art's per-pose texture swaps directly. */
  private kilaueaHeroVisual?: Phaser.GameObjects.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private embers!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  /** Kīlauea sulphur-bank gas clouds — static overlap zones, damage-on-touch. */
  private hazardZones!: Phaser.Physics.Arcade.StaticGroup;
  private enemyState = new Map<Phaser.GameObjects.GameObject, EnemyState>();
  private shotPierce = new Map<Phaser.GameObjects.GameObject, number>();
  private levelGfx: Phaser.GameObjects.GameObject[] = [];
  private coinObjs: Array<{ x: number; y: number; collected: boolean; gfx: DecorGfx }> = [];
  private starObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private healthObjs: Array<{ x: number; y: number; collected: boolean; gfx: Phaser.GameObjects.Graphics }> = [];
  private checkpointObjs: Array<{ x: number; y: number; reached: boolean; gfx: DecorGfx }> = [];
  /** Kīlauea's painted mid/near ridge strips — drift against scroll like the reef's parallax stack. */
  private kilaueaBgLayers: Array<{ ts: Phaser.GameObjects.TileSprite; factor: number }> = [];
  private lavaRect?: Phaser.GameObjects.Rectangle;
  private waveRect?: Phaser.GameObjects.Rectangle;
  private waveClockStart = 0;
  private lastSurgeHit = -1;
  private mongooseGfx?: Phaser.GameObjects.Graphics;
  private mongooseState: 'roaming' | 'fleeing' | 'gone' = 'roaming';
  private mongooseDir = 1;
  private stolenCoins = 0;
  private hatchlingGfx: Phaser.GameObjects.Graphics[] = [];
  private escort: 'waiting' | 'following' | 'done' = 'waiting';

  private level!: IslandLevel;
  private lives = 3;
  private hp = 100;
  private maxHp = 100;
  private coins = 0;
  private stars = 0;
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

  constructor() { super('IslandPlat'); }

  /** Kīlauea only: `k-player-idle` -> `k-player-idle-girl` when the girl hero is selected. */
  private kHero(key: string): string {
    return this.heroCharacter === 'girl' ? `${key}-girl` : key;
  }

  create() {
    this.skin = (this.game.registry.get('skin') as SkinId) ?? 'bolt';
    this.worldId = (this.game.registry.get('worldId') as PlatformerWorldId) ?? 'lagoon';
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;
    this.heroCharacter = useGameStore.getState().settings.heroCharacter;

    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.embers = this.physics.add.group();
    this.shots = this.physics.add.group();
    this.hazardZones = this.physics.add.staticGroup();

    // Kīlauea: single AI-generated hiker replaces the 6 procedural skin
    // looks in this scene only (skin still sets HERO_TUNING move/jump/hp).
    // `this.player` (the physics body) stays on a single unchanging
    // texture and invisible; a separate non-physics sprite
    // (kilaueaHeroVisual, synced to it every tick) shows the actual
    // idle/run/jump art. Two earlier attempts tried to keep the art
    // directly on the physics sprite — Phaser's Arcade Body recomputes its
    // world position every step from the GameObject's `displayOrigin`
    // (Body.js `updateFromGameObject`), which itself gets silently
    // recalculated from whichever frame is newly active on every
    // `setTexture()`/anim tick. Since idle (1092px tall) vs jump (918px)
    // vs the 4 run frames (918-1105px) differ enough to shift the body out
    // of platform contact, and THIS scene picks the jump texture whenever
    // `!grounded`, that created a self-sustaining idle↔jump flicker: losing
    // contact swapped to the taller/shorter jump texture, which shifted the
    // body again. Splitting art from the collision box removes the
    // dependency entirely — physics never touches a pose texture.
    const heroTexture = this.worldId === 'kilauea' ? this.kHero('k-player-idle') : buildSkinTexture(this, this.skin);
    this.player = this.physics.add.sprite(0, 0, heroTexture) as Body;
    this.player.setDepth(5); this.player.setGravityY(GRAVITY);
    this.player.setMaxVelocity(1000, 1200);
    if (this.worldId === 'kilauea') {
      this.player.setScale(KILAUEA_HERO_SCALE);
      this.player.setVisible(false);
      this.setupKilaueaHeroBody();
      this.kilaueaHeroVisual = this.add.sprite(0, 0, this.kHero('k-player-idle')).setDepth(5).setScale(KILAUEA_HERO_SCALE);
    } else {
      this.player.setScale(1.6);
    }

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms, (e) => this.onEnemyLand(e as Body));
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onEnemyTouch(e as Body));
    this.physics.add.overlap(this.player, this.embers, (_p, a) => this.onEmberHit(a as Body));
    this.physics.add.overlap(this.shots, this.enemies, (s, e) => this.onShotHit(s as Body, e as Body));
    // Sulphur-bank gas (Kīlauea only, zero members elsewhere) — damage() has
    // its own 1200ms invuln window, so lingering in the cloud ticks damage
    // periodically rather than every overlapping physics step.
    this.physics.add.overlap(this.player, this.hazardZones, () => this.damage(8));

    const fit = () => { this.cameras.main.setZoom(followZoom(this.scale.height, ISLAND_WORLD_H)); };
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
    const mods = difficultyMods(useGameStore.getState().settings.difficulty);
    this.mods = mods;
    this.lives = 3 + mods.extraLives;
    this.coins = 0; this.stars = 0; this.scoreBonus = 0; this.won = false;
    this.maxHp = Math.round(HERO_TUNING[this.skin].hp * mods.hpMul);
    this.hp = this.maxHp;
    this.weapon = 'missile';
    this.ammo = { missile: Infinity, repulsor: Infinity, unibeam: 15, smartbomb: 3 };
    this.waveClockStart = this.time.now;
    this.lastSurgeHit = -1;
    this.buildLevel();
  }

  private clearLevel() {
    for (const o of this.levelGfx) o.destroy();
    this.levelGfx = [];
    this.platforms.clear(true, true);
    this.enemies.clear(true, true);
    this.embers.clear(true, true);
    this.shots.clear(true, true);
    this.hazardZones.clear(true, true);
    this.enemyState.clear();
    this.shotPierce.clear();
    this.coinObjs = []; this.starObjs = []; this.healthObjs = []; this.checkpointObjs = [];
    this.mongooseState = 'roaming'; this.stolenCoins = 0;
    this.escort = 'waiting'; this.hatchlingGfx = [];
    this.waveRect = undefined; this.mongooseGfx = undefined;
    this.kilaueaBgLayers = [];
  }

  private buildLevel() {
    this.clearLevel();
    this.level = ISLAND_LEVELS[this.worldId];

    this.buildBackdrop();

    // Platforms.
    for (const p of this.level.platforms) {
      const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
      if (this.worldId === 'kilauea') {
        // Pāhoehoe rock-slab art (kilauea-art-brief.md §3) — a thin cap on
        // the collision rect; the physics footprint is unchanged, only the
        // visual swaps.
        const capH = Math.min(p.h, 50);
        if (p.w > 500) {
          // The level's full-width floor (p.w=6000) is far wider than any
          // chunked platform this art was sized for — stretching a single
          // image across it (setDisplaySize) smeared the swirl motif into
          // horizontal streaks. Tile at native aspect instead, same
          // technique bg-mid/bg-near already use for wide-area coverage.
          const tileScale = capH / KILAUEA_PLATFORM_WIDE_NATIVE_H;
          const img = this.add.tileSprite(p.x + p.w / 2, p.y, p.w, capH, 'k-platform-wide').setOrigin(0.5, 0).setDepth(2);
          img.setTileScale(tileScale);
          this.levelGfx.push(img);
        } else {
          const tex = p.w >= 340 ? 'k-platform-wide' : p.w >= 200 ? 'k-platform-mid' : 'k-platform-small';
          const img = this.add.image(p.x + p.w / 2, p.y, tex).setOrigin(0.5, 0).setDepth(2);
          img.setDisplaySize(p.w, capH);
          this.levelGfx.push(img);
        }
        // The dark ropy lava-rock top is close in value to the ridge
        // backdrop behind it — a bright ember-glow edge line makes the
        // walkable surface read clearly against the dark scene.
        const edge = this.add.rectangle(p.x + p.w / 2, p.y, p.w, 3, 0xffaa44, 0.85).setOrigin(0.5, 0).setDepth(2);
        this.levelGfx.push(edge);
      } else {
        const gfx = this.add.graphics().setDepth(2);
        gfx.fillStyle(0x241010, 1); gfx.fillRoundedRect(p.x, p.y, p.w, p.h, 4);
        gfx.fillStyle(0x5a2410, 1); gfx.fillRoundedRect(p.x, p.y, p.w, 5, 2);
        this.levelGfx.push(gfx);
      }
    }

    // Kayak platforms — static bodies; only the graphics bob.
    for (const k of this.level.kayaks) {
      const cx = k.x + k.w / 2; const cy = k.y + k.h / 2;
      const rect = this.add.rectangle(cx, cy, k.w, k.h, 0x000000, 0);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
      const gfx = this.add.graphics().setDepth(2);
      gfx.fillStyle(0xc0392b, 1); gfx.fillRoundedRect(-k.w / 2, -k.h / 2, k.w, k.h, 8);
      gfx.fillStyle(0x7a2e0a, 1); gfx.fillRoundedRect(-k.w / 2, -k.h / 2, k.w, 5, 4);
      gfx.setPosition(cx, cy);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: gfx, y: cy - 5, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.levelGfx.push(gfx);
    }

    // Lava (optional — only on worlds that define it).
    if (this.level.lava) {
      this.lavaY = this.level.lava.startY;
      this.lavaRect = this.add.rectangle(
        this.level.worldW / 2, this.lavaY + 300, this.level.worldW, 600, 0xff3300, 0.88,
      ).setDepth(4);
      this.levelGfx.push(this.lavaRect);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: this.lavaRect, alpha: 0.7, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }

    // Sneaker waves (optional): translucent surge rectangle, parked below the world.
    if (this.level.waveFlood) {
      this.waveRect = this.add.rectangle(
        this.level.worldW / 2, this.level.worldH + 200, this.level.worldW, 400, 0x3fa9f5, 0.55,
      ).setDepth(4);
      this.levelGfx.push(this.waveRect);
    }

    // Coins — ʻōhelo berries on Kīlauea (kilauea-art-brief.md §3).
    this.coinObjs = this.level.coins.map((c, i) => {
      let gfx: DecorGfx;
      if (this.worldId === 'kilauea') {
        gfx = this.add.image(c.x, c.y, 'k-ohelo-berries').setDepth(3).setScale(0.05);
      } else {
        const g = this.add.graphics().setDepth(3);
        g.fillStyle(0xffbb22, 0.3); g.fillCircle(0, 0, 11);
        g.fillStyle(0xffbb22, 1); g.fillCircle(0, 0, 7);
        g.fillStyle(0xfff3c0, 1); g.fillCircle(-2.5, -2.5, 2);
        g.setPosition(c.x, c.y);
        gfx = g;
      }
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

    // Checkpoints — resting monk seal (lagoon), AI banner (kilauea), or
    // generic pole (other worlds). Never a hazard.
    this.checkpointObjs = this.level.checkpoints.map((cp) => {
      let gfx: DecorGfx;
      if (this.worldId === 'kilauea') {
        gfx = this.add.image(cp.x, cp.y, 'k-checkpoint-banner').setOrigin(0.5, 1).setDepth(3).setScale(0.13);
      } else {
        const g = this.add.graphics().setDepth(3);
        if (this.level.checkpointStyle === 'seal') {
          this.drawSeal(g, 0x9aa2ab);
        } else {
          g.lineStyle(3, 0x7a4a20, 1);
          g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -50); g.strokePath();
          g.fillStyle(0x888888, 0.9); g.fillTriangle(0, -50, 20, -44, 0, -34);
        }
        g.setPosition(cp.x, cp.y);
        gfx = g;
      }
      this.levelGfx.push(gfx);
      return { x: cp.x, y: cp.y, reached: false, gfx };
    });

    // Mongoose cameo (optional; friendly shell-thief).
    if (this.level.mongoose) {
      const m = this.level.mongoose;
      const gfx = this.add.graphics().setDepth(4);
      gfx.fillStyle(0x8a6a42, 1);
      gfx.fillEllipse(0, 0, 22, 7);
      gfx.fillCircle(12, -2, 4);
      gfx.fillRect(-18, -1, 8, 2);
      gfx.setPosition(m.x, 492);
      this.levelGfx.push(gfx);
      this.mongooseGfx = gfx;
      this.mongooseState = 'roaming';
    }

    // Turtle-hatchling escort (optional; friendly).
    if (this.level.hatchlings) {
      const hz = this.level.hatchlings;
      const nest = this.add.graphics().setDepth(3);
      nest.fillStyle(0x2a2a30, 1); nest.fillEllipse(0, 0, 40, 16);
      nest.fillStyle(0xe8e0d0, 1);
      nest.fillEllipse(-10, -3, 6, 5); nest.fillEllipse(0, -4, 6, 5); nest.fillEllipse(10, -3, 6, 5);
      nest.setPosition(hz.nest.x, hz.nest.y);
      this.levelGfx.push(nest);

      const sea = this.add.graphics().setDepth(3);
      sea.fillStyle(0x9adcf0, 0.8);
      sea.fillCircle(-14, 0, 3); sea.fillCircle(0, -6, 3); sea.fillCircle(14, 0, 3);
      sea.setPosition(hz.sea.x, hz.sea.y);
      this.levelGfx.push(sea);

      this.escort = 'waiting';
      this.hatchlingGfx = [];
    }

    // Enemies.
    for (const e of this.level.enemies) this.spawnEnemy(e);

    // Ambient dolphins (lagoon only) — decorative, non-colliding.
    if (this.level.ambient.dolphins && !this.reducedMotion) {
      const span = Math.max(1, this.level.worldW - 800);
      for (let i = 0; i < 3; i++) {
        const gfx = this.add.graphics().setDepth(-1).setScrollFactor(0.5);
        gfx.fillStyle(0x3fa9f5, 0.85); gfx.fillEllipse(0, 0, 26, 10);
        gfx.fillStyle(0x3fa9f5, 0.85); gfx.fillEllipse(15, -6, 12, 8);
        const baseX = 400 + i * (span / 2);
        const baseY = ISLAND_WORLD_H - 70;
        gfx.setPosition(baseX, baseY);
        this.tweens.add({
          targets: gfx, y: baseY - 30, duration: 900, yoyo: true, repeat: -1,
          repeatDelay: 4200, ease: 'Sine.easeInOut', delay: i * 2000,
        });
        this.levelGfx.push(gfx);
      }
    }

    // Goal — the story's last beacon on Kīlauea, a flag pole elsewhere.
    const g = this.level.goal;
    this.goalRect = { x: g.x, y: g.y, w: g.w, h: g.h };
    if (this.worldId === 'kilauea') {
      const beacon = this.add.image(g.x + g.w / 2, g.y + g.h, 'k-beacon').setOrigin(0.5, 1).setDepth(3).setScale(0.14);
      if (!this.reducedMotion)
        this.tweens.add({ targets: beacon, scaleX: 0.15, scaleY: 0.15, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.levelGfx.push(beacon);
    } else {
      const flag = this.add.graphics().setDepth(3);
      flag.lineStyle(3, 0xeaeaea, 1);
      flag.beginPath(); flag.moveTo(g.x, g.y); flag.lineTo(g.x, g.y + g.h); flag.strokePath();
      flag.fillStyle(0x33cc55, 1); flag.fillTriangle(g.x + 1, g.y + 1, g.x + 26, g.y + 9, g.x + 1, g.y + 18);
      this.levelGfx.push(flag);
    }

    // Player + camera.
    this.respawn = { x: this.level.start.x, y: this.level.start.y };
    this.player.setPosition(this.level.start.x, this.level.start.y);
    this.player.body.setVelocity(0, 0);
    this.player.setAlpha(1); this.invulnUntil = 0;
    this.facing = 1;
    if (this.level.skySpawn) this.nextSky = this.time.now + this.level.skySpawn.intervalMs;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.level.worldW, this.level.worldH);
    cam.setZoom(followZoom(this.scale.height, ISLAND_WORLD_H));
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

  /** Resting monk seal — grey body, lighter belly, round head with eye/nose. */
  private drawSeal(gfx: Phaser.GameObjects.Graphics, bodyColor: number) {
    gfx.clear();
    gfx.fillStyle(bodyColor, 1); gfx.fillEllipse(0, 0, 26, 12);
    gfx.fillStyle(0xd8d2c4, 1); gfx.fillEllipse(0, 2, 15, 6);
    gfx.fillStyle(bodyColor, 1); gfx.fillCircle(-16, -4, 7);
    gfx.fillStyle(0x000000, 1); gfx.fillCircle(-19, -5, 1.4); gfx.fillCircle(-19, -1.5, 1);
  }

  // ── Island backdrop parallax (4 layers, drawn with Graphics) ─────────────
  private buildBackdrop() {
    const { worldW, backdrop } = this.level;
    const h = this.scale.height;
    const w = this.scale.width;

    if (backdrop === 'volcano' && this.worldId === 'kilauea') {
      this.buildKilaueaBackdrop(w, h, worldW);
      return;
    }

    if (backdrop === 'volcano') {
      const sky = this.add.graphics().setDepth(-3).setScrollFactor(0);
      const [b0, b1, b2, b3] = VOLCANO_SKY;
      sky.fillStyle(b0, 1); sky.fillRect(0, 0, w, h * 0.4);
      sky.fillStyle(b1, 1); sky.fillRect(0, h * 0.4, w, h * 0.25);
      sky.fillStyle(b2, 1); sky.fillRect(0, h * 0.65, w, h * 0.2);
      sky.fillStyle(b3, 1); sky.fillRect(0, h * 0.85, w, h * 0.15);
      this.levelGfx.push(sky);

      const far = this.add.graphics().setDepth(-2).setScrollFactor(0.2);
      far.fillStyle(VOLCANO_FAR, 1);
      for (let x = 0; x < worldW; x += 180) {
        const bh = 120 + ((x * 53) % 110);
        far.fillRect(x, ISLAND_WORLD_H - bh, 130, bh);
      }
      this.levelGfx.push(far);

      const mid = this.add.graphics().setDepth(-1).setScrollFactor(0.5);
      for (let x = 60; x < worldW; x += 220) {
        const bh = 180 + ((x * 71) % 150);
        mid.fillStyle(VOLCANO_MID, 1);
        mid.fillRect(x, ISLAND_WORLD_H - bh, 150, bh);
      }
      this.levelGfx.push(mid);

      const near = this.add.graphics().setDepth(1).setScrollFactor(0.8);
      for (let x = 120; x < worldW; x += 280) {
        const bh = 220 + ((x * 97) % 170);
        const top = ISLAND_WORLD_H - bh;
        near.fillStyle(VOLCANO_NEAR, 1);
        near.fillRect(x, top, 170, bh);
        // Vent flames (crater ridges, not windowed buildings).
        const [f0, f1, f2] = VOLCANO_FLAME;
        near.fillStyle(f0, 0.9); near.fillTriangle(x + 30, top, x + 18, top + 22, x + 42, top + 22);
        near.fillStyle(f1, 0.9); near.fillTriangle(x + 90, top - 6, x + 80, top + 18, x + 100, top + 18);
        near.fillStyle(f2, 0.9); near.fillTriangle(x + 140, top + 4, x + 132, top + 22, x + 148, top + 22);
      }
      this.levelGfx.push(near);
      return;
    }

    if (backdrop === 'blackSand') {
      // dusk sky over water, low white surf, palm silhouettes, black-sand dunes.
      const sky = this.add.graphics().setDepth(-3).setScrollFactor(0);
      const [s0, s1, s2, s3] = BLACKSAND_SKY;
      sky.fillStyle(s0, 1); sky.fillRect(0, 0, w, h * 0.4);
      sky.fillStyle(s1, 1); sky.fillRect(0, h * 0.4, w, h * 0.25);
      sky.fillStyle(s2, 1); sky.fillRect(0, h * 0.65, w, h * 0.2);
      sky.fillStyle(s3, 1); sky.fillRect(0, h * 0.85, w, h * 0.15);
      this.levelGfx.push(sky);

      const far = this.add.graphics().setDepth(-2).setScrollFactor(0.2);
      far.fillStyle(BLACKSAND_SEA, 1);
      far.fillRect(0, ISLAND_WORLD_H - 60, worldW, 60);
      far.fillStyle(0xeaf6f7, 0.35); far.fillRect(0, ISLAND_WORLD_H - 62, worldW, 3);
      this.levelGfx.push(far);

      const mid = this.add.graphics().setDepth(-1).setScrollFactor(0.5);
      for (let x = 60; x < worldW; x += 260) {
        const trunkH = 90 + ((x * 71) % 60);
        const top = ISLAND_WORLD_H - trunkH;
        mid.fillStyle(BLACKSAND_PALM, 1);
        mid.fillRect(x, top, 14, trunkH);
        mid.fillTriangle(x + 7, top - 4, x - 24, top - 14, x + 7, top + 10);
        mid.fillTriangle(x + 7, top - 4, x + 38, top - 14, x + 7, top + 10);
        mid.fillTriangle(x + 7, top - 8, x - 16, top - 30, x + 7, top - 2);
        mid.fillTriangle(x + 7, top - 8, x + 30, top - 30, x + 7, top - 2);
      }
      this.levelGfx.push(mid);

      const near = this.add.graphics().setDepth(1).setScrollFactor(0.8);
      for (let x = 20; x < worldW; x += 240) {
        const dh = 30 + ((x * 37) % 24);
        near.fillStyle(BLACKSAND_DUNE, 1);
        near.fillRoundedRect(x, ISLAND_WORLD_H - dh, 200, dh, 10);
      }
      this.levelGfx.push(near);
      return;
    }

    // lagoon: dawn sky over water, smooth sea line, palm silhouettes, beach dunes.
    const sky = this.add.graphics().setDepth(-3).setScrollFactor(0);
    const [s0, s1, s2, s3] = LAGOON_SKY;
    sky.fillStyle(s0, 1); sky.fillRect(0, 0, w, h * 0.4);
    sky.fillStyle(s1, 1); sky.fillRect(0, h * 0.4, w, h * 0.25);
    sky.fillStyle(s2, 1); sky.fillRect(0, h * 0.65, w, h * 0.2);
    sky.fillStyle(s3, 1); sky.fillRect(0, h * 0.85, w, h * 0.15);
    this.levelGfx.push(sky);

    const far = this.add.graphics().setDepth(-2).setScrollFactor(0.2);
    far.fillStyle(LAGOON_SEA, 1);
    far.fillRect(0, ISLAND_WORLD_H - 60, worldW, 60);
    this.levelGfx.push(far);

    const mid = this.add.graphics().setDepth(-1).setScrollFactor(0.5);
    for (let x = 60; x < worldW; x += 260) {
      const trunkH = 90 + ((x * 71) % 60);
      const top = ISLAND_WORLD_H - trunkH;
      mid.fillStyle(LAGOON_PALM, 1);
      mid.fillRect(x, top, 14, trunkH);
      mid.fillTriangle(x + 7, top - 4, x - 24, top - 14, x + 7, top + 10);
      mid.fillTriangle(x + 7, top - 4, x + 38, top - 14, x + 7, top + 10);
      mid.fillTriangle(x + 7, top - 8, x - 16, top - 30, x + 7, top - 2);
      mid.fillTriangle(x + 7, top - 8, x + 30, top - 30, x + 7, top - 2);
    }
    this.levelGfx.push(mid);

    const near = this.add.graphics().setDepth(1).setScrollFactor(0.8);
    for (let x = 20; x < worldW; x += 240) {
      const dh = 30 + ((x * 37) % 24);
      near.fillStyle(LAGOON_DUNE, 1);
      near.fillRoundedRect(x, ISLAND_WORLD_H - dh, 200, dh, 10);
    }
    this.levelGfx.push(near);
  }

  /** Kīlauea's painted backdrop (kilauea-art-brief.md §5): opaque far vista +
   * two matted ridge strips drifting against scroll (SwimScene's parallax
   * pattern), plus scattered set pieces, ember drift, and warm grade. */
  private buildKilaueaBackdrop(w: number, h: number, worldW: number) {
    this.kilaueaBgLayers = [];
    const refScale = h / 941; // bg images are 1672×941 native (pre-matte)

    const far = this.add.tileSprite(0, 0, w, h, 'k-bg-far').setOrigin(0, 0).setScrollFactor(0).setDepth(-4);
    far.setTileScale(refScale);
    this.levelGfx.push(far);

    const midH = 394 * refScale;
    const mid = this.add.tileSprite(0, h - midH, w, midH, 'k-bg-mid').setOrigin(0, 0).setScrollFactor(0).setDepth(-3);
    mid.setTileScale(refScale);
    this.levelGfx.push(mid);
    this.kilaueaBgLayers.push({ ts: mid, factor: 0.15 });

    const nearH = 488 * refScale;
    const near = this.add.tileSprite(0, h - nearH, w, nearH, 'k-bg-near').setOrigin(0, 0).setScrollFactor(0).setDepth(-2);
    near.setTileScale(refScale);
    this.levelGfx.push(near);
    this.kilaueaBgLayers.push({ ts: near, factor: 0.3 });

    // Foreground set pieces — ʻōhiʻa, hāpuʻu, steam vents, sulphur rocks,
    // grass tufts — same world-anchored gentle-sway pattern as the reef's
    // coral/rock scatter.
    const sceneryDefs: { key: string; scale: number; sway: boolean }[] = [
      { key: 'k-ohia-tree', scale: 0.18, sway: true },
      { key: 'k-hapuu-fern', scale: 0.15, sway: true },
      { key: 'k-steam-vent', scale: 0.13, sway: false },
      { key: 'k-sulphur-rock', scale: 0.14, sway: false },
      { key: 'k-grass-tuft', scale: 0.1, sway: true },
    ];
    const steamKey = 'kilauea-steam-mote';
    const gasKey = 'kilauea-gas-mote';
    for (let x = 100, i = 0; x < worldW; x += 260, i++) {
      const def = sceneryDefs[i % sceneryDefs.length];
      // Sulphur rocks are a real damage hazard below, so they track true
      // world space (scrollFactor 1) instead of the 0.85 parallax drift the
      // other purely-decorative scatter uses — otherwise the visible rock
      // and its invisible hazard zone would slowly drift apart across the
      // level's 6000px width.
      const isSulphur = def.key === 'k-sulphur-rock';
      const s = this.add.image(x, ISLAND_WORLD_H - 8, def.key)
        .setOrigin(0.5, 1).setDepth(-1).setScrollFactor(isSulphur ? 1 : 0.85).setScale(def.scale);
      this.levelGfx.push(s);
      if (!this.reducedMotion && def.sway)
        this.tweens.add({ targets: s, angle: 2, duration: 2600 + (i % 4) * 280, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      // Wisps of steam from each vent's fissure (the art itself stays a dry
      // rock crack per the brief — baked-in steam can't be background-matted).
      if (!this.reducedMotion && def.key === 'k-steam-vent') {
        if (!this.textures.exists(steamKey)) {
          const g = this.make.graphics({ x: 0, y: 0 }, false);
          g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 4);
          g.generateTexture(steamKey, 8, 8);
          g.destroy();
        }
        const vent = this.add.particles(x, ISLAND_WORLD_H - 46, steamKey, {
          speedY: { min: -34, max: -16 },
          speedX: { min: -4, max: 4 },
          lifespan: 1800,
          frequency: 200,
          scale: { start: 0.5, end: 1.6 },
          alpha: { start: 0.35, end: 0 },
        }).setScrollFactor(0.85).setDepth(-1);
        this.levelGfx.push(vent);
      }

      // Sulphur banks vent poisonous gas — a real hazard (invisible overlap
      // zone; damage() already rate-limits repeated hits via its own
      // invuln window). Vent height ≈ native 805 × scale.
      if (isSulphur) {
        const zone = this.add.zone(x, ISLAND_WORLD_H - 50, 60, 60);
        this.physics.add.existing(zone, true);
        this.hazardZones.add(zone);
        this.levelGfx.push(zone);
        if (!this.reducedMotion) {
          if (!this.textures.exists(gasKey)) {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xccdd33, 1); g.fillCircle(5, 5, 5);
            g.generateTexture(gasKey, 10, 10);
            g.destroy();
          }
          const gas = this.add.particles(x, ISLAND_WORLD_H - 40, gasKey, {
            speedY: { min: -26, max: -10 },
            speedX: { min: -10, max: 10 },
            lifespan: 2200,
            frequency: 160,
            scale: { start: 0.7, end: 1.8 },
            alpha: { start: 0.4, end: 0 },
          }).setDepth(-1);
          this.levelGfx.push(gas);
        }
      }
    }

    // Lava-tube mouth flourish near the start (doubles as World 6's door art later).
    const tubeMouth = this.add.image(260, ISLAND_WORLD_H - 4, 'k-lava-tube-mouth')
      .setOrigin(0.5, 1).setDepth(-1).setScrollFactor(0.85).setScale(0.28);
    this.levelGfx.push(tubeMouth);

    // Friendly ambient wildlife (never a hazard — same rule as the reef's
    // honu/dolphins): nēnē walking near the floor, koaʻe kea soaring above.
    if (!this.reducedMotion) {
      for (let i = 0; i < 3; i++) {
        const nene = this.add.sprite(700 + i * 1800, ISLAND_WORLD_H - 20, 'k-nene-1')
          .setDepth(-1).setScrollFactor(0.8).setScale(0.09);
        nene.play('k-nene-walk');
        this.tweens.add({
          targets: nene, x: nene.x + 220, duration: 6000 + i * 700, yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
          onYoyo: () => nene.setFlipX(true), onRepeat: () => nene.setFlipX(false),
        });
        this.levelGfx.push(nene);
      }
      for (let i = 0; i < 2; i++) {
        const bird = this.add.sprite(500 + i * 2600, 90 + i * 30, 'k-koae-kea-1')
          .setDepth(-1).setScrollFactor(0.5).setScale(0.1);
        bird.play('k-koae-kea-soar');
        this.tweens.add({
          targets: bird, x: bird.x + 500, duration: 8000 + i * 900, yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
          onYoyo: () => bird.setFlipX(true), onRepeat: () => bird.setFlipX(false),
        });
        this.levelGfx.push(bird);
      }
    }

    // Drifting embers + warm ambient grade (runtime effects, not baked art).
    const key = 'kilauea-ember-mote';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffbb55, 1); g.fillCircle(3, 3, 3);
      g.fillStyle(0xfff0c0, 1); g.fillCircle(3, 3, 1.5);
      g.generateTexture(key, 6, 6);
      g.destroy();
    }
    if (!this.reducedMotion) {
      // x/y use onEmit callbacks (not a fixed min/max) so each spawn reads
      // the CURRENT viewport size — a plain {min,max} would freeze at the
      // dimensions captured when the level was built and drift out of sync
      // after a window resize/orientation change.
      const embers = this.add.particles(0, 0, key, {
        x: { onEmit: () => Phaser.Math.Between(0, this.scale.width) },
        y: { onEmit: () => this.scale.height + 10 },
        speedY: { min: -80, max: -30 },
        speedX: { min: -12, max: 12 },
        lifespan: 6000,
        frequency: 220,
        scale: { start: 0.9, end: 0.2 },
        alpha: { start: 0.85, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
      }).setScrollFactor(0).setDepth(2);
      this.levelGfx.push(embers);
    }
    this.levelGfx.push(ambientGrade(this, 0xff3a00, 0.07, 6));
  }

  // ── Enemies ──────────────────────────────────────────────────────────────
  private enemyTexture(skin: IslandEnemy['skin']): string {
    if (this.worldId === 'kilauea') {
      const art = KILAUEA_ENEMY_ART[skin];
      // Same defensive fallback as the procedural path below: if an art
      // drop is somehow missing at runtime, fall through to the generated
      // shape rather than rendering a blank/missing-texture sprite.
      if (art && this.textures.exists(art.frames[0])) return art.frames[0];
    }
    const key = `island-enemy-${skin}`;
    if (this.textures.exists(key)) return key;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    if (skin === 'kakamora') {         // coconut body + war-paint face
      g.fillStyle(0x6b4a2a, 1); g.fillCircle(9, 12, 8);
      g.fillStyle(0xe8d8b0, 1); g.fillCircle(9, 9, 5);
      g.fillStyle(0xc0392b, 1); g.fillRect(4, 8, 10, 2);
      g.fillStyle(0x000000, 1); g.fillRect(6, 10, 2, 2); g.fillRect(11, 10, 2, 2);
    } else if (skin === 'jelly') {     // translucent bell + tentacles
      g.fillStyle(0xd58cf0, 0.85); g.fillEllipse(9, 8, 14, 10);
      g.fillStyle(0xb35cd9, 0.9);
      for (const tx of [4, 8, 12]) g.fillRect(tx, 12, 2, 8);
    } else if (skin === 'lavaCrab') {  // ember crab, glowing shell
      g.fillStyle(0xb03000, 1); g.fillEllipse(9, 13, 15, 9);
      g.fillStyle(0xff7733, 1); g.fillEllipse(9, 11, 9, 5);
      g.fillStyle(0x000000, 1); g.fillRect(5, 8, 2, 2); g.fillRect(11, 8, 2, 2);
      g.fillStyle(0xb03000, 1); g.fillRect(1, 14, 4, 3); g.fillRect(13, 14, 4, 3);
    } else if (skin === 'ghostCrab') {  // pale sand crab
      g.fillStyle(0xd9cfc0, 1); g.fillEllipse(9, 13, 15, 9);
      g.fillStyle(0xf2ece0, 1); g.fillEllipse(9, 11, 9, 5);
      g.fillStyle(0x000000, 1); g.fillRect(5, 7, 2, 3); g.fillRect(11, 7, 2, 3);
      g.fillStyle(0xd9cfc0, 1); g.fillRect(1, 14, 4, 3); g.fillRect(13, 14, 4, 3);
    } else if (skin === 'frigate') {    // black frigate bird, red throat
      g.fillStyle(0x1a1a1a, 1); g.fillTriangle(9, 8, 0, 4, 9, 12); g.fillTriangle(9, 8, 18, 4, 9, 12);
      g.fillStyle(0x1a1a1a, 1); g.fillEllipse(9, 11, 8, 6);
      g.fillStyle(0xc0392b, 1); g.fillCircle(9, 14, 2.5);
    } else {                            // fireSprite (and bat/caveSprite until Task 5 wires World-6): flame wisp
      g.fillStyle(0xff4400, 0.95); g.fillTriangle(9, 2, 3, 18, 15, 18);
      g.fillStyle(0xffbb00, 0.95); g.fillTriangle(9, 7, 6, 17, 12, 17);
      g.fillStyle(0xffffff, 1); g.fillRect(6, 12, 2, 2); g.fillRect(10, 12, 2, 2);
    }
    g.generateTexture(key, 18, 22);
    g.destroy();
    return key;
  }

  /** Applies Kīlauea's AI art scale/animation to a freshly spawned enemy
   * sprite; a no-op (default 1.5 scale, no anim) on every other world. */
  private applyKilaueaEnemyArt(body: Body, skin: IslandEnemy['skin']): number | undefined {
    const art = this.worldId === 'kilauea' ? KILAUEA_ENEMY_ART[skin] : undefined;
    if (!art) { body.setScale(1.5); return undefined; }
    body.setScale(art.scale);
    this.syncKilaueaEnemyBody(body, art.scale);
    if (!this.reducedMotion) body.play(art.anim);
    return art.scale;
  }

  /** Re-anchors an enemy's physics body to the BOTTOM of whichever walk/
   * flicker frame is currently showing — called every stepEnemies() tick.
   * Unlike the hero (see setupKilaueaHeroBody), enemies don't read their
   * own physics state to pick a texture — their anim loops on a timer
   * independent of grounded/velocity — so re-deriving this every tick has
   * no feedback-loop risk, and it IS needed: lava-crab's two frames differ
   * by 329px/57% in height, so anchoring once at spawn (to frame 1) drifts
   * the body every time the anim flips to frame 2. `body.frame` (not a
   * texture-key lookup) is always a valid Frame, even mid-animation. */
  private syncKilaueaEnemyBody(body: Body, scale: number) {
    const bodyW = KILAUEA_ENEMY_BODY_W / scale;
    const bodyH = KILAUEA_ENEMY_BODY_H / scale;
    const frame = body.frame;
    body.body.setSize(bodyW, bodyH, false);
    body.body.setOffset((frame.width - bodyW) / 2, frame.height - bodyH);
  }

  /** Sets the (invisible, physics-only) hero body's collision box ONCE,
   * anchored to the BOTTOM of its one permanent texture (k-player-idle —
   * see the kilaueaHeroVisual split in create() for why this sprite never
   * swaps textures, unlike enemies, so a one-time setup is safe here).
   * Centering the box in the whole frame (as setSize's `center` option
   * does) puts the ground-contact edge somewhere around the character's
   * waist, since this full-body crop has as much headroom above the head
   * as body below it — anchoring to the frame's bottom edge instead (where
   * the matted crop's feet sit) keeps the collision box at the character's
   * feet. Uses `this.player.frame` (always valid) rather than a texture-key
   * lookup, which can return undefined for a missing/failed asset. */
  private setupKilaueaHeroBody() {
    const bodyW = KILAUEA_HERO_BODY_W / KILAUEA_HERO_SCALE;
    const bodyH = KILAUEA_HERO_BODY_H / KILAUEA_HERO_SCALE;
    const frame = this.player.frame;
    this.player.body.setSize(bodyW, bodyH, false);
    this.player.body.setOffset((frame.width - bodyW) / 2, frame.height - bodyH);
  }

  private spawnEnemy(e: IslandEnemy) {
    const key = this.enemyTexture(e.skin);
    const body = this.physics.add.sprite(e.x, e.y, key) as Body;
    body.setDepth(4);
    const kilaueaArtScale = this.applyKilaueaEnemyArt(body, e.skin);
    body.setGravityY(GRAVITY);
    body.setCollideWorldBounds(false);
    this.enemies.add(body);
    body.body.setVelocityX(e.speed);
    this.enemyState.set(body, {
      kind: e.kind, minX: e.minX, maxX: e.maxX, speed: e.speed,
      dir: 1, nextShot: this.time.now + 2000 + Math.random() * 1500,
      landed: true, kilaueaArtScale,
    });
  }

  private spawnSkyEnemy() {
    const cfg = this.level.skySpawn;
    if (!cfg) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-120, 120), 40, this.level.worldW - 40);
    const key = this.enemyTexture(cfg.skin);
    const body = this.physics.add.sprite(x, this.player.y - 320, key) as Body;
    body.setDepth(4);
    const kilaueaArtScale = this.applyKilaueaEnemyArt(body, cfg.skin);
    body.setGravityY(GRAVITY);
    this.enemies.add(body);
    this.enemyState.set(body, {
      kind: 'sky', minX: x - cfg.patrolRange / 2, maxX: x + cfg.patrolRange / 2,
      speed: cfg.speed, dir: 1, nextShot: 0, landed: false, kilaueaArtScale,
    });
  }

  private onEnemyLand(e: Body) {
    const st = this.enemyState.get(e);
    const cfg = this.level.skySpawn;
    if (st && st.kind === 'sky' && !st.landed && cfg) {
      st.landed = true;
      st.minX = Math.max(20, e.x - cfg.patrolRange / 2);
      st.maxX = e.x + cfg.patrolRange / 2;
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
      if (st.kilaueaArtScale !== undefined) this.syncKilaueaEnemyBody(e, st.kilaueaArtScale);
      if (st.kind === 'sky' && !st.landed) continue; // falling; physics handles it

      // Patrol within bounds.
      if (e.x <= st.minX) st.dir = 1;
      else if (e.x >= st.maxX) st.dir = -1;
      e.body.setVelocityX(st.speed * st.dir * slow);
      e.setFlipX(st.dir < 0);

      // Ranged (ember) shooting.
      if (st.kind === 'ranged' && now >= st.nextShot) {
        st.nextShot = now + (2000 + Math.random() * 1500) / Math.max(slow, 0.15);
        this.shootEmber(e);
      }
    }

    // Cull off-world enemies.
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Body;
      if (e.active && e.y > this.level.worldH + 200) { this.enemyState.delete(e); e.destroy(); }
    }
  }

  private shootEmber(e: Body) {
    const dir = this.player.x < e.x ? -1 : 1;
    const useAiArt = this.worldId === 'kilauea' && this.textures.exists('k-ember');
    const key = useAiArt ? 'k-ember' : 'island-ember';
    if (!useAiArt && !this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xff7733, 1); g.fillCircle(5, 3, 4);
      g.fillStyle(0xffcc66, 1); g.fillCircle(5, 3, 2);
      g.generateTexture(key, 10, 6);
      g.destroy();
    }
    const ember = this.physics.add.sprite(e.x, e.y - 6, key) as Body;
    ember.setDepth(4);
    if (useAiArt) ember.setScale(0.05);
    ember.body.setAllowGravity(false);
    ember.setFlipX(dir < 0);
    ember.body.setVelocityX(350 * dir);
    this.embers.add(ember);
  }

  // ── Player input / movement ───────────────────────────────────────────────
  update() {
    // Mirror alpha even when `won` — hitFlash on the finishing blow tweens
    // the invisible this.player's alpha via damage()→die(), and the early
    // return below used to also skip this, silently dropping the death
    // flash on Kīlauea (this.player itself is invisible, so only the
    // mirrored sprite ever shows it).
    if (this.kilaueaHeroVisual) this.kilaueaHeroVisual.setAlpha(this.player.alpha);
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

    // Kīlauea hero: mirror the invisible physics body's position/flip onto
    // the visible art sprite (alpha is mirrored unconditionally at the top
    // of update(), even when won), then drive the visual's animation state
    // (run cycle / jump frame / idle) — the physics body's own texture
    // never changes, so none of this can feed back into `grounded` (see
    // the kilaueaHeroVisual split in create() for why).
    if (this.worldId === 'kilauea' && this.kilaueaHeroVisual) {
      const visual = this.kilaueaHeroVisual;
      visual.setPosition(this.player.x, this.player.y);
      visual.setFlipX(this.facing < 0);
      if (!grounded) {
        visual.anims.stop();
        visual.setTexture(this.kHero('k-player-jump'));
      } else if (Math.abs(body.velocity.x) > 5) {
        if (this.reducedMotion) { visual.anims.stop(); visual.setTexture(this.kHero('k-player-run-1')); }
        else visual.play(this.kHero('k-player-run'), true);
      } else {
        visual.anims.stop();
        visual.setTexture(this.kHero('k-player-idle'));
      }
    }

    for (const l of this.kilaueaBgLayers) l.ts.tilePositionX = this.cameras.main.scrollX * l.factor;

    this.stepEnemies();

    // Sky-enemy spawner (optional).
    if (this.level.skySpawn && now >= this.nextSky) {
      this.nextSky = now + this.level.skySpawn.intervalMs;
      this.spawnSkyEnemy();
    }

    // Rising lava (optional).
    if (this.level.lava && this.lavaRect) {
      this.lavaY -= (this.level.lava.riseSpeed * this.mods.lavaMul * this.game.loop.delta) / 1000;
      this.lavaRect.y = this.lavaY + 300;
      if (this.player.y + 12 >= this.lavaY) { this.die(); return; }
    }

    // Sneaker-wave surge (optional). Grace period after each spawn so the
    // wave never hits a player who hasn't had time to react, and a per-surge
    // latch so one surge deals at most one hit (playtest: the unguarded loop
    // ground an idle player at spawn from 4 lives to 1 in ~20s).
    if (this.level.waveFlood && this.waveRect) {
      const wf = this.level.waveFlood;
      const elapsed = now - this.waveClockStart - WAVE_GRACE_MS;
      let waveY = this.level.worldH + 10; // parked
      if (elapsed >= 0) {
        const t = elapsed % wf.periodMs;
        if (t < wf.surgeMs) {
          const k = Math.sin((t / wf.surgeMs) * Math.PI); // 0→1→0
          waveY = this.level.worldH - (this.level.worldH - wf.floodY) * k;
          const surgeIndex = Math.floor(elapsed / wf.periodMs);
          if (this.player.y + 10 > waveY && surgeIndex !== this.lastSurgeHit) {
            this.lastSurgeHit = surgeIndex;
            this.damage(30);
            this.player.body.setVelocityY(-360); // shoved upward, not killed
          }
        }
      }
      this.waveRect.y = waveY + 200;
    }

    // Mongoose cameo (optional; never a hazard — steals/returns coins).
    if (this.level.mongoose && this.mongooseGfx && this.mongooseState !== 'gone') {
      const m = this.level.mongoose;
      const speed = this.mongooseState === 'fleeing' ? m.speed * 1.6 : m.speed;
      this.mongooseGfx.x += speed * this.mongooseDir * (this.game.loop.delta / 1000);
      if (this.mongooseGfx.x <= m.minX) this.mongooseDir = 1;
      else if (this.mongooseGfx.x >= m.maxX) this.mongooseDir = -1;
      this.mongooseGfx.scaleX = this.mongooseDir;
      const near = Math.abs(this.player.x - this.mongooseGfx.x) < 24 && Math.abs(this.player.y - this.mongooseGfx.y) < 30;
      if (near && this.mongooseState === 'roaming') {
        this.stolenCoins = Math.min(3, this.coins);
        this.coins -= this.stolenCoins;
        this.mongooseState = 'fleeing';
        this.mongooseDir = this.player.x < this.mongooseGfx.x ? 1 : -1;
        this.emitHud();
        EventBus.emit('sfx', { key: 'arrive' });
      } else if (near && this.mongooseState === 'fleeing') {
        this.coins += this.stolenCoins;
        this.scoreBonus += 20;
        this.mongooseState = 'gone';
        this.mongooseGfx.setVisible(false);
        coinPop(this, this.mongooseGfx.x, this.mongooseGfx.y, 0xffbb22, this.reducedMotion);
        this.emitHud();
      }
    }

    // Turtle-hatchling escort (optional; hatchlings are invulnerable friends).
    if (this.level.hatchlings) {
      const hz = this.level.hatchlings;
      if (this.escort === 'waiting' && this.near(hz.nest.x, hz.nest.y, 40)) {
        this.escort = 'following';
        for (let i = 0; i < 3; i++) {
          const t = this.add.graphics().setDepth(4);
          t.fillStyle(0x2e8b6e, 1); t.fillEllipse(0, 0, 12, 8);   // shell
          t.fillStyle(0x9adcf0, 1); t.fillCircle(7, -1, 3);        // head
          t.setPosition(hz.nest.x - 20 - i * 16, 492);
          this.levelGfx.push(t);
          this.hatchlingGfx.push(t);
        }
        EventBus.emit('sfx', { key: 'arrive' });
      }
      if (this.escort === 'following') {
        this.hatchlingGfx.forEach((t, i) => {
          const targetX = this.player.x - 26 - i * 18;
          t.x += Phaser.Math.Clamp(targetX - t.x, -80, 80) * (this.game.loop.delta / 1000) * 2.2;
          t.y = 492;
        });
        if (this.near(hz.sea.x, hz.sea.y, 50)) {
          this.escort = 'done';
          this.scoreBonus += 150;
          this.hatchlingGfx.forEach((t, i) => {
            if (this.reducedMotion) t.setVisible(false);
            else this.tweens.add({ targets: t, x: hz.sea.x + 60 + i * 20, alpha: 0, duration: 900, onComplete: () => t.setVisible(false) });
          });
          this.goldFlash();
          this.emitHud();
        }
      }
    }

    // Cull embers off-world.
    for (const obj of this.embers.getChildren()) {
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
        // 'seal' style always uses a Graphics gfx (see checkpoint creation above).
        if (this.level.checkpointStyle === 'seal') this.drawSeal(cp.gfx as Phaser.GameObjects.Graphics, 0xd8c8b8);
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
      this.won = true;
      EventBus.emit('arcade:done', { success: true, score: this.score(true) });
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
    const key = 'island-shot';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x66e0ff, 1); g.fillCircle(5, 5, 5);
      g.fillStyle(0xffffff, 1); g.fillCircle(5, 5, 2);
      g.generateTexture(key, 10, 10);
      g.destroy();
    }
    const s = this.physics.add.sprite(this.player.x + this.facing * 14, this.player.y, key) as Body;
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
    const key = 'island-shield';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(SKIN_SUIT.aegis, 1); g.fillCircle(9, 9, 9);
      g.fillStyle(0xbcd3ef, 1); g.fillCircle(9, 9, 5);
      g.generateTexture(key, 18, 18);
      g.destroy();
    }
    const shield = this.physics.add.sprite(this.player.x + this.facing * 14, this.player.y, key) as Body;
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
    if (!this.reducedMotion) this.explosion(x, y);
    this.emitHud();
    EventBus.emit('sfx', { key: 'select' });
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
    const dmg = st?.kind === 'melee' || st?.kind === 'sky' ? 30 : 20;
    this.damage(dmg);
  }

  private onEmberHit(ember: Body) {
    if (this.won || !ember.active) return;
    ember.destroy();
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
    if (this.level.lava && this.lavaRect) {
      this.lavaY = lavaRespawnReset(this.lavaY, this.respawn.y, this.level.lava.startY);
      this.lavaRect.y = this.lavaY + 300;
    }
    // Fresh wave grace each life (same spirit as the lava respawn reset).
    this.waveClockStart = this.time.now;
    this.lastSurgeHit = -1;
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
    const weaponName = this.skin === 'blaze' ? WEAPONS[w].name : 'Water Jet';
    EventBus.emit('apoc:hud', {
      hp: Math.max(0, Math.round(this.hp)), maxHp: this.maxHp,
      lives: this.lives, score: this.score(false), stars: this.stars, coins: this.coins,
      weapon: weaponName, ammo,
    });
  }
}
