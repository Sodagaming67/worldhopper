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

## Session 1 — Import, Privacy Cleanup, and Tracking Setup

---

### Repo Import for GitHub Pages

**What was asked:** Copy the Island Summer Quest game out of the private mCloud-games repo into a
new public repo, hostable on GitHub Pages, without any of the AWS/CDK deployment code.

**What was built**
A file-level copy (via `git ls-files`, not a full git-history clone) of every tracked file except
`deployment/`, `deploy.yml`, and `infra.yml`. Renamed to "World Hopper" throughout config
(`GAME_PATH` in `vite.config.ts`, PWA manifest, save filename) to match the new repo name, since
GitHub Pages project sites derive their URL from the repo name and Vite's `base` must match. Added
`actions/deploy-pages` workflow and a `cp dist/index.html dist/404.html` postbuild step, since
GitHub Pages has no server-side rewrite and the app uses wouter's browser-history router.

**Why this way**
- **File copy, not `git clone`.** A full clone would carry the entire private repo's commit history
  (including AWS ARNs, infra decisions, and anything else discussed in old commit messages) into a
  public repo. A tracked-files copy plus one fresh commit avoids that entirely.
- **Repo name = `worldhopper` = Vite base path.** Zero-config Pages hosting — no custom domain, no
  base-path mismatch.
- **404.html copy over a hash router.** Changing the router mode would touch every route/link in the
  app; copying `index.html` to `404.html` is a one-line build step with no app code changes.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| `git clone` then filter-branch/rewrite history | Overkill for a fresh public mirror; risks leaking old commit messages |
| Switch wouter to hash-based routing | Bigger diff for no benefit over the 404.html trick |
| Custom domain for Pages | Not requested; adds DNS setup out of scope for "just get it on Pages" |

---

### Privacy Cleanup

**What was asked:** Remove work-in-progress/process files not relevant to a fresh repo, and — once
personal content was spotted — make sure no real names, emails, or family info ship in a public repo.

**What was built**
Removed `.superpowers/`, `docs/superpowers/` (planning artifacts from the original repo's sessions),
`research/`, and other planning docs. Kept genuine game documentation (art briefs, ADR,
`how-to-play.md`, `ATTRIBUTION.md`, the core design spec) per the user's choice. Separately, deleted
two files containing real personal content and used `perl -pi -e 's/\bName\b/Placeholder/g'`
(word-boundary regex; macOS `sed -i` doesn't support `\b`) to redact remaining real family names from
the docs that were kept. Also re-authored the initial commit with a GitHub noreply email instead of
the developer's real gmail address, since that email also contained the redacted name.

**Why this way**
- **Keep design docs, drop process docs.** The design spec/ADR/art briefs describe the *game*, which
  is useful to keep working from. The superpowers plans/specs/test-logs describe *how a previous AI
  session built it*, which has no ongoing value in a fresh repo.
- **Redact rather than delete the design spec.** The spec's actual design content (world structure,
  progression) doesn't depend on the real names used as running examples; swapping in placeholders
  keeps 100% of the design value while removing the personal info.
- **Fix the commit email too.** A public repo's commit history is permanent and searchable — leaving
  a real name in the author email while scrubbing it from the docs would have been pointless.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Full "minimal repo" wipe (code only, no docs) | User chose to keep design references — more useful for future work on the game |
| Leave real names in git history, fix going forward only | Not yet pushed anywhere; cheaper to fix now than rewrite public history later |
| `sed -i` with `\b` | Silently no-ops on macOS/BSD sed; switched to `perl` which supports `\b` |

---

### Tracking Setup (Issues, Prompt Log, Auto-Commit)

**What was asked:** Copy the tracking conventions from `zap-n-hop` (another of the user's game repos
under the same sodaGaming67 identity) — track enhancements as GitHub issues, keep a log of prompts,
and auto-commit after every response.

**What was built**
`CLAUDE.md` with the standing rule set (docs-before-commit, issue-per-enhancement, no
`Co-Authored-By`, sodaGaming67 identity, a privacy rule given what was just cleaned up). Two docs
files — this one and `feature-requests.md` — split the same way zap-n-hop does: a quick numbered
index vs. the full why/alternatives reasoning. `.claude/settings.json` gets a `Stop` hook that runs
`git add -A && git commit` automatically at the end of every response.

**Why this way**
- **Split docs, not one merged file.** Matches the user's explicit choice and zap-n-hop's own
  pattern: skimming asks vs. reading the reasoning behind one are different tasks with different
  amounts of detail needed.
- **Issues for enhancements, not every change.** Mirrors how the mCloud-games repo already works
  (every feature gets a GitHub issue) — consistent conventions across the user's projects. Trivial
  fixes don't need the overhead of an issue.
- **Commit-only hook, no auto-push.** Matches zap-n-hop's hook exactly — pushing is a separate,
  explicitly-confirmed action, not something that should happen silently after every response.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Single combined log file | User explicitly chose the two-file split |
| Auto-commit hook that also pushes | Bigger behavior change than what zap-n-hop does or what was asked |
| Issue-per-response (not just enhancements) | Would flood the issue tracker with trivial changes |

---

### Rebrand Audit

**What was asked:** "does existing documentation like README also need updates? lets review them"

**What was built**
Grepped the whole repo (not just docs) for the old name, since the PWA manifest and README had
already been renamed but nothing had checked the rest. Found and fixed real inconsistencies: the
browser tab `<title>` in `index.html` was still "Island Summer Quest" even though
`vite.config.ts`'s PWA manifest name was already "World Hopper" — a visible mismatch a user would
actually see. Its Playwright assertion in `smoke.spec.ts` matched on the old title too, so it would
have silently kept passing against the old name forever. Renamed the founding design spec file and
updated its title/repo-name references, added a note that it was originally built as Island Summer
Quest rather than pretending it never was.

**Why this way**
- **Grep the whole tree, not just `docs/`.** Branding leaks into code (`<title>`, test assertions,
  CSS comments), not only prose. Checking only docs would have missed the actual user-visible tab
  title bug.
- **Fix the title *and* its test together.** A test asserting on stale content would have made the
  mismatch invisible in CI — fixing only the markup without updating the assertion would have broken
  the test for the wrong reason.
- **Leave historical/dev-log mentions alone.** `phaser-migration-summary.md` and the "retired Island
  Summer Quest map" note in the overworld art brief describe what was literally true at a past point
  in time. Editing history to match the present would make those logs less accurate, not more.
- **Keep "Originally built as" in the spec rather than silently overwriting.** The design spec is
  historically the founding document; a reader benefits from knowing the product was renamed rather
  than the rename being invisible.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Docs-only grep | Would have missed the `index.html` title / test assertion mismatch entirely |
| Silently delete "Island Summer Quest" everywhere, no provenance note | Loses useful history for no benefit — the file isn't shipped as user-facing product copy |
| Rewrite historical log/dev-note mentions to say "World Hopper" | Falsifies what was actually true at the time those notes were written |

---

### Lockfile Fix

**What was asked:** "continue and push" — after pushing, the GitHub Pages deploy workflow failed.

**What was built**
`gh run view --log-failed` showed `npm ci` exiting with `EUSAGE`: the lockfile required
`@emnapi/core@1.11.2` in one place but only pinned `1.11.1` elsewhere — an internal inconsistency in
the `package-lock.json` carried over from mCloud-games, not something introduced by the rename.
Regenerated it from scratch (`rm -rf node_modules package-lock.json && npm install`) using Node 24
via nvm, matching the `node-version: 24` in `pages.yml`, so the lockfile npm produces matches what CI
will actually resolve. Verified `npm ci`, `npm run build` (confirms `dist/404.html` is produced), and
`npm test` (158/158 passing) all succeed before pushing.

**Why this way**
- **Regenerate under the same Node version CI uses**, not whatever happened to be on this machine —
  npm's dependency resolution (including which optional platform variants get listed) is influenced
  by the engines field of transitive deps, so a lockfile built under a different Node major version
  can legitimately resolve differently than what `npm ci` expects in CI.
- **Verify locally before re-pushing**, rather than push-and-hope against CI. `npm ci` failing is
  exactly the kind of thing that's cheap to catch locally and expensive to iterate on through GitHub
  Actions run cycles.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Switch `pages.yml` to `npm install` instead of `npm ci` | Papers over the real inconsistency instead of fixing it; `npm ci`'s strictness is exactly what catches this class of bug |
| Downgrade the workflow's node-version to match whatever was convenient locally | The lockfile should match the CI environment, not the other way around |

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
- **Player-facing only, per explicit choice.** The user was asked whether to rewrite all 11 files
  that mention "World Hopper" or only what players see, and chose the latter — a full repo/URL
  rename wasn't requested and would break the existing GitHub Pages URL for no benefit.
- **Update the title's test alongside the title.** Same reasoning as the #4 rebrand: an assertion
  left pointing at the old string would either fail immediately or (worse) mask a future revert.

**What was ruled out**

| Option | Why rejected |
|--------|-------------|
| Rename everywhere (repo name, `GAME_PATH`, docs, `CLAUDE.md`) | Explicitly declined — would change the live Pages URL and rewrite unrelated internal docs |
| Leave `smoke.spec.ts`'s title assertion matching the old name | Would fail CI (or falsely pass if left too loose) against the new title |

---

### Auto-Commit Hook Path Fix

**What was asked:** "fix that setting to use for this computer" — after the previous response's
changes never got auto-committed by the Stop hook, a `git status` check showed the hook's `cd`
target was a macOS path (`/Users/jthangiah/Developer/repos/games/worldhopper`) left over from
before the repo moved to this Windows machine, so it had been failing silently on every response.

**What was built**
Swapped the hardcoded `cd` target in `.claude/settings.json`'s `Stop` hook for this machine's actual
path in Git-Bash form (`/c/Code/Games/worldhopper`), since the hook's `command` runs under `"shell":
"bash"`.

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
| Use a Windows-style path (`C:/Code/Games/worldhopper`) | The hook's shell is bash (Git Bash), which expects the `/c/...` mount form |

---

### Map Screen Title Fix

**What was asked:** "I still see the old name on the map" — after the #6 rename shipped, the live
site's `<title>` was confirmed correct via a fetch, but the in-game map screen itself still showed
an old name.

**What was built**
The earlier rename (#6) only covered the browser `<title>`, PWA manifest, README, and their test —
it never searched for hardcoded UI text inside the game itself. Grepping the codebase turned up
`IslandMapScreen.tsx`'s header `<h1>`, hardcoded to "Big Island Blitz" — a name predating even
"World Hopper", missed by every previous rebrand pass because it never matched a "World Hopper" or
"Island Summer Quest" search. Updated it to "THE ABANDONED RESORT" and the three Playwright specs
asserting on that exact heading text (`smoke.spec.ts` ×2, `island-map.spec.ts` ×1).

**Why this way**
- **Grep for the actual old string, not just "World Hopper".** The #6 rename's search terms didn't
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
| Game engine | Phaser 4 + React 19 | Carried over from the original mCloud-games implementation |
| Hosting | GitHub Pages (`actions/deploy-pages`) | Free for public repos; no AWS account needed |
| Persistence | localStorage (save data) | Carried over; no server in this repo |
| Version control | Git + auto-commit Stop hook | Matches the zap-n-hop convention for this identity |
