# World Hopper — Project Rules for Claude

These rules apply to every response in this project. Follow them before the auto-commit fires.

---

## 1. Every change is tracked

When you add, change, or remove a feature:

1. Add a new numbered entry to `docs/feature-requests.md` (never renumber existing entries).
   - Include: what was asked, status, what was built, files changed, link to design note.
2. Add a matching entry to `docs/design-decisions.md` under the current session.
   - Include: what was built, why this approach, alternatives considered.
3. Do this in the **same response** — not a follow-up, not after the commit.

Enhancements (new features, not trivial tweaks) also get a GitHub issue via `gh issue create` in the
`Sodagaming67/worldhopper` repo, referenced in the commit message as `(#N)`. Small fixes/typos don't
need an issue.

---

## 2. Commit rules

- Do not add a `Co-Authored-By:` trailer to commit messages.
- Git username: sodaGaming67 (email: sodaGaming67@users.noreply.github.com).
- A Stop hook auto-commits at the end of every response (see `.claude/settings.json`) — docs updates
  above must land before that fires.

---

## 3. Code style

- No comments unless the WHY is non-obvious.
- No new files unless the feature genuinely requires one.
- No error handling for scenarios that can't happen.

---

## 4. Privacy

- This repo is public. Never commit real names, emails, addresses, or personal photos of the
  developer or their family. Use generic placeholders (e.g. "Player A") in docs and code.

---

## 5. Visual upgrades

When asked for a visual upgrade (new background, character art, scene redesign, etc.), first decide
whether an AI-generated image/background would serve better than a coded/procedural approach (CSS,
SVG, Phaser shapes, etc.). If AI art is the better call:

1. Write a detailed, ready-to-use generation prompt (style clause, composition, what to exclude —
   see `docs/game/*-art-brief.md` for the established prompt format and conventions).
2. Write step-by-step instructions for using that prompt: where to run it, what filename/size/format
   to save each result as, and where to save it (drops go in `docs/art-drops/<world-or-feature>/`,
   the brief itself lives in `docs/game/`).
3. Save both as a new or updated brief under `docs/game/` (e.g. `docs/game/<feature>-art-brief.md`) —
   this is required, not optional, and happens in the same response per Rule 1.

The game must stay playable on the existing procedural/placeholder art until the generated art is
wired in.
