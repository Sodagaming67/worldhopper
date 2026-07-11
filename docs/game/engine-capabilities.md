# What the Phaser Engine Unlocks

This is the honest answer to "what did the migration buy us, and what can I add next?"

The old overworld was a single hand-drawn SVG illustration with an avatar walking on percentage coordinates. It looked great, but it was a **picture you could walk on** — it couldn't scroll, collide, animate sprites, run physics, or transition scenes. Phaser replaces that picture with a **real game world**. None of the benefits below were possible with the SVG approach; all of them are now incremental additions on top of what's built.

> Legend — rough effort: 🟢 small (hours) · 🟡 medium (a day) · 🔴 large (multi-day)

---

## 1. World & exploration

| Capability | Why it was impossible in SVG | Effort |
|---|---|---|
| **Scrolling worlds bigger than the screen** | SVG was one fixed viewbox. Phaser has a camera with `startFollow`, bounds, zoom, deadzones. | 🟢 (already wired; just enlarge the map) |
| **Tile-based maps from a visual editor (Tiled)** | Authoring is now painting in Tiled, not editing SVG paths by hand. Swap real art with zero code change. | 🟡 |
| **Per-tile collision** (walls, water, cliffs) | The avatar genuinely can't walk through things. SVG had no collision at all. | 🟢 (built) |
| **Multiple maps / interiors** with door warps | Walk into the museum → load an interior scene. Scene system makes this clean. | 🟡 |
| **Layered depth** (walk behind trees/buildings) | Y-sorted depth so the avatar passes behind tall objects. | 🟡 |
| **Animated tiles** (waves, waterfalls, flickering torches) | Tiled animated tiles render automatically. | 🟢 |
| **Camera effects** — shake, flash, fade, zoom-punch on events | One-line calls (`camera.shake()`, `camera.fade()`). | 🟢 |
| **Minimap** of a larger island | Second camera rendering the same world smaller. | 🟡 |

## 2. Characters & NPCs

| Capability | Effort |
|---|---|
| **Sprite-sheet animation** (4/8-direction walk cycles, idle, actions) — Aseprite art drops straight in | 🟢 (pipeline built; needs art) |
| **NPCs that wander, follow paths, or chase** (tween paths, simple AI, A* pathfinding) | 🟡 |
| **Talk-to-NPC dialogue triggered by proximity/interact** (reuse your existing React dialogue) | 🟢 |
| **Party members / followers** trailing the player | 🟡 |
| **Push/pull objects, pick up items** off the ground | 🟡 |

## 3. Physics & movement (Arcade physics, already enabled)

| Capability | Effort |
|---|---|
| **Real platformers** — gravity, jumping, one-way platforms, moving platforms (your Runner/Maze minigames become real) | 🟡 |
| **Projectiles & throwing** (arcs, bouncing) | 🟢 |
| **Pushable blocks, switches, pressure plates** for puzzles | 🟡 |
| **Overlap triggers** — step on a zone → fire an event (already used for landmarks) | 🟢 |
| **Knockback, dashes, momentum** | 🟢 |

## 4. Game feel & juice

| Capability | Effort |
|---|---|
| **Particle systems** — sparkles when collecting a lens, dust on landing, sand kick-up, confetti at the finale | 🟢 |
| **Tweened everything** — squash/stretch, bobbing pickups, pulsing markers, smooth UI pops | 🟢 |
| **Screen transitions** between scenes (wipe, iris, fade) | 🟢 |
| **Lighting / day-night tint** over the island | 🟡 |
| **Hit-stop, screen shake, slow-mo** on big moments | 🟢 |

## 5. Audio (Howler, already wired)

| Capability | Effort |
|---|---|
| **Spatial/positional audio** — waves louder near the lagoon | 🟡 |
| **Adaptive music** — track shifts by area or tension | 🟡 |
| **Audio sprites** — many SFX in one file, low overhead (built) | 🟢 (needs real sounds) |

## 6. Minigames (the big one for "Mario-like")

Each of your 9 minigames can become a real Phaser scene instead of a React reskin:
- **Runner / platformer** → real gravity, jumps, obstacles, scrolling 🟡
- **Catch / TapTargets** → physics-driven falling objects, particle feedback 🟢
- **Maze** → tile collision + enemies + fog-of-war 🟡
- **Wave/Flow rhythm games** → timed sprites, tween choreography 🟡

A scene is self-contained, so you build/test one at a time without touching the others.

## 7. Performance headroom

| | SVG/DOM ceiling | Phaser (WebGL) |
|---|---|---|
| Animated sprites on screen | dozens before jank (~3–5k DOM nodes total) | thousands at 60fps |
| Particles | not practical | tens of thousands |
| Tiles | each is a DOM/SVG node | GPU-batched, whole layers in few draw calls |

This matters the moment you add many NPCs, particles, or a big map — exactly the things that make a world feel alive.

---

## What it cost (so you have the full picture)

- **Bundle size**: +~360 KB gzip for Phaser. Worth code-splitting so it only loads on the game screen (a known follow-up).
- **Art dependency**: the engine is only as good as the art you feed it. The current placeholder tiles/sprites are why it looked worse than the polished SVG — the fix is real Tiled maps + Aseprite sprites (or richer drawn art), which the pipeline now accepts directly.
- **Complexity**: a real engine is more moving parts than one SVG file. Mitigated by keeping React for all HUD/menus/dialogue and Phaser only for the world.

## Suggested "add next" order for maximum visible payoff

1. **Real art** — themed landmark structures + a proper avatar (closes the visual gap immediately).
2. **Particles + tweens** — lens-collect sparkle, bobbing pins, confetti finale (cheap, huge juice).
3. **Animated water + day tint** — makes the island feel alive.
4. **One real platformer minigame** (Runner) — proves the "Mario-like" promise.
5. **Interiors / NPCs** — walk into landmarks, talk to characters.
6. **Enlarge the map / add a second island** — uses the scrolling camera you already have.
