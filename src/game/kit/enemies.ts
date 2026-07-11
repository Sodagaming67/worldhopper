import type Phaser from 'phaser';
import type { ArcadeEnemy } from '@/game/data/levels/braveSteps';
import { patrolVelocity } from './patrol';

export type EnemyMeta = { kind: ArcadeEnemy['kind']; minX: number; maxX: number; speed: number };
type Body = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
type PlayerPos = { x: number; y: number };

export function enemyTextureKey(scene: Phaser.Scene): string {
  const key = 'arcade-enemy';
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xc0392b, 1); g.fillRoundedRect(1, 4, 16, 10, 4);
  g.fillStyle(0x17323a, 1); g.fillCircle(6, 7, 1.4); g.fillCircle(12, 7, 1.4);
  g.fillStyle(0xc0392b, 1); g.fillRect(0, 2, 3, 3); g.fillRect(15, 2, 3, 3);
  g.generateTexture(key, 18, 16);
  g.destroy();
  return key;
}

/**
 * Spawn one enemy into `group`, recording patrol/fall metadata in `meta`.
 * `patrollerGravityY` lets top-down scenes (no world gravity) spawn patrollers
 * with 0 gravity so they don't sink; side-scrollers keep the default 900.
 */
export function spawnEnemy(
  scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group,
  def: ArcadeEnemy, meta: Map<Phaser.GameObjects.GameObject, EnemyMeta>,
  patrollerGravityY = 900,
): void {
  const key = enemyTextureKey(scene);
  if (def.kind === 'patroller') {
    const s = scene.physics.add.image(def.x, def.y, key) as Body;
    s.setDepth(4); s.setScale(1.5); s.setGravityY(patrollerGravityY); s.setVelocityX(def.speed); s.setBounce(0);
    group.add(s);
    meta.set(s, { kind: 'patroller', minX: def.minX, maxX: def.maxX, speed: def.speed });
  } else if (def.kind === 'faller') {
    // Faller: bobs vertically between minY/maxY, no gravity.
    const s = scene.physics.add.image(def.x, def.minY, key) as Body;
    s.setDepth(4); s.setScale(1.5); s.setGravityY(0); s.setVelocityY(def.speed);
    group.add(s);
    meta.set(s, { kind: 'faller', minX: def.minY, maxX: def.maxY, speed: def.speed });
  } else {
    // Chaser: top-down hunter, no gravity, homes in on the player each frame.
    const s = scene.physics.add.image(def.x, def.y, key) as Body;
    s.setDepth(4); s.setScale(1.5); s.setGravityY(0);
    group.add(s);
    meta.set(s, { kind: 'chaser', minX: 0, maxX: 0, speed: def.speed });
  }
}

/**
 * Per-frame movement: patrollers turn at x-bounds; fallers bounce at y-bounds;
 * chasers steer toward `player` (pass it from top-down scenes that use chasers).
 */
export function stepEnemies(
  group: Phaser.Physics.Arcade.Group, meta: Map<Phaser.GameObjects.GameObject, EnemyMeta>,
  player?: PlayerPos,
): void {
  for (const obj of group.getChildren()) {
    const s = obj as Body; const m = meta.get(obj);
    if (!m) continue;
    if (m.kind === 'patroller') {
      s.setVelocityX(patrolVelocity(s.x, s.body.velocity.x, m.minX, m.maxX, m.speed));
    } else if (m.kind === 'faller') {
      if (s.y <= m.minX) s.setVelocityY(m.speed);
      else if (s.y >= m.maxX) s.setVelocityY(-m.speed);
    } else if (player) {
      // Chaser: normalise the vector to the player and move at constant speed.
      const dx = player.x - s.x; const dy = player.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      s.setVelocity((dx / len) * m.speed, (dy / len) * m.speed);
    }
  }
}
