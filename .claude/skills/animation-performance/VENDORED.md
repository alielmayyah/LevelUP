# Vendored skill: animation-performance

- **Source:** https://github.com/emilkowalski/skills/tree/0f2e23b32bb1265e84cff8d3e75785fec953fb1b/skills/animation-performance
- **Commit:** `0f2e23b32bb1265e84cff8d3e75785fec953fb1b` (2026-11-13, "Fix wrong APIs and cross-skill contradictions in the skills (#51)")
- **License:** MIT, Copyright (c) 2026 Emil Kowalski (`gh api repos/emilkowalski/skills/license` reports `MIT`). The skill folder has no license file of its own, so `LICENSE` here is the repo-root license, unchanged.
- **Vendored:** 2026-11-18

## Files

| File | Upstream blob (bytes) | Here |
|---|---|---|
| `SKILL.md` | `c7dd441dde8d597c877e851ed9f9601249351591` (14,002) | Changed (see below) |
| `LICENSE` | `57b46f1fd11dc62351ea548104a88aa3f659c11b` (1,070), repo root | Unchanged |
| `VENDORED.md` | none | Added |

The upstream folder holds only Markdown: no scripts, no binaries, nothing over 200 KB. Nothing was skipped.

## Changes

1. `SKILL.md`: removed the `## Initial Response` section: a canned branded greeting ("I'm ready to find out why your animation drops frames and make it smooth, my knowledge comes from Emil Kowalski's design engineering philosophy.") and the instruction to say nothing else until the user asks a question.
2. `SKILL.md`, Why This Matters: removed the promotional link to the author's own Sonner site (`https://sonner.emilkowal.ski/`). The example sentence stays.
3. `SKILL.md`: added a `## LevelUP notes` section right after the H1 title (6 bullets and the closing conflict rule), followed by a `---` rule before the upstream intro.
4. Added `LICENSE` and this `VENDORED.md`.

All other text is unchanged from upstream.

## Kept on purpose

- Cross-references: `animate` and `review-animations` are vendored here; `animate-expo` (React Native) is not.
- The Sonner, Vaul and Vercel examples and the "upgrade to motion 14.2" rows. LevelUP is already on motion 14.13, and the LevelUP notes say to skip those rows.
- The blur-cost advice ("keep animated blur under 20px"). It is accurate; LevelUP simply uses no blur.

## Updating

Fetch `skills/animation-performance/` at a newer commit, re-apply the changes above, update this file, and keep `.claude/skills/animation-performance/` and `.agents/skills/animation-performance/` identical.
