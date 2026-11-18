# Vendored: state-machine

| | |
|---|---|
| Upstream | [jakubkrehel/skills](https://github.com/jakubkrehel/skills), by Jakub Krehel |
| Source | https://github.com/jakubkrehel/skills/tree/19ab1fa176a2f28d426567108ff1f3d816af58b1/skills/state-machine |
| Commit | `19ab1fa176a2f28d426567108ff1f3d816af58b1` (committed 2026-11-17, "Resolve contradictions and ambiguity found by cold reads and trials"), the latest commit touching `skills/state-machine` when vendored |
| License | MIT, Copyright (c) 2026 Jakub Krehel. The repo-root `LICENSE` is copied unchanged to `LICENSE`; the skill folder has no license file of its own |
| Vendored | 2026-11-18 |
| Copies | `.claude/skills/state-machine/` and `.agents/skills/state-machine/`, kept identical |

## Files

| File | Upstream blob | Status |
|---|---|---|
| `SKILL.md` | `22ebdfd` | Changed: LevelUP notes added (see Changes) |
| `agents/openai.yaml` | `34ee7c7` | Unchanged |
| `switcher.md` | `06b5bf7` | Unchanged |
| `LICENSE` | `6a067e9` (repo root) | Added, unchanged copy of the repo-root license |
| `VENDORED.md` | | Added (this file) |

Every file in the upstream folder was downloaded at the commit above and read in full. None was skipped: the folder has no binaries, no files over 200 KB and no executable scripts. `agents/openai.yaml` is Codex display metadata (`display_name`, `short_description`) and is kept unchanged. `SKILL.md` keeps its upstream `disable-model-invocation: true`, and `agents/openai.yaml` keeps `policy: allow_implicit_invocation: false`: both stop agents from invoking the skill on their own, so the skill runs only when a user asks for it.

The ui-skills.com snapshot used for triage lacked `switcher.md` and `agents/openai.yaml`; the files it did have are byte-identical to this commit.

## Changes

1. `SKILL.md`: inserted a `## LevelUP notes` section (7 bullets, ending with the line "On any conflict, LevelUP's `ui-standards` and `ionic-mobile-experience` skills win.") directly after the `# State machine` heading, followed by a horizontal rule. No upstream line was edited, moved or removed.
2. Added `LICENSE` and this `VENDORED.md`.

The notes override the upstream text where LevelUP differs: the states route is gated behind `import.meta.env.DEV`, allowed through the `KNOWN` pattern in `src/App.tsx`, never committed, and built as an Ionic page; fixtures come from props or `src/api/mock/`; the LevelUP scan states are listed.

## Removals

None. Every file was checked for `allowed-tools` pre-approvals, run-time fetches of instructions, rules or code, `npx`, `pip` or `curl` installs, telemetry or usage beacons, canned greeting or branding lines, trigger-grabbing wording, instructions to commit, push, deploy, install globally or edit agent config (CLAUDE.md, AGENTS.md, settings, hooks), prompt injection or project data sent anywhere, and hidden Unicode (zero-width or bidi controls). Nothing matched, and no file links outside the skill folder.

## Cross-references

- `break` is not installed in LevelUP: upstream's stress-test harness for one component.
- `interface-review` is not installed in LevelUP: upstream's review of a change, branch or pull request.
- `variant` is not installed in LevelUP: upstream's design-variant picker.
- No name needed adjusting: every folder name matches its upstream name.

## Updating

Find the newest commit touching the folder (`gh api "repos/jakubkrehel/skills/commits?path=skills/state-machine&per_page=1" --jq ".[0].sha"`), compare its files with the blobs above, read every changed file under the same checks, re-apply the LevelUP notes, and update both copies and this file.
