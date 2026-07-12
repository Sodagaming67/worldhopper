# Tram Dash Chase-Cam art brief — prompts for the pseudo-3D chase-cam round

World 3 (Sunline Tram Dash) shipped painted side-view art for issue #22. This
branch (#35, PR #36) converted the *gameplay* to a Sonic-Dash-style
behind-the-hero chase camera, but it's still running on the old side-view
textures as placeholders. This brief covers the NEW chase-angle art set. Run
each prompt in your image tool of choice, save each result at the stated
filename/size into `docs/art-drops/tramdash-chase/` at the repo root, then
start a session with: **"wire in the Tram Dash chase-cam art from
art-drops/tramdash-chase"** — background removal (matting) + manifest wiring
+ scene swap happens then. The world stays fully playable on the current
placeholder art until this lands; partial drops are fine.

**13 images total** (15 if you regenerate the two optional pickups):

| Priority | Images | Count |
|---|---|---|
| 1 | hero run ×2, hero jump, hero slide, kakamora ×2, backdrop | 7 |
| 2 | sign, overhead bar, gap, goal car, palm, pole | 6 |
| optional | coin, star (only if the existing ones don't read at the new angle) | 0–2 |

## Scene context (what's different from the old side-view brief)

The camera now sits **behind the hero**, looking down a straight track
toward a vanishing point on the horizon (see
`docs/superpowers/specs/2026-07-11-tramdash-chase-cam-design.md`). This
changes the art requirements in three ways:

1. **The hero now runs on foot, viewed from behind** — no more riding a tram
   car in view. The tram car is now the thing you're *chasing*: it appears
   small near the vanishing point and grows as the hero closes in, becoming
   the goal reveal at the end of the level.
2. **Obstacles and the Kakamora now face the camera** (they face the
   approaching player), not side-on.
3. **Everything shrinks toward the horizon and grows toward the camera** —
   the game scales every sprite in real time via perspective math, so
   generate at good resolution and let the engine handle scale. But
   legibility at *small* scale matters even more than before: a sign or
   Kakamora first appears tiny near the vanishing point. Test each obstacle
   sprite scaled down to ~25% before accepting — bold, high-contrast
   silhouettes beat fine detail every time.

## Lessons carried over from every prior round (read before generating)

- **No transparency from the model.** Prompt for a flat solid background and
  we matte it off afterward. Never ask for "transparent background" — some
  models paint a literal grey checkerboard instead.
- **Forbid scene elements explicitly.** "Studio shot" alone gets ignored by
  some models. Every sprite prompt below ends with a die-cut clause for this
  reason — no ground shadow, no background scene, no glow halo (the game
  adds glow/particles/speed-lines at runtime; baked-in glow ruins the
  cutout).
- **One image per pose, square or the stated aspect — not a sheet.** Sheet
  quarters give uneven bounding boxes and grid-cropping clips limbs.
- **Describe poses by silhouette,** not joint adjectives, or every frame
  comes back nearly identical.
- **Character/style reference:** if your tool supports an image reference
  (Midjourney `--cref`, img2img, an "image prompt" slot), feed it the
  approved `public/game/tramdash/hero-ride-1.png` (or the reef hero at
  `public/game/reef/player-1.png`) so the kid is recognizably the same
  character, just seen from a new angle.
- **Seamless tiles don't work.** Nothing below asks for a tileable texture;
  track motion (streaming ties, sweeping props) is done in-engine.

## Character reference (keep identical across every hero image)

Same hiker kid as the shipped side-view Tram Dash / Kīlauea rounds, now seen
**from behind**:

"A young kid hiker character seen FROM BEHIND: tousled brown hair, a yellow
bandana tied around the neck with its tails visible from behind, a small
yellow backpack worn on the back, a flat teal/turquoise short-sleeve
t-shirt, dark grey hiking shorts, sturdy brown hiking boots with yellow
laces, round friendly build. Full body visible from the back of the head
down to the boots — no face visible, this is a rear/back view."

**Shared style clause (append to every sprite prompt):** "2D animated
cartoon illustration, flat cel-shaded vector art like a Disney/Pixar mobile
game asset — NOT a photo, NOT photorealistic, NOT 3D render, NOT stock
footage. Bold clean linework, simplified shapes, flat bright colors with
soft cel shading. Isolated studio shot on a solid flat magenta `#FF00FF`
background, no shadow, no gradient, no floor, no scene elements, no props
in the background — just the subject floating on flat magenta so it can be
cleanly cut out. No text."

**Negative prompt (if supported):** "photo, photorealistic, realistic skin
texture, 3D render, CGI, stock photo, live-action, DSLR, film grain,
checkered background, transparent PNG pattern, gray checkerboard, white
background, drop shadow, ground shadow, glow halo, smoke, embers,
background scene, gradient background, vignette, motion blur, speed lines."

**If a result comes back photoreal,** re-run with: "in the style of a
Moana/Disney animated film character, flat vector illustration like a
mobile game icon, NOT a photograph."

Every sprite prompt below ends with "+ shared style clause" (die-cut,
magenta matte) unless marked opaque (the backdrop only).

---

## 1. Hero run cycle + jump + slide — PRIORITY 1

Four SEPARATE images, same character scale and centered position in every
frame, seen from directly behind, full body visible, running away from
camera / into the screen.

**Run cycle** (384×512 portrait each) — two frames tellable apart by
silhouette alone, for the running-in-place loop:

- `hero-run-1.png`: "[character reference], running pose seen from behind —
  LEFT-LEG-FORWARD stride: right leg extended back and up mid-stride, left
  knee driving forward and up, right arm swung forward, left arm swung
  back, torso leaned slightly forward, backpack straps visible, bandana
  tails and hair streaming back with the motion. Centered in frame, full
  body head-to-boots visible." + shared style clause.
- `hero-run-2.png`: "[character reference], running pose seen from behind —
  RIGHT-LEG-FORWARD stride: the mirror opposite of a left-leg-forward
  stride — left leg extended back and up mid-stride, right knee driving
  forward and up, left arm swung forward, right arm swung back, torso
  leaned slightly forward, backpack straps visible, bandana tails and hair
  streaming back with the motion. Centered in frame, full body head-to-
  boots visible." + shared style clause.

**Jump** (384×512 portrait):

- `hero-jump.png`: "[character reference], mid-air jump pose seen from
  behind — both knees tucked up sharply toward the chest, both arms out to
  the sides for balance, torso upright, boots visible tucked underneath,
  a clear gap of empty space beneath the boots showing the character is
  airborne. Centered in frame, full body head-to-boots visible." + shared
  style clause.

**Slide** (512×256 landscape — wide and low, this is the widest/flattest
pose in the set):

- `hero-slide.png`: "[character reference], low sliding-crouch pose seen
  from behind — body compressed down into a wide low crouch/slide stance,
  knees bent out to the sides, one arm trailing back low for balance, torso
  pitched forward and down, backpack visible on the back, a wide low
  silhouette clearly much shorter and wider than the standing run pose.
  Centered in frame, full body visible." + shared style clause.

## 2. Kakamora boarder, facing the camera — PRIORITY 1

Two SEPARATE square images, 320×384 each, facing DIRECTLY toward the
camera (not side-on like the old side-view set), centered, one subject per
image. Two-frame bob to match a running/boarding cadence.

- `kakamora-1.png`: "a small mischievous coconut-warrior creature facing
  directly toward the camera — round coconut-shell body as its torso and
  armor, skinny arms and legs, a painted red-and-white war-paint band
  across the eyes on the shell, a tiny leaf-and-twig topknot, standing on a
  small board/plank, front-facing, BOB-UP pose: body raised and upright,
  arms out wide for balance, board riding level. The board is the only
  ground/support element — NO track, NO rails, NO resort scenery." +
  shared style clause.
- `kakamora-2.png`: "the same coconut-warrior creature as before, front-
  facing toward the camera, BOB-DOWN pose: body compressed lower, knees
  bent, arms pulled in narrower for balance, board dipping slightly lower.
  The board is the only ground/support element — NO track, NO rails, NO
  resort scenery." + shared style clause.

## 3. Track obstacles, facing the camera — PRIORITY 2

Single subject, centered, facing the camera head-on (these rush toward the
player), die-cut clause + shared style clause on every prompt.

- `sign.png`, 256×384: "a resort stop-sign obstacle on a short metal pole,
  seen head-on facing the camera — an octagonal red-and-white 'STOP' sign
  like a golf-cart-path crossing sign, sun-bleached tropical resort
  styling, small sandbag base at the foot of the pole, upright, drawn as a
  2D game obstacle rushing toward the viewer." + shared style clause.
- `overhead.png`, 512×192: "a low hanging station signage bar spanning
  across a train platform lane, seen head-on facing the camera — a
  horizontal wooden or metal crossbar mounted on two short side posts just
  above head height, weathered resort-style directional signage hanging
  from the bar (faded arrows, a small destination placard), wide and flat,
  drawn as a 2D game obstacle a runner must duck under, rushing toward the
  viewer." + shared style clause.
- `gap.png`, 512×256: "a broken section of tram rail track, seen head-on
  facing the camera — two short intact rail segments with a dark gap/hole
  between them, splintered wood ties at the break, black-and-yellow hazard
  stripe markings on the rail ends, drawn as a 2D game hazard a runner must
  jump over, rushing toward the viewer, flat bottom edge." + shared style
  clause.

## 4. Pickups — OPTIONAL, only if needed

The existing `t-coin` / `t-star` textures (shipped in `public/game/tramdash/`)
are expected to read fine face-on at the new angle without regeneration —
skip this section unless visual sign-off flags them. If you do regenerate,
match the originals' style exactly:

- `coin.png`, 128×128: "a golden shell-shaped coin — a stylized cowrie or
  scallop shell coin cast in bright shiny gold, subtle engraved shell
  ridges, glossy highlight, drawn as a 2D game collectible icon" + shared
  style clause.
- `star.png`, 128×128: "a glowing five-point star pickup, warm golden-
  yellow core fading to a soft lighter-yellow rim, simple sparkle
  highlights at the points, drawn as a flat 2D game collectible icon, no
  motion blur, no lens flare" + shared style clause.

## 5. Goal — the tram car, rear view — PRIORITY 2

This is the payoff shot: small and distant near the vanishing point for
most of the level, growing large as the hero closes in at the finish.

- `goal-car.png`, 512×512: "the tram's rear car, seen from directly BEHIND
  (rear view, the back of the car facing the camera) — coral-red painted
  body with pale cream window frames, a small red tail-lamp mounted
  centered on the back panel, a festive golden-hour highlight along the
  roofline, drawn as a 2D game set piece / level goal that a runner is
  chasing from behind. NO track, NO rails, NO resort scenery — just the
  car." + shared style clause.

## 6. Backdrop + trackside props — PRIORITY 1 (backdrop), 2 (props)

The backdrop is **opaque** — no matting, lowest-risk AI ask, and the single
biggest visual upgrade for the chase-cam feel, since the whole composition
now converges toward one central point instead of scrolling sideways.

- `bg-horizon.png`, 1920×1080, opaque full-frame painting: "a wide
  painterly 2D game background for a first-person/chase-cam runner,
  composed around a CENTRAL VANISHING POINT roughly one-third down from the
  top of the frame — a warm golden-hour Hawaiian resort sky in deep gold,
  coral-orange, and soft pink bands low near the horizon fading to dusky
  blue-purple higher up, a distant resort skyline of low pastel hotel
  buildings and swaying palm silhouettes symmetrically framing the
  vanishing point, a calm gold-glinting ocean horizon beyond them. Flat
  cel-shaded cartoon illustration style like a Disney/Pixar mobile game
  background, bold simplified shapes, soft painterly color bands, the
  composition should feel like looking straight down a long path toward a
  single point on the horizon. NO text, NO characters, NO animals, NO
  foreground track (the game draws the track itself)." (No die-cut clause
  — this fills the frame edge to edge.)

Trackside props, portrait orientation, seen from the side as they sweep
past the camera:

- `palm.png`, 256×512: "a single tall coconut palm tree, seen from the
  side, front-lit in warm golden-hour light, leaning slightly, full tree
  from roots to fronds visible, drawn as a 2D game trackside prop." +
  shared style clause.
- `pole.png`, 200×512: "a resort-style lamp post, seen from the side, warm
  glowing lamp head, slim decorative metal post, full post from base to
  lamp visible, drawn as a 2D game trackside prop." + shared style clause.

---

## Suggested run order

1. §6 `bg-horizon` + §1 hero run/jump/slide — biggest visual payoff, and
   the hero anchors the character reference for everything after.
2. §2 Kakamora + §3 obstacles + §5 goal car.
3. §6 `palm` / `pole` props.
4. §4 pickups only if flagged after sign-off.

Drop whatever lands in `docs/art-drops/tramdash-chase/` — partial rounds are
fine and get wired in as they arrive, exactly like every prior world's
rounds. Once wired, the manifest keys will be `tc-*` (e.g. `tc-hero-run-1`,
`tc-kakamora-1`, `tc-overhead`, `tc-goal-car`, `tc-bg-horizon`) in a new
`tramdash-chase` asset manifest, and this replaces the placeholder
rectangles/reused old-scene textures currently in `TramDashScene.ts`. The
old side-view set stays in the repo until this new set passes visual
sign-off (see issue #35).

---

## Wiring addendum (2026-07-12, boy/girl hero variant)

Issue #2 added a boy/girl explorer picker (title screen, `settings.heroCharacter`).
The §1 hero run/jump/slide poses already shipped read as ponytail/girl-coded
rather than neutral, so they became the **girl** variant as-is (renamed, not
redrawn): `hero-run-girl-1.png`, `hero-run-girl-2.png`, `hero-jump-girl.png`,
`hero-slide-girl.png`. A matching spiky-hair **boy** set was generated at the
same poses/canvas/magenta key and matted in via `scripts/matte-art` (`--global
--group hero-run-1.png,hero-run-2.png` for the run pair, so both frames share
one crop box and don't jitter) to become the new default (unsuffixed)
`hero-run-1.png` / `hero-run-2.png` / `hero-jump.png` / `hero-slide.png`.
`TramDashScene.heroKey(base)` picks the right suffix from
`settings.heroCharacter` at `create()` and on every texture swap
(run/jump/slide). Both variants share one frame anim pair (`tc-hero-run` /
`tc-hero-run-girl`) registered in `tramdashChaseAssets.ts`. Raw drops for the
boy set live in `docs/art-drops/tramdash-chase/hero-*-boy.png`.
