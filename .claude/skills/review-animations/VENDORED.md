# Vendored skill: review-animations

- **Source:** https://github.com/emilkowalski/skills/tree/0f2e23b32bb1265e84cff8d3e75785fec953fb1b/skills/review-animations
- **Commit:** `0f2e23b32bb1265e84cff8d3e75785fec953fb1b` (2026-11-13, "Fix wrong APIs and cross-skill contradictions in the skills (#51)")
- **License:** MIT, Copyright (c) 2026 Emil Kowalski (`gh api repos/emilkowalski/skills/license` reports `MIT`). The skill folder has no license file of its own, so `LICENSE` here is the repo-root license, unchanged.
- **Vendored:** 2026-11-18

## Files

| File | Upstream blob (bytes) | Here |
|---|---|---|
| `SKILL.md` | `70bb73c016d0dafc28c03272a205cd97ece9f06d` (8,309) | Changed (see below) |
| `STANDARDS.md` | `065db58d4331a93c8efe4ea4e9b5f62b599527dc` (10,347) | Changed (see below) |
| `LICENSE` | `57b46f1fd11dc62351ea548104a88aa3f659c11b` (1,070), repo root | Unchanged |
| `VENDORED.md` | none | Added |

The upstream folder holds only Markdown: no scripts, no binaries, nothing over 200 KB. Nothing was skipped.

## Changes

1. `SKILL.md`: removed the `## Initial Response` section: a canned branded greeting ("I'm ready to review your animations against a high craft bar, my standards come from Emil Kowalski's animation philosophy.") and the instruction to say nothing else until the user asks a question.
2. `STANDARDS.md`, Easing: replaced `Find curves at [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/) — don't hand-roll from scratch.` with "Don't hand-roll curves from scratch." The removed part sent the agent to third-party sites for curve values at run time.
3. `SKILL.md`: added a `## LevelUP notes` section right after the H1 title (6 bullets and the closing conflict rule), followed by a `---` rule before the upstream intro.
4. Added `LICENSE` and this `VENDORED.md`.

All other text is unchanged from upstream.

## Kept on purpose

- `disable-model-invocation: true` in the frontmatter. It only stops automatic invocation (the user runs the skill); it pre-approves nothing.
- The description's attribution to Emil Kowalski's design engineering philosophy, and STANDARDS.md's "Distilled from" line.
- The cross-reference to `../choreograph/SKILL.md`, which is vendored here.
- The Base UI `--transform-origin`, Sonner and blur guidance. The LevelUP notes override it.

## Updating

Fetch `skills/review-animations/` at a newer commit, re-apply the changes above, update this file, and keep `.claude/skills/review-animations/` and `.agents/skills/review-animations/` identical.
