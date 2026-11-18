# Vendored skill: prototype

- **Source:** https://github.com/emilkowalski/skills/tree/0f2e23b32bb1265e84cff8d3e75785fec953fb1b/skills/prototype
- **Commit:** `0f2e23b32bb1265e84cff8d3e75785fec953fb1b` (2026-11-13, "Fix wrong APIs and cross-skill contradictions in the skills (#51)")
- **License:** MIT, Copyright (c) 2026 Emil Kowalski (`gh api repos/emilkowalski/skills/license` reports `MIT`). The skill folder has no license file of its own, so `LICENSE` here is the repo-root license, unchanged.
- **Vendored:** 2026-11-18

## Files

| File | Upstream blob (bytes) | Here |
|---|---|---|
| `SKILL.md` | `56a648d217a8665f2acdf9d6f6a21bbfb5a325f3` (8,095) | Changed (see below) |
| `PICKER.md` | `f61186257d9b9f7a4ccd672754be030de6e1aec4` (7,705) | Unchanged |
| `LICENSE` | `57b46f1fd11dc62351ea548104a88aa3f659c11b` (1,070), repo root | Unchanged |
| `VENDORED.md` | none | Added |

The upstream folder holds only Markdown: no scripts, no binaries, nothing over 200 KB. Nothing was skipped.

## Changes

1. `SKILL.md`: removed the `## Initial Response` section: a canned branded greeting ("I'm ready to build several genuinely different versions of a UI piece for you to flip through, my craft bar comes from Emil Kowalski's design engineering philosophy.") and the instruction to say nothing else until the user asks a question.
2. `SKILL.md`: added a `## LevelUP notes` section right after the H1 title (5 bullets and the closing conflict rule), followed by a `---` rule before the upstream intro.
3. Added `LICENSE` and this `VENDORED.md`.

All other text is unchanged from upstream.

## Kept on purpose

- `disable-model-invocation: true` in the frontmatter (user-invoked only; it pre-approves nothing).
- PICKER.md word for word, including its literal colors, `backdrop-filter` blur, physical `left`/`translateX` positioning and LTR arrow keys. The picker is throwaway harness chrome; the LevelUP notes cover RTL keys, tab-bar placement and removal before merging.
- Cross-references: `review-animations` is vendored here; `improve-animations` and `pick-ui-library` are not.
- Attribution to Emil Kowalski's standards in Operating Posture.

## Updating

Fetch `skills/prototype/` at a newer commit, re-apply the changes above, update this file, and keep `.claude/skills/prototype/` and `.agents/skills/prototype/` identical.
