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

## Technology Stack

| Layer | Technology | Why chosen |
|-------|-----------|-----------|
| Game engine | Phaser 4 + React 19 | Canvas-based game engine paired with React for UI/menus and routing |
| Hosting | GitHub Pages (`actions/deploy-pages`) | Free for public repos; no server infra needed |
| Persistence | localStorage (save data) | No server in this repo |
| Version control | Git + auto-commit Stop hook | Keeps docs and commits in sync automatically |
