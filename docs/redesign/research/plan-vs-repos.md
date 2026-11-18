# Plan v2 vs the repos

Checked 2026-11-18 (`levelup-frontend` a2c981e, `levelup-backend` ae528aa). §NN is a Plan v2 section. "Core plan" is `docs/superpowers/plans/2026-11-13-levelup-core.md`. "Prisma" is its planned model (line 117), as no schema exists.

## High

**H1. Plan v2 builds on a backend that doesn't exist, and the repo docs specify a different one.**
Evidence: `levelup-backend` contains only docs; README.md:9 says "Not scaffolded yet". Those docs specify Prisma + PostgreSQL, Fit ID login and one gym per deployment (backend CLAUDE.md:3, core plan:9, 18, 23). §18–19 instead specify MongoDB + Mongoose, shared Zod in a pnpm + Turborepo monorepo, BullMQ, R2, FCM and WhatsApp OTP.

None of the 25 endpoint operations in §19 exists, not even in the app's mock (`src/api/mock/server.ts:304-330` serves 11 other routes):
- `POST /auth/otp`, `POST /auth/verify`
- `GET|POST|PATCH /orgs/:id/members`, plus `/members/import`
- `…/scans/preview`, `…/scans`
- `/orgs/:id/imports`, `/imports/:id/rows[/:row]`
- `PATCH /scans/:id/move`, `DELETE /scans/:id`
- `/me/timeline`, `/me/places`, `/scans/compare`, `/me/access/:orgId`, `/me/export`, `DELETE /me`
- `/orgs/:id/due-rescan`, `/flags`, `/leads` (GET and PATCH), `/stats`, `/audit`

The gym dashboard has no repo.

Fix: Pick one spec before week 3; update every doc. I'd keep PostgreSQL + Prisma, because §19 is relational and a JSONB `raw` column can hold machine-specific fields. I'd also keep the two-repo OpenAPI contract (core plan:37). Decide where the dashboard lives.

**H2. Plan v2 is one app for many gyms, keyed by phone number. The repo is one gym per build, keyed by a front-desk Fit ID.**
Evidence:
- core plan:23 says "single-tenant… no gymId column".
- `src/brand.config.ts:54-56` fixes the gym logo at build time.
- `Login.tsx:59-60` sends `{fitId}`.
- `src/api/types.ts` has no org, branch, device or phone field.
- Staff (§14, §20) need individual identities, but §19 has no Staff model, and the repo plans one shared `x-staff-key` (core plan:206).

Fix: Identify members by phone, put `orgId` on every record, and serve gym branding from the API. Add a `Staff {orgId, role, phone}` model with its own login. Specify which logo a member of several places sees, and how login knows the gym (a QR code carrying `Org.code`?).

**H3. Each data layer drops InBody fields that Plan v2 features need.**
All four layers keep weight, SMM, BFM, PBF, TBW, visceral fat level and BMR. Only the example has FFM, VFA, phase angle and impedance.

| Fields | InBody example | §19 `Scan` | `AssessmentDto` | Prisma |
|---|---|---|---|---|
| Protein, minerals, BMI | yes | no | yes | yes |
| ICW, ECW, ECW/TBW | yes | yes | no | no |
| Score | from machine | from machine | computed | computed |
| Segmental lean | yes | yes | only if fat also present | no |
| Segmental fat | no | yes | required with lean | no |
| Normal ranges | JSON only | no | no | no |
| Device, branch | model, JSON only | yes | no | no |
| Conditions, source | no | yes | no | no |

What breaks:
- The body map needs segmental lean. The DTO accepts it only with segmental fat (types.ts:127-130), which the example lacks, so `segments` stays null (docs/inbody/README.md:27).
- The DTO has no data for the ECW/TBW flag (§21) or the different-machine rule.
- Plan v2 drops protein and minerals, which the weight ring uses (`Progress.tsx:71-76`).
- The DTO requires every value (types.ts:98-114), but typed entry (§17) has only 4.
- The app's derived ranges are adult-only (`src/body/standards.ts:16-17`), so there is no source for §21's youth ranges.

Fix: Use one scan contract in every layer:
- nullable values, with lean and fat segments each optional;
- ICW/ECW, protein, minerals, device, branch, source and conditions;
- the machine score and the computed score kept separate;
- the raw row kept as well.

Check whether real exports carry range columns (unverified).

**H4. The flagship example is impossible on an InBody sheet.**
Evidence:
- The hook (§01, §07) says fat % stayed the same while muscle rose 1.1 kg and fat fell 0.9 kg. Fat % is fat ÷ weight, so when fat falls and lean mass rises, fat % must fall.
- §12's own masses give 23.5% → 22.4%, not 22.6 → 22.4.
- §11–12 also treat SMM as all of fat-free mass: +0.2 = +1.1 − 0.9. In the plan's scans and in the example JSON, SMM is about 57% of fat-free mass. So +1.1 kg SMM means about +1.9 kg lean and +1.0 kg weight.
- Once fat % is corrected, §16's Recomposition rule (fat % within 0.5) rejects the plan's own example.

Fix: Make the hook "the scale didn't move", using consistent numbers: weight 82.1→82.2, lean 62.8→63.8, SMM 35.7→36.3, fat 19.3→18.4, fat % 23.5→22.4. Drop the fat-% condition. Have a nutritionist check every mock.

## Medium

**M1. §16's rules conflict with the rules the app already runs.**
Evidence:
- Muscle loss starts at 0.5 kg in §16 but at 0.2 kg in the app (`insight.ts:8`, `advice.ts:22`).
- "Within noise" (under 0.5 kg) overlaps Recomposition (over 0.3 kg).
- §16 has no pattern for muscle and fat both rising, fat alone rising, or both falling. `insight.ts` has all three.
- `insight.ts` calls muscle down with fat up "fatGain" (:63-64), so a muscle-loss lead built on it would miss those members.
- §16 lacks `advice.ts`'s range rules, which feed Home.
- The repo has no imbalance, water-noise, machine-change, re-scan, gone-quiet or error-margin rules.
- The rules run in two places: `Progress.tsx:264` also recomputes them on the device.

Fix: Write one table of mutually exclusive patterns in a fixed order, starting from `insight.ts`. Run it only in the API, and return `{key, params}` (`I18nText`, types.ts:197-200).

**M2. The member app's scope differs, and the plan says nothing about the existing features.**
Evidence:
- §11's tabs are Home, Scans, Compare and My account. The repo's are Home, Progress, Goals and Profile (`tabConfig.ts:3-8`).
- §11's Home shows goal progress, but §19 has no Goal model.
- The plan never mentions the splash, onboarding, avatar, Trophy Room, notification inbox, sound or "What to do next" (`LevelUP-Features-Core.md:9-15`).
- My account has no screen.

Fix: Make a keep/cut list before Figma, and settle Goals. Reuse Progress's pickers, `MetricInfo`, `TrendChart` and `ScanHistory`.

**M3. §19 is missing endpoints that its own screens need, and the ones the app uses today.**
Evidence:
- §19 has no endpoints for a single scan or its sheet image, consent, "this isn't my scan", push tokens, the member profile, family profiles, manual entry, phone change or staff.
- The app's current routes are also absent: `/me`, `/me/dashboard`, `/me/progress`, `/me/assessments`, `/me/goals`, `/me/avatar` and the notification routes.

Fix: Add each to §19 or mark it cut.

**M4. The plan gives two different ages for guardian consent.**
Evidence: §20 says under 15. §21 says under 18, and §13 hides share cards under 18. §19 stores only `birthYear`, so neither cut-off can be checked exactly.
Fix: Get one age from the lawyer (I didn't verify Law 151/2020) and store the full birth date.

**M5. The member-app stack in §18 differs from the code, and keeping the code's choices is cheaper.**
- **Charts:** `ui-standards` bans chart libraries (`SKILL.md:95`) and caps each lazy chunk at 80 KB (:89). The SVG `LineChart.tsx` already mirrors for right-to-left. Keep it instead of ECharts.
- **Data fetching:** `useApi` (`src/api/useApi.ts:14-51`) works. TanStack Query would also need a persister for §09's offline last view. Add a Preferences cache to `useApi`.
- **State:** Zustand isn't needed; the app's state lives in Preferences.
- **Motion:** count-ups and reveals use GSAP (`gsapMotion.ts:189, 285`); Motion is in only two files. Keep GSAP and add it to §18.
- **Dates:** `Intl` (`homeText.ts:4-22`) costs no bundle size. Keep it instead of Day.js.
- **Not installed yet:** push, haptics, share, html-to-image, Lottie and `@capacitor/ios` (`package.json:23-43`). Budget for iOS setup.

## Low

- **Mock numbers disagree.** Generate every mock from one dataset.
  - The reveal shows +0.8/−0.5 kg, but the report shows +1.1/−0.9.
  - The score goes 78→80, but the repo's formula (`domain.ts:41-46`) gives 75→77 for §12's scans.
  - The re-scan is due "in 2 days" in §15 but "in 9 days" in §11.
  - The chips add up to 12 without counting "No scan in 63 days".
  - `Lead.status` has no "Reminded" value.
  - Home's +2.1 kg is measured from a manual entry.
- **Segment label:** the app and §13 both call segmental lean "muscle" (`en.json:557`). The segments add up to 53.6 kg, against 36.8 kg of muscle. Call it lean mass.
- **Design vs code:**
  - Bad changes show in red (`Progress.tsx:326`), which §09 rules out.
  - Login shows a spinner (`Login.tsx:168`).
  - Radii are 24/16 (`tokens.css:55-56`), not 20/14 as in §10.
- **Language:** the app defaults to English unless the device is in Arabic (`src/i18n/index.ts:33-41`).
- **Copy:** "Heart problems" (`en.json:662`) breaks §20's no-disease-names rule, and there's no disclaimer.
- **Stale docs:**
  - `levelup-frontend/CLAUDE.md:3, 41` cite `api:types` and `schema.d.ts`; neither exists.
  - Plan v1 (`docs/LevelUP-Business-Plan.md:73`) says multi-tenant, while the core plan says single-tenant.
- **Schedule:** §22 has the first paying venue in month 4, but the 60-day pilots start in week 9.
