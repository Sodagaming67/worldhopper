# Overworld island map art brief — prompts for the AI image round

`OverworldScene` (the top-down island map — `Overworld` scene,
`scripts/gen-overworld-map.mjs` generated tileset) gets the reef/Kīlauea
treatment: bespoke AI-generated painted art. Run each prompt in your image
tool of choice, save each result at the stated filename/size into
`docs/art-drops/overworld/` at the repo root (solid-white background unless a
prompt says otherwise), then start a session with: **"wire in the overworld
art from art-drops/overworld"** — background removal + cropping + scene
wiring happens then. The map stays playable on the current procedural tiles
and Phaser-drawn structures until each piece lands; partial drops are fine,
anything missing keeps its stand-in. (Issue #24.)

**Ground truth:** this map is the festival island of *World Hopper* —
its nine landmarks (Turtleglass Lagoon, Hall of Echoes, Sunline Tram, etc.,
`src/data/locations.ts`) are whimsical, not literal Big Island place names.
"More realistic" here means the terrain itself should read like a real
volcanic Hawaiian island rather than a flat green ellipse — see
`docs/photos/map/` for the reference pulls: `big-island-2.jpg` (satellite —
twin shield-volcano domes, dry golden-brown leeward west side, deep green
windward east side, dark lava-rock coastal patches) is the terrain truth;
`big-island-1.png`, `big-island-6.webp`, `big-island-7.webp` (illustrated
tourist maps with circular badge icons, tan road lines, teal water) are the
**style** truth — that's the painted-poster-map look we want, just re-skinned
with our own fictional landmarks in place of the real place names. Keep the
festival names and lore; borrow the island's geological bones and the
illustrated-map rendering style.

## Lessons carried over from the reef/Kīlauea rounds (read before generating)

- **No transparency from the model.** Prompt for a flat solid white
  background (or light blue for anything with white in it) and we matte it
  off afterward. Never ask for "transparent background."
- **Forbid scene elements explicitly** on every die-cut sprite/set-piece
  prompt — no ground shadow, no glow halo, no background scene. The `bg-map`
  prompt is the one exception: it's opaque and fills the frame edge to edge,
  like Kīlauea's `bg-far`.
- **One image per pose/subject, not a sheet.** Grid sheets crop unevenly.
- **Character reference:** feed your tool the approved reef hero
  (`public/game/reef/player-1.png`) or Kīlauea hero
  (`docs/art-drops/kilauea/player-idle.png`) as a style/character anchor so
  the map hero token reads as the same overall cast, even though this one is
  a top-down icon rather than a side-view sprite.
- **Top-down character consistency across facing directions is the hardest
  ask in this brief** — harder than the reef/Kīlauea side-view work. Budget
  for re-rolls on §3, and see the fallback note there.

---

## 1. Painted island background — PRIORITY 1

The single biggest visual upgrade, and **opaque** — no matting, lowest-risk
AI ask, same category as Kīlauea's `bg-far`.

- `bg-map.png`, portrait, **1536×2048** (3:4 — closest common preset to the
  in-engine 640×832 map; we'll scale/crop to fit), opaque full-frame
  painting, top-down/slightly-oblique aerial view: "A painted top-down aerial
  map illustration of a small volcanic Hawaiian island, teardrop-rounded
  silhouette tapering to a point in the north, surrounded by a gradient ocean
  — bright turquoise shallows fading to deep navy blue at the frame edges.
  Two large shield-volcano domes rise near the center of the island, one
  taller and grey-purple near the summit, one broader with warm reddish-brown
  volcanic slopes. The western half of the island is dry and golden-brown
  with sparse scrubby vegetation; the eastern half is lush and deep green
  with dense forest texture. A ring of pale sand coves breaks up a darker
  jagged black lava-rock coastline in the south. Thin tan winding road lines
  connect a few small clearings. Soft rounded cloud shadows drift across the
  slopes. Flat cel-shaded painterly illustration style like a Disney/Pixar
  storybook map or a hand-painted travel poster — bold simplified terrain
  shapes, warm saturated colors, gentle painterly texture, NOT photoreal, NOT
  a literal satellite image, NO text, NO labels, NO compass rose, NO
  characters, NO buildings." (No die-cut clause — fills the frame.)

Optional companion, only if the flat single image reads too busy once
landmark art sits on top:

- `bg-map-shadow.png`, same 1536×2048 canvas, matching terrain silhouette
  from `bg-map.png` but rendered as a soft **darkened/desaturated** variant
  (a "dusk" or "underlay" pass) — generate only if you want a subtle
  depth-of-field backdrop behind foreground landmark art; skip if `bg-map`
  alone reads well.

## 2. Landmark set-pieces — PRIORITY 2

These replace the nine Phaser-`Graphics`-drawn structures in
`OverworldScene.drawIslandArt()`. Each is a die-cut painted set-piece placed
at its existing `mapPosition` from `src/data/locations.ts` — **positions and
hit-areas stay exactly where they are**, only the art changes. Style clause:
"2D painted illustration, flat cel-shaded style matching a storybook island
map, bold clean linework, soft painterly shading, isolated on a solid pure
white background, no shadow, no gradient, no floor, no scene elements around
it — just the subject, die-cut sticker on white paper, no text."

- `turtleglass-lagoon.png`, 384×256 (node at x:22,y:28 — NW coast): "a small
  glassy teal lagoon inlet seen from a 3/4 aerial angle, calm rippled water,
  a pale sand rim, one gentle sea turtle silhouette visible just under the
  surface" + style clause.
- `hall-of-echoes.png`, 384×288 (x:50,y:16 — north headland): "a small
  open-air pavilion museum with a coral-pink triangular roof and pale
  cream walls, a row of painted mural columns, seen from a 3/4 aerial
  angle" + style clause.
- `sunline-tram.png`, 384×256 (x:76,y:24 — NE): "a cheerful yellow open-air
  tram car on a short curved rail track, two round black wheels, seen from a
  3/4 aerial angle, festive bunting along the roofline" + style clause.
- `splashbridge-basin.png`, 384×288 (x:26,y:70 — SW): "a round turquoise
  splash pool crossed by a rustic wooden rope bridge with hanging plank
  slats, seen from a 3/4 aerial angle" + style clause.
- `fourfold-springs.png`, 384×288 (x:74,y:64 — SE): "four small round blue
  hot-spring pools arranged in a cluster, connected by thin trickling water
  channels, pale stone rims, seen from a 3/4 aerial angle" + style clause.
- `palmwind-paths.png`, 384×288 (x:50,y:84 — south): "winding sandy garden
  paths through clusters of colorful tropical flowers — coral, gold, and
  violet blossoms — seen from a 3/4 aerial angle" + style clause.
- `lantern-evening.png`, 384×288 (x:86,y:46 — east coast): "a small open
  wooden pavilion with a violet fabric canopy roof and three glowing amber
  paper lanterns hanging from its beams, seen from a 3/4 aerial angle" +
  style clause. (Warm glow is a painted shape here, not a runtime light —
  keep it soft and contained, not a blown-out halo, since this one keeps a
  little glow unlike the Kīlauea sprites.)
- `outer-island-expeditions.png`, 384×256 (x:12,y:50 — west coast): "a small
  wooden dock jutting into turquoise water with a single coral-red-sailed
  outrigger boat moored alongside, seen from a 3/4 aerial angle" + style
  clause.
- `beacon-courtyard.png`, 320×384 (x:50,y:52 — island center): "a short white
  lighthouse tower with red horizontal stripes and a glowing golden lamp
  room at the top, standing in a small sandy festival courtyard, seen from a
  3/4 aerial angle" + style clause. (This is the map's hub/home node — keep
  it visually the tallest and most central-feeling of the nine.)

## 3. Hero map token — PRIORITY 1

This replaces the procedurally-drawn 32×32 four-direction walk sprite
(`OverworldScene.buildPlayerTexture()`). Top-down character consistency
across four facing directions is genuinely hard for current image models —
**recommended default scope** is one static pose per direction (4 images
total), with the existing in-engine walk *animation* (leg-swing bob) either
dropped in favor of a simple squash/stretch or step-bounce tween, or kept by
generating 2 poses per direction later as a priority-3 stretch goal. Ship
with whichever directions land; missing ones keep the procedural sprite as
today.

Base character (same island-explorer-kid family as the reef/Kīlauea hero,
adapted for a top-down icon scale): "a small cartoon island-explorer kid
character token, straw sun hat with a teal band, coral-red short-sleeve
shirt, dark teal shorts, seen from directly above/top-down 3/4 angle like a
board-game piece, simplified rounded shapes readable at small size."

- `hero-token-down.png`, 128×128: "{character token}, facing toward the
  viewer (south), both arms at sides, standing" + die-cut white-background
  clause.
- `hero-token-up.png`, 128×128: "{character token}, facing away from the
  viewer (north), sun hat crown and shoulders visible, standing" + clause.
- `hero-token-left.png`, 128×128: "{character token}, facing left (west),
  side profile of the hat brim, standing" + clause.
- `hero-token-right.png`, 128×128: "{character token}, facing right (east),
  side profile of the hat brim, standing" + clause.

If results drift into looking like four different kids, re-run each with the
`down` image fed back in as an image/character reference and note in the
prompt: "same character as the reference image, only the facing direction
changes."

## 4. Path treatment — no AI asset needed

The tan winding road lines connecting landmarks (visible in
`big-island-1.png`, `big-island-6.webp`) are cheap to draw procedurally with
Phaser `Graphics` dashed-line calls, same technique already used for the surf
ring in `drawIslandArt()` — no image generation needed here. When wiring,
add a thin dashed tan line (`#c9a668`-ish, 2–3px, dash pattern) connecting
`beaconCourtyard` (the hub) to each of the other eight nodes, drawn beneath
the landmark set-pieces.

---

## Suggested run order

1. §1 `bg-map` + §3 hero-token directions — biggest visual payoff, and the
   hero anchors the character reference for everything after.
2. §2 landmark set-pieces (all nine, any order — `beacon-courtyard` first if
   you want the hub art to anchor the others' scale/style).
3. Wire §4's procedural path lines alongside the first wiring pass — no art
   drop required for that step.

Drop whatever lands in `docs/art-drops/overworld/` — partial rounds are fine
and get wired in as they arrive, exactly like the reef's and Kīlauea's
multi-round drops.

---

## Wiring addendum (2026-07-10, post-drop)

The brief above targeted `OverworldScene` per issue #24's text, but at
wire-in time that scene (and all of `src/features/map/`) turned out to be
**unrouted dead code** from the retired Island Summer Quest map — the map
players actually see is the arcade `IslandMapScreen` at `/map`. The art was
wired there instead, and the dead chain (`features/map/`,
`OverworldScene.ts`, `systems/landmarks.ts`, `gen-overworld-map.mjs`,
`overworld.tmj`) was deleted in the same PR.

How the drop was used (`public/game/overworld/`):

- `bg-map.png` — full-bleed painted island replacing the green SVG blob.
- Node set-pieces, remapped from quest landmarks to arcade worlds:
  turtleglass-lagoon → World 1 Lagoon, fourfold-springs → World 2 Slides,
  sunline-tram → World 3 Tram Dash, splashbridge-basin → World 4 Reef,
  outer-island-expeditions → World 5 Black Sands, lantern-evening →
  World 6 Dark Tube. Worlds 6.5/7 ride the painted volcanoes in the
  background itself. beacon-courtyard sits on the west coast as ambient
  festival-hub art.
- `hero-token-down/up/left/right.png` — the island hero. It idles at the
  next uncleared world ("you are here") and walks across the map to any
  node you tap, facing its travel direction, before the world opens.
- The whole map is anchored to an image-fitted stage (bg-map's 1086:1448
  aspect, letterboxed over a blurred cover pass), so node positions in
  `worlds.ts` are true percentages of the painted terrain — retuned so
  Kīlauea Ascent and Lava Flow Builder sit on the lava mountain, and the
  Reef and Black Sands hug the coast, at every viewport size.
- Unused (kept in `docs/art-drops/overworld/` only): `bg-map-shadow`,
  `hall-of-echoes`, `palmwind-paths` — spares for a future night mode or
  extra decoration.
