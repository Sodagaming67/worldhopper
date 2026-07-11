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
