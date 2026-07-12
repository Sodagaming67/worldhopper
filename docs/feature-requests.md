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

## Session 1 — Import and Setup

---

### #1 — Copy Island Summer Quest into a New Public Repo for GitHub Pages

**Asked:** "help me copy all the content from this repo to /Users/jthangiah/Developer/repos/games/worldhopper and leave out all code related to deployment / i want to deploy this on github pages / also the username for the commit needs to be sodaGaming67"
**Status:** ✓ Done
**What was built:** Copied all git-tracked files from mCloud-games (island-summer-quest) into this repo, excluding `deployment/`, `deploy.yml`, and `infra.yml`. Renamed the game/repo to "World Hopper" (vite `base`, PWA manifest, save-file name). Added `.github/workflows/pages.yml` (actions/deploy-pages) and a postbuild `404.html` copy for wouter's browser-history SPA routing. Simplified `playwright.config.ts` now that the CDK outputs file it read no longer exists.
**Files changed:** whole-repo copy; `vite.config.ts`, `package.json`, `playwright.config.ts`, `src/App.tsx`, `src/lib/storage.ts`, `.github/workflows/pages.yml`, `README.md`
**Design note:** → [Session 1 — Repo Import](design-decisions.md)

---

### #2 — Clean Up Process Artifacts and Personal Content

**Asked:** "lets cleanup the superpowers folder and any other work files" / "since this is a public repo i dont want any people names or personal information shared"
**Status:** ✓ Done
**What was built:** Removed `.superpowers/`, `docs/superpowers/` (plans/specs/test-logs), `research/`, `docs/build-plan.md`, `docs/fun-enhancements.md`, the hosting-plan doc, and `.claude/skills/` (tied to the old repo's GitHub issue workflow). Removed personal family content (`docs/Hawaii Vacation.md`, a child's wishlist doc, a brainstorm doc). Redacted real family member names (replaced with "Player A"/"Player B"/"the developer") from the design docs that were kept (spec, ADR, art brief, attribution). Switched the commit author email to a GitHub noreply address for the same reason.
**Files changed:** repo-wide deletions; `docs/island-summer-quest-spec.md`, `docs/adr/0001-graphics-art-pipeline.md`, `docs/game/reef-hero-brief.md`, `docs/game/ATTRIBUTION.md`
**Design note:** → [Session 1 — Privacy Cleanup](design-decisions.md)

---

### #3 — Copy Tracking Rules from zap-n-hop

**Asked:** "lets also copy some rules from zap-n-hop to make sure any changes introduced are tracked - maybe use issues for any enhancements and a have a log of all prompts provided by user" (+ follow-up: auto-commit after every iteration, split feature-request/design-decision docs)
**Status:** ✓ Done
**What was built:** `CLAUDE.md` with standing rules (docs updated same-response as code changes, enhancements get a GitHub issue, no `Co-Authored-By` trailer, sodaGaming67 identity, privacy rule). This file and `design-decisions.md` as the tracking docs. `.claude/settings.json` Stop hook that auto-commits (`git add -A && git commit`) at the end of every response.
**Files changed:** `CLAUDE.md` (new), `docs/feature-requests.md` (new), `docs/design-decisions.md` (new), `.claude/settings.json` (new)
**Design note:** → [Session 1 — Tracking Setup](design-decisions.md)

---

### #4 — Rebrand Remaining "Island Summer Quest" References

**Asked:** "does existing documentation like README also need updates? lets review them"
**Status:** ✓ Done
**What was built:** Audited every doc for stale branding. Renamed `docs/island-summer-quest-spec.md` → `docs/game-design-spec.md` and updated its title/repo-name/scaffold-command references to World Hopper (keeping a note that it was originally built as Island Summer Quest). Updated the browser tab `<title>` in `index.html` (previously missed — inconsistent with the already-renamed PWA manifest), the matching Playwright title assertion in `smoke.spec.ts`, a CSS comment, and title lines in `docs/game/how-to-play.md` and `docs/game/overworld-art-brief.md`. Left historical/dev-log mentions as-is (`docs/game/phaser-migration-summary.md`, an "unrouted dead code from the retired Island Summer Quest map" note, and this log's own past entries) since those describe what was true at the time, not current branding.
**Files changed:** `docs/game-design-spec.md` (renamed + edited), `index.html`, `src/tests/e2e/smoke.spec.ts`, `src/index.css`, `docs/game/how-to-play.md`, `docs/game/overworld-art-brief.md`
**Design note:** → [Session 1 — Rebrand Audit](design-decisions.md)

---

### #5 — Fix Broken GitHub Pages Deploy (Stale Lockfile)

**Asked:** "continue and push"
**Status:** ✓ Done
**What was built:** After pushing and enabling Pages, the `pages.yml` workflow's `npm ci` step failed with `EUSAGE` — the carried-over `package-lock.json` had an internal version conflict (one dependency required `@emnapi/core@1.11.2`, another only provided `1.11.1`), unrelated to the World Hopper rename. Regenerated the lockfile from scratch under Node 24 (matching the CI workflow's node-version) with `rm -rf node_modules package-lock.json && npm install`. Verified locally: `npm ci` succeeds, `npm run build` produces `dist/404.html`, and all 158 unit tests pass.
**Files changed:** `package-lock.json`
**Design note:** → [Session 1 — Lockfile Fix](design-decisions.md)

---

## How to Update This File

When a new feature is added:

1. Add a new `### #N` entry at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
