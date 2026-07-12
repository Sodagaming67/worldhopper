# World Hopper — Feature Requests Log

Every feature ask is recorded here in the order it was made, across all sessions.
Each entry links to [design-decisions.md](design-decisions.md) for the full reasoning behind the implementation.

---

## How to Read This

- Entries are numbered in the order they were asked — never renumbered
- "Session" labels mark which conversation the request came from
- "Files changed" is a quick pointer for finding the relevant code
- When a request is later revised, a follow-up entry is added (not the original edited)

---

## Session 1 — Branding and Title Screen

---

### #1 — Rename Player-Facing Title to "THE ABANDONED RESORT"

**Asked:** "Can you change the name to \" the abandoned resort \" in all caps" (clarified: player-facing display name only, not every internal/doc reference to "World Hopper")
**Status:** ✓ Done
**What was built:** Changed the display name shown to players from "World Hopper" to "THE ABANDONED RESORT" — the browser tab `<title>`, the PWA manifest `name`/`short_name` (installed-app label), the README title, and the matching Playwright title assertion. Left the repo/package name (`worldhopper`), `vite.config.ts`'s `GAME_PATH`, and internal docs/CLAUDE.md references to "World Hopper" unchanged since those aren't player-visible.
**Files changed:** `index.html`, `vite.config.ts`, `README.md`, `src/tests/e2e/smoke.spec.ts`
**Design note:** → [Session 1 — Player-Facing Rename](design-decisions.md)

---

### #2 — Fix Auto-Commit Hook's Hardcoded macOS Path

**Asked:** "fix that setting to use for this computer" — after noticing the Stop hook in `.claude/settings.json` was `cd`-ing into a macOS path left over from a previous machine that doesn't exist on this Windows machine, so it had been silently failing (no auto-commits landed after the #1 rename).
**Status:** ✓ Done
**What was built:** Replaced the hardcoded macOS path with this machine's actual Git-Bash-form path, matching where the repo actually lives now.
**Files changed:** `.claude/settings.json`
**Design note:** → [Session 1 — Auto-Commit Hook Path Fix](design-decisions.md)

---

### #3 — Fix Leftover "Big Island Blitz" Title on the Map Screen

**Asked:** "I still see the old name on the map" — the #1 rename only touched the browser tab title, PWA manifest, README, and their test, but the actual in-game map screen header was a separate hardcoded string that had never been updated to "World Hopper" in the first place, let alone "THE ABANDONED RESORT".
**Status:** ✓ Done
**What was built:** Found the `<h1>` in `IslandMapScreen.tsx` still read "Big Island Blitz" (a name from before even the "World Hopper" branding). Changed it to "THE ABANDONED RESORT" and updated the three Playwright assertions asserting on that exact heading text.
**Files changed:** `src/features/arcade/IslandMapScreen.tsx`, `src/tests/e2e/smoke.spec.ts`, `src/tests/e2e/island-map.spec.ts`
**Design note:** → [Session 1 — Map Screen Title Fix](design-decisions.md)

---

### #4 — Add a Title Screen with an Abandoned-City Background

**Asked:** "Can you make a tital screen with a background of an Abandoned modern city"
**Status:** ✓ Done (no GitHub issue — `gh` CLI isn't installed on this machine; user chose to skip filing one rather than block on it)
**What was built:** New `TitleScreen` at the `/` route (map moved to being reached only via its own `/map` route, no longer also the root). Background is a self-contained inline SVG skyline — gradient dusk sky, a moon, flat silhouette towers (one with a crumbled/jagged top), a handful of sparse windows (a couple flickering via the existing `twinkle` keyframe), and a fog gradient near the base — since no image-generation tool is available in this session and the project's real art assets come from AI prompts run by the developer directly (`docs/adr/0001-graphics-art-pipeline.md`). Shows the game title and a "Play ▸" button that navigates to `/map`. Updated `smoke.spec.ts`'s root-load tests to go through the title screen's Play button before asserting on map content.
**Files changed:** `src/features/title/TitleScreen.tsx` (new), `src/app/router.tsx`, `src/tests/e2e/smoke.spec.ts`
**Design note:** → [Session 1 — Title Screen](design-decisions.md)

---

### #5 — Redesign Title Background as an Overgrown Rotunda, Reference Photo

**Asked:** "For the tital screen use something like this picture, and fantisize it" + a Bing image URL (a photo of a real overgrown, domed neoclassical rotunda reclaimed by forest — not a modern city skyline).
**Status:** ✓ Done
**What was built:** Fetched the reference photo, confirmed it was a single grand domed/columned building overgrown with trees (not a city), and redrew the title background around that instead: a stylized dome + drum + portico-with-columns silhouette, flanking tree canopies, climbing vine strokes, crumbled entry steps, a distant treeline, and a soft golden glow behind the dome (framed as the game's own "Wayfinder Beacon" lore rather than a generic glow). Also switched the SVG's `viewBox` from a landscape 400×300 to a portrait 300×400 — the landscape version, under `preserveAspectRatio="xMidYMax slice"`, cropped almost all side content out on real phone aspect ratios (confirmed via a Playwright screenshot before fixing). Verified the final result across narrow-phone, wide-phone, and desktop-shell viewport screenshots, then ran the full e2e + unit suite (build, preview server, `smoke.spec.ts`, `island-map.spec.ts`, `npm test`) — all passing.
**Files changed:** `src/features/title/TitleScreen.tsx`
**Design note:** → [Session 1 — Title Screen Redesign (Reference Photo)](design-decisions.md)

---

### #6 — Title Screen AI Art Brief (Rotunda Background)

**Asked:** "give me an ai prompt for ther abandoned resort title page that i can generate with high fidelity"
**Status:** ✓ Done ([#3](https://github.com/Sodagaming67/worldhopper/issues/3))
**What was built:** Per Rule 5, decided AI-generated art is the better call here over further procedural SVG work (the current rotunda background is already at the ceiling of what hand-drawn SVG shapes can sell). Wrote a ready-to-use generation prompt matching the existing rotunda/dome/portico/beacon-glow composition from `TitleScreen.tsx`, plus save instructions (filename, 1536×2048 portrait size, PNG/JPG, opaque full-bleed, drop folder). No code changed — the title screen keeps rendering its current procedural SVG until the generated art is wired in during a follow-up session.
**Files changed:** `docs/game/title-screen-art-brief.md` (new)
**Design note:** → [Session 2 — Title Screen AI Art Brief](design-decisions.md)

---

## Session 3 — Boy/Girl Explorer Picker

---

### #7 — Boy/Girl Explorer Picker on the Title Screen

**Asked:** "i want to add a player selection with 2 selections a boy and a girl" (clarified: the picker belongs on the title screen, not Settings; the choice should actually drive the hero's art, not just be cosmetic UI)
**Status:** ✓ Done ([#4](https://github.com/Sodagaming67/worldhopper/issues/4))
**What was built:** A "Choose your explorer" picker on the title screen — two tappable boy/girl cards above the Play button, boy pre-selected by default. The choice saves to a new `settings.heroCharacter` field and drives which character art shows for the island-map "you are here" hero token and the Sunline Tram Dash runner (run/jump/slide). Girl-variant art was matted (background removed, cropped) through the existing `scripts/matte-art` pipeline and wired in as real, playable art today — not a placeholder. Other minigames (reef dive, Kīlauea platformer, Black Sands, pool slides) are unaffected for now; see the design note for why.
**Files changed:** `src/features/title/TitleScreen.tsx`, `src/game/assets.ts`, `src/features/arcade/IslandMapScreen.tsx`, `src/game/scenes/TramDashScene.ts`, `src/game/data/tramdashChaseAssets.ts`, `src/store/gameStore.ts`, `src/types/game.ts`, plus new art under `public/game/overworld/` and `public/game/tramdash-chase/`
**Design note:** → [Session 3 — Boy/Girl Explorer Picker](design-decisions.md)

---

### #8 — Extend the Boy/Girl Picker to Kīlauea and the Reef

**Asked:** "kilauea world shows the boy character even though i picked giorl" and "reef also shows boy even though i picked girl" — followed by confirming matching reference art was already on hand for both worlds.
**Status:** ✓ Done ([#4](https://github.com/Sodagaming67/worldhopper/issues/4))
**What was built:** Extended `settings.heroCharacter` to the two remaining worlds with real AI-generated hero art: Kīlauea Ascent (`IslandPlatformerScene`'s idle/run/jump art) and Kahaluʻu Reef (`SwimScene`'s 5-frame swim cycle). Both now pick boy/girl textures the same way the map token and Tram Dash already did. Matched reference art was matted/cropped via `scripts/matte-art` and wired in as real, playable art. Fixed a follow-up sizing bug where the girl reef swim frames (cropped to a much taller native canvas than the boy set) rendered ~3x too large under the scene's single fixed `setScale` — added a per-character scale constant instead.
**Files changed:** `src/game/scenes/IslandPlatformerScene.ts`, `src/game/scenes/SwimScene.ts`, `src/game/data/kilaueaAssets.ts`, `src/game/data/reefAssets.ts`, plus new art under `public/game/kilauea/` and `public/game/reef/`
**Design note:** → [Session 3 — Boy/Girl Explorer Picker](design-decisions.md)

---

---

### #9 — Boy/Girl Picker in Settings, and Reef Sizing Fix

**Asked:** "once we are past the title screen, there is no way to change the character again - should we also add this character switch in the Settings?" (confirmed yes) — plus follow-up fine-tuning: "we could make the girl in the reef a tad bit bigger still - same size as the boy", then "the girl is too big now - lets revert this or find an inbteween size".
**Status:** ✓ Done ([#4](https://github.com/Sodagaming67/worldhopper/issues/4))
**What was built:** Added the same boy/girl "Explorer" picker to the Settings screen (two cards with live art previews, same styling as the title screen's) so the choice can be changed anytime, not just before the first Play. Also hand-tuned the reef girl sprite's on-screen scale after the initial crop-ratio-based fix over- and under-shot in opposite directions across a few rounds of visual feedback — settled on a manually-verified value rather than a pure math ratio.
**Files changed:** `src/features/settings/SettingsScreen.tsx`, `src/game/scenes/SwimScene.ts`
**Design note:** → [Session 3 — Boy/Girl Explorer Picker](design-decisions.md)

---

## How to Update This File

When a new feature is added:

1. Add a new `### #N` entry at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
