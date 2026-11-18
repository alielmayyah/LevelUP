# Vendored: interface-design

| | |
|---|---|
| Source | https://github.com/Dammyjay93/interface-design/tree/890d9295acdaf57891a20dc2499abfb4b8529784/.claude/skills/interface-design |
| Commit | `890d9295acdaf57891a20dc2499abfb4b8529784` (2026-06-20, "Refocus skill on visual hierarchy; replace commands with design-review + design-deslop"), the latest commit touching `.claude/skills/interface-design` |
| License | MIT, Copyright (c) 2026 Damola Akinleye. From the repo's root `LICENSE`; GitHub's license API reports MIT. |
| Vendored | 2026-11-18 |

## Files

| File | Upstream file and blob | Status |
|---|---|---|
| `SKILL.md` | `SKILL.md`, `92e1df4eb5ca30923149c60f142db7ebeaaad334` | Modified, see Changes and Removals |
| `agents/openai.yaml` | `agents/openai.yaml`, `69138eaaf2083d18e130d6742be141491bc60275` | Unchanged |
| `LICENSE` | repo root `LICENSE`, `fe236841aef0a6abe04284f0cfcb3630e7393725` | Copied in, text unchanged |
| `VENDORED.md` | none | Added |

Every upstream file was downloaded at the commit above and checked against its git blob hash. None is executable or binary.

## Changes

1. `SKILL.md`: added a `## LevelUP notes` section right after the `# Interface Design` title, followed by a `---` rule that separates it from the original text.
2. `SKILL.md`: one removal, listed below.
3. Copied the repo's root `LICENSE` into the folder.
4. Added this file.

No other line of `SKILL.md` was changed.

## Removals

1. **Paintover mode** (Workflow → Execution discipline, step 3). Removed `**paintover** (a stronger version of an existing screenshot), ` and changed "Four modes" to "Three modes". The mode has the agent send a screenshot of the existing app to whatever image-generation tool is attached, which in Claude Code means a third-party server: project data leaving the machine without being asked for. The prompt-only modes (direction board, UI reference, raster asset) stay.

## Kept after review

- `agents/openai.yaml`: Codex display metadata. Its `policy.allow_implicit_invocation: true` lets Codex choose the skill from its description, as skills normally are; it pre-approves no tools. Its `default_prompt` mentions image-based references, which the remaining prompt-only modes still cover.
- "Render It When You Can": it renders specimens in the conversation through the host's own tool and uploads nothing from the project.
- The offer to save patterns to `.interface-design/system.md`: it asks first and writes inside the project. The LevelUP notes point it at `ui-standards` instead.

## Not vendored

Everything outside the skill folder. That includes the plugin's `.claude/commands/design-review.md` and `.claude/commands/design-deslop.md`, which the skill's "Commands" section names as `/interface-design:design-review` and `/interface-design:design-deslop` (the LevelUP notes say they are not installed), and `.claude-plugin/`, `.githooks/pre-commit`, `reference/`, `website/`, `README.md` and `.github/FUNDING.yml`.

## Updating

Find the latest commit touching `.claude/skills/interface-design`, diff its files against the blobs above, take the upstream changes, and re-apply the changes listed here.
