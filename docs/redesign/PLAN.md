# LevelUP redesign plan

**Status: latest plan (18 November 2026).** It supersedes the member-app parts of the Business & Technical Plan v2 (`docs/LevelUP-Business-Technical-Plan-v2.pdf`), `LevelUP-Features-Core.md`, and the core and sprint-1 plans in `docs/superpowers/plans/` wherever they disagree. Those stay for history and for the business side.

It comes from a discovery phase. Fifteen research agents read Plan v2 (PDF and text), Plan v1, both repos, the InBody example, the current app (82 fresh screenshots, kept outside the repo), how other apps show body-composition data, and all 804 skills on ui-skills.com. Three rounds of visual directions followed. The full reports are in `research/`, `skills-digest/` and `directions/` next to this file.

## Bottom line

- **Build the app around three answers:** "did I improve?" (a sentence, then the change), "what does this number mean?" (value on its normal range), and "what do I do next?" (one action, often "talk to your coach"). Today's Home shows a score with no meaning, and the scan analysis is hidden, then repeated over almost five screens.
- **The data rules need fixing before the design.** On an InBody 770, a change is only real at about 0.9 kg of muscle and 1.5 kg of fat. The app calls 0.2–0.3 kg real, and Plan v2 calls 0.3–0.5 kg real. Single-month changes will mostly read "about the same", so the app must lean on trends since the first scan. This also changes the sales pitch.
- **Plan v2's flagship example can't happen.** Fat % can't stay flat while fat falls and lean mass rises. Fix it before pitching.
- **The backend doesn't exist yet**, so switching to Plan v2's phone login and multi-gym model costs nothing now. Use PostgreSQL + Prisma, not MongoDB.
- **19 curated UI skills** are in the repo (`.claude/skills/`, mirrored to `.agents/skills/`), pinned to fixed commits and adapted to LevelUP. Dozens more were rejected as unsafe.
- **The look:** a dark app in the logo's violet, re-colorable per gym, with icons throughout and a signature visual on every screen. The UI concept is a mix of two round-3 mockups: Story's card feed and Level Journey's road and levels.

## Decisions

The owner asked for the recommended option on each, except 7 and 16, which they set themselves. Override any of them.

| # | Decision | Chosen | Why |
|---|---|---|---|
| 1 | App structure | **Home · Scans · Compare · Account** (Plan v2) | Everything centers on scans. The current four tabs split the scan story across Home, Progress, Goals and the Trophy Room. |
| 2 | Goals | **One active goal, shown on Home**; history in Account; no Goals tab | Plan v2 shows a goal bar on Home. A goal can only be set after the first scan. |
| 3 | Cartoon avatar | **Remove** | Not in Plan v2, unrelated to the scan data, and expensive to maintain. Account shows initials. |
| 4 | Medals and Trophy Room | **Replace with scan milestones**: records, streaks of real improvement, on-time re-scans | Shown in the new-result reveal and listed in Account. Today's medals contradict the app's own ranges (they celebrate 8% body fat as "Legendary", while Home warns about it). |
| 5 | Headline score | **Verdict sentence first; no FitScore** | Show the machine's printed InBody Score as a detail, only when present. The app's own formula disagrees with the sheet (79 vs 83 on the example). Never celebrate a change under about 3 points. |
| 6 | Login | **Phone number + one-time code** (WhatsApp, SMS fallback) | Scans the gym saved under the number appear at first login, and the history follows the member across gyms. The frontend runs against the mock server until the backend exists. |
| 7 | Branding | **Per-gym brand color on LevelUP's dark look**, plus the gym's logo | Set by the owner. Only the brand layer (buttons, active tab, hero, gradient) follows the gym; the meaning colors never change. Default brand is LevelUP violet. See "Design system" below. |
| 8 | Gyms and data model | **Many gyms, keyed by phone**; gym, branch and machine on every scan | Plan v2 needs it for history across places and the "different machine" rule. |
| 9 | Backend | **PostgreSQL + Prisma, two repos, OpenAPI contract** | Plan v2's data is relational. A JSON column keeps each machine's raw export. |
| 10 | Member-app libraries | **Keep the current ones**: hand-made SVG charts, `useApi` plus an offline cache, GSAP + motion, `Intl` dates | No ECharts, TanStack Query, Zustand, Day.js or Lottie. Add Capacitor haptics, share and push when those features land. |
| 11 | "Real change" thresholds | **Per metric, from InBody 770 test-retest data**: muscle ≈0.9 kg, fat ≈1.5 kg, weight ≈1.9 kg, fat % ≈1.9 points | A smaller change counts only if 3+ scans move one way and the total clears the floor. Otherwise say "about the same" in a neutral color. Trainer leads use the same rule. Tune with repeat scans in the pilots. |
| 12 | Different machine | **Direction only**: no verdict, celebration or lead across machines; no comparison across brands | Machine differences can be bigger than a month of real change. |
| 13 | Normal ranges | **The machine's printed range when present**, otherwise `standards.ts`, one source per scan | Today's derived ranges can contradict the member's printed sheet. |
| 14 | Digits and units | **0–9 in both languages**; "كجم" for kg; numbers wrapped for bidi | Matches the printed sheet and today's formatter. Set the digit system explicitly, because `ar-EG` defaults to ٠–٩. |
| 15 | Arabic charts | **Time runs right to left** (oldest on the right), the same in every chart | The body figure is never mirrored; sides are named in words. Test with prototype members. |
| 16 | Colors | **Dark-first, from the logo** (`#E19CFB` → `#B98CFF` → `#6B3BF5`); brand = actions, selection, hero; fixed green = real improvement; amber (dark text) = needs attention; grey = about the same | Set by the owner. Never red on a body metric. Light mode is still supported. Muscle, fat and water have fixed data colors. |
| 17 | Language | **Arabic by default**, English in settings | Plan v2 is Arabic-first. Today the app falls back to English unless the phone is set to Arabic. |
| 18 | Sound and intro | **Remove sound effects** (haptics instead); **drop the three intro slides** | Login carries the pitch. The splash only covers real loading. |
| 19 | Guardian consent age | **Open: ask the lawyer**; store the full birth date | Plan v2 says both 15 and 18. |

## Design system

History: round 1 (six non-brand palettes) was rejected. Round 2 (four dark logo variants) stopped on server timeouts, and the owner then asked for one shared palette with richer UI. Round 3 is four UI concepts on that palette: `directions/round-3/index.html`.

**Palette** (tokens in `directions/round-3/BRIEF-3.md`):
- **Neutrals (fixed):** `#0C0A14` background; surfaces `#15121F`, `#1D1929`, `#26213A`; border `#2E2843`; text `#F4F2FA`; muted `#A9A3BF`.
- **Brand layer (per gym):** `--brand`, `--brand-strong`, `--brand-soft`, `--brand-tint`, `--on-brand`, `--brand-gradient`. Default: `#8B5CF6`, `#6B3BF5`, `#B98CFF`, `#2A1F4D`, white, and the logo gradient.
- **Meaning layer (fixed):** good `#4ADE9A`; attention `#FFC857`; stable `#8B8AA3`; muscle `#5B9CFF`; fat `#F2A65A`; water `#3FD0E0`; fat-free `#C9C3E3`.

**Fixes all four round-3 agents measured** (build them into the tokens):
- White text on `--brand` is 4.23:1, so filled buttons use `--brand-strong` (5.88:1) and brand-colored text uses `--brand-soft`.
- The gradient can't carry white text: use a dark label (`#0C0A14`) or keep it to rings, arcs and the wordmark.
- `--text-faint` (`#6F6987`) is not a text color, only lines.
- Each gym's `--on-brand` (white or dark) is chosen automatically by contrast. White fails on orange `#FF6A1A` and teal `#12B5A6`.
- Gym onboarding flags any brand color within about 30° of hue of a meaning color. Brand color never draws body data, and every data color comes with an icon and a word.

**UI bar** (owner feedback: round 1 was "really basic, no icons, nothing special or unique"):
- icons throughout (Lucide)
- one signature visual per screen
- layered surfaces and rich data viz
- a greeting header with initials and the gym badge
- a polished tab bar
- milestones with personality

No frosted glass, no aurora.

**Chosen concept: a mix of Story and Level Journey** (owner, 18 November 2026). Story gives the structure: Home is a feed of cards, each with an icon header and exactly one action. Level Journey gives the meaning and the delight: progress is a road with a stamped stop per scan, and real body changes earn levels.

- **Signature visual: the road.** One shape across the app, merging Story's arc and Journey's road: a true date axis (oldest on the right in Arabic), a stamped stop per scan, today highlighted, the next scan dashed at the end. It uses the brand gradient and never carries text.
- **Home:** a hero card with the level emblem, the verdict sentence and the road. Below it, Story's feed: body today (weight as fat + fat-free mass), the latest milestone or badge, the next stop (book the re-scan, with test conditions), and the coach. The one filled button is the next stop.
- **Scan report:** opens with Journey's passport stamp (stop number, gym, machine, time), then Story's report: headline, weight split, each value as a dot on its normal band with one word, extra numbers behind "more numbers".
- **Scans tab:** Story's two trend lanes (muscle and fat) on one true date axis with the grey noise band, plus Journey's level flags where a line leaves the band. Below, the timeline of stop cards, the next stop dashed on top.
- **Body balance:** the shared unmirrored figure (lean mass, sides named in words) with Journey's balance beams shading the ±2% balanced zone. Imbalance only after two scans.
- **Compare:** before on the right, after on the left, machine match first. Each row gets a noise meter; changes inside it read "about the same" in grey. The last card hands the news to the trend.
- **New-result reveal:** Story's three beats (verdict, the main change on the road, the milestone) staged as Journey's level-up: the road slides in, the emblem lands, the haptic fires once. Only a same-machine change beyond the noise plays it. A flat scan gets a quiet "on the way" stamp instead.
- **Account:** Story's grouped card lists with Journey's badges: earned badges in their data color, the next one as a dashed outline stating its real-change rule.
- **Levels (from Journey):** each level is one real change since the first scan: muscle up by about 0.9 kg or fat down by about 1.5 kg. Smaller changes count only when 3+ same-machine scans move one way and the total clears the floor. Nothing is earned across machines, for weight loss alone, or for anything done in the app (opening it, logins, taps). The next level is stated as a body target ("muscle +0.9 kg more"), never as a progress bar. Levels never go down on screen; a later loss shows in the verdict and the trend in neutral or amber words.
- **Icons:** Lucide at about 1.85–1.9 stroke in tinted rounded tiles; badge glyphs drawn on the same 24 px grid and stroke.
- **Buttons:** the default filled button is solid `--brand-strong`. Gyms whose brand fails white text (Iron Box, Pulse Gym) get a dark `--on-brand` and may use the full gradient on the button.
- **Fonts:** Readex Pro for text (Arabic and Lexend Latin, both geometric, next to the logo). Readex Pro has no tabular figures (no `tnum`; digits 500–620 units wide), so standalone numbers use Alexandria, already in the app, with `tabular-nums`. IBM Plex goes.

## What the InBody data requires

From `inbody-data-map.md`:

- **On Home and in the reveal:** the verdict sentence; muscle and fat change; weight shown as fat plus fat-free mass (never muscle plus fat; they don't add up to weight).
- **On the scan report:** weight, muscle, fat, fat %, visceral fat and body water, each as a dot on its normal range with one word ("طبيعي", "أعلى شوية"). Protein, minerals, BMI, BMR, ECW ratio and phase angle sit behind a tap.
- **Body balance:** segmental lean mass on a body figure with % of the ideal and the left/right gap. Call it "lean mass", not "muscle" (the segments add up to 54 kg, against 36 kg of muscle). Flag imbalance only after two scans.
- **Staff only or hidden:** identity fields, ICW/ECW, impedance, body cell mass, waist-hip ratio. Never show the machine's own status labels; the app names zones itself.
- **Medical care:** ECW ratio, phase angle and visceral fat get "fitness information, not diagnosis" wording. "Consider talking to a doctor" appears only after two high ECW readings in a row. No disease names. The current app's "Heart problems" copy has to go.
- **Data contract:** add optional `origin` (source, trust, machine, place, test conditions, sheet image), `ranges`, `extra` (FFM, ECW ratio, phase angle, visceral area…) and separate `segmentalLean` and `segmentalFat`. Today `segments` needs both, so this lean-only example would send `null` and the body map would be empty.
- **The example file has four errors:**
  - BMR should be 1730, not 1745.
  - The score by the app's method is 79, not 83.
  - The ranges fit a 180 cm man, not 178.5 cm.
  - The JSON and CSV times differ by the Cairo time zone.

  Get one real export from a gym before the import is built; Plan v2 says the CSV column names are still unknown.

## Plan v2: what to fix

From `plan-vs-repos.md` and `plan-pdf-v2.md`:

- **The hook is impossible.** "Same fat %, +1.1 kg muscle, −0.9 kg fat" can't happen: fat % must fall when fat falls and lean mass rises. The mockups also treat muscle as all of the lean mass (it's about 57% of it).
  - Under the new thresholds, a one-month +0.6 kg muscle / −0.9 kg fat change is within noise anyway.
  - Pitch a 3-month, 3-scan trend instead, for example muscle +1.0 kg and fat −2.3 kg since the first scan, and have a nutritionist check every mock.
- **The stack section describes a different backend** (MongoDB, Turborepo) from the repo docs, and none of its 25 endpoints exist. It also misses the endpoints for a single scan, consent, "this isn't my scan", push tokens, profiles and staff.
- **The explanation rules overlap.** "Within noise" (under 0.5 kg) overlaps "recomposition" (over 0.3 kg), and three cases are missing (muscle and fat both rising, fat rising alone, both falling). Rewrite them as one ordered table, run only in the API.
- **Inconsistencies inside the plan:**
  - Guardian consent at 15 vs 18.
  - Muscle drawn in three different colors.
  - Progress drawn in green, although amber is called the accent.
  - The share card promises "never weight" but prints "same weight".
  - Mock numbers that disagree between screens.
  - "$25–85" in one place vs "$25–150" in another.
- **Never mocked:** Account, consent, light mode, English, the tap-to-explain sheet, and the empty, loading and error states. The redesign has to design these from scratch.

## Current app: what's broken, what to keep

From `current-app-audit.md`. The 15 biggest problems, by impact:

1. Home can't answer "did I improve?"
2. The same number gets opposite verdicts on different screens.
3. The analysis is hidden, then repeated (Progress is 4.8 screens long).
4. The app's "normal" isn't the machine's normal.
5. The design system is violet glass: 41 glass references, up to 9 blurred elements per screen.
6. Contrast fails, or can't be checked over glass.
7. Arabic charts run in opposite directions.
8. English and broken Arabic appear in the Arabic app.
9. There are dead ends: a "set a goal" button before any scan exists, and notifications that don't open anything.
10. There are four different scan pickers.
11. The information architecture is scattered.
12. There's no type scale: 28 font sizes, 69 text elements under 12 px.
13. Motion delays reading: count-ups replay on every visit, and the splash holds for 1.6 s.
14. Loading and error states are generic.
15. Login never says where the Fit ID comes from.

**Keep:**
- the Egyptian Arabic voice (513 keys, in sync)
- the data layer (`api()`, `useApi`, refresh on resume, 401 sign-out)
- the mock personas
- the "null means not yet" rules
- the metric explainers and change classes
- the theme plumbing (with new values)
- the 44 px targets, safe areas and reduced-motion handling
- the test harness

The kit CSS (757 lines) and the page styles will be rewritten.

## Patterns to adopt

From `ux-patterns.md`, all sourced:

- **One personal verdict sentence**, judged against the member's own history.
- **Values as dots on a shaded normal band.** Tables make near-normal results look alarming.
- **Weight split into fat and fat-free mass.**
- **An unmirrored body figure.**
- **"Stable" for changes inside the noise.**
- **Two scans side by side** with the change worked out. Grey out changes inside the noise.
- **Test conditions in the reminder:** "3 hours after eating, no workout, same time as last time".
- **Celebrate records and streaks, never weight loss alone.**
- **Share the change, never the weight**, with per-field toggles and a "hide my weight" mode.
- **Sparse trend charts:** a dot per scan on a true date axis, a fixed scale, dashed lines across gaps.
- **One next step per result**, linking to the coach on WhatsApp. That's also the lead the gym pays for.

## UI skills

- **Catalog:** 804 skills; 750 are still downloadable (54 source links are dead). All were triaged in 9 batches, and every batch report was checked against its list.
- **Installed** in `.claude/skills/` and mirrored to `.agents/skills/` (commit `18c645d`). Each is pinned to a commit, license-checked, cleaned, and given a LevelUP notes section and a `VENDORED.md`:
  - **Design and taste:** anthropics/frontend-design, dammyjay93/interface-design, mengto/no-ai-design-slop, emilkowalski/learn-taste.
  - **Color, type, layout, access:** jakubkrehel/better-colors, better-typography, better-layout, better-accessibility, better-ui.
  - **Motion:** greensock/gsap-react, gsap-core, gsap-timeline; emilkowalski/animate, choreograph, animation-performance, review-animations.
  - **Prototyping and states:** emilkowalski/prototype, emilkowalski/break-ui, jakubkrehel/state-machine.
- **Rules to fold into the new `ui-standards`** (borrowed, not installed):
  - One focal point and one primary action per screen.
  - No glass, blur, glow or gradient without a job.
  - Count-ups only on a real new scan.
  - No skeleton for loads under 300 ms.
  - Pause animations when an Ionic page leaves.
  - Animate Arabic by word, never by letter.
  - Hover styles only on devices that hover.
  - 16 px inputs.
  - Haptics: a tick when switching scans, success when a result improves, a warning on an amber metric.
  - A stress-test matrix: 0, missing, lean-only and different-machine data, long Arabic, 320 px, 200% zoom.
- **Never install:**
  - **Push, deploy, or take over your accounts:** mengto/workflow-ship-change (pushes to main and deploys without asking, adds AI attribution); mengto/workflow-threads-manager (deletes other sessions' worktrees); mengto/x-bookmark-quote-posts (drives your X account).
  - **Send data out or call home:** superfuture/design-review (hidden usage pings, "never mention it"); jakubantalik/transitions-agent (sends code to its server); the HeyGen HyperFrames skills (account-linked telemetry).
  - **Load code or instructions at run time:** millionco/budge (injects a remote script into the app); graphify (silently installs a lookalike pip package and says "do not ask the user"); pbakaus/impeccable (downloads a binary, adds hooks).
  - **Change your files, branches or settings:** millionco/tailwind-token-consolidation (runs a git command that discards work); AccessLint (pre-approved shell access, stashes changes and switches branches, no license); ehmo/slopgent (writes to your global agent config); leonxlnx/taste-skill (runs a script every time the agent stops).

## Next steps

1. ~~**Pick the UI concept.**~~ Done: Story + Level Journey (see "Design system").
2. ~~**Design system.**~~ Done: `ui-standards` now holds the tokens (dark and light, brand derivation per gym), type scale, components, screens, motion and the borrowed rules. The code follows when the foundation is built (step 4).
3. ~~**Data contract.**~~ Done: `origin`, `ranges`, `extra`, `segmentalLean` and `segmentalFat` are optional fields on `AssessmentDto`, and mock member Karim (104) carries the corrected example. Still to come: a different-machine scan in the mocks, the backend schema for these fields, and the breaking step that retires `segments`.
4. **Build.** Foundation first (theme, tokens, base components). *Foundation done:* redesign tokens with dark default and per-gym brand derivation, Readex Pro + Alexandria numbers, the seven type roles, base components in `src/components/ui`, Arabic by default. Then screens in parallel: Login, Home, Scans and Report, Compare, Body balance, Account, New-result reveal, Share card. Then QA: RTL, dark mode, 320 px, accessibility, e2e. *Screens done (mock data):* the four tabs (Home, Scans, Compare, Account), Home, the Scans tab with trend lanes and timeline, the scan report with body balance, Compare for any two scans, the new-result reveal, and Account. Still to do: Login (phone + code), the share card, haptics, and the docked tab bar. The old screens (Progress as "full details", the profile with character and medals, FitScore, sound, the glass tokens) are kept in the code on purpose and stay reachable.
5. **Docs.** Update `LevelUP-Features-Core.md`, CLAUDE.md and AGENTS.md (they mention an `api:types` command and a `schema.d.ts` file that don't exist), and the backend README. Fix Plan v2's hook and mock numbers.

## Reports

Next to this file:

| File | What |
|---|---|
| `research/plan-pdf-v2.md` | Plan v2 read page by page, mockups described, requirements checklist |
| `research/plan-v1-vs-v2.md` | What changed between the plans, and the decisions that raised |
| `research/plan-vs-repos.md` | Plan v2 checked against the code and data, with fixes |
| `research/inbody-data-map.md` | Every InBody field: role, screen, wording, real-change threshold, DTO proposal |
| `research/current-app-audit.md` | Inventory, the 15 biggest problems, what to keep |
| `research/ux-patterns.md` | 14 sourced patterns and an avoid list |
| `skills-digest/*.md` | Every one of the 804 skills rated, with top picks and red flags |
| `directions/round-1/` | The six rejected palettes and the briefs |
| `directions/round-3/` | The four UI concepts on the shared palette, and its brief |

Kept outside the repo (too large, or third-party): the audit's 82 screenshots and the downloaded skills library, in `LevelUP/discovery/` next to the two repos.
