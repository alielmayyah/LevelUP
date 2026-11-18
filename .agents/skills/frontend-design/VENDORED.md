# Vendored: frontend-design

| | |
|---|---|
| Source | https://github.com/anthropics/skills/tree/41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f/skills/frontend-design |
| Commit | `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f` (2026-09-03, "Update frontend-design skill to avoid generic design defaults (#1713)"), the latest commit touching `skills/frontend-design` |
| License | Apache-2.0, from the skill folder's own `LICENSE.txt` (here `LICENSE`). The repo has no root license: GitHub's license API returns 404. |
| Vendored | 2026-11-18 |

## Files

| File | Upstream file and blob | Status |
|---|---|---|
| `SKILL.md` | `SKILL.md`, `a5333457c414d20d625f307df945842c0952ecc3` | Modified, see Changes |
| `LICENSE` | `LICENSE.txt`, `f433b1a53f5b830a205fd2df78e2b34974656c7b` | Renamed, text unchanged |
| `VENDORED.md` | none | Added |

Every upstream file was downloaded at the commit above and checked against its git blob hash. None is executable or binary.

## Changes

1. Renamed `LICENSE.txt` to `LICENSE`, so every vendored skill keeps its license in `LICENSE`. The text is unchanged.
2. `SKILL.md` frontmatter: `license: Complete terms in LICENSE.txt` became `license: Complete terms in LICENSE`.
3. `SKILL.md`: added a `## LevelUP notes` section right after the `# Frontend Design` title, followed by a `---` rule that separates it from the original text. Its first line is the notice of modification that Apache-2.0 section 4(b) requires.
4. Added this file.

No other line of `SKILL.md` was changed.

## Removals

None. A full read found no `allowed-tools`, no run-time fetching or installs, no telemetry, no greeting, branding or promotional lines, no trigger-grabbing wording, no instructions to commit, push, deploy or edit agent config, and nothing that sends project data anywhere.

## Not vendored

- `THIRD_PARTY_NOTICES.md` at the repo root. It covers software (imageio, imageio-ffmpeg, FFmpeg, Pillow) and fonts bundled with other skills in that repo, none of which is part of this skill. The skill folder has no NOTICE file.

## Updating

Find the latest commit touching `skills/frontend-design`, diff its files against the blobs above, take the upstream changes, and re-apply the changes listed here.
