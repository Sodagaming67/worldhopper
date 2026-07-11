# Reef hero art brief — prompts for the developer's AI image round

Run each prompt in your image tool of choice. Save each result at the stated
filename/size into a new folder `art-drops/reef/` at the repo root (solid-white
background is fine — see below for why), then start a session with: "wire in
the reef hero art from art-drops/reef" — background removal + cropping happens
then. Interim pixel stand-ins keep the game playable until then.

## Progress so far

- `docs/art/hero1.png` (rejected): came back photoreal stock footage, not an
  illustration.
- `docs/art/hero2.png` (**style approved**): a clean flat cel-shaded cartoon
  kid snorkeler, consistent across a 4-pose sheet. This is the target look —
  reuse it as an image/character reference if your tool supports one
  (Midjourney `--cref`, an "image prompt" slot, img2img, etc.) so every later
  generation matches it exactly.
- **Remaining problem: `hero2.png` has no transparency** — it's a flat
  `#FEFEFE`-white RGB PNG, not RGBA. Dropped straight into the game it would
  render as a white box over the reef. Most image models **cannot output true
  alpha transparency at all** — asking for "transparent background" in prompt
  text is unreliable and sometimes makes the model literally draw a grey
  checkerboard *pattern* as pixels instead of real transparency. The reliable
  fix is two steps: (1) prompt for a flat, shadow-free solid background that's
  easy to key out, (2) run background removal as a separate post-process step
  (remove.bg, `rembg`, or ask me — I can do a local white-key + edge-feather
  script on any of these images).
- Also generate each pose as its **own square image**, not one wide sheet —
  `hero2.png`'s 4 poses have uneven bounding boxes (464–479px wide, 272–359px
  tall inside equal quarters), so a uniform grid crop clips fins/hands on some
  frames. Separate square generations crop trivially.
- **Round 2 result:** `docs/art/player1-4.png`, `pearl.png`, `buoy.png`,
  `beacon.png`, `eel-1.png`, `eel-2.png`, `urchin.png` all generated. Matting
  (multi-seed flood fill + edge feather) was run on all of them:
  **pearl, buoy, beacon, eel-1, eel-2, and urchin matted cleanly** — solid
  white/near-black backgrounds, no artifacts, ready to ship. **The 4 player
  frames did not** — see "REGENERATE (round 2)" below for why and the fixed
  prompt. Only the player swim cycle needs a re-run; everything else in this
  brief is done.

## Character reference (keep identical across every image below)

"A young kid snorkeler character: tousled brown hair, round dive goggles with
a yellow rim and light blue-tinted lenses, a yellow snorkel tube over the
head, light tan skin, a flat turquoise/teal long-sleeve wetsuit with black
cuffs at the wrists and ankles, yellow swim fins with black soles."

**Shared style clause (append to every prompt):** "2D animated cartoon
illustration, flat cel-shaded vector art like a Disney/Pixar mobile game asset
— NOT a photo, NOT photorealistic, NOT 3D render, NOT stock footage. Bold
clean linework, simplified shapes, flat bright colors with soft cel shading.
Isolated character studio shot on a solid pure white background, no shadow,
no gradient, no floor, no scene elements, no props in the background — just
the character floating on flat white so it can be cleanly cut out. No text."

**If your tool supports a negative prompt**, add: "photo, photorealistic,
realistic skin texture, 3D render, CGI, stock photo, live-action, DSLR, film
grain, underwater photography, checkered background, transparent PNG pattern,
gray checkerboard, drop shadow, ground shadow."

**If a first attempt still comes back photoreal**, re-run with an explicit
anchor added to the prompt: "in the style of a Moana/Disney animated film
character" or "flat vector illustration like a mobile game icon, NOT a
photograph."

## 1. Hero diver swim cycle — REGENERATE (round 2)

`docs/art/player1-4.png` (round 1) have the right character but the wrong
background and near-identical poses. Both are fixable in the prompt:

- **Background got ignored.** The tool painted a full underwater scene —
  gradient blue water, light rays, streaks of bubbles — instead of a flat
  white studio background. Bubbles and light rays create visually separate
  "islands" against the gradient, which breaks automated background removal
  (it can only cleanly cut out background that's one connected region from
  the image edges inward). **The fix: forbid scene elements explicitly, not
  just imply "studio shot."**
- **Poses barely differed.** All 4 came back as nearly the same "gliding,
  legs together" silhouette. **The fix: describe each pose by silhouette
  shape, not just joint adjectives** — a reader should be able to tell the 4
  poses apart from silhouette alone.

Generate as FOUR SEPARATE images (not one sheet), `player-1.png` …
`player-4.png`, square canvas 512×512 each, same character scale and
centered position in every frame.

Base prompt for all 4 (only `{pose}` changes) — use the character reference
above + style clause, plus:
"[character reference] swimming underwater, side view facing right, full
body visible, centered in frame, {pose}. Background: flat solid pure white,
completely empty — NO water, NO light rays, NO sunbeams, NO bubbles, NO
gradient, NO texture, NO scene of any kind. Character is the only thing in
the image, like a die-cut sticker on white paper." + style clause.

**If your tool supports a negative prompt**, also add here: "background
scene, underwater environment, light rays, sunbeams, bubbles, water texture,
gradient background, vignette."

- `player-1.png`: "STREAMLINED GLIDE pose — body forming one straight
  diagonal line from fingertips to fin tips, legs pressed together and fully
  extended straight back, arms fully extended straight forward, narrowest
  silhouette of the 4 poses"
- `player-2.png`: "DOWN-KICK pose — both legs bent sharply at the knee and
  pulled UP toward the hips so the fins point up and forward, body bends
  into a shallow V-shape from the hips, arms still extended forward"
- `player-3.png`: "WIDE SCISSOR-KICK pose — legs fully split apart, ONE leg
  extended straight up at roughly 45°, the OTHER leg extended straight down
  at roughly 45°, widest silhouette of the 4 poses, arms extended forward"
- `player-4.png`: "UP-KICK pose — legs bent and swept DOWN and back below the
  hips (mirror image of player-2's leg position), body bends into a shallow
  upward arc, arms extended forward"

The suit color will be recolored per player skin in-game — keep it one flat
saturated hue distinct from skin/fins.

## 2. Pearl collectible — `pearl.png`, 128×128
"An illustrated glossy white pearl resting in a slightly open pastel clam
shell, gentle sparkle highlight, drawn as a 2D game icon" + style clause.

## 3. Checkpoint buoy — `buoy.png`, 128×256
"An illustrated small red-and-white striped ocean buoy floating upright with
a tiny flag, rope ring at the waterline, drawn as a 2D game asset" + style
clause.

## 4. Goal beacon — `beacon.png`, 192×192
"An illustrated glowing golden conch shell on a small rock pedestal,
radiating soft light rays, tropical treasure, drawn as a 2D game icon" +
style clause.

## 5. (Optional upgrades — current pack stand-ins already look decent)
- Moray eel, 2 frames `eel-{1,2}.png` 192×96: "an illustrated cartoon moray
  eel swimming, side view facing right, olive-green with lighter belly, mouth
  {1: closed, 2: open}, drawn as a 2D game character" + style clause.
- Sea urchin `urchin.png` 128×128: "an illustrated cartoon round black sea
  urchin with long spines, slight purple sheen, drawn as a 2D game icon" +
  style clause.
- Soft caustics tile `caustics.png` 512×512, seamless: lowest priority and the
  hardest to get from a generic image tool — it needs true soft-edged partial
  transparency (light ribbons fading to nothing), which the solid-background
  cutout workflow above can't produce well. The current pack texture already
  looks decent; skip this one unless your tool has a dedicated
  transparent/alpha-output mode.

## 6. Authentic Kahaluʻu Bay species (round 3 — optional, higher effort)

the developer shared a photo of the real interpretive sign at Kahaluʻu Bay (the actual
place this world is named for). The current ambient fish are generic Kenney
color-swaps (solid blue/green/orange/red blob shapes) — not the distinctive
silhouettes of the real species that live there. This section is a stretch
goal: real species have much more recognizable shapes than a recolor can
give, so if you want the reef to read as *this specific bay*, these need
bespoke art like the hero did. Same workflow as before: solid pure white
isolated background per prompt, style clause appended, background-removed
and matted the same way.

- `fish-triggerfish.png`, 180×160: "a Reef Triggerfish (humuhumunukunukuāpua
  ʻa, Hawaii's state fish), side view facing right, bold geometric pattern —
  blue-grey body, a black band through the eye, orange-yellow highlights near
  the tail, a small pointed snout" + style clause. The single most
  recognizable/important species for a Hawaii reef — prioritize this one if
  only doing a few.
- `fish-moorish-idol.png`, 200×200: "a Moorish Idol fish, side view facing
  right, tall disc-shaped body with bold black-white-yellow vertical bands,
  a long trailing dorsal fin filament, small pointed snout" + style clause.
- `fish-yellow-tang.png`, 160×160: "a Yellow Tang fish, side view facing
  right, solid bright yellow oval disc-shaped body, small mouth, no
  patterning" + style clause.
- `fish-raccoon-butterfly.png`, 160×160: "a Raccoon Butterflyfish, side view
  facing right, yellow-orange disc body, a bold black mask marking around
  the eye, a black band near the tail" + style clause.
- `fish-parrotfish.png`, 200×160: "a Bullethead Parrotfish, side view facing
  right, blue-green body with a distinct beak-like fused-tooth mouth,
  chunky rounded body" + style clause.
- `fish-convict-tang.png`, 160×160: "a Convict Tang, side view facing right,
  oval disc body with bold vertical black-and-white stripes, small mouth" +
  style clause.
- `urchin-wana.png`, 140×140: "a black long-spined sea urchin (waʻawaʻa),
  side view, jet black round body with many long thin needle spines radiating
  outward, a few spines tipped with a subtle purple sheen" + style clause.
  Could replace or sit alongside the current purple spiky `urchin.png`.
- `honu-turtle.png`, 2 frames `honu-{1,2}.png` 220×160: "a Hawaiian green sea
  turtle (honu), side view facing right, olive-green speckled shell, flippers
  {1: mid stroke down, 2: mid stroke up}, gentle friendly expression" + style
  clause. Matches the wildlife-respect theme already in the game (the
  existing dolphin slipstreams are friendly/never-harm) — a honu should swim
  past as a friendly ambient background animal, not a hazard.
- `coral-head-a.png`, `coral-head-b.png`, `coral-head-c.png`, ~140×140 each
  (named `-head-` to avoid colliding with the existing Kenney-pack
  `coral-a.png` placeholder): "a single branching reef coral head, {a:
  golden-yellow branches, b: soft lavender-purple branches, c: burnt-orange
  branches}, coral-polyp texture on the branch tips, no fish or other
  objects, just the one coral head" + style clause. These are foreground
  floor set-pieces (like the existing seaweed/rock scatter) — keep the base
  flat so it plants naturally on the sand.

Drop these in `art-drops/reef/` same as before; a session wires them in
alongside the existing fish/urchin/floor-scatter code paths. The honu would
need a small new "friendly ambient swimmer" code path (same shape as the
existing dolphin slipstream zones or the ambient fish loop — no collision
damage, per the game's wildlife rule).
