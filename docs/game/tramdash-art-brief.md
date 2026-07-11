# Sunline Tram Dash art brief — prompts for the golden-hour resort tram round

World 3 (Sunline Tram Dash, the golden-hour resort tram auto-runner) gets the
same treatment as the reef and Kīlauea rounds: bespoke AI-generated painted
art. Run each prompt in your image tool of choice, save each result at the
stated filename/size into `docs/art-drops/tramdash/` at the repo root, then
start a session with: **"wire in the Tram Dash art from
art-drops/tramdash"** — background removal + cropping + scene wiring happens
then. The world stays playable on procedural art until each piece lands;
partial drops are fine, anything missing keeps its stand-in.

**Scene context** (current procedural art, to be replaced by these prompts):
a golden-hour sky over a beach resort; three horizontal lanes represent tram
roof / car windows / track-side; the hero rides a small coral-red tram car
with pale cream windows; the Kakamora are Moana-style coconut warriors with a
red war-paint band, riding as boarders; obstacles are resort stop-signs and
broken-rail gaps, both track-side only; pickups are golden coins and glowing
stars; the goal is the tram's coral-red front car with a gold lamp. The hero
has a jump verb and a dash move that leaves an afterimage trail, so
`hero-ride` frames must stay readable when ghosted at 35% alpha — keep
silhouettes bold and high-contrast, avoid thin lines or fine detail that
disappears at low opacity.

## Lessons carried over from the reef and Kīlauea rounds (read before generating)

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
  asks for a tileable texture; motion stays in-engine.

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

### Matting color for this round: flat magenta, not white

Everything above is copied verbatim from the Kīlauea brief for continuity —
including its white-background style clause. **For Tram Dash, swap the
matte color to flat solid `#FF00FF` (magenta) instead of white** in every
prompt below, the same way the Kīlauea brief swapped in light blue for the
white tropicbird. Use this swapped style clause for every asset section
below (opaque backgrounds are called out separately where they apply):

**Swapped style clause:** "2D animated cartoon illustration, flat cel-shaded
vector art like a Disney/Pixar mobile game asset — NOT a photo, NOT
photorealistic, NOT 3D render, NOT stock footage. Bold clean linework,
simplified shapes, flat bright colors with soft cel shading. Isolated
studio shot on a solid flat magenta `#FF00FF` background, no shadow, no
gradient, no floor, no scene elements, no props in the background — just
the subject floating on flat magenta so it can be cleanly cut out. No
text."

**Swapped negative prompt:** "photo, photorealistic, realistic skin
texture, 3D render, CGI, stock photo, live-action, DSLR, film grain,
checkered background, transparent PNG pattern, gray checkerboard, white
background, drop shadow, ground shadow, glow halo, smoke, embers,
background scene, gradient background, vignette."

Every prompt below ends with "+ swapped style clause" (die-cut, magenta
matte) unless marked opaque.

---

## 1. Hero ride cycle — PRIORITY 1

Three SEPARATE square images, 384×384 each, same character scale and
centered position in every frame, side view facing right, full body and car
visible. These are the frames that get ghosted into a 35%-alpha afterimage
trail on dash, so keep each silhouette bold, high-contrast, and instantly
readable at low opacity — no fine linework that vanishes when faded.

Base prompt for all three (only `{pose}` changes): "[character reference]
riding a small coral-red open-air tram car with pale cream window frames,
leaning forward into the wind, side view facing right, full body and car
visible, centered in frame, {pose}. The car is the only ground/support
element — NO track, NO rails, NO resort scenery, NO background of any kind.
The character and car are the only thing in the image, like a die-cut
sticker on flat magenta paper." + swapped style clause.

The two ride frames must be tellable apart from silhouette alone (a 2-frame
bob for the car's motion):

- `hero-ride-1.png`: "BOB-UP pose — car riding level, character's torso
  leaned forward and slightly raised, both hands gripping a front rail,
  hair and bandana tails streaming back, front leg braced"
- `hero-ride-2.png`: "BOB-DOWN pose — car dipping slightly, character's
  torso compressed lower and forward, knees bent to absorb the dip, hands
  still gripping the front rail, hair and bandana tails streaming back at a
  sharper angle"

Plus:

- `hero-jump.png`: "JUMP pose — character and car both mid-hop off the
  track, knees tucked up toward the chest, car tilted slightly nose-up,
  arms out for balance, compact airborne silhouette clearly floating with
  a gap of empty space beneath the car's wheels"

## 2. Kakamora boarder — PRIORITY 1

Two SEPARATE square images, 256×256 each, side view facing right, centered,
one subject per image, die-cut clause + swapped style clause on every
prompt. Two-frame bob to match the hero's ride cadence.

- `kakamora-1.png` / `kakamora-2.png`: "a small mischievous coconut-warrior
  creature — round coconut-shell body as its torso and armor, skinny arms
  and legs, a painted red-and-white war-paint band across the eyes on the
  shell, a tiny leaf-and-twig topknot, riding a matching small tram car
  side-board, side view facing right, {1: body leaned forward and raised,
  arms braced wide on the rail, board riding level; 2: body compressed
  lower and forward, knees bent, arms braced narrow on the rail, board
  dipping}. The board is the only ground/support element — NO track, NO
  rails, NO resort scenery." + swapped style clause.

## 3. Track-side obstacles — PRIORITY 2

Single subject, centered, flat base or mount, die-cut clause + swapped
style clause on every prompt. Both obstacles live only in the track-side
lane, so keep them upright and readable against a track backdrop later.

- `sign.png`, 128×256: "a resort stop-sign obstacle on a short metal pole —
  an octagonal red-and-white 'STOP' sign like a golf-cart-path crossing
  sign, sun-bleached tropical resort styling, small sandbag base at the
  foot of the pole, upright, side view, drawn as a 2D game obstacle" +
  swapped style clause.
- `gap.png`, 384×192: "a broken section of tram rail track — two short
  intact rail segments with a gap between them, splintered wood ties at
  the break, black-and-yellow hazard stripe markings on the rail ends,
  side view from track level, drawn as a 2D game hazard obstacle, flat
  bottom edge" + swapped style clause.

## 4. Pickups — PRIORITY 2

Small, centered, single subject, die-cut clause + swapped style clause on
every prompt.

- `coin.png`, 128×128: "a golden shell-shaped coin — a stylized cowrie or
  scallop shell coin cast in bright shiny gold, subtle engraved shell
  ridges, glossy highlight, drawn as a 2D game collectible icon" + swapped
  style clause.
- `star.png`, 128×128: "a glowing five-point star pickup, warm golden-
  yellow core fading to a soft lighter-yellow rim, simple sparkle
  highlights at the points, drawn as a flat 2D game collectible icon, no
  motion blur, no lens flare" + swapped style clause.

## 5. Goal — PRIORITY 2

- `goal-car.png`, 512×384: "the tram's front car, coral-red painted body
  with pale cream window frames, a polished brass-gold headlamp mounted on
  the front, small coral-red cowcatcher grille below the lamp, side view
  facing right, flat bottom edge where it meets the track, drawn as a 2D
  game set piece / level goal, festive golden-hour highlight along the
  roofline" + swapped style clause.

## 6. Parallax background layers — PRIORITY 1 (far + mid), 2 (near)

The far layer is **opaque** — no matting, lowest-risk AI ask, and the
single biggest visual upgrade. Generate at 16:9 (1920×1080 or your tool's
closest).

- `bg-far.png`, 1920×1080, opaque full-frame painting: "a wide painterly 2D
  game background of a golden-hour Hawaiian beach resort — a warm
  sun-drenched sky in deep gold, coral-orange, and soft pink bands low near
  the horizon fading to dusky blue-purple higher up, a distant resort
  skyline of low pastel hotel buildings and swaying palm silhouettes, a
  calm gold-glinting ocean horizon beyond them. Flat cel-shaded cartoon
  illustration style like a Disney/Pixar mobile game background, bold
  simplified shapes, soft painterly color bands, NO text, NO characters, NO
  animals." (No die-cut clause here — this one fills the frame edge to
  edge.)
- `bg-mid.png`, 1920×1080 generated, used as a strip: "a horizontal
  silhouette strip for a 2D game parallax layer: a row of low pastel
  resort hotel buildings — coral, cream, and soft turquoise facades with
  striped awnings and balcony rails — interspersed with a loose cluster of
  leaning palm trees, occupying only the BOTTOM HALF of the frame.
  Everything above the roofline is SOLID FLAT MAGENTA `#FF00FF` — no sky,
  no clouds, no gradient, just flat magenta. Flat cel-shaded cartoon style,
  warm golden-hour building tones." (We matte the magenta off from the top
  edge and keep the building/palm strip.)
- `bg-near.png`, 1920×1080 generated, used as a strip: "a horizontal
  silhouette strip for a 2D game parallax layer: a row of track-side
  planters and low decorative railings — terracotta planter boxes
  overflowing with pink and orange tropical flowers, a simple painted
  white wooden rail running between posts — occupying only the BOTTOM
  THIRD of the frame. Everything above the planter/rail line is SOLID FLAT
  MAGENTA `#FF00FF` — no sky, no gradient, just flat magenta. Flat
  cel-shaded cartoon style, warm golden-hour tones."

---

## Suggested run order

1. §6 `bg-far` + §1 hero ride cycle — biggest visual payoff, and the hero
   anchors the character reference for everything after.
2. §2 Kakamora boarder + §3 obstacles + §4 pickups + §5 goal car.
3. §6 `bg-mid` and `bg-near` strips.

Drop whatever lands in `docs/art-drops/tramdash/` — partial rounds are fine
and get wired in as they arrive, exactly like the reef's and Kīlauea's
rounds.
