# World Hopper — Design Decisions Log

This is a living document. Every time a feature is added or changed, a new entry goes here **in the
same response as the code change** — before the auto-commit fires.

The goal is to capture **why** a decision was made, not just **what** was built.

---

## How to Read This

Each feature entry has four parts:

- **What was asked** — the original request, quoted where possible
- **What was built** — a plain description of the implementation
- **Why this way** — the reasoning behind the specific choices made
- **What was ruled out** — alternatives that were considered and rejected, and why

See [feature-requests.md](feature-requests.md) for a quick numbered index of every request.

---

## Session 1 — Branding and Title Screen

---

### Player-Facing Rename

**What was asked:** "Can you change the name to \" the abandoned resort \" in all caps" — clarified
that this meant the game's display title, not a level or location name, and (via a second
clarification) only the copy players actually see rather than every internal reference to
"World Hopper".

**What was built**
Changed the browser tab `<title>`, the PWA manifest `name`/`short_name` (the label shown when the
app is installed to a home screen), the README's top-level heading, and the Playwright title
assertion that checks it, from "World Hopper" to "THE ABANDONED RESORT". Left the repo/npm package
name (`worldhopper`), `vite.config.ts`'s `GAME_PATH`, and every internal doc/`CLAUDE.md` mention of
"World Hopper" untouched.

**Why this way**
- **Player-facing only, per explicit choice.** The user was asked whether to rewrite every file that
  mentions "World Hopper" or only what players see, and chose the latter — a full repo/URL rename
  wasn't requested and would break the existing GitHub Pages URL for no benefit.
- **Update the title's test alongside the title.** An assertion left pointing at the old string
  would either fail immediately or (worse) mask a future revert.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Rename everywhere (repo name, `GAME_PATH`, docs, `CLAUDE.md`) | Explicitly declined — would change the live Pages URL and rewrite unrelated internal docs |
| Leave `smoke.spec.ts`'s title assertion matching the old name | Would fail CI (or falsely pass if left too loose) against the new title |

---

### Auto-Commit Hook Path Fix

**What was asked:** "fix that setting to use for this computer" — after the previous response's
changes never got auto-committed by the Stop hook, a `git status` check showed the hook's `cd`
target was a macOS path left over from a previous machine, so it had been failing silently on every
response since the repo moved to this Windows machine.

**What was built**
Swapped the hardcoded `cd` target in `.claude/settings.json`'s `Stop` hook for this machine's actual
repo path in Git-Bash form, since the hook's `command` runs under `"shell": "bash"`.

**Why this way**
- **Git-Bash path form, not a Windows-style path.** The hook explicitly declares `"shell": "bash"`,
  and bash on this machine is Git Bash, which needs `/c/...` rather than `C:\...` or `C:/...`.
- **Fix in place rather than removing the `cd`.** Hooks aren't guaranteed to already run with the
  project directory as their working directory across every environment, so keeping an explicit
  (now-correct) `cd` is safer than assuming an implicit cwd.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Drop the `cd` entirely, rely on default cwd | Less portable if this repo ever moves again or the hook runs from a different cwd |
| Use a Windows-style path instead of Git-Bash form | The hook's shell is bash (Git Bash), which expects the `/c/...` mount form |

---

### Map Screen Title Fix

**What was asked:** "I still see the old name on the map" — after the #1 rename shipped, the live
site's `<title>` was confirmed correct via a fetch, but the in-game map screen itself still showed
an old name.

**What was built**
The earlier rename (#1) only covered the browser `<title>`, PWA manifest, README, and their test —
it never searched for hardcoded UI text inside the game itself. Grepping the codebase turned up
`IslandMapScreen.tsx`'s header `<h1>`, hardcoded to "Big Island Blitz" — a name predating even
"World Hopper", missed by the earlier rebrand pass because it never matched a "World Hopper" search.
Updated it to "THE ABANDONED RESORT" and the three Playwright specs asserting on that exact heading
text (`smoke.spec.ts` ×2, `island-map.spec.ts` ×1).

**Why this way**
- **Grep for the actual old string, not just "World Hopper".** The #1 rename's search terms didn't
  cover every prior name the game had carried; this pass grepped the literal text the user reported
  seeing, which immediately found it.
- **Update all three failing assertions together.** Same reasoning as every prior rename in this
  log: a heading and its test assertions move together, or CI breaks/masks regressions.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Assume it's a caching issue and stop at confirming the live `<title>` | The user said "inside the game itself," and a source grep confirmed a real leftover string, not a cache problem |

---

### Title Screen

**What was asked:** "Can you make a tital screen with a background of an Abandoned modern city."

**What was built**
A new `TitleScreen` component now owns the `/` route; `IslandMapScreen` is reachable only via
`/map` (still a real route, not a redirect target with extra state). The background is an inline
SVG — no external image file — built from the game's existing CSS color variables: a dusk gradient
sky (`--color-ink` → `--color-ocean-deep` → `--color-sunset-rose`), a pale moon, a row of flat
silhouette towers (one drawn as a jagged polygon instead of a rectangle to read as
storm/blast-damaged), a sparse handful of lit windows (most dark — "abandoned" — a couple using the
existing `@keyframes twinkle` from `index.css`), and a fog gradient fading up from the bottom edge.
Below it: the game title, subtitle, and a "Play ▸" button (styled with the same
`cartoon-border`/`cartoon-shadow-hover` classes as every other primary button in the game) that
navigates to `/map`. `smoke.spec.ts`'s two root-load tests now click Play before asserting on map
content, since root no longer renders the map directly.

**Why this way**
- **Inline SVG, not a commissioned image.** This session has no image-generation tool, and per
  `docs/adr/0001-graphics-art-pipeline.md` this project's real art assets come from AI prompts the
  developer runs directly or CC0 packs — not something to fabricate here. The user chose this option
  explicitly over waiting on a dropped-in file or a plain placeholder.
- **Reuse the palette and button styles verbatim.** A title screen is the very first thing a player
  sees; using `--color-ink`/`--color-sunset-rose`/etc. and the existing cartoon-button classes
  (rather than inventing new colors) keeps it from reading as a bolted-on placeholder.
- **`/map` as a real route, not a redirect.** Matches the existing router pattern exactly (`/map`
  was already a route, just aliased to root before); no new routing concepts introduced.
- **No GitHub issue filed.** `gh` isn't installed on this machine; the user chose to skip filing one
  this time rather than block the work on installing it.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Wait for the developer to drop in a real PNG/JPG | Would block the feature entirely on an out-of-session step; user chose the self-contained SVG option |
| Plain gradient/solid placeholder background | User explicitly preferred a real illustrated skyline over a bare placeholder |
| Redirect `/` → `/map` with a separate title overlay state | More moving parts than just swapping which component the existing `/` route renders |

---

### Title Screen Redesign (Reference Photo)

**What was asked:** "For the tital screen use something like this picture, and fantisize it" plus a
Bing image URL.

**What was built**
Fetched the linked photo directly (the URL resolved to a real image file, viewable via the `Read`
tool) rather than guessing from the search page — it turned out to be a single grand, domed,
column-fronted neoclassical building fully reclaimed by forest, not a city skyline at all. Re-read
literally, "abandoned modern city" would have been the wrong subject; the actual photo is a much
better match for a game literally titled "THE ABANDONED RESORT," so the background was rebuilt
around it: a dome + drum + pediment/portico silhouette (columns, faint teal-glow window slits, a
crumbled entry-steps base), flanking tree canopies overlapping the building's edges, hand-drawn vine
strokes climbing the columns, a distant treeline, and a radial "beacon" glow behind the dome —
reusing the in-universe Wayfinder Beacon concept already present in `src/data/locations.ts` rather
than an unmotivated generic glow. Screenshotting the first landscape-`viewBox` attempt (via a
temporary Playwright script driving the Vite dev server) showed `preserveAspectRatio="xMidYMax
slice"` was cropping almost the entire width away on realistic phone aspect ratios — the flanking
trees were invisible. Switched the `viewBox` from `400 300` to a portrait `300 400` and rechecked
against narrow-phone/wide-phone/desktop-shell viewports before calling it done, then ran a full
build + `vite preview` + Playwright (`smoke.spec.ts`, `island-map.spec.ts`) + `vitest` pass.

**Why this way**
- **Fetch the actual image before designing, don't design from the search-page text alone.** The
  Bing results page's filename/alt text didn't make the subject obvious; fetching the direct image
  URL and viewing it (the tool saved it locally as a byproduct) caught that the requested "modern
  city" framing didn't match the actual reference, before any wasted illustration work.
- **Tie the glow to existing lore instead of inventing new fiction.** A glowing dome needed *some*
  in-fiction reason; the game already has a "Wayfinder Beacon" concept, so reusing it costs nothing
  and reads as intentional rather than decorative.
- **Screenshot-verify at multiple real aspect ratios before shipping.** SVG `slice` cropping
  behavior is highly sensitive to viewBox-vs-viewport aspect ratio mismatch and doesn't show up by
  reading the code — only by rendering it. Catching this before pushing avoided shipping a
  background that looked fine on one screen shape and broken on the majority (phones).
- **Full local verification before pushing.** No `node_modules` were present in this environment
  from prior sessions; installed dependencies, Playwright's Chromium, built the production bundle,
  ran it under `vite preview` (matching `playwright.config.ts`'s expectations), and ran the full e2e
  + unit suite rather than shipping on code-review confidence alone.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep the original "abandoned city skyline" concept and just restyle it | Would have ignored the reference photo's actual subject, which the user explicitly asked to be inspired by |
| Ship the landscape `viewBox` since it "looked fine" in one screenshot | The first screenshot's viewport happened to hide the cropping problem; checking only one aspect ratio would have shipped a broken-looking background to most real phones |
| A generic unexplained glow effect | A glow with no in-fiction reason reads as decoration bolted on; tying it to the existing Wayfinder Beacon concept costs nothing and reads as intentional |

---

## Session 2 — Title Screen AI Art Brief

---

### Title Screen AI Art Brief (Rotunda Background)

**What was asked:** "give me an ai prompt for ther abandoned resort title page that i can generate with high fidelity"

**What was built**
Rule 5 requires weighing AI-generated art against a coded/procedural approach before doing a
visual upgrade. The existing title background (Session 1's rotunda redesign) is already a
hand-tuned inline SVG at roughly the ceiling of what flat shape primitives can convincingly sell
for a dome/portico/foliage scene at "high fidelity" — the explicit ask — so a commissioned painted
image is the right call here, not more procedural work. Wrote `docs/game/title-screen-art-brief.md`
following the same brief format as the Kīlauea/reef/overworld briefs: a single detailed prompt
describing the same composition already established in code (dome + lantern cupola + drum with
glowing window slits + columned portico + crumbled steps + flanking tree canopies + climbing vines
+ distant treeline + dusk sky + soft "Wayfinder Beacon" glow), a negative prompt, a photoreal-
recovery fallback, and concrete save instructions (`title-bg.png`, 1536×2048 portrait to match the
SVG's `300 400` viewBox aspect, opaque full-bleed, saved to `docs/art-drops/title-screen/`). Filed
GitHub issue [#3](https://github.com/Sodagaming67/worldhopper/issues/3) since this is an
enhancement, not a trivial fix — `gh` is authenticated on this machine, unlike the Session 1 #4
entry where it wasn't installed.

**Why this way**
- **One full-bleed opaque image, not sprite/parallax pieces.** The current scene has no runtime
  parallax or layered motion (just two twinkling window rects), so a single painted background is a
  straight swap-in upgrade with zero scene-code restructuring. Splitting it into parallax layers
  (like Kīlauea's `bg-far`/`bg-mid`/`bg-near`) would be a separate follow-up brief if depth motion is
  ever wanted, not something to bundle in speculatively.
- **Match the existing composition exactly, don't redesign the scene.** The rotunda's specific
  silhouette (dome, drum, portico, glow) was already chosen deliberately in Session 1 against a real
  reference photo; the prompt describes that same building rather than inventing a new one, so the
  generated art is a fidelity upgrade, not a scope change.
- **Explicit portrait aspect ratio and matte guidance.** Two failure modes seen in past briefs
  (Session 1's landscape-viewBox cropping bug, and the reef/Kīlauea briefs' matte-background
  lessons) both apply here: called out the 3:4 portrait size up front, and explicitly said *not* to
  ask for a solid-color matte since this is a full-bleed background, not a die-cut sprite.
- **No code changes yet.** The brief only produces a prompt and save instructions; wiring the actual
  generated file in is deferred to a follow-up session per the brief's own instructions, so the game
  keeps running on the current SVG in the meantime.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Further procedural SVG refinement (more shape detail, gradients, etc.) | The user explicitly asked for "high fidelity," which is the ceiling procedural flat-shape SVG can't clear; Rule 5 exists for exactly this call |
| Splitting the background into parallax layers now | No current runtime parallax exists on this screen; adding layer-split art without the corresponding scene code would be speculative scope creep |
| Redesigning the building's silhouette/composition | Session 1 already validated the rotunda look against a real reference photo; this pass upgrades fidelity, not subject matter |
| Skip filing a GitHub issue | `gh` is authenticated on this machine (unlike Session 1's #4 entry), and this is an enhancement per Rule 1, not a trivial fix |

---

## Session 3 — Boy/Girl Explorer Picker

---

### Boy/Girl Explorer Picker

**What was asked:** "i want to add a player selection with 2 selections a boy and a girl" — later clarified to belong on the title screen (not Settings), and that the selection should actually change the hero's in-game art, not just be a cosmetic toggle.

**What was built**
Added `heroCharacter: 'boy' | 'girl'` to `GameSettings` (default `'boy'`, backfilled in the store's
`migrate()` alongside the existing `difficulty` backfill). The title screen (`TitleScreen.tsx`) got
a "Choose your explorer" picker — two cards showing a live preview of each hero's map-token art,
selected state highlighted with the same gold accent used elsewhere, wired straight to
`updateSettings`. A `heroTokenAsset(hero, dir)` helper in `game/assets.ts` resolves the right file
(`overworld/hero-token-{dir}.png` for boy, `overworld/hero-token-girl-{dir}.png` for girl), and
`IslandMapScreen` now calls it instead of a hardcoded boy-only path.

Investigating scope turned up that Sunline Tram Dash (`tramdash-chase` sprite set: run/jump/slide,
the only *live* tram-dash asset set — a second `tramdash` "riding" set exists in the codebase but is
dead code, unused by the shipped world) was the other place with a single fixed hero sprite. The
*existing* shipped runner art turned out to already read as ponytail/girl-coded rather than
neutral, so it became the girl variant (renamed, not redrawn), and a new spiky-hair boy set (matching
run-1/run-2/jump/slide poses 1:1) was matted in as the new default. `TramDashScene` picks between
them at `create()` via a small `heroKey(base)` helper that reads `settings.heroCharacter` directly
from the Zustand store (same pattern already used there for `reducedMotion` — no registry/prop
threading needed).

Both the overworld girl set and the Tram Dash boy set were sourced from existing character
reference art the developer already had on hand from a prior generation round, rather than
commissioning a fresh AI art brief — the poses, palette, and outfit (straw hat/teal band for the
map token; ponytail-or-spiky-hair + teal shirt + yellow bandana + backpack for the tram runner)
were already a near-exact match to this game's established look. Backgrounds were removed and
frames cropped through the repo's existing `scripts/matte-art` pipeline (magenta-key mode for the
tram assets, matching how `tc-*` art has always been keyed; white-key for the overworld token,
matching the existing `hero-token-*` convention), then resized/verified in-browser via Playwright
screenshots on both the title screen and live gameplay (map + Tram Dash) before wiring anything in.

**Why this way**
- **Title screen, not Settings.** The user explicitly redirected here mid-brainstorm — a
  first-run "who's playing" choice reads more naturally as part of starting the game than as a
  buried settings toggle, and mirrors how the reference implementation the user pointed to actually
  surfaces it.
- **Drives real art immediately, no runtime fallback branching.** The alternative (ship the picker
  UI now, wire actual sprite-swapping later) would leave "girl" visually identical to "boy" with no
  visible payoff for picking it. Shipping literal file swaps up front avoids `if (art missing) use
  boy` fallback logic entirely — Rule 3 discourages error-handling for scenarios that can't happen,
  and once the files exist, there's no "missing" case to guard against.
- **Overworld map token + Tram Dash only, not every minigame.** Reef diving, the Kīlauea platformer,
  Black Sands, and pool slides all have their own hero art too, but nothing in this session's
  reference material covered them, and guessing at new poses for four more minigames without a
  matching reference would have meant a much larger, lower-confidence art round. Scoped to the two
  places where a solid pose/style match already existed.
- **Reuse existing reference art over a fresh AI brief.** Rule 5 asks "would AI art serve better
  than procedural" — here the real question was "generate fresh vs. reuse art that already matches
  this game's exact palette and outfit." The existing reference art was close enough (confirmed by
  side-by-side comparison before committing to it) that a new generation round would have only
  risked a worse style match for no benefit.
- **`scripts/matte-art`, not a new one-off script.** The repo already has a proven matting pipeline
  (border-flood-fill + feather + crop, with a `--global` magenta-key mode and a `--group` mode for
  keeping animation-frame pairs aligned) built and tested from the reef/Kīlauea rounds. Reused it
  as-is rather than writing new image-processing code.
- **Existing tram runner art became "girl," not "boy."** Renaming was more honest than relabeling —
  the shipped art already reads as ponytail-coded, so calling it the girl variant and adding a
  genuinely distinct boy set was more accurate than pretending the original was gender-neutral.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Settings-screen picker (matching the reference implementation exactly) | User explicitly asked for it on the title screen instead, mid-session |
| No default — force a choice before Play | Adds friction for kids for a low-stakes cosmetic choice; boy pre-selected with Play always enabled was the user's confirmed preference |
| Girl selection shows boy art until a future art-brief round lands | Rejected once real matching reference art turned out to already be on hand — no reason to ship a visual no-op when the real thing was available same-session |
| Fresh AI art brief for the overworld/tram-dash girl and boy variants | Existing reference art was already a near-exact palette/pose/outfit match; generating from scratch risked a worse match for no upside |
| Extend the picker to reef/Kīlauea/Black Sands/pool-slides heroes now | No matching reference art available for those poses this session; left out rather than guessing at new art |
| Keep the original tram runner art unlabeled as gender-neutral, add girl only | The art already reads as ponytail-coded, not neutral; leaving "boy" pointed at it would have been the less accurate labeling |

---

### Extend the Boy/Girl Picker to Kīlauea and the Reef

**What was asked:** "kilauea world shows the boy character even though i picked giorl" followed by "reef also shows boy even though i picked girl" — a direct report that the previous round's scoping (map token + Tram Dash only) left two more worlds unaffected by the picker, then confirmation that matching reference art was already available for both.

**What was built**
`IslandPlatformerScene` (Kīlauea Ascent) and `SwimScene` (Kahaluʻu Reef) both already had real
AI-generated hero art (`k-player-*` and `player-*` respectively) instead of the generic procedural
skin used elsewhere — the same pattern that made the map token and Tram Dash good candidates last
round. Added girl-variant textures for both: Kīlauea got `k-player-{idle,run-1..4,jump}-girl`
(matted from a 6-pose reference set — idle/salute, three running poses, and a jump, with the fourth
run frame reusing the same source as the first to complete a 4-frame loop, matching how the
existing boy run cycle is itself a subtle near-duplicate jiggle rather than a big stride change);
reef got a 4-frame `player-girl-1..4` swim cycle (one pose short of the boy's 5, so the animation
frameRate carries the difference rather than reusing a frame — a swim cycle reads fine at 4 vs 5
frames). `IslandPlatformerScene` picks textures via a new `kHero(key)` helper (same pattern as
`TramDashScene`'s `heroKey`); `SwimScene` picks its initial texture/anim inline. Both read
`settings.heroCharacter` directly from the Zustand store in `create()`.

A related session/editor pass was independently working on the reef wiring at the same time (the
`player-girl-*` asset keys, `SwimScene`'s texture pick, and the raw art drops in
`docs/art-drops/reef/` already existed on disk mid-session) — reconciled by keeping that version and
removing this session's redundant duplicate `player-*-girl` keys/files rather than shipping two
parallel naming schemes for the same art.

Shipping surfaced a real bug: the girl reef swim frames were matted from a taller native source
canvas (811px content height vs the boy set's 260px — same matting pipeline, just a different
source aspect ratio), and `SwimScene` applied one fixed `player.setScale(0.24)` regardless of
texture, so the girl swam roughly 3x too big on screen. Fixed by adding a `PLAYER_SCALE` constant
keyed by hero character, scaled by the ratio of cropped-frame heights so both read as the same
on-screen size despite the different source resolutions.

**Why this way**
- **`kHero`/per-scene helper, not a shared cross-scene abstraction.** `TramDashScene`,
  `IslandPlatformerScene`, and `SwimScene` each already read settings directly from the store in
  their own `create()` — matching that existing per-scene pattern kept the diff small instead of
  introducing a new shared "hero art resolver" module three call sites don't otherwise need.
- **Reuse a run frame for Kīlauea's 4th pose, use only 4 frames for reef's swim cycle.** Rather than
  force a 1:1 frame count match by inventing new poses with no reference art, each world's frame
  count follows what reference art actually existed — consistent with the rest of this session's
  "reuse existing reference art, don't fabricate poses" approach.
- **Keep the concurrently-added reef wiring, drop this session's duplicate.** Both versions used the
  identical source images (confirmed byte-for-byte equivalent via matched crop dimensions and visual
  comparison) — shipping two differently-named asset sets for the same art would only add confusion
  for zero benefit.
- **Per-character scale constant, not a shared crop/resize step.** The size mismatch came from the
  two art rounds using different source canvases, not from anything wrong with the matting itself;
  correcting the runtime scale is a one-line fix, versus re-cropping/re-exporting art that already
  looks correct in isolation.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Generate a true 5th reef pose / 4th-distinct Kīlauea run pose to match frame counts exactly | No reference art existed for the missing pose; reusing/shortening was lower-risk than fabricating a new pose from scratch |
| Ship both this session's and the concurrent session's reef asset keys side by side | Confirmed identical source art — duplicating naming schemes would only create confusion, not redundancy value |
| Re-crop/resize the girl reef art to match the boy set's native canvas exactly | The scale mismatch was a runtime rendering bug, not an art quality problem; fixing the `setScale` call is simpler and doesn't touch already-good art |

---

### Boy/Girl Picker in Settings, and Reef Sizing Fix

**What was asked:** "once we are past the title screen, there is no way to change the character
again - should we also add this character switch in the Settings?" (confirmed), plus iterative
visual feedback on the reef girl sprite's size: "a tad bit bigger still - same size as the boy",
then "too big now - lets revert this or find an inbteween size".

**What was built**
Added an "Explorer" section to `SettingsScreen.tsx`, directly above the existing toggle switches —
the same two-card boy/girl picker as the title screen (live `heroTokenAsset(hero, 'down')` preview,
gold highlight on the selected card), wired to the same `updateSettings({ heroCharacter })` call. No
new store logic needed since `heroCharacter` already lived in `GameSettings`.

Separately, tuned `SwimScene`'s `PLAYER_SCALE.girl` constant across three rounds of direct visual
feedback: the crop-ratio-derived value from the prior round's bugfix (0.24 × 260/811 ≈ 0.077) read
as too small once actually compared against the boy sprite in gameplay, a mid-range guess (0.14)
looked right in a side-by-side screenshot, a further bump to 0.155 (chasing "same size as the boy"
literally) turned out too big, and the value was reverted to the already-verified 0.14. The constant's
comment now says outright that it's hand-tuned against the boy's on-screen size, not a formula, so a
future reader doesn't try to re-derive it from crop dimensions and reintroduce the same mismatch.

**Why this way**
- **Settings, not a separate "change character" flow.** The picker already exists and works well on
  the title screen; Settings already hosts every other adjustable preference (sound, motion, font,
  difficulty), so duplicating the exact same component there is the smallest, most consistent way to
  make the choice revisitable.
- **Hand-tuned scale constant over a recomputed formula.** The crop-dimension ratio approach seemed
  principled but didn't track perceived character size (pose-dependent limb extension skews a pure
  bounding-box comparison) — two rounds of formula-based attempts both missed in different
  directions, so the working number came from direct visual comparison instead, and the code now
  says so.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Keep re-deriving the reef girl scale from crop pixel dimensions | Already tried twice (height-ratio undershot, "same size" overshot back the other way); a directly-verified constant is simpler and more honest about being tuned by eye |
| A dedicated "change your explorer" screen/flow separate from Settings | Settings already is that screen for every other preference; a second entry point would be redundant |

---

## Technology Stack

| Layer | Technology | Why chosen |
|-------|-----------|-----------|
| Game engine | Phaser 4 + React 19 | Canvas-based game engine paired with React for UI/menus and routing |
| Hosting | GitHub Pages (`actions/deploy-pages`) | Free for public repos; no server infra needed |
| Persistence | localStorage (save data) | No server in this repo |
| Version control | Git + auto-commit Stop hook | Keeps docs and commits in sync automatically |
