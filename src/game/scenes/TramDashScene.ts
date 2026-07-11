// src/game/scenes/TramDashScene.ts
import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { useGameStore } from '@/store/gameStore';
import { TRAM_DASH_LEVEL, LANE_HOP_MS, tramLaneAt, TRAM_DRIFT_DISTANCE, WARNING_LEAD_DISTANCE, type TramDashLevel, type TramLane } from '@/game/data/levels/tramDash';
import { coinPop, hitFlash, shake, dashTrailGhost, speedLines, zoomPunch, textPop } from '@/game/kit/juice';
import { comboMultiplier, isNearMiss, NEAR_MISS_BONUS, NEAR_MISS_X } from '@/game/kit/dashScoring';
import {
  project, perspective, laneScreenX, playerPlaneY, depthFor, projectLaneFrac,
  DEPTH, DASH_DEPTH, DRAW_DISTANCE, BEHIND_MARGIN, HORIZON_FRAC, LANE_SPREAD_FRAC,
  type ChaseViewport,
} from '@/game/kit/chaseProjection';
import { loseLife } from '@/lib/gameRules';

const DASH_MS = 1400;
const DASH_BONUS = 160;
const DASH_COST = 5; // coins to fill the meter
const JUMP_MS = 460;
const SLIDE_MS = 460;
const JUMP_HEIGHT = 70; // screen px at the player plane
const RECENT_HOP_MS = 400;
const TRAIL_EVERY_MS = 60;
const TIE_SPACING = 140;  // track units between rail ties
const PROP_SPACING = 340; // track units between trackside props
const GROUND_OFF = 20;    // feet line sits this far below the nominal player plane
const TRAM_Z = 240;              // fixed track-distance the tram sits ahead of the hero
const CATCH_MS = 1000;           // duration of the finish "catch the tram" flourish
// The tram's schedule and the hero both start in lane 1 — without a brief
// grace window, every run takes one guaranteed, unavoidable hit before any
// input can possibly land (confirmed via playtest: hearts drop on a
// completely idle run within the first frame). Mirrors the existing
// post-hit rush-pattern invuln window (1100ms) in scale.
const START_INVULN_MS = 1000;
// Bumped from 3 per direct user feedback that the level felt too punishing.
const STARTING_LIVES = 5;
// Track-distance checkpoints — a "Try Again" retry resumes at the furthest
// one already reached this session instead of always restarting from x=80,
// per user feedback that repeated failed attempts had to re-clear the whole
// level every time. Placed in the quieter stretches right after the early
// obstacles and right after the boarding wave, matching this.level's layout.
const CHECKPOINTS = [1700, 3400];
// Fixed, always-behind-gameplay depth for the tram — NOT depthFor(TRAM_Z).
// The tram sits at a constant close z, but obstacles/Kakamora approach from
// much farther away; depthFor(z)-based ordering would draw the (large,
// always-visible) tram on top of anything still farther than TRAM_Z,
// hiding an oncoming same-lane Kakamora until it's already too close to
// react. Pinning the tram below the obstacle depth range (10, 18] — but
// above the track graphics (0-2) and background layers (-3) — guarantees
// every gameplay hazard stays visible in front of it, regardless of z.
const TRAM_DEPTH = 9;

/** Base display sizes at the player plane (s=1); shrink by the projected scale.
 * Aspect ratios matched to the chase-cam art (docs/art-drops/tramdash-chase).
 * Bumped ~15% across the board per user feedback that hero/obstacles/pickups
 * read too small at a glance. */
const SIZE = {
  hero: [81, 184], heroJump: [141, 150], heroSlide: [110, 90],
  sign: [53, 115], kakamora: [82, 90], gap: [138, 35], overhead: [166, 51],
  coin: [41, 41], star: [53, 48], goal: [184, 230],
} as const;

/** Trackside prop textures + their base display size (aspect-matched).
 * Bumped once already (70x137/42x146 -> 91x178/59x204) for legibility, then
 * bumped again ~10% here per the follow-up "make objects a bit bigger" ask. */
const PROP_DEFS: { key: string; w: number; h: number }[] = [
  { key: 'tc-palm', w: 100, h: 196 },
  { key: 'tc-pole', w: 65, h: 224 },
];

type TrackGfx = Phaser.GameObjects.GameObject & {
  setPosition(x: number, y: number): unknown;
  setDisplaySize(w: number, h: number): unknown;
  setVisible(v: boolean): unknown;
  setDepth(d: number): unknown;
};

type Placed = { lane: TramLane; x: number; gfx: TrackGfx; baseW: number; baseH: number; yOff: number };

export class TramDashScene extends Phaser.Scene {
  private reducedMotion = false;
  private level: TramDashLevel = TRAM_DASH_LEVEL;

  private player!: Phaser.GameObjects.Sprite;
  private bgHorizon!: Phaser.GameObjects.Image;
  private trackGfx!: Phaser.GameObjects.Graphics; // static: ground + converging rails
  private tieGfx!: Phaser.GameObjects.Graphics;   // per-frame: streaming ties
  private props: Phaser.GameObjects.Image[] = [];
  private tramGfx!: Phaser.GameObjects.Image;
  private tramWarned = new Set<number>(); // waypoint atX values already warned-for this run
  private catching = false;
  private catchStartAt = 0;
  private obstacleObjs: Array<Placed & { kind: 'sign' | 'kakamora' | 'gap' | 'overhead'; hit: boolean }> = [];
  private coinObjs: Array<Placed & { collected: boolean }> = [];
  private starObjs: Array<Placed & { collected: boolean }> = [];

  private playerDistance = 0;
  // Furthest checkpoint reached this session (world mount) — startRun()
  // resumes here on a "Try Again" retry instead of always restarting from
  // the very beginning. Resets only when the world is re-entered fresh
  // (a new scene instance), not on every retry.
  private furthestCheckpoint = 80;
  private lane: TramLane = 1;
  private laneTweening = false;
  private speed = 0;
  private lives = STARTING_LIVES;
  private coins = 0;
  private stars = 0;
  private scoreBonus = 0;
  private dashMeter = 0; // 0..1
  private dashUntil = 0;
  private invulnUntil = 0;
  private won = false;
  private jumpUntil = 0;
  private slideUntil = 0;
  private recentHopUntil = 0;
  private comboChain = 0;
  private pickupScore = 0;
  private nearMissed = new Set<number>();
  private nearMissStreak = 0;
  private speedFx?: { update: (i: number) => void; destroy: () => void };

  private readonly onDir = (p: { up: boolean; down: boolean; left: boolean; right: boolean }) => {
    if (!this.sys.isActive() || this.laneTweening || this.won || this.time.now < this.jumpUntil) return;
    // up/down kept as aliases so the pre-swipe React controls stay functional.
    if ((p.left || p.up) && this.lane > 0) this.hopLane((this.lane - 1) as TramLane);
    else if ((p.right || p.down) && this.lane < 2) this.hopLane((this.lane + 1) as TramLane);
  };
  private readonly onPower = () => { if (this.sys.isActive()) this.dash(); };
  private readonly onRestart = () => { if (this.sys.isActive()) this.startRun(); };
  private readonly onInput = (p: { jump?: boolean; slide?: boolean }) => {
    if (!this.sys.isActive()) return;
    if (p.jump) this.jump();
    else if (p.slide) this.slide();
  };

  constructor() { super('TramDash'); }

  private vp(): ChaseViewport { return { width: this.scale.width, height: this.scale.height }; }

  create() {
    this.reducedMotion = useGameStore.getState().settings.reducedMotion;

    // Backdrop: single opaque painting composed around the vanishing point.
    this.bgHorizon = this.add.image(0, 0, 'tc-bg-horizon').setOrigin(0, 0).setDepth(-3).setScrollFactor(0);
    this.trackGfx = this.add.graphics().setDepth(0).setScrollFactor(0);
    this.tieGfx = this.add.graphics().setDepth(1).setScrollFactor(0);

    // Trackside prop pool. Texture is NOT fixed per slot here — a pool slot
    // recycles to represent a new physical prop instance every PROP_SPACING
    // units traveled, so its texture must be recomputed each frame in
    // updateProps() from the same instance number driving its side (see
    // there for why) — otherwise a palm silently swaps to a lamp post at
    // the same screen position every time the slot recycles.
    this.props = Array.from({ length: 12 }, () =>
      this.add.image(0, 0, PROP_DEFS[0].key).setOrigin(0.5, 1).setVisible(false));

    this.tramGfx = this.add.image(0, 0, 'tc-goal-car').setOrigin(0.5, 1);

    this.player = this.add.sprite(0, 0, 'tc-hero-run-1');
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(18.5);
    this.player.setDisplaySize(SIZE.hero[0], SIZE.hero[1]);
    if (!this.reducedMotion) this.player.play('tc-hero-run');

    const fit = () => this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, fit, this);
    EventBus.on('arcade:dir', this.onDir);
    EventBus.on('apoc:power', this.onPower);
    EventBus.on('arcade:restart', this.onRestart);
    EventBus.on('arcade:input', this.onInput);
    const cleanup = () => {
      EventBus.off('arcade:dir', this.onDir);
      EventBus.off('apoc:power', this.onPower);
      EventBus.off('arcade:restart', this.onRestart);
      EventBus.off('arcade:input', this.onInput);
      this.scale.off(Phaser.Scale.Events.RESIZE, fit, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.speedFx = speedLines(this, 21);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.speedFx?.destroy(); this.speedFx = undefined; });
    this.time.addEvent({ delay: TRAIL_EVERY_MS, loop: true, callback: () => {
      if (!this.won && this.time.now < this.dashUntil) dashTrailGhost(this, this.player, this.reducedMotion);
    } });

    this.buildLevel();
    this.layout();
    this.startRun();
  }

  /** Static screen furniture — backdrop sizing, ground plane, converging rails. */
  private layout() {
    const { width: w, height: h } = this.vp();
    const horizonY = h * HORIZON_FRAC;
    const py = playerPlaneY(this.vp());
    this.bgHorizon.setDisplaySize(w, horizonY + 24);

    this.trackGfx.clear();
    // Ground plane below the horizon.
    this.trackGfx.fillStyle(0x11414e, 1);
    this.trackGfx.fillRect(0, horizonY, w, h - horizonY);
    // Track bed: a trapezoid narrowing to the vanishing point.
    const bedHalf = w * LANE_SPREAD_FRAC * 1.6;
    this.trackGfx.fillStyle(0x0a1a20, 0.55);
    this.trackGfx.fillPoints([
      new Phaser.Math.Vector2(w / 2 - bedHalf, py + GROUND_OFF + 6),
      new Phaser.Math.Vector2(w / 2 + bedHalf, py + GROUND_OFF + 6),
      new Phaser.Math.Vector2(w / 2, horizonY),
    ], true);
    // One rail per lane, converging on the vanishing point (gold highlight on top).
    for (const lane of [0, 1, 2] as const) {
      const x0 = laneScreenX(lane, this.vp());
      this.trackGfx.lineStyle(3, 0x17323a, 0.95);
      this.trackGfx.lineBetween(x0, py + GROUND_OFF + 4, w / 2, horizonY);
      this.trackGfx.lineStyle(1.5, 0xf6c453, 0.8);
      this.trackGfx.lineBetween(x0, py + GROUND_OFF + 2, w / 2, horizonY);
    }

    this.player.setPosition(laneScreenX(this.lane, this.vp()), py + GROUND_OFF);
  }

  private buildLevel() {
    const all = [...this.level.obstacles];
    const bw = this.level.boardingWave;
    for (let i = 0; i < bw.count; i++) {
      all.push({ lane: 1, x: bw.fromX + ((bw.toX - bw.fromX) / (bw.count - 1)) * i, kind: 'kakamora' });
    }
    this.obstacleObjs = all.map((o) => {
      if (o.kind === 'sign') {
        const img = this.add.image(0, 0, 'tc-sign').setOrigin(0.5, 1).setVisible(false);
        return { lane: o.lane, x: o.x, kind: o.kind, hit: false, gfx: img, baseW: SIZE.sign[0], baseH: SIZE.sign[1], yOff: GROUND_OFF };
      } else if (o.kind === 'kakamora') {
        const spr = this.add.sprite(0, 0, 'tc-kakamora-1').setOrigin(0.5, 1).setVisible(false);
        if (!this.reducedMotion) spr.play('tc-kakamora-bob');
        return { lane: o.lane, x: o.x, kind: o.kind, hit: false, gfx: spr, baseW: SIZE.kakamora[0], baseH: SIZE.kakamora[1], yOff: GROUND_OFF };
      } else if (o.kind === 'overhead') {
        const bar = this.add.image(0, 0, 'tc-overhead').setOrigin(0.5, 1).setVisible(false);
        // Bar sits above GROUND_OFF for a "hanging overhead" look; actual
        // pass/hit is driven by `sliding` state (see update()), not this offset.
        return { lane: o.lane, x: o.x, kind: o.kind, hit: false, gfx: bar, baseW: SIZE.overhead[0], baseH: SIZE.overhead[1], yOff: GROUND_OFF - 60 };
      }
      const img = this.add.image(0, 0, 'tc-gap').setOrigin(0.5, 0.5).setVisible(false);
      return { lane: o.lane, x: o.x, kind: o.kind, hit: false, gfx: img, baseW: SIZE.gap[0], baseH: SIZE.gap[1], yOff: GROUND_OFF + 8 };
    });

    this.coinObjs = this.level.coins.map((c) => {
      const img = this.add.image(0, 0, 'tc-coin').setVisible(false);
      return { lane: c.lane, x: c.x, collected: false, gfx: img, baseW: SIZE.coin[0], baseH: SIZE.coin[1], yOff: -30 };
    });
    this.starObjs = this.level.stars.map((s) => {
      const img = this.add.image(0, 0, 'tc-star').setVisible(false);
      return { lane: s.lane, x: s.x, collected: false, gfx: img, baseW: SIZE.star[0], baseH: SIZE.star[1], yOff: -34 };
    });
  }

  private startRun() {
    this.lives = STARTING_LIVES; this.coins = 0; this.stars = 0; this.scoreBonus = 0;
    this.speed = this.level.startSpeed; this.dashMeter = 0; this.dashUntil = 0;
    this.won = false; this.invulnUntil = this.time.now + START_INVULN_MS;
    this.playerDistance = this.furthestCheckpoint;
    // Never force-spawn into the tram's own lane — checkpoints can land
    // inside one of its settled windows (e.g. x=1700 and x=3400 both sit
    // inside a lane-1 window), and always defaulting to lane 1 would
    // reproduce the exact "health drops with nothing visibly hit" bug on
    // every retry from that checkpoint, not just the very first run.
    const tramLaneAtStart = tramLaneAt(this.level.tramSchedule, this.playerDistance).lane;
    this.lane = tramLaneAtStart === 1 ? 0 : 1;
    this.laneTweening = false;
    this.comboChain = 0; this.pickupScore = 0; this.jumpUntil = 0; this.slideUntil = 0; this.recentHopUntil = 0;
    this.catching = false; this.catchStartAt = 0;
    this.tramWarned.clear();
    this.nearMissed.clear();
    this.nearMissStreak = 0;
    for (const o of this.obstacleObjs) o.hit = false;
    for (const c of this.coinObjs) c.collected = false;
    for (const s of this.starObjs) s.collected = false;
    this.tweens.killTweensOf(this.player);
    this.player.setAlpha(1);
    this.player.setRotation(0);
    // Restore the run visual — a run can end mid-jump, leaving the jump's
    // delayedCall restore blocked by its `won` guard.
    this.player.stop();
    this.player.setTexture('tc-hero-run-1');
    this.player.setDisplaySize(SIZE.hero[0], SIZE.hero[1]);
    if (!this.reducedMotion) this.player.play('tc-hero-run');
    this.player.setPosition(laneScreenX(this.lane, this.vp()), playerPlaneY(this.vp()) + GROUND_OFF);
    this.emitHud();
  }

  private hopLane(to: TramLane) {
    this.recentHopUntil = this.time.now + RECENT_HOP_MS;
    const from = this.lane;
    this.lane = to;
    this.laneTweening = true;
    const targetX = laneScreenX(to, this.vp());
    if (this.reducedMotion) {
      this.player.x = targetX;
      this.laneTweening = false;
    } else {
      this.player.setRotation(to > from ? 0.09 : -0.09);
      this.tweens.add({
        targets: this.player, x: targetX, duration: LANE_HOP_MS,
        ease: 'Quad.easeOut',
        onComplete: () => { this.laneTweening = false; this.player.setRotation(0); },
      });
    }
    EventBus.emit('sfx', { key: 'select' });
  }

  private jump() {
    if (this.won || this.laneTweening || this.time.now < this.jumpUntil || this.time.now < this.slideUntil) return;
    this.jumpUntil = this.time.now + JUMP_MS;
    const baseY = playerPlaneY(this.vp()) + GROUND_OFF;
    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.player, y: baseY - JUMP_HEIGHT,
        duration: JUMP_MS / 2, yoyo: true, ease: 'Quad.easeOut',
      });
    }
    this.player.stop(); this.player.setTexture('tc-hero-jump'); this.player.setDisplaySize(SIZE.heroJump[0], SIZE.heroJump[1]);
    this.time.delayedCall(JUMP_MS, () => {
      if (this.won || this.time.now < this.jumpUntil) return;
      this.player.setTexture('tc-hero-run-1');
      this.player.setDisplaySize(SIZE.hero[0], SIZE.hero[1]);
      if (!this.reducedMotion) this.player.play('tc-hero-run');
    });
    EventBus.emit('sfx', { key: 'select' });
  }

  private slide() {
    const now = this.time.now;
    if (this.won || now < this.jumpUntil || now < this.slideUntil) return;
    this.slideUntil = now + SLIDE_MS;
    this.player.stop();
    this.player.setTexture('tc-hero-slide');
    this.player.setDisplaySize(SIZE.heroSlide[0], SIZE.heroSlide[1]);
    this.time.delayedCall(SLIDE_MS, () => {
      if (this.won || this.time.now < this.slideUntil) return;
      this.player.setTexture('tc-hero-run-1');
      this.player.setDisplaySize(SIZE.hero[0], SIZE.hero[1]);
      if (!this.reducedMotion) this.player.play('tc-hero-run');
    });
    EventBus.emit('sfx', { key: 'select' });
  }

  private dash() {
    if (this.won || this.dashMeter < 1) return;
    this.dashMeter = 0;
    this.dashUntil = this.time.now + DASH_MS;
    this.invulnUntil = Math.max(this.invulnUntil, this.dashUntil);
    this.player.setAlpha(0.6);
    zoomPunch(this, this.reducedMotion);
    this.time.delayedCall(DASH_MS, () => { if (this.time.now >= this.invulnUntil) this.player.setAlpha(1); });
    EventBus.emit('sfx', { key: 'arrive' });
    this.emitHud();
  }

  /** Position one object for the current frame; hides it outside the view window. */
  private place(o: Placed, depth: number) {
    const z = o.x - this.playerDistance;
    if (z < -BEHIND_MARGIN || z > DRAW_DISTANCE) { o.gfx.setVisible(false); return; }
    const p = project(o.lane, z, this.vp(), depth);
    o.gfx.setVisible(true);
    // Passed objects (z<0) hold full scale and slide down past the camera.
    const y = p.y + o.yOff * p.scale + (z < 0 ? -z * 0.9 : 0);
    o.gfx.setPosition(p.x, y);
    o.gfx.setDisplaySize(o.baseW * p.scale, o.baseH * p.scale);
    o.gfx.setDepth(depthFor(z));
  }

  /** Streaming rail ties — the main "we are moving" cue. */
  private drawTies(depth: number) {
    const { width: w, height: h } = this.vp();
    const horizonY = h * HORIZON_FRAC;
    const py = playerPlaneY(this.vp());
    const bedHalf = w * LANE_SPREAD_FRAC * 1.6;
    this.tieGfx.clear();
    this.tieGfx.fillStyle(0x0e2830, 0.7);
    const offset = this.playerDistance % TIE_SPACING;
    for (let k = 0; k < 16; k++) {
      const z = k * TIE_SPACING - offset;
      if (z < 0 || z > DRAW_DISTANCE) continue;
      const s = perspective(z, depth);
      const y = horizonY + (py + GROUND_OFF + 4 - horizonY) * s;
      this.tieGfx.fillRect(w / 2 - bedHalf * s, y, bedHalf * 2 * s, Math.max(1, 5 * s));
    }
  }

  /** Trackside palms/poles sweeping past on alternating sides. Each pool
   * slot k recycles to represent a new physical prop instance every time
   * `cycle` (= floor(playerDistance / PROP_SPACING)) advances — so both
   * which side it's on AND which texture it shows must be derived from the
   * same stable instance number `n = cycle + k`, not from the raw slot
   * index k alone. Deriving side from `n` but texture from `k` was the bug
   * that made props visibly swap (palm <-> lamp post) at a fixed screen
   * position every time a slot recycled. */
  private updateProps(depth: number) {
    const { width: w, height: h } = this.vp();
    const horizonY = h * HORIZON_FRAC;
    const py = playerPlaneY(this.vp());
    const offset = this.playerDistance % PROP_SPACING;
    const cycle = Math.floor(this.playerDistance / PROP_SPACING);
    this.props.forEach((img, k) => {
      const z = k * PROP_SPACING - offset;
      if (z < 0 || z > DRAW_DISTANCE) { img.setVisible(false); return; }
      const n = cycle + k;
      const def = PROP_DEFS[n % PROP_DEFS.length];
      const propW = def.w, propH = def.h;
      if (img.texture.key !== def.key) img.setTexture(def.key);
      const s = perspective(z, depth);
      const side = n % 2 === 0 ? -1 : 1;
      img.setVisible(true);
      img.setPosition(w / 2 + side * w * 0.47 * s, horizonY + (py + GROUND_OFF - horizonY) * s);
      img.setDisplaySize(Math.max(2, propW * s), Math.max(4, propH * s));
      img.setDepth(depthFor(z));
    });
  }

  update(_t: number, deltaMs: number) {
    if (this.won) return;
    const now = this.time.now;

    if (this.catching) {
      this.updateCatchSequence(now);
      return;
    }

    const dt = deltaMs / 1000;
    this.speed = Math.min(this.level.maxSpeed, this.speed + this.level.accel * dt);
    const dashing = now < this.dashUntil;
    const effSpeed = this.speed + (dashing ? DASH_BONUS : 0);
    const depth = dashing && !this.reducedMotion ? DASH_DEPTH : DEPTH;
    this.playerDistance += effSpeed * dt;
    for (const cp of CHECKPOINTS) {
      if (this.playerDistance >= cp && this.furthestCheckpoint < cp) this.furthestCheckpoint = cp;
    }

    this.drawTies(depth);
    this.updateProps(depth);

    const airborne = now < this.jumpUntil;
    this.updateTram(depth, airborne);

    // Collisions (z-proximity on the same lane) + near misses.
    for (let i = 0; i < this.obstacleObjs.length; i++) {
      const o = this.obstacleObjs[i];
      this.place(o, depth);
      if (o.hit) continue;
      const z = o.x - this.playerDistance;
      const dz = Math.abs(z);
      const sliding = now < this.slideUntil;
      // Kakamora now clears the same way sign/gap do (jump) instead of
      // being dodge-only — jumping onto one defeats it, Sonic Dash's
      // signature stomp, rather than just harmlessly passing over it.
      const clearedInLane = o.kind === 'overhead' ? sliding : airborne;
      if (o.lane === this.lane && !this.laneTweening) {
        const hitRadius = o.kind === 'gap' ? 26 : o.kind === 'overhead' ? 22 : 20;
        if (dz < hitRadius) {
          if (o.kind === 'kakamora' && airborne) {
            o.hit = true;
            o.gfx.setVisible(false); // defeated — disappears like a collected pickup, not a frozen hit obstacle
            this.comboChain++;
            this.pickupScore += Math.round(20 * comboMultiplier(this.comboChain));
            coinPop(this, this.player.x, this.player.y - 40, 0xff6644, this.reducedMotion);
            EventBus.emit('sfx', { key: 'select' });
            this.emitHud();
            continue;
          }
          if (!clearedInLane) { o.hit = true; this.hurt(); continue; }
        }
      }
      // Near miss: narrow escapes score once per obstacle per run, evaluated
      // only once the obstacle is behind the player.
      if (!this.nearMissed.has(i) && dz <= NEAR_MISS_X && z < 0) {
        const laneGap = Math.abs(this.lane - o.lane);
        if (isNearMiss(laneGap, dz, clearedInLane, now < this.recentHopUntil)) {
          this.nearMissed.add(i);
          this.scoreBonus += NEAR_MISS_BONUS;
          this.nearMissStreak++;
          const label = this.nearMissStreak >= 2 ? `NEAR MISS x${this.nearMissStreak} +${NEAR_MISS_BONUS}` : `NEAR MISS +${NEAR_MISS_BONUS}`;
          textPop(this, this.player.x, this.player.y - 90, label, '#ffffff', this.reducedMotion);
          EventBus.emit('sfx', { key: 'select' });
          this.emitHud();
        }
      }
    }

    // Pickups.
    for (const c of this.coinObjs) {
      this.place(c, depth);
      if (c.collected) { c.gfx.setVisible(false); continue; }
      if (c.lane === this.lane && Math.abs(c.x - this.playerDistance) < 24) {
        c.collected = true; c.gfx.setVisible(false);
        this.coins++; this.comboChain++;
        this.pickupScore += Math.round(10 * comboMultiplier(this.comboChain));
        this.dashMeter = Math.min(1, this.dashMeter + 1 / DASH_COST);
        coinPop(this, this.player.x, this.player.y - 60, 0xffbb22, this.reducedMotion);
        EventBus.emit('sfx', { key: 'select' });
        this.emitHud();
      }
    }
    for (const s of this.starObjs) {
      this.place(s, depth);
      if (s.collected) { s.gfx.setVisible(false); continue; }
      if (s.lane === this.lane && Math.abs(s.x - this.playerDistance) < 26) {
        s.collected = true; s.gfx.setVisible(false);
        this.stars++; this.comboChain++;
        this.pickupScore += Math.round(25 * comboMultiplier(this.comboChain));
        coinPop(this, this.player.x, this.player.y - 60, 0xfff066, this.reducedMotion);
        this.emitHud();
      }
    }

    this.speedFx?.update(this.reducedMotion ? 0 : effSpeed / (this.level.maxSpeed + DASH_BONUS));

    if (this.playerDistance >= this.level.goalX) this.beginCatchSequence(now);
  }

  /** Renders the tram at a fixed close z, drifting smoothly between lanes
   * per the level's tramSchedule; fires the lead-in cue once per drift and
   * registers a hit if it's stationary in the hero's lane. Jump always
   * clears it; a mid-drift tram grants the same brief immunity the hero's
   * own lane-hop tween already gets (see `!this.laneTweening` elsewhere). */
  private updateTram(depth: number, airborne: boolean) {
    const schedule = this.level.tramSchedule;
    for (const wp of schedule) {
      const warnStart = wp.atX - TRAM_DRIFT_DISTANCE - WARNING_LEAD_DISTANCE;
      if (!this.tramWarned.has(wp.atX) && this.playerDistance >= warnStart && this.playerDistance < wp.atX - TRAM_DRIFT_DISTANCE) {
        this.tramWarned.add(wp.atX);
        EventBus.emit('sfx', { key: 'select' });
        if (!this.reducedMotion) this.tweens.add({ targets: this.tramGfx, alpha: 0.4, duration: 120, yoyo: true, repeat: 2 });
      }
    }

    const info = tramLaneAt(schedule, this.playerDistance);
    // driftFrom/driftProgress are always set together by tramLaneAt — safe to assert.
    const laneFrac = info.driftProgress !== undefined
      ? info.driftFrom! + (info.lane - info.driftFrom!) * info.driftProgress
      : info.lane;
    const p = projectLaneFrac(laneFrac, TRAM_Z, this.vp(), depth);
    this.tramGfx.setPosition(p.x, p.y + (GROUND_OFF + 4) * p.scale);
    this.tramGfx.setDisplaySize(SIZE.goal[0] * p.scale, SIZE.goal[1] * p.scale);
    this.tramGfx.setDepth(TRAM_DEPTH);

    if (info.driftProgress === undefined && info.lane === this.lane && !this.laneTweening && !airborne) {
      this.hurt();
    }
  }

  private beginCatchSequence(now: number) {
    this.catching = true;
    this.catchStartAt = now;
    this.speedFx?.update(0);
    if (this.reducedMotion) this.finishWin();
  }

  private updateCatchSequence(now: number) {
    if (this.reducedMotion) return; // finishWin already fired synchronously in beginCatchSequence
    const t = Math.min(1, (now - this.catchStartAt) / CATCH_MS);
    const catchZ = TRAM_Z * (1 - t);
    const p = projectLaneFrac(this.lane, catchZ, this.vp(), DEPTH);
    this.tramGfx.setPosition(p.x, p.y + (GROUND_OFF + 4) * p.scale);
    this.tramGfx.setDisplaySize(SIZE.goal[0] * p.scale, SIZE.goal[1] * p.scale);
    if (t >= 1) this.finishWin();
  }

  private finishWin() {
    this.won = true;
    EventBus.emit('arcade:done', { success: true, score: this.score(true) });
  }

  private hurt() {
    if (this.won || this.time.now < this.invulnUntil) return;
    const { lives, gameOver } = loseLife(this.lives);
    this.lives = lives; this.comboChain = 0; this.nearMissStreak = 0; this.emitHud();
    shake(this, this.reducedMotion);
    EventBus.emit('sfx', { key: 'arrive' });
    if (gameOver) {
      this.won = true;
      this.speedFx?.update(0);
      EventBus.emit('arcade:gameover', { score: this.score(false) });
      return;
    }
    // Rush pattern: keep running, brief invuln, small speed penalty.
    this.invulnUntil = this.time.now + 1100;
    this.speed = Math.max(this.level.startSpeed, this.speed - 80);
    hitFlash(this, this.player, this.reducedMotion);
  }

  private score(withLives: boolean): number {
    return this.pickupScore + this.scoreBonus + (withLives ? this.lives * 50 : 0);
  }

  private emitHud() {
    EventBus.emit('blitz:hud', {
      lives: this.lives, maxLives: STARTING_LIVES, score: this.score(false), stars: this.stars, coins: this.coins,
      gauge: this.dashMeter, gaugeLabel: 'DASH', combo: comboMultiplier(this.comboChain),
    });
  }
}
