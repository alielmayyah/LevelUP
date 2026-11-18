# Vendored skill: learn-taste

- **Source:** https://github.com/emilkowalski/skills/tree/0f2e23b32bb1265e84cff8d3e75785fec953fb1b/skills/learn-taste
- **Commit:** `0f2e23b32bb1265e84cff8d3e75785fec953fb1b` (2026-11-13, "Fix wrong APIs and cross-skill contradictions in the skills (#51)")
- **License:** MIT, Copyright (c) 2026 Emil Kowalski (`gh api repos/emilkowalski/skills/license` reports `MIT`). The skill folder has no license file of its own, so `LICENSE` here is the repo-root license, unchanged.
- **Vendored:** 2026-11-18

## Files

| File | Upstream blob (bytes) | Here |
|---|---|---|
| `SKILL.md` | `9ea9da36bf557e063723df8641ce6b56594170d4` (9,251) | Changed (see below) |
| `LICENSE` | `57b46f1fd11dc62351ea548104a88aa3f659c11b` (1,070), repo root | Unchanged |
| `VENDORED.md` | none | Added |

The upstream folder holds only Markdown: no scripts, no binaries, nothing over 200 KB. Nothing was skipped.

## Changes

1. `SKILL.md`, Phase 1: removed "If the user names earlier sessions and you can read their transcripts (Claude Code stores them as JSONL under `~/.claude/projects/<project>/`), read those too." It read other sessions' private transcripts; LevelUP uses the current conversation only.
2. `SKILL.md`, Phase 2 tree: replaced `→ Ask where their global rules live.` with `→ Raise it under "Needs your answer". Never write outside this repo.` Writing global rules means editing the user's own agent config outside the repo.
3. `SKILL.md`, Phase 4: removed the "Make sure it gets read" paragraph, which proposed adding `Before building or changing UI, read DESIGN.md.` to CLAUDE.md or AGENTS.md (agent config). LevelUP's CLAUDE.md already points agents at `ui-standards`.
4. `SKILL.md`, Invocation Variants: removed the `/learn-taste <sessions>` row ("Also read the named or most recent N session transcripts").
5. `SKILL.md`: added a `## LevelUP notes` section right after the H1 title (6 bullets and the closing conflict rule), followed by a `---` rule before the upstream intro.
6. Added `LICENSE` and this `VENDORED.md`.

All other text is unchanged from upstream.

## Kept on purpose

- `disable-model-invocation: true` in the frontmatter (user-invoked only; it pre-approves nothing).
- The DESIGN.md wording in the description and body. The LevelUP notes send every DESIGN.md read and write to `ui-standards` instead of rewriting upstream's text.
- Phase 2's read-only check of CLAUDE.md / AGENTS.md for an existing rule, and Phase 6's approval step: nothing is written until the user approves it.
- There was no canned greeting to remove.

## Updating

Fetch `skills/learn-taste/` at a newer commit, re-apply the changes above, update this file, and keep `.claude/skills/learn-taste/` and `.agents/skills/learn-taste/` identical.
