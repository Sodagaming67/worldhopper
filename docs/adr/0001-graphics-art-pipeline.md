# ADR 0001: Graphics upgrade — real art assets via a GameKit asset layer

- **Status:** Proposed (style choice gated on Milestone 0 proof)
- **Date:** 2026-07-08
- **Deciders:** the developer; input from Player B & Player A (fortune-land brainstorm)

## Context

Big Island Blitz renders every scene with procedural Phaser `Graphics` primitives
(`fillRect`/`fillCircle`). The only image asset in the game is `src/assets/hero.png`
(unused by Phaser scenes). Seven scenes (~4,100 lines) draw characters, terrain, and
effects as flat shapes — e.g. `kit/skins.ts` builds each hero as an 18×24 generated
texture from rectangles and circles.

Physics, level design, and "juice" (tweens, shake) are in good shape, but the game
reads as a prototype because it lacks: real sprite/tile art, frame-based animation,
layered parallax backgrounds, particles, per-world lighting/color grading, a
consistent game font, and scene transitions. That is the gap between the current
look and "a real video game."

Constraints:

- Solo/agent development; no artist. Assets must come from free packs, scripted
  generation, or AI image models (prompts run by the developer).
- The style must be judged visually before full commitment ("I need to see it to
  decide").
- Existing worlds must keep working during a gradual conversion.

## Decision

1. **Art source — hybrid:** CC0 asset packs (Kenney.nl, itch.io) as the foundation
   for tiles, characters, animation frames, and particles; bespoke Hawaiian set
   pieces (reef, lava, tiki, resort landmarks) produced by scripted pixel-PNG
   generation or AI prompts, palette-matched to the packs.
2. **Style — pixel art as the M0 *pipeline* proof; hand-painted/cartoon as the
   likely final target.** Milestone 0 uses scripted pixel-PNG art because it is
   deterministic and fully self-contained (no image-gen, no network) — its job is
   to validate the machinery (manifest → preload → sprites → animation → parallax →
   particles), not to lock the look. The reference the game is aiming for is a
   **hand-painted reef à la Disney's *Nemo's Reef*** (soft-shaded, painterly
   coral/creatures), which pixel art does **not** resemble. Because the pipeline is
   art-style-agnostic, the painted art swaps in post-gate by replacing only the
   generated PNGs + manifest — no scene code changes. **Gate:** the developer judges the M0
   pixel proof for pipeline/feel; the style decision (keep pixel vs. commission
   hand-painted/AI art) is made at that point.
3. **Style-proof screen:** World 4 reef swim (`SwimScene`) — visually rich,
   showcases bespoke Hawaiian set pieces.
4. **Architecture — asset layer behind GameKit (Approach A):**
   - An asset **manifest** module lists every texture/atlas/animation with keys.
   - `BootScene` becomes a real preloader (progress bar) loading the manifest.
   - `kit/skins.ts` grows into the single lookup point: scenes request named
     sprites/animations (`skin.sprite('turtle')`, `skin.anim('player-run')`)
     instead of drawing shapes. Persisted `SkinId`s are unchanged.
   - Scenes convert world-by-world; unconverted scenes keep procedural rendering
     as the fallback.
5. **Polish pillars** (applied per world during conversion): frame-based character
   animation; 3+ layer parallax backgrounds; particle effects (splash, sparkle,
   embers); per-world ambient tint/color grade; bitmap-font HUD; animated scene
   transitions.
6. **Rollout order:** M0 SwimScene proof (assets loaded directly in the scene —
   no kit changes yet, so a style switch throws away almost nothing) → style
   decision → GameKit asset layer + BootScene preloader (M0 assets migrate into
   it) → remaining worlds in play order, overworld map included.

## Alternatives considered

### B. Direct scene-by-scene replacement (rejected)

Each scene loads and places its own images with no shared layer. Fastest first
screenshot, but seven scenes duplicate loading/animation logic, styles drift, and
a style switch means editing every scene again.

### C. Full tilemap rebuild on Tiled (deferred, not rejected)

Adopt Phaser Tilemaps + the Tiled editor; rebuild levels as tile maps. The most
professional pipeline — and would let the kids lay out levels in Tiled — but it
migrates working level code before the art style is even validated. **Revisit for
new worlds** (e.g. the lava-tube flight course) once the art direction is proven.

### D. Better procedural (rejected)

Keep runtime-drawn graphics, add gradients/textures/shaders. No asset pipeline
needed, but the ceiling stays below "real game" and none of the polish-pillar
gaps (animation frames, real backgrounds) are addressed.

## Consequences

- **Positive:** consistent look enforced by the kit; style is swappable until M0
  approval; worlds convert incrementally with no big-bang risk; new content
  (fortune-land ideas) will be built on real art from day one.
- **Negative / accepted:** small up-front abstraction cost in GameKit; the game's
  look adapts to the chosen packs; bespoke pieces need palette discipline to avoid
  reading as mismatched; asset licensing must stay CC0/attribution-safe.
- **Follow-ups:** separate design for fortune-land content ideas (lava tube world,
  resort-layout map, legendary-item quest, end prize); possible Tiled adoption
  (Alternative C) for those new worlds.
