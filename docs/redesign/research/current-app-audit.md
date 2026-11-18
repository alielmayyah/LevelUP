# Current member app audit

Discovery for the redesign, 2026-11-18, `levelup-frontend` at `a2c981e`.

**Evidence.** Only 3 of the 13 shots in `docs/business-plan-source/shots/` are current (`dashboard-dark`, `progress-dark`, `profile-dark`). The other 10 show a removed pixel-art build (Community tab, leaderboard, XP), so I didn't audit from them. Instead I captured the app from the mock-data dev server: 82 PNGs in `discovery/screens/` (393×852, light/dark × English/Arabic, 320 and 1280 px, stage personas, loading and error states). Contrast and targets were measured with axe-core in Chromium. Judged from code only: toasts, gestures, animation feel. Not verified: device performance, bundle size; tests not run.

## (a) Inventory

### Screens

| Screen | Route | Purpose |
|---|---|---|
| Splash | `/splash` (`/`, unknown paths redirect) | Logo, 1.6 s loading line, then Intro, Login or Home |
| Intro | `/intro` | 3 first-launch slides |
| Login | `/login` | Numeric Fit ID, errors, language and sound toggles |
| Home | `/tabs/home` | Greeting, avatar, FitScore, top plan item, current goal ("mission"), bell |
| Progress | `/tabs/progress` | Scan picker, weight ring, muscle and fat with change, Your plan. "See full scan" adds 6 metric tiles, compare picker, range bars, body parts, trend chart |
| Goals | `/tabs/goals` | Active and completed kg goals |
| New goal | `/tabs/goals/new` | Metric, ±0.5 kg stepper, Create |
| Profile | `/tabs/profile` | Name, Fit ID, age, height, Edit avatar, best medals, Settings link |
| Settings | `/tabs/profile/settings` | Language, theme, sound, sign out |
| Avatar editor | `/tabs/profile/character` | Skin, hair, eyes, outfit; autosave; no tab bar |
| Trophy Room | `/tabs/profile/medals` | 15 medals (muscle gain, body fat, BMI streak × 5 rarities) |

### Sheets, dialogs, overlays

| Overlay | Opened from |
|---|---|
| Notifications sheet | Home bell |
| Metric explainer (what, why, what to do) | 9 ⓘ buttons on Progress |
| All scans (paged) | Progress header |
| Compare with (paged) | Expanded Progress |
| Scan calendar | Progress date |
| Medal details | Profile, Trophy Room |
| Medal unlocked | Opening Trophy Room |
| Sign-out confirm | Settings |
| Toasts | Goal created, save failed |

**Flows:** Splash → Intro → Login → Home; Home or Goals → New goal → Goals; Profile → Trophy Room → celebration; Profile → avatar editor; Profile → Settings → sign out. Gestures: pull to refresh, swipe between tabs, re-tap tab to scroll up, Android back to Home.

### Non-UI pieces

| Piece | Where | Verdict |
|---|---|---|
| API client, `useApi`, resume/online refresh, 401 sign-out, auth gate | `src/api/client.ts`, `useApi.ts`, `src/auth/*` | Keep |
| DTO types | `src/api/types.ts`, hand-written (no `schema.d.ts` or `api:types` script, despite CLAUDE.md) | Change: add deltas, device ranges, ECW ratio, phase angle, localizable goals |
| Mock server, personas 101/102/103 | `src/api/mock/*` | Keep; add fixtures from `inbody-data-example.json` |
| i18n setup, formatters | `src/i18n/index.ts`, `format.ts` | Keep |
| Strings | `en.json`, `ar.json`: 513 keys each, in sync | Keep the voice; rewrite for the new IA |
| Plan rules, change insight, scan age | `src/body/advice.ts`, `planText.ts`, `age.ts`, `progress/insight.ts`, `scanAge.ts` | Keep; one verdict source shared with the API |
| InBody standards | `src/body/standards.ts` | Change: use the device's ranges |
| Medal rules | `pages/medals/rules.ts`, `config.ts` | Change thresholds, or go |
| Theme plumbing | `tokens.css`, `tailwind.css`, `theme.ts`, `applyBrand.ts`, `brand.config.ts`, `check-colors.mjs` | Keep structure, replace values, drop dead tokens |
| UI kit, page styles | `kit.css` (757 lines); 3,125 CSS/SCSS lines in all | Go (rewrite) |
| Motion | `MotionProvider`, `gsapMotion.ts`, splash and intro motion | Change: keep reduced-motion handling, drop replays |
| Interaction helpers | `roving.ts`, `useSwipe.ts`, `tabGestures.ts`, `Dialog`, `Toast` | Keep; `Pager`, `ScrollStrip` likely go |
| Sound | `src/sound/useSound.ts` | Go, or off by default |
| Avatar | `src/avatar/*`, `Character.tsx` | Keep logic if avatars stay |
| Unit tests | 28 files, about 217 cases | Keep logic tests; rewrite page tests |
| E2E | 12 specs, about 103 tests | Keep fixtures, a11y, login, mobile, journey; rewrite `tabs`, `progress-visuals`, `pages`, `medals` |

Dead code: kit classes `.lu-quick`, `.lu-tier-*`, `.lu-icon-tile`, `.lu-row-button`, `.lu-goal-row`, `.lu-chip-danger`; `formatRank`; the never-rendered `gym.logo` slot.

## (b) The 15 biggest problems, by impact

1. **Home can't answer "did I improve?"** Its biggest element is "91 out of 100": no change, no scan date, no meaning; the DTO carries only `score`. On Progress the verdict ("Stronger and leaner") starts 714 px down an 852 px screen, mostly under the tab bar; deltas above it are 11.5–12.8 px. Evidence: `home-en-light.png`, `progress-en-light.png`, `FitScoreCard.tsx:29-39`, `types.ts:25-26`. Instead: open on the latest scan's verdict, date and key changes; explain the score; send deltas with `/me/dashboard`.

2. **The same number gets opposite verdicts.** Body fat 8.0%: Home says "Keep an eye… under the healthy 10%"; Progress gives the drop a green check while its range bar says "Low"; Trophy Room celebrates "Legendary Shape · Below 12%"; New goal defaults to "Lose body fat", allowing up to 60% of fat mass. Evidence: `home-en-light.png`, `progress-full-tall-en-light.png`, `celebration-en-light.png`, `newgoal-en-light.png`, `Progress.tsx:108`, `advice.ts:72`, `medals/config.ts:36`, `NewGoal.tsx:40,118`. Instead: one range-aware verdict feeding deltas, plan, goals and medals.

3. **The InBody analysis is hidden, then repeated.** Ranges, body parts and composition sit behind "See full scan". Expanded, Progress is 4,128 px (4.8 screens): weight, muscle and body fat appear 4 times each, water and protein 3, as ring, tiles and bars. Evidence: `progress-full-tall-en-light.png`, `Progress.tsx:648-736`. Instead: one scan report, each metric once with value, range and change.

4. **"Normal" isn't the device's normal; most InBody data is unused.** `standards.ts` derives ranges from height and sex: for the 178.5 cm sample, body-fat mass 8.4–16.8 kg versus the device's 10.8–17.2 kg, so the app can contradict the printed sheet. ECW ratio, phase angle, visceral fat area and waist-hip ratio never reach the app. Evidence: `standards.ts:33-47`, `AssessmentDto`, `docs/inbody/inbody-data-example.json`. Instead: store and show device ranges; extend the DTO.

5. **Violet glass is the whole design system.** Lavender page with three radial glows, violet hero, gradient buttons, tab pill and badges, frosted cards (`--lu-glass*` referenced 41 times; 2–9 blurred elements per signed-in screen), and entry screens forced to dark violet with aurora and stars in both themes. Evidence: every capture, `tokens.css:31-41,115-130`, `kit.css:37-50,159-172`, `Intro.scss:118-141`. Instead: a new palette on solid surfaces, color reserved for meaning.

6. **Contrast fails, or can't be checked.** On expanded Progress (light), axe fails the "Healthy" labels at 4.31:1 (`#127a45` on `#d9eae1`, 10.6 px, 8 instances) and can't evaluate 120 more text nodes over glass and gradients. `e2e/a11y.spec.ts:18` audits only collapsed Progress. Skeletons barely show. Evidence: `progress-full-tall-en-light.png`, `loading-home.png`. Instead: opaque token pairs checked to 4.5:1 in both themes; audit expanded states.

7. **Arabic charts run in opposite directions.** Trend cards and chart mirror time, so +4.9 kg muscle draws as a falling line; main-card sparklines and range bars don't mirror. The repo's own rule says don't mirror charts. Evidence: `progress-full-tall-ar-dark.png`, `ProgressCharts.tsx:18`, `LineChart.tsx:86`. Instead: one direction for all charts, with labeled ends.

8. **English and broken Arabic in the Arabic app.** Goal titles are English API strings ("Gain 3 kg of muscle" on Arabic Home, Goals, notifications). Medal values glue a number to "شهر" ("6 شهر"). "+33 سعرة" overflows its tile, the weight change wraps inside the ring, the logo tagline is English. Evidence: `home-ar-light.png`, `goals-ar-dark.png`, `profile-ar-light.png`, `progress-full-tall-ar-dark.png`, `members.ts:59-89`, `medals/format.ts:12`, `ar.json:27`. Instead: goals as structured data through i18n plurals; check Arabic widths.

9. **Dead ends and broken promises.** A member with no scan is offered "Set your first goal", then told a scan comes first. Notifications say "View your latest scan in Progress", but a tap only marks them read. Medal celebrations fire only inside Trophy Room. Evidence: `lina-home.png`, `lina-newgoal.png`, `notifications-en-light.png`, `MissionCard.tsx:42`, `NotificationsSheet.tsx:182`, `Medals.tsx:263`. Instead: stage-aware actions ("Book your first scan"), deep links, celebrations on the scan result.

10. **Four scan pickers for monthly data.** Arrows, date → calendar, "All scans", and a compare picker that pages 6 scans ("Page 1 of 2"). Evidence: `progress-en-light.png`, `calendar-en-light.png`, `compare-en-light.png`, `Progress.tsx:347-357,413-468,622-629`. Instead: one timeline and one "compare to" control defaulting to the previous scan.

11. **Scattered information architecture, two names for goals.** The scan story spans Home, Progress, Goals and Trophy Room; Profile mixes identity, avatar, medals and a small Settings link; Trophy Room sits two levels deep. Home and notifications say "mission", the tab says "Goals". Evidence: `home-en-light.png`, `profile-en-light.png`, `goals-en-light.png`. Instead: structure around the scan (latest result, history, goals, me), one vocabulary.

12. **No type scale; text too small.** Expanded Progress uses 28 font sizes and 69 text elements under 12 px, including 9 px chart axes and 10.6 px range and tab labels. Page titles come from 5 hand-built headers at 5 sizes. Arabic mixes Alexandria titles with IBM Plex Sans Arabic body. Evidence: DOM measurement, `TabPage.tsx:61`, `NewGoal.tsx:144`, `Medals.tsx:223`, `Dashboard.tsx:85`, `Character.tsx:310`. Instead: a 6–7 step scale, 12 px minimum (larger in Arabic), one page header.

13. **Motion delays reading.** FitScore counts up from 0 for 1.2 s on every tab visit; sections replay their entrance each visit; every press springs elastically; the splash holds 1.6 s per cold start; CSS keyframes, Motion and GSAP all run. Reduced motion is respected. Evidence: `gsapMotion.ts:46-78,187-272,285-299`, `Splash.tsx:15`. Instead: numbers static on arrival, short transitions, no splash hold.

14. **Generic loading and error states.** An error is one line plus Retry, with no cause (offline or server), and Home loses its greeting; skeletons are faint. The 50×30 px sound switch is the only control under 44 px. Evidence: `error-home.png`, `loading-home.png`, `Settings.tsx:57-68`. Instead: a designed state per stage, offline vs server copy, visible skeletons.

15. **Login doesn't say where a Fit ID comes from.** The helper line was removed, so first-timers find out only after a failed try. Evidence: `login-en-light.png`, `login-error-en.png`, `Login.tsx:140-158`. Instead: a permanent hint under the field.

## (c) Worth keeping

- The Egyptian Arabic voice; keys in sync; Latin digits and bidi isolation (`format.ts`); logical CSS; mirrored layout, arrows and tab order.
- The data layer: `api()`, `useApi` (keeps data when a refresh fails), refresh on resume and reconnect, 401 sign-out, and the no-scan, one-scan and six-scan personas.
- Partial-data rules: `null` means "not yet"; changes wait for a second scan.
- Plain-language content: metric explainers, `insight.ts` change classes, plan items quoting the member's own numbers.
- Low / Healthy / High range tracks and the body-part view, as concepts.
- Theme plumbing: tokens mapped into Tailwind `@theme`, `check-colors`, System/Light/Dark, `applyBrand` contrast picking.
- Mobile and accessibility basics: 44 px targets, arrow-key radio groups, native `<dialog>` sheets closing on Escape and Android back, safe areas, reduced motion, no horizontal overflow in any of 73 captures (320–1280 px).
- The test harness: e2e fixtures, the axe sweep, logic unit tests.
