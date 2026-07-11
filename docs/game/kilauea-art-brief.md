# Kīlauea Ascent art brief — prompts for the volcano AI image round

World 7 (Kīlauea Ascent, `IslandPlatformerScene`, `backdrop: 'volcano'`) gets
the reef treatment: bespoke AI-generated painted art. Run each prompt in your
image tool of choice, save each result at the stated filename/size into
`docs/art-drops/kilauea/` at the repo root (solid-white background unless a
prompt says otherwise — see the reef brief for why), then start a session
with: **"wire in the Kīlauea art from art-drops/kilauea"** — background
removal + cropping + scene wiring happens then. The world stays playable on
procedural art until each piece lands; partial drops are fine, anything
missing keeps its stand-in.

**Ground truth:** this world memorializes the real Hawaiʻi Volcanoes National
Park day — see `docs/photos/volcano/`. The look to capture, from those
photos: the vast Kaluapele caldera with stair-step cliff terraces and an
orange eruption glow under a smoke plume (`volcano-eruption.jpg`,
`kilauea-eruption.jpg`); Kīlauea Iki's grey hardened lava lake below lush
green crater walls; steam vents wisping out of golden grass and ferns at
Haʻakulamanu / Sulphur Banks (`DCF5F7BC…jpeg`, `849620C6…jpeg`); hāpuʻu tree
ferns and ʻōhiʻa everywhere at the rim. **The world's four visual themes:
lava flow, lava tubes, steam vents, sulphur banks.**

## Lessons carried over from the reef round (read before generating)

- **No transparency from the model.** Prompt for a flat solid background and
  we matte it off afterward. Never ask for "transparent background" — some
  models literally paint a grey checkerboard.
- **Forbid scene elements explicitly.** "Studio shot" alone gets ignored;
  the reef round-1 player frames came back inside full underwater scenes and
  couldn't be matted. Every sprite prompt below ends with the die-cut
  clause for this reason. For this world that especially means: **NO lava
  glow, NO embers, NO smoke wisps, NO ground shadow** around characters —
  glow and smoke become baked-in halos that ruin the cutout. The game adds
  glow/particles at runtime.
- **One image per pose, square canvas** — not a sheet. Sheet quarters had
  uneven bounding boxes and grid-cropping clipped limbs.
- **Describe poses by silhouette,** not joint adjectives, or every frame
  comes back nearly identical.
- **Character/style reference:** if your tool supports an image reference
  (Midjourney `--cref`, img2img, "image prompt" slot), feed it the approved
  reef hero (`public/game/reef/player-1.png`) so the kid is the same kid,
  and reuse successful volcano results as references for later ones.
- **Seamless tiles don't work** (the reef caustics failed). Nothing below
  asks for a tileable texture; lava-surface animation stays in-engine.

## Character reference (keep identical across every hero image)

Same kid as the reef snorkeler, now dressed for the crater-rim trail:

"A young kid hiker character: tousled brown hair, light tan skin, a yellow
bandana tied around the neck, a flat teal/turquoise short-sleeve t-shirt,
dark grey hiking shorts, sturdy brown hiking boots with yellow laces, a
small yellow backpack, round friendly face."

Keep the shirt one flat saturated teal — same hue family as the reef
wetsuit so the hero reads as the same character across worlds.

**Shared style clause (append to every prompt):** "2D animated cartoon
illustration, flat cel-shaded vector art like a Disney/Pixar mobile game
asset — NOT a photo, NOT photorealistic, NOT 3D render, NOT stock footage.
Bold clean linework, simplified shapes, flat bright colors with soft cel
shading. Isolated studio shot on a solid pure white background, no shadow,
no gradient, no floor, no scene elements, no props in the background — just
the subject floating on flat white so it can be cleanly cut out. No text."

**Negative prompt (if supported):** "photo, photorealistic, realistic skin
texture, 3D render, CGI, stock photo, live-action, DSLR, film grain,
checkered background, transparent PNG pattern, gray checkerboard, drop
shadow, ground shadow, glow halo, smoke, embers, background scene, gradient
background, vignette."

**If a result comes back photoreal,** re-run with: "in the style of a
Moana/Disney animated film character, flat vector illustration like a
mobile game icon, NOT a photograph."

---

## 1. Hero run cycle — PRIORITY 1

Six SEPARATE square images, 512×512 each, same character scale and centered
position in every frame, side view facing right, full body visible.

Base prompt for all six (only `{pose}` changes): "[character reference]
hiking up a volcano trail, side view facing right, full body visible,
centered in frame, {pose}. Background: flat solid pure white, completely
empty — NO ground, NO rocks, NO lava, NO smoke, NO scene of any kind. The
character is the only thing in the image, like a die-cut sticker on white
paper." + style clause.

The four run frames must be tellable apart from silhouette alone:

- `player-run-1.png`: "CONTACT pose — front leg planted straight beneath
  the body, back leg trailing fully extended behind, arms in opposite
  swing (front arm back, back arm forward), torso upright"
- `player-run-2.png`: "PASSING pose — both legs nearly together under the
  hips, one knee lifting past the other, body at its TALLEST of the four
  frames, arms passing at the sides"
- `player-run-3.png`: "PUSH-OFF pose — back leg driving straight behind
  with toes leaving the ground, front knee raised high in front, body
  leaning forward, widest stride silhouette of the four frames"
- `player-run-4.png`: "AIRBORNE pose — BOTH feet off the ground, legs in a
  mid-air scissor, arms swinging, slight forward lean — clearly floating,
  no contact with anything"

Plus:

- `player-jump.png`: "JUMP pose — leaping upward, both knees tucked toward
  the chest, arms raised above shoulder height, compact ball-like
  silhouette"
- `player-idle.png`: "IDLE pose — standing upright facing right, weight on
  both feet, one hand shading the eyes as if scouting the summit, relaxed"

## 2. Enemies — PRIORITY 1

All side view facing right, centered, one subject per image, die-cut clause
+ style clause on every prompt. Two frames per enemy = two separate images
with matching scale/position.

- `kakamora-1.png` / `kakamora-2.png`, 256×256: "a small mischievous
  coconut-warrior creature — round coconut-shell body as its torso and
  armor, skinny arms and legs, a painted red-and-white war-paint face on
  the shell, a tiny leaf-and-twig topknot, side view facing right, walking
  {1: legs scissored wide mid-stride, arms swinging; 2: legs together
  passing under the body, knees bent}" + clauses.
- `lava-crab-1.png` / `lava-crab-2.png`, 256×256: "a cartoon lava crab —
  rounded ember-red shell with glowing orange crack patterns like cooling
  lava crust, stubby legs, two chunky claws, small friendly-menacing black
  eyes on stalks, side view facing right, {1: both claws raised high and
  open; 2: claws lowered and closed, legs mid-scuttle}" + clauses. NO glow
  halo around the crab — the cracks are painted shapes, not light.
- `fire-sprite-1.png` / `fire-sprite-2.png`, 256×256: "a small living flame
  wisp creature — teardrop-shaped body of layered flat flame shapes (deep
  red outer, orange middle, yellow core), two simple white eyes, tiny
  flame arms, {1: TALL thin flicker, body stretched upward to a sharp
  point; 2: SQUAT wide flicker, body compressed and bulging sideways,
  point bent}" + clauses. Flat painted flame shapes, not glowing light.
- `ember.png`, 128×128: "a single small molten rock pebble projectile,
  glowing orange-yellow crack lines on a dark crust, round, drawn as a 2D
  game projectile icon" + clauses.

## 3. Theme props & pickups — PRIORITY 2

- `steam-vent.png`, 256×192: "a volcanic steam vent ground fixture — a low
  mound of cracked dark lava rock with a fissure opening at the top, faint
  yellow-white sulfur crust around the crack, flat base so it sits on the
  ground, NO steam, NO smoke, NO vapor — just the rocky vent" + clauses.
  (Steam is a runtime particle effect; baked-in steam can't be matted.)
- `sulphur-rock.png`, 256×192: "a cluster of volcanic rocks crusted with
  bright yellow and pale green sulfur crystal deposits, golden dry grass
  tufts at the base, flat base, drawn as a 2D game set piece" + clauses —
  straight from the Haʻakulamanu / Sulphur Banks photos.
- `checkpoint-banner.png`, 128×256: "a checkpoint banner on a carved wooden
  pole — a triangular kapa-cloth flag with a bold red-and-white Hawaiian
  tapa geometric pattern, small lava rocks stacked at the pole's base,
  upright, drawn as a 2D game asset" + clauses.
- `beacon.png`, 192×192: "an illustrated glowing golden beacon lantern
  resting on a carved dark lava-rock pedestal, warm yellow light rays
  radiating softly, tropical treasure, drawn as a 2D game icon" + clauses.
  (Same family as the reef's conch beacon — this is the story's LAST
  beacon, make it grander: slightly taller pedestal, brighter gold.)
- `ohelo-berries.png`, 128×128: "a small cluster of bright red ʻōhelo
  berries with tiny green leaves, drawn as a 2D game collectible icon,
  glossy highlight on each berry" + clauses. (Upgrades the coin pickup —
  ʻōhelo berries are Pele's sacred berries, straight from the park signs.)
- `platform-wide.png` 512×160, `platform-mid.png` 384×160,
  `platform-small.png` 256×160: "a floating slab platform of dark grey
  pāhoehoe lava rock with ropy swirled crust texture on top and a rough
  broken underside, perfectly FLAT walkable top edge, {wide: long and low;
  mid: medium length; small: short and chunky}, drawn as a 2D platformer
  game platform" + clauses. Keep the top edge flat and horizontal — it's
  the collision surface.

## 4. Set pieces — PRIORITY 3

- `ohia-tree.png`, 384×512: "a single ʻōhiʻa lehua tree — twisting
  dark-barked trunk, small rounded grey-green leaves, several bright red
  pompom-shaped lehua blossoms, flat base, drawn as a 2D game set piece" +
  clauses.
- `hapuu-fern.png`, 320×320: "a single hāpuʻu Hawaiian tree fern — a short
  fuzzy reddish-brown trunk crowned with large arching bright green fern
  fronds, flat base, drawn as a 2D game set piece" + clauses.
- `lava-tube-mouth.png`, 512×384: "the entrance arch of a lava tube cave —
  a rough dark basalt rock archway with a pitch-black opening, a few green
  ferns growing around the rim of the arch, flat base, drawn as a 2D game
  set piece" + clauses. (Doubles later as World 6 Nāhuku's door.)
- `grass-tuft.png`, 128×96: "a small tuft of golden-tan dry volcanic
  grassland grass, a few blades, flat base, drawn as a tiny 2D game set
  piece" + clauses.

## 5. Parallax background layers — PRIORITY 1 (far layer), 2 (strips)

The far layer is **opaque** — no matting, lowest-risk AI ask, and the
single biggest visual upgrade. Generate at 16:9 (1920×1080 or your tool's
closest).

- `bg-far.png`, 1920×1080, opaque full-frame painting: "a wide painterly
  2D game background of the Kīlauea volcano caldera at dusk — huge dark
  stair-stepped cliff terraces dropping into a vast crater floor of dark
  cooled lava crust, a bright orange-red eruption glow rising from vents
  near the crater center, a towering smoke-and-steam plume lit orange from
  below, deep red-to-black dusk sky above, distant crater rim on the
  horizon. Flat cel-shaded cartoon illustration style like a
  Disney/Pixar mobile game background, bold simplified shapes, soft
  painterly color bands, NO text, NO characters, NO animals." (No die-cut
  clause here — this one fills the frame edge to edge.)
- `bg-mid.png`, 1920×1080 generated, used as a bottom strip: "a horizontal
  silhouette strip for a 2D game parallax layer: a dark crater-rim ridge
  line of layered volcanic rock terraces with a few thin white steam
  columns rising from cracks along the ridge, occupying only the BOTTOM
  HALF of the frame. Everything above the ridge line is SOLID PURE WHITE —
  no sky, no clouds, no gradient, just flat white. Flat cel-shaded cartoon
  style, muted dark red-brown rock tones." (We flood-fill the white off
  from the top edge and keep the ridge.)
- `bg-near.png`, 1920×1080 generated, used as a bottom strip: "a horizontal
  silhouette strip for a 2D game parallax layer: a near-black jagged lava
  rock ridge with clusters of green ferns and golden grass tufts along the
  top edge, occupying only the BOTTOM THIRD of the frame. Everything above
  the ridge line is SOLID PURE WHITE — no sky, no gradient, just flat
  white. Flat cel-shaded cartoon style." 

## 6. Friendly ambient wildlife — PRIORITY 3

Never hazards (wildlife-respect rule, same as the reef honu and dolphins).

- `nene-1.png` / `nene-2.png`, 220×160: "a nēnē Hawaiian goose, side view
  facing right, buff-cream cheeks and neck with fine dark diagonal neck
  furrows, black face and crown, grey-brown barred body, walking {1: one
  foot forward mid-step; 2: feet together, head dipped slightly as if
  grazing}, gentle friendly expression" + clauses.
- `koae-kea-1.png` / `koae-kea-2.png`, 256×160: "a koaʻe kea white-tailed
  tropicbird in flight, side view facing right, sleek white seabird with
  black eye stripe and black wingtip markings and two long thin white
  tail streamer feathers, {1: wings raised in a high V; 2: wings swept
  fully down}, gliding" — **background exception: solid flat LIGHT BLUE
  background, not white** (a white bird on white can't be matted), no
  other scene elements, die-cut sticker on light blue paper + style
  clause with the background wording swapped accordingly.

---

## Suggested run order

1. §5 `bg-far` + §1 hero run cycle — biggest visual payoff, and the hero
   anchors the character reference for everything after.
2. §2 enemies + §3 props/pickups.
3. §5 strips, §4 set pieces, §6 wildlife.

Drop whatever lands in `docs/art-drops/kilauea/` — partial rounds are fine
and get wired in as they arrive, exactly like the reef's three rounds.
