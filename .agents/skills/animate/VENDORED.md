# Vendored skill: animate

- **Source:** https://github.com/emilkowalski/skills/tree/0f2e23b32bb1265e84cff8d3e75785fec953fb1b/skills/animate
- **Commit:** `0f2e23b32bb1265e84cff8d3e75785fec953fb1b` (2026-11-13, "Fix wrong APIs and cross-skill contradictions in the skills (#51)")
- **License:** MIT, Copyright (c) 2026 Emil Kowalski (`gh api repos/emilkowalski/skills/license` reports `MIT`). The skill folder has no license file of its own, so `LICENSE` here is the repo-root license, unchanged.
- **Vendored:** 2026-11-18

## Files

| File | Upstream blob (bytes) | Here |
|---|---|---|
| `SKILL.md` | `69338805e0ea1c77d6f4c1987d516f46b1657819` (12,122) | Changed (see below) |
| `RECIPES.md` | `20bc376c15b16541b1e45c94b60b23d73ab59656` (8,060) | Unchanged |
| `LICENSE` | `57b46f1fd11dc62351ea548104a88aa3f659c11b` (1,070), repo root | Unchanged |
| `VENDORED.md` | none | Added |

The upstream folder holds only Markdown: no scripts, no binaries, nothing over 200 KB. Nothing was skipped.

## Changes

1. `SKILL.md`: removed the `## Initial Response` section: a canned branded greeting ("I'm ready to build animations that feel right, my knowledge comes from Emil Kowalski's animation philosophy.") and the instruction to say nothing else until the user asks a question.
2. `SKILL.md`, step 5: removed `Take it from [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/).`, which sent the agent to third-party sites for curve values at run time. The line now reads "Need a curve that isn't here? Don't hand-roll one."
3. `SKILL.md`: added a `## LevelUP notes` section right after the H1 title (7 bullets and the closing conflict rule), followed by a `---` rule before the upstream intro.
4. Added `LICENSE` and this `VENDORED.md`.

All other text is unchanged from upstream.

## Kept on purpose

- Cross-references to other skills. `choreograph` and `review-animations` are vendored here; `improve-animations`, `find-animation-opportunities`, `animate-expo` and `pick-ui-library` (including the `../pick-ui-library/SKILL.md` link) are not, and the LevelUP notes say what to do instead.
- Attribution to Emil Kowalski's animation philosophy in the body. It credits the source and doesn't make the agent say anything.
- The Base UI, Vaul and Sonner examples, the blur crossfade recipe, the LTR `clip-path` recipes and the "upgrade to motion 14.2" advice. They are content, not hazards; the LevelUP notes override them here.

## Updating

Fetch `skills/animate/` at a newer commit, re-apply the changes above, update this file, and keep `.claude/skills/animate/` and `.agents/skills/animate/` identical.
