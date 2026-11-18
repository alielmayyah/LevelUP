# Vendored: no-ai-design-slop

| | |
|---|---|
| Source | https://github.com/MengTo/Skills/tree/321c769739b823de5eb94eb3a52aa1974fe783a2/agent-skills/ui/no-ai-design-slop |
| Commit | `321c769739b823de5eb94eb3a52aa1974fe783a2` (2026-08-28, "Add No Design Slops skills"), the latest commit touching `agent-skills/ui/no-ai-design-slop` |
| License | MIT, Copyright (c) 2026 Meng To. From the repo's root `LICENSE`; GitHub's license API reports MIT. |
| Vendored | 2026-11-18 |

## Files

| File | Upstream file and blob | Status |
|---|---|---|
| `SKILL.md` | `SKILL.md`, `1562176afd7130e4568409203f459074cea09bdf` | Modified, see Changes |
| `ARTICLE.md` | `ARTICLE.md`, `c25445fb2470218763e3d4a4bf7dbedc43f721c3` | Unchanged |
| `REFERENCES.md` | `REFERENCES.md`, `2a7a768cdafe3430728e751ac02dd5c932b72aa7` | Unchanged |
| `agents/openai.yaml` | `agents/openai.yaml`, `14801c5fef75e1d80a68d915d669832b4f2bea36` | Unchanged |
| `LICENSE` | repo root `LICENSE`, `b3a5f823a69b4b010f92930ac09e8a776daf65c6` | Copied in, text unchanged |
| `VENDORED.md` | none | Added |

Every upstream file was downloaded at the commit above and checked against its git blob hash. None is executable or binary.

## Changes

1. `SKILL.md`: added a `## LevelUP notes` section right after the `# No Design Slops` title, followed by a `---` rule that separates it from the original text. It records the owner's authorization to replace LevelUP's current look, adds RTL, theme, 320 px and safe-area gates to the skill's quality gates, and points at LevelUP's local sources.
2. Copied the repo's root `LICENSE` into the folder.
3. Added this file.

No other line of any upstream file was changed.

## Removals

None. A full read of all four files found no `allowed-tools`, no run-time fetching or installs, no telemetry, no greeting, branding or promotional lines, no trigger-grabbing wording, no instructions to commit, push, deploy or edit agent config, and nothing that sends project data anywhere.

## Kept after review

- `REFERENCES.md`: a bare list of 16 links with no instructions: two X posts (the author's and Google Design's), a YouTube video, impeccable.style, getdesign.md, three GitHub repos (two other authors' skills and the author's own), four WCAG 2.2 pages, and NN/g, Material, Apple HIG and GOV.UK pages. Nothing in the skill links to it. Kept for attribution; the LevelUP notes say not to fetch it.
- `ARTICLE.md` credits "the Impeccable slop catalog, the DesignCode anti-slop workflow, and the recurring principles in Meng's design skills". That is attribution, not promotion.
- `agents/openai.yaml`: Codex display metadata only. Its `default_prompt` asks to preserve the product's direction; for LevelUP, the notes' redesign authorization overrides that.
- The description's "Use as a passive quality gate during UI work" states the skill's scope; it is not "always use this skill" wording.

## Not vendored

- The sibling `audit-ai-design-slop` skill, which `SKILL.md` names for review-only requests. The LevelUP notes say it is not installed.

## Updating

Find the latest commit touching `agent-skills/ui/no-ai-design-slop`, diff its files against the blobs above, take the upstream changes, and re-apply the changes listed here.
