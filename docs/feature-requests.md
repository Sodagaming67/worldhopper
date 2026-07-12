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
**What was built:** Replaced the hardcoded macOS path with this machine's Git-Bash path (`/c/Code/Games/worldhopper`), matching where the repo actually lives now.
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

## How to Update This File

When a new feature is added:

1. Add a new `### #N` entry at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
