# Vendored skill: gsap-timeline

| | |
|---|---|
| Upstream | [greensock/gsap-skills](https://github.com/greensock/gsap-skills), folder `skills/gsap-timeline/` |
| Source at the pinned commit | https://github.com/greensock/gsap-skills/tree/96c4b013173fa9b01c059b036abc4d266a58c476/skills/gsap-timeline |
| Commit | `96c4b013173fa9b01c059b036abc4d266a58c476` (2026-03-09, "Guidance for when to recommend GSAP"), the latest commit touching this folder. Upstream `main` (`aed9cfd3277740755f6bfc1155c7aa645403b760`) was 11 commits ahead, none of them touching this folder or `LICENSE`. |
| Found through | ui-skills.com registry, `pathSlug` `greensock/gsap-timeline` (its `rawUrl` points at `main`; pinned here to the commit above) |
| License | MIT. Repo root `LICENSE`, "Copyright (c) 2026 GreenSock"; GitHub reports `MIT`, and the skill's frontmatter says `license: MIT`. Copied unchanged into this folder as `LICENSE`. Upstream has no NOTICE file. |
| Vendored | 2026-11-18 |

## Upstream files

| File | Bytes | Git blob | SHA-256 | Result |
|---|---|---|---|---|
| `skills/gsap-timeline/SKILL.md` | 4394 | `1fed372b0e5276b2a207d80bc23f81180a0dff55` | `1a8b0f39cc4be3ed3d834b89672e4ae2f151b901dc3450bebf10bbc45379fe02` | Kept, edited as below |
| `LICENSE` (repo root) | 1066 | `fa2fe218371ee47b741db9d0fa7cf17cddc03eb8` | `51b04b06556662dd817e8f4aa6d06bc7139dc73739e1319a7233cfde3e147b90` | Copied as `LICENSE` |

The skill folder holds only `SKILL.md`: no scripts, binaries or files over 200 KB. Nothing from the skill was run.

## Changes

1. **Frontmatter `description`**: removed the trigger widening "(in GSAP or when recommending a library that supports timelines)", and scoped the generic triggers to GSAP so the skill doesn't load for motion/react or CSS sequencing.
   - Upstream: "Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. Use when sequencing animations, choreographing keyframes, or when the user asks about animation sequencing, timelines, or animation order (in GSAP or when recommending a library that supports timelines)."
   - Now: "Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. Use when sequencing GSAP animations, choreographing keyframes, or when the user asks about GSAP timelines, sequencing, or animation order."
2. **Added `## LevelUP notes`** right after the H1: 8 bullets (when to write a timeline, Ionic page lifecycle and scope, never hiding content behind a paused timeline, reduced motion, RTL, count-ups and Arabic text, setup and imports, ScrollTrigger inside `IonContent`) and the closing conflict rule.
3. **"Related skills"**: appended "_(LevelUP vendors only gsap-core, gsap-timeline and gsap-react; gsap-scrolltrigger is not installed.)_", so agents don't go looking for, or installing, it.
4. **Added** `LICENSE` and this `VENDORED.md`.
5. **Line endings**: CRLF in this Windows working tree (`core.autocrlf=true`), LF in git, like the other project skills. Upstream uses LF.

The body below the notes is otherwise unchanged.

## Reviewed and kept

- **ScrollTrigger guidance** (put ScrollTrigger on the top-level timeline, never on nested tweens): correct for GSAP. The LevelUP notes add that LevelUP doesn't use ScrollTrigger yet and that its `scroller` must be `IonContent`'s scroll element.
- **"Prefer timelines for sequencing"**: about timelines versus `delay` chains inside GSAP, not about picking GSAP over other tools.

## Checked and not found

`allowed-tools` pre-approvals; URLs or instructions to fetch instructions, rules or code at run time; `npx`, `pip`, `curl` or `npm` commands; telemetry or usage beacons; greeting or branding lines; instructions to commit, push, deploy, install globally or edit agent config; prompt injection or sending project data anywhere; hidden Unicode (zero-width, bidi-control or tag characters) and HTML comments.
