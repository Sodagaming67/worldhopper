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

## How to Update This File

When a new feature is added:

1. Add a new `### #N` entry at the bottom (never renumber existing entries)
2. Fill in: what was asked, status, what was built, files changed
3. Add a matching entry in `design-decisions.md` under the correct session with full why/alternatives reasoning
4. This happens in the **same response as the code change** — before the auto-commit fires
