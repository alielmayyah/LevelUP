# Solo Experience, Milestone 1 (Rules, Mock API, Setup, Today) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A member can finish a short solo setup, then use a Today screen every day: log training, water and habits, watch a weekly ring fill, and earn XP and levels. All of it is served by the mock API and saved on the device.

**Architecture:** The game rules are pure functions in `src/api/mock/solo.ts`. The mock server stores raw day logs in Capacitor Preferences and derives everything else (XP, level, week progress) on every read. The UI reads `GET /me/today`, writes one whole day with `PUT /me/days/:date`, and gets the setup through `GET/PUT /me/solo`. The existing Home cards (FitScore, rank, mission, tiles) stay below the new Today sections. Hiding gym pieces is a later milestone.

**Tech Stack:** Ionic React 8, Vite, TypeScript, Tailwind, Capacitor Preferences, react-i18next, Vitest, Playwright.

**Spec:** [docs/superpowers/specs/2026-11-17-solo-experience-design.md](../specs/2026-11-17-solo-experience-design.md). This plan covers spec phases 1 and 2 only. Medals, avatar unlocks, Progress, Goals, Settings, lift logging and the gym flag are later milestones.

## Global Constraints

- Every string exists in `en.json` and `ar.json`. Arabic is Egyptian colloquial, never MSA. Arabic renders right to left.
- Every screen works in light and dark mode, using theme tokens only. Width 320 px up to desktop. No content under safe areas.
- Clean modern style from `ui-standards` ("Visual style"), no pixel art. This plan runs **after** the restyle, so `Toast`, `Dialog`, `Icon` and `.lu-card` exist. Primary actions use `CtaButton`. Tailwind first, Sass only for custom pieces. Shared component styles go in `src/theme`.
- Only `src/api/client.ts` and tests import from `src/api/mock/` (ESLint enforces this).
- Load the repo skills before matching work: `ui-standards` and `ionic-mobile-experience` (UI tasks), `e2e-testing` (Task 6), `git-workflow` (every commit).
- Commit to `dev`, one topic per commit, `type(scope): summary`, **no AI attribution or Co-Authored-By lines**.
- `npm run lint`, `npm test` and `npm run test:e2e` pass at the end of every task that touches their area.

### Values pinned by the spec, and by this plan where the spec left a choice

- XP: training 50 (once a day), week hit 200 bonus, water target reached 20, habit 10 each with at most 5 counted a day, perfect day 30 (training + water target + every planned habit).
- Level L needs `50 × L × (L − 1)` total XP. Tiers by level: Rookie 1–4, Regular 5–9, Athlete 10–19, Beast 20–34, Legend 35+.
- The week starts on **Saturday**. A week is hit when days trained ≥ that week's target. A target change applies from the next week.
- Editable days: **today and yesterday** only. Other dates → 409.
- Weekly target 2–6, default 3. At most 5 habits. Custom habit label 1–24 characters after trimming.
- Habit presets (i18n keys): `creatine`, `vitamins`, `sleep8h`, `steps10k`, `stretch`, `protein`, `noSugar`.
- Training types: `PUSH`, `PULL`, `LEGS`, `FULL_BODY`, `CARDIO`, `OTHER`.
- **Plan's call:** water is always stored as a count of glasses. The target is 4–16 glasses (default 8). The unit only changes display: 1 glass = 0.25 L.
- **Plan's call:** `TodayDto.nextMedal` is always `null` in this milestone. The medal milestone fills it in.

## Review Focus

1. **Past XP must not change when the profile changes.** If a member removes a habit or lowers the water target, XP already earned stays the same. Each stored day keeps a snapshot of its water target and habit count (Task 1). Test: `dayXp` uses the snapshot, not the current profile (Task 1). Test: the route keeps total XP the same after `PUT /me/solo` removes a habit (Task 2).
2. **Midnight and timezone.** "Today" is the device's local date, not UTC. An evening log in Cairo (UTC+2) lands on the right day. Test: `localDate` of `2026-11-14T23:30:00+02:00` is `2026-11-14` (Task 1, using a fixed `TZ`).
3. **Double tap or retried request.** Sending the same `PUT` twice gives the same result and doesn't double XP. Test in Task 2.
4. **Bad input to `PUT /me/days/:date`.** Negative or huge water, unknown habit ids, more than 5 habits, an unknown training type, a malformed date → 400, with nothing saved. Test in Task 2.
5. **Corrupt or missing Preferences.** A corrupt saved entry reads as "no solo profile" (setup shows again) instead of crashing. Test in Task 2.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/api/types.ts` (modify) | Solo DTOs: `TrainingType`, `HabitPreset`, `SoloProfileDto`, `DayLogDto`, `PutDayRequest`, `TodayDto`, `PutDayResponse`, `Tier`. |
| `src/api/mock/solo.ts` (create) | Pure game rules: dates, validation, XP, levels, weeks. No I/O. |
| `src/api/mock/solo.test.ts` (create) | Unit tests for the rules. |
| `src/api/mock/soloStore.ts` (create) | Preferences load/save for the solo profile, target history and day logs. |
| `src/api/mock/server.ts` (modify) | Routes `GET/PUT /me/solo`, `GET /me/today`, `PUT /me/days/:date`, `GET /me/days`. |
| `src/api/mock/soloServer.test.ts` (create) | Route tests. |
| `src/api/mock/soloFixtures.ts` (create) | Seeded history for Mohamed (101). |
| `src/api/solo.ts` (create) | Typed client calls the screens use. |
| `src/pages/today/*` (create) | `useSoloProfile`, `XpBar`, `WeeklyRing`, `TrainingCard`, `WaterRow`, `HabitChips`, `DaySwitch`, `TodaySection`. |
| `src/pages/SoloSetup.tsx` + `src/pages/setup/*` (create) | First-run setup steps. |
| `src/pages/Dashboard.tsx`, `src/components/Tabs.tsx` (modify) | Mount Today on top of Home, add the setup route, redirect to setup when no profile. |
| `src/i18n/en.json`, `ar.json` (modify) | `today.*` and `setup.*` strings. |
| `e2e/solo.spec.ts` (create) | Setup → log → XP flow, Mohamed's seeded week. |
| `src/api/mock/README.md` (modify) | Document the new routes, keys and fixtures. |

---

### Task 1: Solo DTOs and the rules module

**Files:**
- Modify: `src/api/types.ts` (append a `/* ---------- Solo ---------- */` section)
- Create: `src/api/mock/solo.ts`
- Test: `src/api/mock/solo.test.ts`

**Interfaces:**
- Produces (types, in `types.ts`):
  ```ts
  export type TrainingType = 'PUSH' | 'PULL' | 'LEGS' | 'FULL_BODY' | 'CARDIO' | 'OTHER';
  export type HabitPreset = 'creatine' | 'vitamins' | 'sleep8h' | 'steps10k' | 'stretch' | 'protein' | 'noSugar';
  export type MainGoal = 'LOSE_FAT' | 'BUILD_MUSCLE' | 'GET_FITTER' | 'STAY_HEALTHY';
  export type Tier = 'rookie' | 'regular' | 'athlete' | 'beast' | 'legend';
  export interface HabitDto { id: string; preset: HabitPreset | null; label: string | null }
  export interface SoloProfileDto { mainGoal: MainGoal; weeklyTarget: number; water: { target: number; unit: 'GLASS' | 'LITER' }; habits: HabitDto[] }
  export interface DayLogDto { date: string; training: TrainingType | null; water: number; habitsDone: string[] }
  export type PutDayRequest = Omit<DayLogDto, 'date'>;
  export interface XpDto { total: number; level: number; tier: Tier; intoLevel: number; toNext: number }
  export interface WeekDto { start: string; daysTrained: number; target: number; hit: boolean; weeksInARow: number; trainedDates: string[] }
  export interface TodayDto { day: DayLogDto; editable: boolean; today: string; week: WeekDto; xp: XpDto; nextMedal: null }
  export interface PutDayResponse { today: TodayDto; xpGained: number; levelUp: boolean }
  ```
- Produces (functions, in `solo.ts`):
  ```ts
  export const XP: { training: 50; weekHit: 200; water: 20; habit: 10; habitDailyCap: 5; perfectDay: 30 };
  export interface StoredDay extends DayLogDto { waterTarget: number; habitCount: number } // snapshot at write time
  export interface TargetChange { from: string; target: number }                          // from = a week start
  export function localDate(d: Date): string;                         // YYYY-MM-DD in the device timezone
  export function addDays(date: string, n: number): string;
  export function weekStart(date: string): string;                    // the Saturday on or before date
  export function isEditable(date: string, today: string): boolean;   // today or yesterday
  export function targetForWeek(history: TargetChange[], start: string): number; // latest change with from ≤ start, else the first entry's target
  export function dayXp(day: StoredDay): number;
  export function weekProgress(days: Record<string, StoredDay>, start: string, target: number): { daysTrained: number; hit: boolean; trainedDates: string[] };
  export function weeksInARow(days: Record<string, StoredDay>, history: TargetChange[], today: string): number;
  export function totalXp(days: Record<string, StoredDay>, history: TargetChange[], today: string): number; // Σ dayXp + 200 × hit weeks up to and including the current week
  export function levelFor(total: number): XpDto;
  export function validateProfile(body: unknown): SoloProfileDto | null;
  export function validateDay(body: unknown, profile: SoloProfileDto): PutDayRequest | null;
  ```

- [ ] **Step 1: Write the failing tests** in `src/api/mock/solo.test.ts` (Vitest, `describe` per function). Assertions:

```ts
// dates (process.env.TZ is pinned to 'Africa/Cairo' at the top of the file, before imports run)
expect(localDate(new Date('2026-11-14T23:30:00+02:00'))).toBe('2026-11-14');
expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
expect(weekStart('2026-11-14')).toBe('2026-11-14'); // Saturday
expect(weekStart('2026-11-20')).toBe('2026-11-14'); // Friday
expect(isEditable('2026-11-17', '2026-11-17')).toBe(true);
expect(isEditable('2026-11-16', '2026-11-17')).toBe(true);
expect(isEditable('2026-11-15', '2026-11-17')).toBe(false);
expect(isEditable('2026-11-18', '2026-11-17')).toBe(false);

// targets
const hist = [{ from: '2026-11-07', target: 3 }, { from: '2026-11-21', target: 5 }];
expect(targetForWeek(hist, '2026-10-31')).toBe(3);
expect(targetForWeek(hist, '2026-11-14')).toBe(3);
expect(targetForWeek(hist, '2026-11-21')).toBe(5);

// dayXp
const d = (o: Partial<StoredDay>): StoredDay => ({ date: '2026-11-14', training: null, water: 0, habitsDone: [], waterTarget: 8, habitCount: 2, ...o });
expect(dayXp(d({}))).toBe(0);
expect(dayXp(d({ training: 'PUSH' }))).toBe(50);
expect(dayXp(d({ water: 8 }))).toBe(20);
expect(dayXp(d({ water: 7 }))).toBe(0);
expect(dayXp(d({ habitsDone: ['a', 'b'] }))).toBe(20);
expect(dayXp(d({ training: 'LEGS', water: 9, habitsDone: ['a', 'b'] }))).toBe(50 + 20 + 20 + 30); // perfect day
expect(dayXp(d({ habitCount: 7, habitsDone: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }))).toBe(50); // cap 5
expect(dayXp(d({ habitCount: 0, training: 'PUSH', water: 8 }))).toBe(50 + 20 + 30); // no habits planned still perfect

// weeks
const days = { /* Sat 11-07 .. Fri 11-13: trained 3 days; Sat 11-14 .. : trained 1 day */ };
expect(weekProgress(days, '2026-11-07', 3)).toEqual({ daysTrained: 3, hit: true, trainedDates: [/* the 3 dates, sorted */] });
expect(weeksInARow(days, [{ from: '2026-10-31', target: 3 }], '2026-11-17')).toBe(1); // last full week hit, current not yet
// current week counts once hit:
expect(weeksInARow(daysWithCurrentHit, hist3, '2026-11-17')).toBe(2);
expect(totalXp(days, [{ from: '2026-10-31', target: 3 }], '2026-11-17')).toBe(4 * 50 + 200);

// levels
expect(levelFor(0)).toEqual({ total: 0, level: 1, tier: 'rookie', intoLevel: 0, toNext: 100 });
expect(levelFor(100)).toMatchObject({ level: 2, intoLevel: 0, toNext: 200 });
expect(levelFor(999)).toMatchObject({ level: 4, tier: 'rookie' });
expect(levelFor(1000)).toMatchObject({ level: 5, tier: 'regular' });
expect(levelFor(4500)).toMatchObject({ level: 10, tier: 'athlete' });
expect(levelFor(50 * 35 * 34)).toMatchObject({ level: 35, tier: 'legend' });

// validation
const good = { mainGoal: 'BUILD_MUSCLE', weeklyTarget: 3, water: { target: 8, unit: 'GLASS' }, habits: [{ id: 'h1', preset: 'creatine', label: null }] };
expect(validateProfile(good)).toEqual(good);
for (const bad of [{ ...good, weeklyTarget: 1 }, { ...good, weeklyTarget: 7 }, { ...good, water: { target: 3, unit: 'GLASS' } },
  { ...good, habits: Array.from({ length: 6 }, (_, i) => ({ id: `h${i}`, preset: 'protein', label: null })) },
  { ...good, habits: [{ id: 'h1', preset: null, label: '   ' }] }, { ...good, habits: [{ id: 'h1', preset: null, label: 'x'.repeat(25) }] },
  { ...good, habits: [{ id: 'h1', preset: 'creatine', label: null }, { id: 'h1', preset: 'protein', label: null }] }, // duplicate id
  { ...good, mainGoal: 'NAP' }, null, 'x'])
  expect(validateProfile(bad)).toBeNull();
expect(validateProfile({ ...good, habits: [{ id: 'h1', preset: null, label: '  Walk dog ' }] })!.habits[0].label).toBe('Walk dog');
expect(validateDay({ training: 'PUSH', water: 3, habitsDone: ['h1'] }, good as SoloProfileDto)).toEqual({ training: 'PUSH', water: 3, habitsDone: ['h1'] });
for (const bad of [{ training: 'YOGA', water: 0, habitsDone: [] }, { training: null, water: -1, habitsDone: [] },
  { training: null, water: 41, habitsDone: [] }, { training: null, water: 1.5, habitsDone: [] },
  { training: null, water: 0, habitsDone: ['nope'] }, { training: null, water: 0, habitsDone: ['h1', 'h1'] }])
  expect(validateDay(bad, good as SoloProfileDto)).toBeNull();
```

- [ ] **Step 2: Run** `npx vitest run src/api/mock/solo.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 3: Add the types to `types.ts`, then implement `solo.ts`.** Dates are plain `YYYY-MM-DD` strings. For arithmetic, use UTC noon (`new Date(date + 'T12:00:00Z')`) so DST never shifts a day. `localDate` uses the local getters (`getFullYear/getMonth/getDate`). Water is valid as an integer 0–40. `weeksInARow` walks back week by week from the previous week while weeks are hit, then adds 1 if the current week is already hit. `levelFor` finds the largest L with `50·L·(L−1) ≤ total`.

- [ ] **Step 4: Run** `npx vitest run src/api/mock/solo.test.ts`. Expected: PASS. Then `npm run lint`. Expected: no errors.

- [ ] **Step 5: Commit**
```bash
git add src/api/types.ts src/api/mock/solo.ts src/api/mock/solo.test.ts
git commit -m "feat(types): add solo dtos and game rules"
```

---

### Task 2: Mock storage and routes

**Files:**
- Create: `src/api/mock/soloStore.ts`
- Modify: `src/api/mock/server.ts` (router `switch`, the `resetMockServer` cache clearing, header comment)
- Create: `src/api/mock/soloServer.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces (store):
  ```ts
  export interface SoloState { profile: SoloProfileDto; targets: TargetChange[]; days: Record<string, StoredDay> }
  export async function loadSolo(fitId: string): Promise<SoloState | null>; // null when missing or corrupt
  export async function saveSolo(fitId: string, state: SoloState): Promise<void>;
  export function clearSoloCache(): void; // called from resetMockServer
  ```
  Preferences keys: `lu.mock.solo.<fitId>` holds `{ profile, targets }`, and `lu.mock.days.<fitId>` holds `days`. The in-memory cache is keyed by fitId.
- Produces (routes; `today` = `localDate(now)` from the server's `now`):
  - `GET /me/solo` → 200 `SoloProfileDto` | 404.
  - `PUT /me/solo` body `SoloProfileDto` → 200 `SoloProfileDto` | 400. The first save sets `targets = [{ from: weekStart(today), target }]`. A later save with a different target appends `{ from: addDays(weekStart(today), 7), target }` (replacing an entry with the same `from`).
  - `GET /me/today?date=` (`date` defaults to `today`; must be today or yesterday, otherwise 409) → 200 `TodayDto` | 404 when no profile. `day` is the stored day or an empty one.
  - `PUT /me/days/:date` body `PutDayRequest` → 200 `PutDayResponse` | 400 bad body or malformed date | 404 no profile | 409 not editable. Stores the day with the snapshot `waterTarget = profile.water.target` and `habitCount = profile.habits.length`. `xpGained` = total after minus total before (it can be negative when something is unticked). `levelUp` = the level went up.
  - `GET /me/days?from=&to=` → 200 `DayLogDto[]` sorted by date, without snapshot fields. 400 if a date is missing or malformed, or the range is over 400 days.

- [ ] **Step 1: Write the failing tests** in `soloServer.test.ts`, in the same style as `server.test.ts` (`Preferences.clear()` and `resetMockServer(NOW)` in `beforeEach`, `NOW = new Date('2026-11-17T10:00:00+02:00')`, `process.env.TZ = 'Africa/Cairo'`). Use fitId `102` (no seeded solo data). Cases:
  - `GET /me/solo` → 404, and `GET /me/today` → 404 before setup.
  - `PUT /me/solo` valid → 200. Then `GET /me/solo` returns the same profile. Invalid → 400.
  - After setup, `GET /me/today` → `{ today: '2026-11-17', editable: true, day: { training: null, water: 0, habitsDone: [] }, week: { start: '2026-11-14', target: 3, daysTrained: 0 }, xp: { total: 0, level: 1 } }`.
  - The test profile has exactly one habit (`h1`). `PUT /me/days/2026-11-17 { training: 'PUSH', water: 8, habitsDone: ['h1'] }` → `xpGained: 110` (50 + 20 + 10 + 30).
  - The same PUT again → `xpGained: 0`, with the same total (Review Focus 3).
  - Unticking training → a negative `xpGained` of 50 plus the perfect-day 30.
  - `PUT /me/days/2026-11-16` → 200. `PUT /me/days/2026-11-15` → 409. `PUT /me/days/2026-13-01` → 400.
  - Bad bodies from Task 1's list → 400, and `GET /me/today` shows nothing changed (Review Focus 4).
  - Three training days in the week → `week.hit: true`, and total includes the 200 bonus.
  - Removing a habit with `PUT /me/solo` after logging → `GET /me/today` total XP is unchanged (Review Focus 1).
  - Changing `weeklyTarget` 3 → 5 mid-week → the current `week.target` stays 3.
  - Corrupt data: `Preferences.set({ key: 'lu.mock.solo.102', value: '{oops' })`, then `clearSoloCache()` → `GET /me/solo` 404 (Review Focus 5).
  - Data persists: after `clearSoloCache()` (simulated restart), `GET /me/today` still has the logged day.
  - `GET /me/days?from=2026-11-10&to=2026-11-17` returns the logged days only, without `waterTarget` or `habitCount`.

- [ ] **Step 2: Run** `npx vitest run src/api/mock/soloServer.test.ts`. Expected: FAIL (404 from the router).

- [ ] **Step 3: Implement `soloStore.ts` and the routes.** Add the cases to the router `switch` and match `PUT /me/days/:date` with a regex, as `/me/notifications/:id/read` does. Call `clearSoloCache()` in `resetMockServer`.

- [ ] **Step 4: Run** `npx vitest run src/api/mock` then `npm run lint`. Expected: all PASS (the existing server tests still pass).

- [ ] **Step 5: Commit**
```bash
git add src/api/mock/soloStore.ts src/api/mock/server.ts src/api/mock/soloServer.test.ts
git commit -m "feat(mobile): serve solo routes from the mock api"
```

---

### Task 3: Seeded history for Mohamed and the client calls

**Files:**
- Create: `src/api/mock/soloFixtures.ts`
- Modify: `src/api/mock/soloStore.ts` (fall back to the seed when Preferences has nothing for `101`)
- Create: `src/api/solo.ts`
- Modify: `src/api/mock/README.md`
- Test: add cases to `src/api/mock/soloServer.test.ts`

**Interfaces:**
- Produces: `export function seedSolo(fitId: string, now: Date): SoloState | null` returns a state for `'101'` only.
  - Profile: `BUILD_MUSCLE`, target 4, water 8 glasses, habits creatine + protein + sleep8h.
  - 8 full weeks before the current week: every week hits 4 trained days, except week 5 back, which has only 2 trained days.
  - Water hits the target on about 70% of days, chosen by a fixed pattern (no randomness).
  - Habits: creatine every day, protein on training days, sleep on alternate days.
  - The current week has the days before today trained up to 2.
- Produces (client, `src/api/solo.ts`):
  ```ts
  export const getSolo = (): Promise<SoloProfileDto>;
  export const putSolo = (p: SoloProfileDto): Promise<SoloProfileDto>;
  export const getToday = (date?: string): Promise<TodayDto>;
  export const putDay = (date: string, req: PutDayRequest): Promise<PutDayResponse>;
  ```
  These are thin wrappers over `api()`, like `src/api/goals.ts`.

- [ ] **Step 1: Write the failing tests.** For `101` at `NOW`, `GET /me/today` gives `week.weeksInARow === 4` (weeks 1–4 back hit, week 5 missed), `xp.level` ≥ 6, and `week.daysTrained === 2`. Two calls return identical output (deterministic). Lina (`102`) and Sara (`140`) still get 404.
- [ ] **Step 2: Run** `npx vitest run src/api/mock/soloServer.test.ts`. Expected: the new cases FAIL.
- [ ] **Step 3: Implement the seed and the client functions.** Update the README's member table and add a "Solo" section listing the routes, keys and the seeded history.
- [ ] **Step 4: Run** `npx vitest run src/api` and `npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/api/mock/soloFixtures.ts src/api/mock/soloStore.ts src/api/solo.ts src/api/mock/README.md src/api/mock/soloServer.test.ts
git commit -m "feat(mobile): seed solo history for the demo member"
```

---

### Task 4: Solo setup flow

Load `ui-standards` and `ionic-mobile-experience` first.

**Files:**
- Create: `src/pages/SoloSetup.tsx`, `src/pages/setup/` (one component per step + `SoloSetup.test.tsx`)
- Create: `src/pages/today/useSoloProfile.ts`
- Modify: `src/components/Tabs.tsx` (route `/tabs/home/setup`, lazy-loaded like the other pages)
- Modify: `src/i18n/en.json`, `src/i18n/ar.json` (`setup.*`, and `habits.<preset>` names)

**Interfaces:**
- Consumes: `getSolo`, `putSolo` (Task 3); `ApiError` from `src/api/client.ts`.
- Produces: `useSoloProfile(): { status: 'loading' | 'missing' | 'error' | 'ready'; profile: SoloProfileDto | null; reload(): Promise<void> }`. `'missing'` means `ApiError` with status 404.
- Produces: page `data-testid="page-setup"`, with steps `setup-goal`, `setup-target`, `setup-water`, `setup-habits`, `setup-avatar`.

Behavior:
- Five steps, one per screen, with Back and Next. Next is a `CtaButton`, disabled until the step is valid.
- Step 1: the four main goals.
- Step 2: target 2–6, default 3.
- Step 3: glasses 4–16, default 8, plus a glass/liter display toggle.
- Step 4: the 7 presets as chips plus "Add your own" (text field, 1–24 characters), max 5. Further chips are disabled once 5 are picked, with a hint.
- Step 5: links to the existing Character editor ("Customize now") or "Later".
- Finish calls `putSolo`, then `router.push('/tabs/home', 'root', 'replace')`.
- Habit ids are generated with `crypto.randomUUID()`.
- If `putSolo` fails, show the error with `Toast` and keep the answers.

- [ ] **Step 1: Write the failing component tests** (Testing Library, like `Login.test.tsx`):
  - Next is disabled until a goal is picked.
  - The target can't go below 2 or above 6.
  - Picking 5 habits disables the rest.
  - A custom habit of only spaces is rejected.
  - Finishing calls `putSolo` with the exact `SoloProfileDto` (mock `src/api/solo.ts` with `vi.mock`).
  - A rejected `putSolo` shows the error and stays on the page.
  - `useSoloProfile` maps a 404 to `'missing'`.
- [ ] **Step 2: Run** `npx vitest run src/pages/setup`. Expected: FAIL.
- [ ] **Step 3: Implement the steps and add the i18n strings** (Egyptian Arabic, for example "عايز توصل لإيه؟" for the goal step). Run `npm run i18n:check`.
- [ ] **Step 4: Run** `npm test` and `npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/pages/SoloSetup.tsx src/pages/setup src/pages/today/useSoloProfile.ts src/components/Tabs.tsx src/i18n/en.json src/i18n/ar.json
git commit -m "feat(mobile): add solo setup flow"
```

---

### Task 5: Today section on Home

Load `ui-standards` and `ionic-mobile-experience` first.

**Files:**
- Create: `src/pages/today/TodaySection.tsx`, `XpBar.tsx`, `WeeklyRing.tsx`, `TrainingCard.tsx`, `WaterRow.tsx`, `HabitChips.tsx`, `DaySwitch.tsx`, `TodaySection.test.tsx`
- Modify: `src/pages/Dashboard.tsx` (render `<TodaySection />` above the existing cards; when `useSoloProfile` is `'missing'`, redirect to `/tabs/home/setup`)
- Modify: `src/i18n/en.json`, `ar.json` (`today.*`, `training.<type>`, `tier.<tier>`)

**Interfaces:**
- Consumes: `getToday`, `putDay` (Task 3), `useSoloProfile` (Task 4), `CtaButton`, `Toast`, `UnlockCelebration` (its existing level-up style; reuse it only if its props fit, otherwise use a toast).
- Produces: test ids `today-section`, `xp-bar` (text `Lv N`), `weekly-ring` (text `N/T`), `train-button`, `train-type-<TYPE>`, `water-glass-<i>`, `habit-<id>`, `day-switch` (Today/Yesterday).

Behavior:
- `TodaySection` loads `getToday(date)`. `DaySwitch` toggles between today and yesterday (from `TodayDto.today`).
- **Optimistic writes:** every tap builds the full `PutDayRequest` from the current day, updates the screen at once, and calls `putDay`. The response replaces local state. On failure, revert and show a toast. Taps while a request is in flight are queued, so the latest state wins.
- Training: `train-button` opens a sheet of the 6 types. Picking one sets it. When already trained, the button shows the type, and the sheet adds "Didn't train" to clear it.
- Water: a row of `target` glass icons, plus extra glasses up to 40 after the target. Tapping glass i sets water to i+1. Tapping the last filled glass sets it to i. Shows "N/T glasses" or liters per the unit.
- Habits: a chip per profile habit (preset name from i18n, or the custom label). Tap toggles.
- `xpGained > 0` shows a "+N XP" toast. `levelUp` shows the level-up celebration.
- `editable: false` disables all controls (not expected for today or yesterday, but render correctly anyway).

- [ ] **Step 1: Write the failing tests** (`vi.mock('../../api/solo')`):
  - Renders level, ring and controls from a `TodayDto`.
  - Tapping glass 3 calls `putDay(today, { ...day, water: 3 })`.
  - Tapping it again calls with `water: 2`.
  - Toggling a habit sends `habitsDone` with and without its id.
  - Picking `LEGS` sends `training: 'LEGS'`.
  - A rejected `putDay` restores the previous state and shows a toast.
  - Switching to Yesterday calls `getToday(<yesterday>)`.
  - Two fast taps send two requests, in order, and the final screen matches the last response.
  - Dashboard redirects to setup when `useSoloProfile` is `'missing'`.
- [ ] **Step 2: Run** `npx vitest run src/pages/today`. Expected: FAIL.
- [ ] **Step 3: Implement the components and strings.** Keep the existing `Dashboard.test.tsx` passing: mock `getToday`/`getSolo` there too.
- [ ] **Step 4: Run** `npm test`, `npm run lint` and `npm run i18n:check`. Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/pages/today src/pages/Dashboard.tsx src/pages/Dashboard.test.tsx src/i18n/en.json src/i18n/ar.json
git commit -m "feat(mobile): add today section with training, water and habits"
```

---

### Task 6: End-to-end flow and a visual check

Load `e2e-testing` and `playwright-browser-check` first.

**Files:**
- Create: `e2e/solo.spec.ts`
- Modify: `e2e/home.spec.ts` only if the new section shifts something it asserts.

- [ ] **Step 1: Write the e2e tests.** Loop over `LOCALES` × `THEMES`, as `home.spec.ts` does:
  - New member `102`: `/tabs/home` redirects to the setup page. Complete the 5 steps, land on Home with `today-section` visible, `xp-bar` "Lv 1" and `weekly-ring` "0/3".
  - Tap train → `PUSH` → the ring shows "1/3". Fill water to the target. Tick every habit. The XP toast appears and the XP bar's total has increased.
  - Reload the page: the state is still there (Preferences).
  - Switch to Yesterday, log training, and the ring shows "2/3".
  - Member `101` shows the seeded week ("2/4") and a level ≥ 6.
  - `noHorizontalOverflow` at 320 px for both the setup page and Home.
- [ ] **Step 2: Run** `npx playwright test e2e/solo.spec.ts`. Expected: PASS. Then the full `npm run test:e2e`. Expected: PASS.
- [ ] **Step 3: Visual check** with `playwright-browser-check`: setup and Home in ar/dark and en/light at 320 px and on a tablet, with the notch area clear. Fix anything found and re-run Step 2.
- [ ] **Step 4: Commit**
```bash
git add e2e/solo.spec.ts e2e/home.spec.ts
git commit -m "test(e2e): cover solo setup and daily logging"
```
- [ ] **Step 5: Push** with `git push origin dev`.

---

## Done when

- A brand-new member is sent to setup, finishes it, and lands on Home with the Today section.
- Training, water and habits can be logged for today and yesterday, and survive a reload.
- The weekly ring, XP bar and level match the rules. Retries never double XP. Profile edits never lower past XP.
- Mohamed shows a believable seeded history.
- Lint, unit tests, i18n check and e2e all pass in en/ar × light/dark. Everything is pushed to `dev`.
