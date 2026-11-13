# Sprint 1: Frontend MVP (Mock Data) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend for LevelUP core features 1–16 as a working Ionic app that runs entirely on mock data, with no backend.

**Architecture:** An npm-workspaces monorepo with `apps/mobile` (Ionic React + Vite + Capacitor) and `packages/shared` (DTO types). Every screen calls `api<T>(path, init)`. When `VITE_USE_MOCKS=true`, `api` sends the call to an in-memory mock server, which answers from typed fixtures and keeps state (settings, read notifications, opt-in) for the session. The mock routes and DTOs match the backend contract in the [core plan](2026-11-13-levelup-core.md) Tasks 5–9, so in Sprint 2 the NestJS API replaces the mocks by setting the flag to `false`. No component changes are needed.

**Tech Stack:** Node 22 LTS, TypeScript (strict), Ionic 8 + React 18 + Vite + Capacitor 7, i18next + react-i18next, Chart.js via react-chartjs-2 (lazy-loaded), date-fns, Vitest + Testing Library, Playwright.

**Spec:** [LevelUP-Features-Core.md](../../../LevelUP-Features-Core.md). Features 1–16 are in scope. Feature 17 (Backend API) is Sprint 2.

**Tracking:** ClickUp → My space → LevelUP → "Sprint 1 — Frontend MVP (mock data)". Each task below names its ClickUp card(s).

## Global Constraints

- Everything in the core plan's Global Constraints applies, except the backend-only rules (`GYM_TZ`, staff key, Prisma). In particular: no XP, levels, streaks, visits, achievements, trophies, challenges, or community page. The tagline is `Track. Improve. Transform.` and the splash call to action is `Tap to Begin`. Login uses a numeric Fit ID and has no password field. There are exactly 5 tabs: Home, Progress, Goals, Leaderboard, Profile.
- No `fetch` to any server in Sprint 1. `VITE_USE_MOCKS` defaults to `true` in `.env.development`. `VITE_API_URL` is read but unused.
- DTO types live only in `packages/shared/src/index.ts`. Components and fixtures import them from `@levelup/shared`. Their shapes are the ones in the core plan, Tasks 5, 7, 8, and 9.
- CLAUDE.md rules on every screen: copy in `src/i18n/en.json` and `src/i18n/ar.json` only, `dir="rtl"` for Arabic, light and dark from theme tokens only (no color literals in `.tsx`/`.css` outside `src/theme/` and `brand.config.ts`), 320 px to desktop with no horizontal scroll, safe-area insets respected.
- Performance budgets from `ui-standards`: initial JS ≤ 200 KB gzip, each lazy route ≤ 80 KB gzip, and every tab page lazy-loaded with `React.lazy`. The Home tab makes 1 call on load (`/me/dashboard`).
- Git: `git init` with `master` and `dev`. Work happens on `feature/sprint-1-frontend-mvp`, branched from `dev`. Use `type(scope): summary` commits with no AI attribution.

### Decisions this plan makes where the spec is silent (confirm or change before execution)

| Topic | Decision |
|---|---|
| Mock switch | `VITE_USE_MOCKS=true` selects the mock server. Mock latency is set by `VITE_MOCK_LATENCY_MS`: 300 by default, and 0 in unit tests. |
| Mock members | `100001` Sam (full history, opted in, coach assigned). `100002` Lina (new member: 0 scans, no goals, opted out). `100003` Omar (1 scan, `showFitScore=false`, membership ends in 10 days). There are 12 more opted-in filler members, so the leaderboard has rows. |
| Mock auth | Login returns the token `mock.<fitId>`. An unknown Fit ID returns 401. The 6th attempt within 60 s returns 429. |
| Mock state | It lives in memory and resets on page reload. Settings changes also go to Preferences (`lu.mock.settings.<fitId>`), so a reload keeps them. |
| Mock dates | Fixtures are built relative to `new Date()` when the mock server starts, so "this month", "renews soon", and goal ETAs always look current. |
| FitScore values | Fixtures hold precomputed scores and tiers. No formula runs in the frontend. |
| Brand colors | `brand.config.ts` sets only the brand hues (`primary`, `secondary`, `accent`). Backgrounds, surfaces, and text come from the light and dark theme tokens, because a single brand background cannot serve both themes. This changes the core plan's Task 10 `brand` shape. |
| Theme | Light, Dark, or System. The default is System, stored in `lu.theme`, and applied with Ionic's `ion-palette-dark` class on `<html>`. |
| Language | `en` or `ar`. The default is the device language when it is Arabic, otherwise `en`. It is stored in `lu.lang`. Numbers use Latin digits in both languages (`ar-u-nu-latn`), so Fit IDs and scores look the same everywhere. |
| Extra settings | Profile → Settings also gets Language and Theme rows. CLAUDE.md requires both modes and languages, and the spec has no other place for them. |
| E2E | Playwright starts only the Vite app with mocks on (no API or DB). `loginAs(fitId)` writes `lu.token = mock.<fitId>` to storage. This replaces the e2e skill's `db:reset` and staff-API steps for this sprint only. |

## Review Focus

1. **Arabic layout.** Expected: the tab pill, back arrows, progress bars, chart axes, and `▲/▼` change indicators mirror correctly in RTL, and mixed text such as `#3` or `+0.8 kg` doesn't scramble. Test: the `ar` run in each e2e spec (Tasks 4–9), plus a `formatSigned` unit test in Task 2.
2. **The new-member path (100002).** Expected: every tab renders an empty state with no `NaN`, `undefined`, or blank card. Test: `newMember.spec.ts` in Task 10.
3. **Narrow screens and long Arabic strings.** Expected: no horizontal scroll at 320 px in either language, and long names truncate with an ellipsis. Test: the overflow assertion in every e2e spec, run under the `small` project.
4. **Settings stay in sync across tabs.** Expected: turning off Show FitScore on Profile hides the FitScore card on Home and the FitScore chart on Progress without a reload, and opting out removes you from the leaderboard right away. Test: Task 9, `settings-sync` e2e.
5. **Mock-to-real swap.** Expected: no component imports anything from `src/api/mock/`, so turning off the flag cannot break a screen. Test: Task 3 adds an ESLint `no-restricted-imports` rule that allows `src/api/mock/**` only from `src/api/client.ts` and test files.

---

## File Structure

```
package.json                         workspaces: apps/*, packages/*; scripts dev, test, build
packages/shared/src/index.ts         DTO types (from the core plan, Tasks 5, 7, 8, 9)
apps/mobile/
  .env.development                   VITE_USE_MOCKS=true
  src/brand.config.ts                gym name, logo, tagline key, brand hues
  src/theme/{tokens.css,applyBrand.ts,theme.ts}
  src/i18n/{index.ts,en.json,ar.json,format.ts}
  src/api/client.ts                  api<T>(), ApiError, onUnauthorized
  src/api/mock/{server.ts,fixtures.ts,members.ts}   mock routes, state, data
  src/auth/AuthContext.tsx, src/sound/useSound.ts, src/settings/SettingsContext.tsx
  src/lib/greeting.ts
  src/pages/{Splash,Login,Dashboard,Progress,Goals,Leaderboard,Profile}.tsx
  src/components/{TabBar,NotificationBell,NotificationsModal,EmptyState,SoundToggle}.tsx
  src/components/dashboard/{Greeting,LeaderboardSummaryCard,FitScoreCard,MissionCard,MonthlyWins}.tsx
  src/components/progress/{BodyCompChart,FitScoreChart,LatestScanTable}.tsx
  e2e/{fixtures.ts,smoke.spec.ts,<feature>.spec.ts}
  playwright.config.ts
```

---

### Task 1: Monorepo and Ionic scaffold

**ClickUp:** S1-01

**Files:**
- Create: root `package.json`, `.gitignore`, `.nvmrc` (`22`), `packages/shared/{package.json,tsconfig.json,src/index.ts}`, `apps/mobile/*` (Ionic scaffold), `apps/mobile/public/brand/logo.webp` (from root `logo.png`, ≤ 100 KB), `apps/mobile/playwright.config.ts`, `apps/mobile/e2e/boot.spec.ts`
- Test: `apps/mobile/src/App.test.tsx`

**Interfaces:**
- Produces: package `@levelup/shared`. Scripts: root `npm run dev` (Vite on 5173), `npm test` (Vitest in all workspaces), `npm -w apps/mobile run test:e2e` (Playwright), `npm -w apps/mobile run build`.

- [ ] **Step 1:** Run `git init`. Create `master`, then `dev`, then `feature/sprint-1-frontend-mvp`. In `apps/`, run `npx @ionic/cli start mobile blank --type=react --capacitor --no-git`. Delete the Cypress folder. Add Vitest, Testing Library, and Playwright. Add the 5 device projects from the `e2e-testing` skill to `playwright.config.ts`. `webServer` runs `npm run dev` with `VITE_USE_MOCKS=true`.
- [ ] **Step 2:** Write `App.test.tsx`: `it('renders without crashing')`. Write `boot.spec.ts`, which loads `/` and expects HTTP 200 with no console errors.
- [ ] **Step 3:** Run `npm test && npm -w apps/mobile run test:e2e`. Expected: PASS.
- [ ] **Step 4:** Commit: `chore: scaffold monorepo and ionic app`.

### Task 2: i18n, theme tokens, safe areas

**ClickUp:** S1-02

**Files:**
- Create: `src/i18n/{index.ts,en.json,ar.json,format.ts}`, `src/theme/{tokens.css,theme.ts}`, `src/components/PageShell.tsx`
- Test: `src/i18n/i18n.test.ts`, `src/i18n/format.test.ts`, `src/theme/theme.test.ts`, `e2e/shell.spec.ts`, `e2e/fixtures.ts`

**Interfaces:**
- Produces:
  - `setLanguage(lang: 'en'|'ar'): Promise<void>`. It switches i18next, sets `<html lang dir>`, and stores the choice in `lu.lang`.
  - `setTheme(mode: 'light'|'dark'|'system'): Promise<void>`. It toggles `ion-palette-dark` on `<html>` and stores the choice in `lu.theme`. In `system` mode it follows `matchMedia('(prefers-color-scheme: dark)')` live.
  - `formatNumber(n: number, digits?: number): string` and `formatSigned(n: number | null, unit?: string): string`. `formatSigned` returns `'+0.8 kg'`, `'−1.2%'` (a true minus sign), or `'—'` for null. The whole string is wrapped in U+2066/U+2069 isolates, so RTL doesn't reorder it.
  - `<PageShell title>`: an `IonPage` with a header that pads by `env(safe-area-inset-top)`, and content that pads its bottom by the tab bar height plus `env(safe-area-inset-bottom)`.
  - The token names in `tokens.css`, for both palettes: `--lu-bg`, `--lu-surface`, `--lu-surface-2`, `--lu-text`, `--lu-text-muted`, `--lu-border`, `--lu-success`, `--lu-danger`.
  - e2e `fixtures.ts`: the `locale` and `theme` options (set storage and `colorScheme` before load), and `loginAs(fitId = '100001')`.

- [ ] **Step 1: Write the failing tests**

```ts
it('ar sets rtl', async () => { await setLanguage('ar'); expect(document.documentElement.dir).toBe('rtl'); expect(document.documentElement.lang).toBe('ar'); });
it('en and ar have identical key sets', () => expect(keys(ar)).toEqual(keys(en)));
it('formatSigned', () => { expect(formatSigned(0.8,'kg')).toBe('⁦+0.8 kg⁩'); expect(formatSigned(-1.2,'%')).toBe('⁦−1.2%⁩'); expect(formatSigned(null)).toBe('—'); });
it('dark adds palette class', async () => { await setTheme('dark'); expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true); });
```

The `shell.spec.ts` e2e test loops over `en/ar` × `light/dark` and asserts `dir`, the palette class, and no horizontal overflow.

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement. Add a `scripts/check-colors` npm script that greps `src/**/*.{tsx,css}` for `#[0-9a-f]{3,8}|rgb\(|hsl\(`, excluding `src/theme/` and `brand.config.ts`, and fails on any match. Use CSS logical properties (`margin-inline-start`, `padding-inline`) instead of left/right throughout.
- [ ] **Step 4:** Run `npm test && npm run check-colors && npm -w apps/mobile run test:e2e`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): i18n with rtl, light/dark tokens, safe-area shell`.

### Task 3: Shared DTOs and mock API

**ClickUp:** S1-03

**Files:**
- Create: `packages/shared/src/index.ts` (all DTOs), `src/api/client.ts`, `src/api/mock/{server.ts,fixtures.ts,members.ts}`, `src/api/mock/README.md` (lists the mock Fit IDs)
- Modify: `.eslintrc` (`no-restricted-imports` for `**/api/mock/**`, except in `src/api/client.ts` and `*.test.*`)
- Test: `src/api/mock/server.test.ts`

**Interfaces:**
- Consumes: the DTO shapes from the core plan: `LoginResponse` (Task 5), `DashboardDto` (Task 7), `LeaderboardDto` and `LeaderboardBoard` (Task 8), and `ProgressDto`, `AssessmentDto`, `GoalsDto`, `GoalView`, `ProfileDto`, `NotificationDto`, and `SettingsDto` (Task 9). `NotificationDto = { id: number; type: 'SCAN_RESULT'|'MISSION_COMPLETE'; title: string; body: string; createdAt: string; readAt: string | null }`. `title` and `body` are i18n keys plus params (`{ key: string; params?: Record<string, string|number> }`), so the mock and the future API both stay language-neutral.
- Produces:
  - `api<T>(path: string, init?: RequestInit): Promise<T>`. It throws `ApiError { status: number }` on a non-2xx response. On 401 it calls the handler registered with `onUnauthorized(fn)`. It reads the token through `getToken()`.
  - `mockServer.handle(method: string, path: string, body: unknown, token: string | null): Promise<{ status: number; body: unknown }>`. It serves every route in the core plan's Tasks 5, 7, 8, and 9 (except the staff routes).
  - `resetMockServer(now?: Date): void` for tests.

- [ ] **Step 1: Write the failing tests**

```ts
beforeEach(() => resetMockServer(new Date('2026-11-13T10:00:00Z')));
it('login: known id → token, unknown → 401, 6th attempt → 429', async () => {
  expect((await login('100001')).body).toMatchObject({ accessToken: 'mock.100001', member: { firstName: 'Sam' } });
  expect((await login('999999')).status).toBe(401);
  for (let i = 0; i < 3; i++) await login('999999');
  expect((await login('999999')).status).toBe(429);
});
it('no token → 401 on /me', async () => expect((await mockServer.handle('GET','/me',null,null)).status).toBe(401));
it('new member dashboard has nulls, never NaN', async () => {
  const d = (await get('/me/dashboard','100002')).body;
  expect(d.fitScore).toBeNull(); expect(d.mission).toBeNull(); expect(d.monthlyWins).toEqual({ bodyFatChangePct: null, muscleGainedKg: null });
  expect(JSON.stringify(d)).not.toContain('NaN');
});
it('opt-out removes member from every board immediately', async () => {
  await patch('/me/settings', { fitScoreOnLeaderboard: false }, '100001');
  for (const b of ['score','progress','muscle','fatLoss']) expect((await get(`/leaderboard?board=${b}`,'100001')).body.rows.some(r => r.isMe)).toBe(false);
});
it('read-all zeroes unread count', async () => {
  await post('/me/notifications/read-all', '100001');
  expect((await get('/me/dashboard','100001')).body.unreadNotifications).toBe(0);
});
it('unknown board → 400', async () => expect((await get('/leaderboard?board=xp','100001')).status).toBe(400));
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement. Leaderboards are computed from the fixture members (`members.ts`): keep only opted-in members, sort descending, and break ties by the lower id. Monthly boards skip members whose fixtures have no scan this month. Sam's fixture has 6 monthly scans, 1 active goal, 2 completed goals, 1 upcoming goal, and 4 notifications (2 unread). `api` waits `VITE_MOCK_LATENCY_MS` before it resolves.
- [ ] **Step 4:** Run `npm test && npm -w apps/mobile run lint`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(shared,mobile): dto contract and in-memory mock api`.

### Task 4: White-label branding and floating tab bar

**ClickUp:** #15, #16

**Files:**
- Create: `src/brand.config.ts`, `src/theme/applyBrand.ts`, `src/components/TabBar.tsx`, `src/components/TabBar.css`, route placeholders for the 5 tab pages (lazy-loaded)
- Test: `src/theme/applyBrand.test.ts`, `src/components/TabBar.test.tsx`, `e2e/tabs.spec.ts`

**Interfaces:**
- Produces:
  - `brand: { gymName: string; logo: string; colors: { primary: string; secondary: string; accent: string } }`
  - `applyBrand(b = brand, root = document.documentElement): void`. It sets `--ion-color-primary` (plus Ionic's `-rgb`, `-shade`, `-tint`, and `-contrast` variants), the same set for `--ion-color-secondary`, and `--lu-accent`. It also sets `document.title`.
  - Routes: `/splash`, `/login`, `/tabs/home`, `/tabs/progress`, `/tabs/goals`, `/tabs/leaderboard`, `/tabs/profile`. `/tabs/*` redirects to `/login` when there is no token.

- [ ] **Step 1: Write the failing tests:** the core plan's Task 10 tests for `applyBrand` and the tab order, plus `it('pill mirrors in rtl')`. After `setLanguage('ar')`, with the Goals tab active, the indicator's inline transform is `translateX(-200%)`. The `tabs.spec.ts` e2e test clicks all 5 tabs in `en/ar` × `light/dark`. On `iphone`, it asserts that the tab bar's bottom edge is ≤ `innerHeight − safe-area-inset-bottom`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. The bar floats at `bottom: calc(12px + env(safe-area-inset-bottom))` and is centered with `max-width: 480px`. Labels sit under icons, and below 360 px only icons show, with `aria-label` kept.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): white-label brand config and floating tab bar`.

### Task 5: Splash, Fit ID login, sound toggle

**ClickUp:** #1, #2, #3

**Files:**
- Create: `src/pages/Splash.tsx`, `src/pages/Splash.css`, `src/pages/Login.tsx`, `src/auth/AuthContext.tsx`, `src/sound/useSound.ts`, `src/components/SoundToggle.tsx`, `public/sounds/{tap,success}.mp3` (each ≤ 20 KB)
- Test: `src/pages/Login.test.tsx`, `src/sound/useSound.test.ts`, `e2e/login.spec.ts`

**Interfaces:**
- Consumes: `api`, `brand`, `LoginResponse`
- Produces: `useAuth()` and `useSound()`, exactly as in the core plan's Task 11. `<SoundToggle />` is reused in Profile.

Behavior and copy follow the core plan's Task 11. Additions: a 429 shows the `login.tooMany` message ("Too many tries. Wait a minute and try again."). The input accepts 6–8 digits, and the submit button stays disabled until then. The starfield and glow ring stop under `prefers-reduced-motion`.

- [ ] **Step 1: Write the failing tests:** the 4 tests from the core plan's Task 11, plus `it('429 shows wait message')` and `it('submit disabled under 6 digits')`. `login.spec.ts` covers splash → `Tap to Begin` → typing `100001` → Home, in `en/ar` × `light/dark`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): splash, fit id login, sound toggle`.

### Task 6: Dashboard (Home tab)

**ClickUp:** #4, #5, #6, #7, #8, and the bell half of #9

**Files and interfaces:** these follow the core plan's Task 12 exactly. Copy goes through i18n keys, and the 14+ quotes exist in both `en.json` and `ar.json`. Monthly Wins and change values use `formatSigned`.

- [ ] **Step 1: Write the failing tests:** all of the core plan's Task 12 tests, using fixtures `100001` and `100002` and with `mockApi` replaced by `resetMockServer`. Add `dashboard.spec.ts` covering `en/ar` × `light/dark` and member `100002`'s empty states.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. On wide screens (≥ 768 px), the cards sit in a 2-column grid.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): dashboard with greeting, fitscore, mission, wins, leaderboard summary`.

### Task 7: Progress page

**ClickUp:** #10 + #11

**Files and interfaces:** these follow the core plan's Task 13. The chart components are `React.lazy` chunks so Chart.js stays out of the initial bundle. In RTL, the x-axis runs right to left (`reverse: true`) and the body-fat axis moves to the left.

- [ ] **Step 1: Write the failing tests:** the 3 tests from the core plan's Task 13 (member `100003` covers both "one scan" and "FitScore hidden"), plus `progress.spec.ts` covering `en/ar` × `light/dark`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests and `npm -w apps/mobile run build`. Expected: PASS, and the Progress chunk is ≤ 80 KB gzip.
- [ ] **Step 5:** Commit: `feat(mobile): progress page with lazy charts`.

### Task 8: Goals and Leaderboard pages

**ClickUp:** #12, #13

**Files and interfaces:** these follow the core plan's Task 14. Values use `formatSigned`. Long names truncate with an ellipsis.

- [ ] **Step 1: Write the failing tests:** the 5 tests from the core plan's Task 14, plus `goals.spec.ts` and `leaderboard.spec.ts` covering `en/ar` × `light/dark`. The leaderboard spec checks that member `100002` sees the Join banner, and that after joining (with no scans yet) the member is still absent from the monthly boards.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): goals and opt-in leaderboard pages`.

### Task 9: Profile, settings, notifications

**ClickUp:** #14, and the list half of #9

**Files:**
- Create: `src/pages/Profile.tsx`, `src/components/NotificationsModal.tsx`, `src/settings/SettingsContext.tsx`
- Modify: `src/pages/Dashboard.tsx` (connect the bell to the modal), `src/pages/Progress.tsx` (read `showFitScore` from `SettingsContext`)
- Test: `src/pages/Profile.test.tsx`, `src/components/NotificationsModal.test.tsx`, `e2e/profile.spec.ts`, `e2e/settings-sync.spec.ts`

**Interfaces:**
- Consumes: the same routes as the core plan's Task 15, plus `setLanguage`, `setTheme`, `useSound`, and `useAuth`.
- Produces: `useSettings(): { showFitScore: boolean; fitScoreOnLeaderboard: boolean; update(patch: Partial<SettingsDto>): Promise<void> }`. `update` changes the UI immediately and rolls back if the request fails. Dashboard and Progress read from it, so changes show without a reload.

Layout and copy follow the core plan's Task 15. The Settings list adds Language (English / العربية) and Theme (System / Light / Dark).

- [ ] **Step 1: Write the failing tests:** the 4 tests from the core plan's Task 15 (the renews-soon test uses member `100003`), plus `it('switching language to Arabic flips dir')`. `settings-sync.spec.ts`: turn off Show FitScore on Profile, go to Home (no `fitscore-card`) and Progress (no `fitscore-chart`), then opt out and check the leaderboard has no `row-me`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): profile, settings, notifications`.

### Task 10: E2E smoke suite, visual check, README

**ClickUp:** S1-04

**Files:**
- Create: `e2e/smoke.spec.ts`, `e2e/newMember.spec.ts`, `README.md`

- [ ] **Step 1:** Write `smoke.spec.ts`: the core plan's Task 16 journey, run in `en/ar` × `light/dark` across all 5 device projects. Write `newMember.spec.ts`: log in as `100002`, visit every tab, and assert that each page shows its empty state and that the page text contains no `NaN` or `undefined`.
- [ ] **Step 2:** Run `npm -w apps/mobile run test:e2e`. Expected: PASS on all projects.
- [ ] **Step 3:** Run `npm -w apps/mobile run build`. Check the budgets: initial JS ≤ 200 KB gzip and each tab chunk ≤ 80 KB gzip. Record the numbers in the README.
- [ ] **Step 4:** Use the `playwright-browser-check` skill to check every tab in Arabic + dark on the iPhone notch and at 320 px. Fix anything it finds and re-run Step 2.
- [ ] **Step 5:** Write the README: setup, the mock Fit IDs, the `VITE_USE_MOCKS` switch and how Sprint 2 turns it off, how to rebrand (`brand.config.ts` + `public/brand/logo.webp`), and the Capacitor build steps.
- [ ] **Step 6:** Commit: `test(mobile): e2e smoke and new-member suites; docs: readme`. Open a PR into `dev` following `git-workflow`.

---

## Spec Coverage

| # | Feature | Task |
|---|---|---|
| 1 | Splash Screen | 5 |
| 2 | Fit ID Login | 3, 5 |
| 3 | Sound Toggle | 5, 9 |
| 4 | Personalized Greeting | 6 |
| 5 | Leaderboard Summary | 3, 6 |
| 6 | FitScore | 3, 6, 9 |
| 7 | Current Mission | 3, 6 |
| 8 | Monthly Wins | 3, 6 |
| 9 | Notifications | 3, 6, 9 |
| 10 | Body Composition Assessments (member view) | 3, 7 |
| 11 | Progress Page | 7 |
| 12 | Goals Page | 8 |
| 13 | Full Gym Leaderboard | 3, 8 |
| 14 | Member Profile | 9 |
| 15 | White-Label Branding | 4 |
| 16 | Bottom Tab Navigation | 4 |
| 17 | Backend API | Sprint 2 (core plan, Tasks 1–9) |
