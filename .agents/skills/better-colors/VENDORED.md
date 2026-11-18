# Vendored: better-colors

| | |
|---|---|
| Upstream | [jakubkrehel/skills](https://github.com/jakubkrehel/skills), by Jakub Krehel |
| Source | https://github.com/jakubkrehel/skills/tree/19ab1fa176a2f28d426567108ff1f3d816af58b1/skills/better-colors |
| Commit | `19ab1fa176a2f28d426567108ff1f3d816af58b1` (committed 2026-11-17, "Resolve contradictions and ambiguity found by cold reads and trials"), the latest commit touching `skills/better-colors` when vendored |
| License | MIT, Copyright (c) 2026 Jakub Krehel. The repo-root `LICENSE` is copied unchanged to `LICENSE`; the skill folder has no license file of its own |
| Vendored | 2026-11-18 |
| Copies | `.claude/skills/better-colors/` and `.agents/skills/better-colors/`, kept identical |

## Files

| File | Upstream blob | Status |
|---|---|---|
| `SKILL.md` | `75c7d18` | Changed: LevelUP notes added (see Changes) |
| `agents/openai.yaml` | `27c2e70` | Unchanged |
| `color-formats.md` | `e3ab1d8` | Unchanged |
| `color-usage.md` | `3e3fa19` | Unchanged |
| `contrast.md` | `b00abf6` | Unchanged |
| `palette-generation.md` | `cb4898c` | Unchanged |
| `palette-structure.md` | `7ad23b1` | Unchanged |
| `reporting.md` | `4a09ce6` | Unchanged |
| `token-naming.md` | `3e22363` | Unchanged |
| `LICENSE` | `6a067e9` (repo root) | Added, unchanged copy of the repo-root license |
| `VENDORED.md` | | Added (this file) |

Every file in the upstream folder was downloaded at the commit above and read in full. None was skipped: the folder has no binaries, no files over 200 KB and no executable scripts. `agents/openai.yaml` is Codex display metadata (`display_name`, `short_description`) and is kept unchanged.

The ui-skills.com snapshot used for triage lacked `reporting.md` and `agents/openai.yaml`; the files it did have are byte-identical to this commit.

## Changes

1. `SKILL.md`: inserted a `## LevelUP notes` section (7 bullets, ending with the line "On any conflict, LevelUP's `ui-standards` and `ionic-mobile-experience` skills win.") directly after the `# Colors` heading, followed by a horizontal rule. No upstream line was edited, moved or removed.
2. Added `LICENSE` and this `VENDORED.md`.

The notes override the upstream text where LevelUP differs: Ionic's `primary` names stay at the Ionic layer; each hue is defined once in OKLCH and the hex that `applyBrand.ts` needs is derived from it; the existing `.ion-palette-dark` class and `@theme inline` setup is kept as the one switching mechanism; LevelUP's color meanings (one accent for action and progress, amber for attention with dark text, no red on body metrics) and its literal and contrast checks are added.

## Removals

None. Every file was checked for `allowed-tools` pre-approvals, run-time fetches of instructions, rules or code, `npx`, `pip` or `curl` installs, telemetry or usage beacons, canned greeting or branding lines, trigger-grabbing wording, instructions to commit, push, deploy, install globally or edit agent config (CLAUDE.md, AGENTS.md, settings, hooks), prompt injection or project data sent anywhere, and hidden Unicode (zero-width or bidi controls). Nothing matched, and no file links outside the skill folder.

## Cross-references

- Installed beside this skill, vendored from the same commit under the same names, so these references resolve unchanged: `better-accessibility`, `better-ui`.
- `better-interface` is not installed in LevelUP: upstream's orchestrating review, which `reporting.md` says replaces its severity ladder and format; without it, `reporting.md` applies as written.
- No name needed adjusting: every folder name matches its upstream name.

## Updating

Find the newest commit touching the folder (`gh api "repos/jakubkrehel/skills/commits?path=skills/better-colors&per_page=1" --jq ".[0].sha"`), compare its files with the blobs above, read every changed file under the same checks, re-apply the LevelUP notes, and update both copies and this file.
