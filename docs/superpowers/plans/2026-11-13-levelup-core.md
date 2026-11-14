# LevelUP Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all 17 LevelUP core features from scratch: a white-label Ionic gym member app on a NestJS + Prisma + PostgreSQL API.

**Architecture:** Two repos. [`levelup-backend`](https://github.com/alielmayyah/levelup-backend) is a NestJS REST API (Phase 1). Members sign in with a Fit ID and get a JWT; staff endpoints use an API key. Domain rules (FitScore, goal progress, monthly wins) are pure functions with unit tests, and services call them. [`LevelUP`](https://github.com/alielmayyah/LevelUP) (this repo) is an Ionic React app (Vite + Capacitor) with five tabs, branded from one config file (Phase 2). The API is the source of truth for the contract: its DTO classes carry `@nestjs/swagger` decorators, and it commits the generated `openapi.json`. The app generates its types from that file with `openapi-typescript`, so drift between the two sides shows up as a type error in the app. This plan, the spec, and the backlog live in this repo; the API repo links here.

**Tech Stack:** Node 22 LTS, TypeScript (strict), NestJS 11, Prisma 6, PostgreSQL 16 (docker-compose), Jest + supertest (API), Ionic 8 + React 18 + Vite + Capacitor 7, Vitest + Testing Library (mobile), Chart.js via react-chartjs-2, date-fns + date-fns-tz.

**Spec:** [LevelUP-Features-Core.md](../../../LevelUP-Features-Core.md)

## Global Constraints

- Scope is the 17 core features only. Do not build XP, levels, or XP rewards anywhere (no columns, DTO fields, or copy). Do not count or track workouts or visits anywhere. Do not build Gym Streak, Gym Visit Tracking UI, XP History, Achievements, Trophies, Challenges, or Community Page.
- Tagline copy, verbatim: `Track. Improve. Transform.`
- Splash call to action, verbatim: `Tap to Begin`.
- Login uses a numeric Fit ID only. There is no password field.
- FitScore is private by default. The API returns another member's FitScore only when that member has `fitScoreOnLeaderboard = true`, and only in leaderboard data.
- FitScore is an integer from 0 to 100. Tiers run from `Elite` down to `Needs Improvement`.
- Branding (gym name, logo, colors) comes from one file in the app repo: `src/brand.config.ts`. No other file hard-codes a brand value.
- The tab bar is a floating bar with exactly 5 tabs: Home, Progress, Goals, Leaderboard, Profile.
- One deployment serves one gym (single-tenant). There is no `gymId` column.
- All month and day boundaries use the `GYM_TZ` env var (IANA zone, default `UTC`).
- Each task follows the `CLAUDE.md` of the repo it runs in. App tasks follow [this repo's CLAUDE.md](../../../CLAUDE.md): English + Arabic (RTL), light + dark themes, responsive from 320 px, safe-area aware, and within the performance budgets in `.claude/skills/ui-standards`. Mobile tasks add `en` and `ar` strings and Playwright coverage per `.claude/skills/e2e-testing`.
- Git follows `.claude/skills/git-workflow`: feature branches off `dev`, `type(scope): summary` commits grouped by topic, and no AI attribution in commits or PRs.

### Decisions this plan makes where the spec is silent (confirm or change before execution)

| Topic | Decision |
|---|---|
| FitScore formula | InBody Score method: `80 + (lean − standardLean) − max(0, fat − standardFat)` in kg (fat below standard earns nothing; checked against two real InBody sheets), rounded and clamped to 0–100. Standard weight = 22·h² (men) / 21.5·h² (women), h in m; ideal fat = 15% (men) / 23% (women) of it, the rest lean. Lean = weight − body-fat kg. Mirrors `computeFitScore` in the app's `src/api/mock/domain.ts` (Task 3) |
| FitScore tiers | InBody's bands: Elite ≥80, Strong 70–79, On Track 60–69, Building 50–59, Needs Improvement <50 |
| FitScore "daily change" | Difference from the previous assessment, labelled "since last scan" |
| Leaderboard ranking | Opt-in only (`fitScoreOnLeaderboard`, default `false`). There are 4 boards: `score` (latest fitScore), `progress` (FitScore points gained this month), `muscle` (kg of skeletal muscle gained this month), and `fatLoss` (body-fat % points lost this month). All rank descending, and ties go to the lower member id. Monthly boards include only members with a non-null monthly delta. The dashboard summary uses `score`. |
| Leaderboard streak column | Dropped, because Gym Streak is out of scope |
| Workouts / visits | Not tracked. There is no Visit model. |
| Assessments, goals, members | Created through staff endpoints protected by `x-staff-key` |
| Sound preference | Stored on the device (Capacitor Preferences), not on the server |
| Repos and contract | Two repos: `levelup-backend` (Phase 1) and `LevelUP` (Phase 2). The API commits `openapi.json` (`npm run openapi`), and the app regenerates `src/api/schema.d.ts` from it (`npm run api:types`). A change to a DTO is two PRs: the API PR first, then the app PR that regenerates types, each linking the other. |
| FitScore visibility | Per-member setting `showFitScore` stored on the server, default `true`. When `false`, the app hides the FitScore card, the change indicator, and the FitScore chart. The score is still computed and stored, and turning the setting back on restores it. This setting is independent of the leaderboard opt-in. |

## Review Focus

1. **Fit ID guessing.** Fit IDs are short numbers, so someone can try many in a row. Expected: login is limited to 5 attempts per minute per IP (the 6th gets 429), and an unknown ID gets the same 401 body as a malformed one. Test: Task 5.
2. **FitScore leaking through the leaderboard.** Expected: members who have not opted in never appear in leaderboard rows or count toward `totalMembers`, and a member who opts out disappears on the next request. Test: Task 8.
3. **A new member with 0 or 1 assessments.** Expected: the dashboard returns `null` for fitScore and change, and monthly-wins deltas are `null`, never `NaN`. The cards show empty states. Tests: Tasks 7 and 13.
4. **Month boundary in the gym's timezone.** Expected: with `GYM_TZ=Asia/Dubai`, a scan at `2026-10-31T21:30Z` (01:30 Nov 1 local) counts as November's scan in Monthly Wins. Test: Task 7.
5. **Goal overshoot or regression.** Expected: progress is clamped to 0–100%, and estimated completion is `null` when the trend is flat or moving away from the target. Test: Task 4.

---

## File Structure

```
levelup-backend/                    (separate repo; Phase 1)
  package.json, docker-compose.yml (postgres:16), .env.example
  openapi.json                  generated contract, committed (npm run openapi)
  prisma/schema.prisma, prisma/seed.ts
  src/main.ts, src/app.module.ts
  src/prisma/prisma.service.ts
  src/domain/fitscore.ts        pure: computeFitScore, fitScoreTier
  src/domain/goal-progress.ts   pure: goalProgress
  src/domain/month.ts           pure: monthRange(date, tz)
  src/auth/                     auth.controller, auth.service, jwt.guard, staff-key.guard, dto/
  src/staff/                    staff.controller, ingest.service (assessments, members, goals), dto/
  src/me/                       me.controller, dashboard.service, progress.service, goals.service, dto/
  src/leaderboard/              leaderboard.controller, leaderboard.service, dto/
  src/notifications/            notifications.controller, notifications.service, dto/
  test/*.e2e-spec.ts
LevelUP/                        (this repo; Phase 2)
  package.json                  Ionic app at the repo root
  src/brand.config.ts, src/theme/applyBrand.ts
  src/api/client.ts, src/api/types.ts (DTO names), src/api/schema.d.ts (generated)
  src/auth/AuthContext.tsx, src/sound/useSound.ts
  src/lib/greeting.ts
  src/pages/{Splash,Login,Dashboard,Progress,Goals,Leaderboard,Profile}.tsx
  src/components/{TabBar,NotificationBell,NotificationsModal}.tsx
  src/components/dashboard/{Greeting,LeaderboardSummaryCard,FitScoreCard,MissionCard,MonthlyWins}.tsx
```

`src/api/types.ts` is the only file components import DTO types from. In Sprint 1 it holds hand-written interfaces copied from this plan. Once the API exists, each type becomes a re-export from the generated schema (`export type DashboardDto = components['schemas']['DashboardDto']`), so components never change.

Every DTO in Phase 1 is a class in the module's `dto/` folder with `@ApiProperty` decorators. Nullable fields use `nullable: true` and unions use `enum`, so the generated schema matches the interfaces in this plan exactly.

---

## Phase 1 — Backend (repo: `levelup-backend`)

All paths and commands in Phase 1 are relative to the root of the `levelup-backend` repo.

### Task 1: API scaffold, Postgres, OpenAPI contract

**Files:**
- Create: `package.json`, `docker-compose.yml`, `.gitignore`, `.env.example`, Nest CLI scaffold at the repo root, `scripts/openapi.ts`, `openapi.json`
- Test: `test/health.e2e-spec.ts`

**Interfaces:**
- Produces: `GET /health` → `{ status: "ok" }`. `GET /docs-json` serves the OpenAPI document. `npm run openapi` writes it to `openapi.json` without a database. Env vars `DATABASE_URL`, `JWT_SECRET`, `STAFF_API_KEY`, `GYM_TZ`.

- [ ] **Step 1:** Scaffold the API at the repo root with `npx @nestjs/cli new . --skip-git --package-manager npm`. Create `docker-compose.yml` with a `postgres:16` service on port 5432 (user, password, and db all `levelup`). Add `@nestjs/swagger`: `main.ts` builds the document with `DocumentBuilder` and serves it at `/docs` and `/docs-json`. `scripts/openapi.ts` creates the app with `NestFactory.create(AppModule, { preview: true })`, builds the same document, and writes `openapi.json`.
- [ ] **Step 2: Write the failing test**

```ts
it('GET /health returns ok', () =>
  request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' }));
```

- [ ] **Step 3:** Run `npm run test:e2e`. Expected: FAIL with a 404.
- [ ] **Step 4:** Add a `HealthController` with `@Get('health')`. Add `ConfigModule.forRoot({ isGlobal: true })`.
- [ ] **Step 5:** Run `npm run test:e2e`, then `npm run openapi`. Expected: PASS, and `openapi.json` lists `/health`.
- [ ] **Step 6:** Commit: `chore(api): scaffold api, postgres, openapi contract`.

From Task 5 on, every task that adds or changes a DTO ends by running `npm run openapi` and committing `openapi.json` in the same commit. CI fails if `openapi.json` is out of date (`npm run openapi && git diff --exit-code openapi.json`).

### Task 2: Prisma schema and seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `src/prisma/prisma.service.ts`
- Test: `test/seed.e2e-spec.ts`

**Interfaces:**
- Produces these models, with field names used by every later task:
  - `Coach { id, name }`
  - `Member { id Int, fitId String @unique, firstName, lastName, sex Sex(MALE|FEMALE), birthDate DateTime, heightCm Float, membershipPlan String, membershipStart DateTime, membershipEnd DateTime, coachId Int?, showFitScore Boolean @default(true), fitScoreOnLeaderboard Boolean @default(false), createdAt }`
  - `Assessment { id, memberId, takenAt, weightKg, skeletalMuscleKg, bodyFatKg, bodyFatPct, bmi, visceralFatLevel Int, totalBodyWaterKg, proteinKg, mineralsKg, bmrKcal Int, fitScore Int }`. All unspecified numbers are `Float`. Index on `(memberId, takenAt)`.
  - `Goal { id, memberId, title, metric GoalMetric(BODY_FAT_KG|MUSCLE_KG|WEIGHT_KG), startValue Float, targetValue Float, startDate, deadline, status GoalStatus(ACTIVE|COMPLETED|UPCOMING), coachNote String?, completedAt DateTime? }`
  - `Notification { id, memberId, title, body, readAt DateTime?, createdAt }`
  - `PrismaService extends PrismaClient` (global module).

- [ ] **Step 1: Write the failing test.** It runs the seed against the test DB and asserts:

```ts
expect(await prisma.member.count()).toBe(20);
const demo = await prisma.member.findUniqueOrThrow({ where: { fitId: '100001' } });
expect(await prisma.assessment.count({ where: { memberId: demo.id } })).toBeGreaterThanOrEqual(6);
expect(await prisma.goal.count({ where: { memberId: demo.id, status: 'ACTIVE' } })).toBe(1);
```

- [ ] **Step 2:** Run `npm run test:e2e -- seed`. Expected: FAIL (the models do not exist).
- [ ] **Step 3:** Write the schema. Run `npx prisma migrate dev --name init`. Write the seed: 2 coaches; 20 members with fitIds `100001`–`100020`; 6 monthly assessments for the demo member and 1–4 for the others; one ACTIVE, one COMPLETED, and one UPCOMING goal for the demo member; set `fitScoreOnLeaderboard = true` on 15 of the 20 members (including the demo member) so the leaderboard has a spread. Compute the seed's `fitScore` values with Task 3's function if it exists, or hard-code them for now and re-seed after Task 3. Add the script `db:reset` (`prisma migrate reset --force`, which re-runs the seed); the app repo's e2e setup calls it.
- [ ] **Step 4:** Re-run the test. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): prisma schema and seed`.

### Task 3: FitScore domain

**Files:**
- Create: `src/domain/fitscore.ts`
- Test: `src/domain/fitscore.spec.ts`

**Interfaces:**
- Produces: `computeFitScore(a: { sex: 'MALE'|'FEMALE'; weightKg: number; skeletalMuscleKg: number; bodyFatPct: number; visceralFatLevel: number }): number` and `fitScoreTier(score: number): 'Elite'|'Strong'|'On Track'|'Building'|'Needs Improvement'`.

The sub-scores, each clamped to 0–100:
- **fat:** 100 when inside the healthy band (MALE 10–20%, FEMALE 18–28%). Subtract 5 per percentage point outside the band.
- **muscle:** a linear ratio `skeletalMuscleKg / weightKg`. MALE runs from 0.30 (score 0) to 0.45 (score 100). FEMALE runs from 0.25 to 0.38.
- **visceral:** 100 when level ≤ 9. Subtract 10 per level above 9.

- [ ] **Step 1: Write the failing tests**

```ts
const base = { sex: 'MALE' as const, weightKg: 80, skeletalMuscleKg: 36, bodyFatPct: 15, visceralFatLevel: 8 };
it('perfect male scores 100', () => expect(computeFitScore(base)).toBe(100));
it('fat 30% male loses 50 fat pts', () => expect(computeFitScore({ ...base, bodyFatPct: 30 })).toBe(80));
it('clamps to 0', () => expect(computeFitScore({ ...base, bodyFatPct: 60, skeletalMuscleKg: 10, visceralFatLevel: 30 })).toBe(0));
it('female band differs', () => expect(computeFitScore({ ...base, sex: 'FEMALE', bodyFatPct: 25, skeletalMuscleKg: 30.4 })).toBe(100));
it.each([[85,'Elite'],[84,'Strong'],[70,'Strong'],[55,'On Track'],[40,'Building'],[39,'Needs Improvement']])
  ('tier(%i)=%s', (s, t) => expect(fitScoreTier(s)).toBe(t));
```

- [ ] **Step 2:** Run `npm test -- fitscore`. Expected: FAIL (the module is not found).
- [ ] **Step 3:** Implement both functions in `fitscore.ts`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): fitscore formula and tiers`.

### Task 4: Goal progress and month domain

**Files:**
- Create: `src/domain/goal-progress.ts`, `src/domain/month.ts`
- Test: `src/domain/{goal-progress,month}.spec.ts`

**Interfaces:**
- Produces:
  - `goalProgress(g: { startValue: number; targetValue: number; startDate: Date }, current: number, now: Date): { percent: number; doneKg: number; remainingKg: number; estimatedCompletion: Date | null; reached: boolean }`
  - `monthRange(at: Date, tz: string): { start: Date; end: Date }`. `end` is exclusive, and both values are UTC instants.
  - `monthDelta(scans: { takenAt: Date; value: number }[], range: { start: Date; end: Date }): number | null`. It returns the latest value inside the range minus a baseline. The baseline is the latest value before `range.start`, or, if there is none, the first value inside the range. It returns `null` when there is no scan in the range or only one scan in total. Monthly Wins (Task 7) and the monthly boards (Task 8) both use it.

Goal direction comes from the sign of `targetValue - startValue`. `percent` is clamped to 0–100 and rounded to an integer. `estimatedCompletion` is a linear projection of the progress rate since `startDate`. It is `null` when `doneKg <= 0`.

- [ ] **Step 1: Write the failing tests**

```ts
const g = { startValue: 20, targetValue: 15, startDate: new Date('2026-10-01T00:00:00Z') }; // lose 5 kg fat
const now = new Date('2026-10-11T00:00:00Z');
it('halfway', () => expect(goalProgress(g, 17.5, now)).toMatchObject({ percent: 50, doneKg: 2.5, remainingKg: 2.5, reached: false }));
it('projects completion', () => expect(goalProgress(g, 17.5, now).estimatedCompletion).toEqual(new Date('2026-10-21T00:00:00Z')));
it('overshoot clamps 100 and reached', () => expect(goalProgress(g, 14, now)).toMatchObject({ percent: 100, reached: true, remainingKg: 0 }));
it('regression clamps 0, no estimate', () => expect(goalProgress(g, 21, now)).toMatchObject({ percent: 0, estimatedCompletion: null }));
it('gain goal works', () => expect(goalProgress({ ...g, startValue: 30, targetValue: 34 }, 31, now).percent).toBe(25));
const nov = { start: new Date('2026-11-01T00:00:00Z'), end: new Date('2026-12-01T00:00:00Z') };
const sc = (d: string, value: number) => ({ takenAt: new Date(d), value });
it('delta vs last scan before month', () => expect(monthDelta([sc('2026-10-20', 60), sc('2026-11-05', 62), sc('2026-11-20', 65)], nov)).toBe(5));
it('delta within month when no earlier scan', () => expect(monthDelta([sc('2026-11-05', 62), sc('2026-11-20', 65)], nov)).toBe(3));
it('null when no scan this month', () => expect(monthDelta([sc('2026-10-20', 60)], nov)).toBeNull());
it('null with a single scan', () => expect(monthDelta([sc('2026-11-05', 62)], nov)).toBeNull());
it('month in gym tz', () => expect(monthRange(new Date('2026-10-31T21:30:00Z'), 'Asia/Dubai').start)
  .toEqual(new Date('2026-10-31T20:00:00Z')));
```

- [ ] **Step 2:** Run `npm test -- domain`. Expected: FAIL.
- [ ] **Step 3:** Implement. Use `date-fns-tz` (`toZonedTime` / `fromZonedTime`) for `monthRange`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): goal progress and month helpers`.

### Task 5: Fit ID auth and staff key

**Files:**
- Create: `src/auth/{auth.module,auth.controller,auth.service,jwt.guard,staff-key.guard,current-member.decorator}.ts`
- Create: `src/auth/dto/login.dto.ts` (`LoginDto`, `LoginResponse`)
- Test: `test/auth.e2e-spec.ts`

**Interfaces:**
- Produces:
  - `POST /auth/login { fitId: string }` → `LoginResponse { accessToken: string; member: { id: number; firstName: string } }`
  - `JwtGuard`, which sets `req.memberId`
  - `@CurrentMember()` param decorator → `number`
  - `StaffKeyGuard`, which checks the `x-staff-key` header against `STAFF_API_KEY`
- The JWT expires after 30 days. `fitId` must match `/^\d{6,8}$/`. Rate limiting uses `@nestjs/throttler`: 5 requests per 60 s on the login route.

- [ ] **Step 1: Write the failing tests**

```ts
it('valid fitId returns token', async () => {
  const r = await request(s).post('/auth/login').send({ fitId: '100001' }).expect(201);
  expect(r.body.accessToken).toEqual(expect.any(String));
});
it('unknown and malformed get identical 401', async () => {
  const a = await request(s).post('/auth/login').send({ fitId: '999999' }).expect(401);
  const b = await request(s).post('/auth/login').send({ fitId: 'abc' }).expect(401);
  expect(a.body).toEqual(b.body);
});
it('6th attempt in a minute is 429', async () => { for (let i=0;i<5;i++) await request(s).post('/auth/login').send({ fitId:'999999' }); await request(s).post('/auth/login').send({ fitId:'999999' }).expect(429); });
it('staff route without key is 401', () => request(s).post('/staff/members').send({}).expect(401));
```

- [ ] **Step 2:** Run `npm run test:e2e -- auth`. Expected: FAIL.
- [ ] **Step 3:** Implement. Validation failures throw the same `UnauthorizedException('Invalid Fit ID')` as unknown IDs. Do not use a 400. Add a stub `POST /staff/members` behind `StaffKeyGuard` so the last test has a target; Task 6 fills it in.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): fit id login, jwt and staff guards`.

### Task 6: Staff ingest (members, assessments, goals)

**Files:**
- Create: `src/staff/{staff.module,staff.controller,ingest.service}.ts`, `src/notifications/notifications.service.ts` (the `create` method only)
- Test: `test/staff.e2e-spec.ts`

**Interfaces:**
- Consumes: `computeFitScore` (Task 3), `goalProgress` (Task 4), `StaffKeyGuard` (Task 5)
- Produces (all behind `StaffKeyGuard`):
  - `POST /staff/members` (Member fields minus id) → `{ id, fitId }`
  - `POST /staff/assessments { memberId, takenAt, weightKg, skeletalMuscleKg, bodyFatKg, bodyFatPct, bmi, visceralFatLevel, totalBodyWaterKg, proteinKg, mineralsKg, bmrKcal }` → the Assessment with `fitScore`
  - `POST /staff/goals` (Goal fields minus id/completedAt)
  - `NotificationsService.create(memberId: number, title: string, body: string): Promise<void>`

`IngestService.recordAssessment` runs in one transaction. It saves the assessment with its computed fitScore and evaluates the ACTIVE goal. If `goalProgress(...).reached`: the goal is marked COMPLETED with `completedAt`, the earliest UPCOMING goal is promoted to ACTIVE, and the notification "Mission complete!" is created. Every assessment also creates the notification "New scan results are in". The current value for each metric comes from the assessment: `BODY_FAT_KG` uses `bodyFatKg`, `MUSCLE_KG` uses `skeletalMuscleKg`, and `WEIGHT_KG` uses `weightKg`.

- [ ] **Step 1: Write the failing tests**

```ts
it('assessment stores computed fitScore', async () => {
  const r = await staff.post('/staff/assessments').send(scan).expect(201);
  expect(r.body.fitScore).toBe(computeFitScore({ ...scan, sex: 'MALE' }));
});
it('reaching target completes goal and promotes upcoming', async () => {
  await staff.post('/staff/assessments').send({ ...scan, bodyFatKg: activeGoal.targetValue - 0.1 }).expect(201);
  expect((await prisma.goal.findUniqueOrThrow({ where: { id: activeGoal.id } })).status).toBe('COMPLETED');
  expect(await prisma.goal.findUniqueOrThrow({ where: { id: upcomingGoal.id } })).toMatchObject({ status: 'ACTIVE' });
  expect(await prisma.notification.count({ where: { memberId: id, title: 'Mission complete!' } })).toBe(1);
});
it('rejects negative weight with 400', () => staff.post('/staff/assessments').send({ ...scan, weightKg: -1 }).expect(400));
```

- [ ] **Step 2:** Run `npm run test:e2e -- staff`. Expected: FAIL.
- [ ] **Step 3:** Implement with `class-validator` DTOs (`@IsPositive` on the masses, `@IsDateString` on the dates) and a global `ValidationPipe({ whitelist: true })`.
- [ ] **Step 4:** Re-run. Expected: PASS. Then re-run `npx prisma db seed` so the seed's fitScores come from the real formula.
- [ ] **Step 5:** Commit: `feat(api): staff ingest with fitscore and goal completion`.

### Task 7: Dashboard endpoint

**Files:**
- Create: `src/me/{me.module,me.controller,dashboard.service}.ts`
- Create: `src/me/dto/dashboard.dto.ts` (`DashboardDto`)
- Test: `test/dashboard.e2e-spec.ts`

**Interfaces:**
- Consumes: `fitScoreTier`, `goalProgress`, `monthRange`, `monthDelta`, `JwtGuard`, `LeaderboardService.monthlySummary` (Task 8; build Task 8 first or stub it and fill it in during Task 8)
- Produces: `GET /me/dashboard` → `DashboardDto`:

```ts
interface DashboardDto {
  member: { firstName: string; showFitScore: boolean };
  fitScore: { score: number; tier: string; changeSinceLastScan: number | null } | null;
  mission: { goalId: number; title: string; percent: number; doneKg: number; remainingKg: number;
             estimatedCompletion: string | null; coachNote: string | null; deadline: string } | null;
  monthlyWins: { bodyFatChangePct: number | null; muscleGainedKg: number | null };
  leaderboard: { optedIn: boolean; standing: { rank: number; totalMembers: number; topPercent: number; membersBehind: number; pointsToNextRank: number | null } | null };
  unreadNotifications: number;
}
```

Monthly-wins deltas compare the latest assessment in the current month (in `GYM_TZ`) with the latest assessment before the month started. If there is no earlier one, they use the first assessment in the month. They are `null` when fewer than 2 assessments are available. The mission is the ACTIVE goal with the earliest deadline.

- [ ] **Step 1: Write the failing tests**

```ts
it('demo member gets full dashboard', async () => {
  const d: DashboardDto = (await authed('100001').get('/me/dashboard').expect(200)).body;
  expect(d.fitScore!.score).toBeGreaterThanOrEqual(0);
  expect(d.mission!.percent).toBeGreaterThanOrEqual(0);
  expect(d.leaderboard.standing!.rank).toBeGreaterThanOrEqual(1);
});
it('member with no scans gets nulls, not NaN', async () => {
  const d = (await authed(newMemberFitId).get('/me/dashboard').expect(200)).body;
  expect(d.fitScore).toBeNull(); expect(d.monthlyWins.bodyFatChangePct).toBeNull(); expect(d.mission).toBeNull();
});
it('scan at 01:30 local Nov 1 (Dubai) counts in November', async () => {
  process.env.GYM_TZ = 'Asia/Dubai'; jest.setSystemTime(new Date('2026-11-15T08:00:00Z'));
  await staff.post('/staff/assessments').send({ ...scan, memberId, takenAt: '2026-10-25T08:00:00Z', skeletalMuscleKg: 30 });
  await staff.post('/staff/assessments').send({ ...scan, memberId, takenAt: '2026-10-31T21:30:00Z', skeletalMuscleKg: 31 });
  expect((await authed(fid).get('/me/dashboard')).body.monthlyWins.muscleGainedKg).toBeCloseTo(1);
});
it('opted-out member gets optedIn false and no standing', async () => {
  const d = (await authed(optedOutFitId).get('/me/dashboard')).body;
  expect(d.leaderboard).toEqual({ optedIn: false, standing: null });
});
it('401 without token', () => request(s).get('/me/dashboard').expect(401));
```

- [ ] **Step 2:** Run `npm run test:e2e -- dashboard`. Expected: FAIL.
- [ ] **Step 3:** Implement `DashboardService.forMember(memberId: number, now = new Date()): Promise<DashboardDto>`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): member dashboard endpoint`.

### Task 8: Leaderboard

**Files:**
- Create: `src/leaderboard/{leaderboard.module,leaderboard.controller,leaderboard.service}.ts`
- Create: `src/leaderboard/dto/leaderboard.dto.ts` (`LeaderboardDto`, `LeaderboardBoard`)
- Test: `test/leaderboard.e2e-spec.ts`

**Interfaces:**
- Consumes: `monthRange`, `monthDelta` (Task 4), `PATCH /me/settings` (Task 9) for the opt-out test
- Produces:
  - `LeaderboardService.monthlySummary(memberId: number, now: Date): Promise<DashboardDto['leaderboard']>`
  - `GET /leaderboard?board=score|progress|muscle|fatLoss` (default `score`, JWT required) → `LeaderboardDto { board: LeaderboardBoard; optedIn: boolean; rows: { rank: number; memberId: number; name: string; value: number; isMe: boolean }[] }`. `LeaderboardBoard = 'score'|'progress'|'muscle'|'fatLoss'` is a swagger `enum`, so the app gets it as a string union. An unknown board is a 400.
- The pool is members with `fitScoreOnLeaderboard = true`. The `value` for each board:
  - `score`: the latest fitScore. Requires ≥1 assessment.
  - `progress`: `monthDelta` of fitScore.
  - `muscle`: `monthDelta` of skeletalMuscleKg, rounded to 0.1.
  - `fatLoss`: `-monthDelta` of bodyFatPct, rounded to 0.1.
  Members whose value is `null` are left out of that board. Rows sort by `value` descending, with `id` ascending as the tie-break. The summary below always uses the `score` board. `topPercent = ceil(rank / total * 100)`. `membersBehind = total - rank`. `pointsToNextRank = (score of rank-1) - (my score) + 1`, or `null` at rank 1. `standing` is `null` when the caller has not opted in or has no assessment. An opted-out caller still gets the rows (so they can see what they'd join), but `optedIn` is `false` and none of the rows are theirs. Names display as `"FirstName L."`.

- [ ] **Step 1: Write the failing tests**

```ts
it('only opted-in members appear', async () => {
  const rows = (await authed('100001').get('/leaderboard').expect(200)).body.rows;
  expect(rows).toHaveLength(15); expect(rows.map(r => r.memberId)).not.toContain(optedOutId);
});
it('opting out removes me on next request', async () => {
  await authed('100001').patch('/me/settings').send({ fitScoreOnLeaderboard: false });
  expect((await authed('100001').get('/leaderboard')).body.rows.some(r => r.isMe)).toBe(false);
});
it.each(['score','progress','muscle','fatLoss'])('board %s orders by value desc', async (board) => {
  const r = (await authed('100001').get(`/leaderboard?board=${board}`).expect(200)).body;
  expect(r.board).toBe(board);
  expect(r.rows.map(x => x.value)).toEqual([...r.rows.map(x => x.value)].sort((a,b)=>b-a));
});
it('progress board omits members with no scan this month', async () => {
  const rows = (await authed('100001').get('/leaderboard?board=progress')).body.rows;
  expect(rows.map(r => r.memberId)).not.toContain(noScanThisMonthId);
});
it('fatLoss value is positive when fat dropped', async () => {
  const me = (await authed('100001').get('/leaderboard?board=fatLoss')).body.rows.find(r => r.isMe);
  expect(me.value).toBeCloseTo(demoFatPctStartOfMonth - demoFatPctLatest, 1);
});
it('unknown board is 400', () => authed('100001').get('/leaderboard?board=visits').expect(400));
it('no row exposes xp or level', async () => {
  for (const row of (await authed('100001').get('/leaderboard')).body.rows) { expect(row).not.toHaveProperty('totalXp'); expect(row).not.toHaveProperty('level'); }
});
it('summary math', async () => {
  const s = await svc.monthlySummary(lastPlaceId, now);
  expect(s).toMatchObject({ optedIn: true, standing: { rank: 15, totalMembers: 15, topPercent: 100, membersBehind: 0 } });
});
```

- [ ] **Step 2:** Run `npm run test:e2e -- leaderboard`. Expected: FAIL.
- [ ] **Step 3:** Implement. One query fetches opted-in members with their assessments from the start of the previous month onward, plus the latest assessment before that. Values come from `monthDelta` and ranks are computed in memory. Seed data must give at least 3 opted-in members scans this month so each monthly board has rows. Return an explicit DTO; never spread the Member object.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): opt-in fitscore leaderboard`.

### Task 9: Progress, goals, profile, and notifications endpoints

**Files:**
- Create: `src/me/{progress.service,goals.service}.ts`, `src/notifications/notifications.controller.ts`
- Create: `src/me/dto/{progress,assessment,goals,profile,settings}.dto.ts`, `src/notifications/dto/notification.dto.ts`
- Modify: `src/me/me.controller.ts`, `src/notifications/notifications.service.ts`
- Test: `test/me.e2e-spec.ts`

**Interfaces:**
- Produces (all JWT-guarded):
  - `GET /me/progress` → `ProgressDto { assessments: { takenAt; weightKg; skeletalMuscleKg; bodyFatPct; fitScore }[] }` (ascending)
  - `GET /me/assessments` → the full Assessment records (all 9 metrics plus fitScore), newest first
  - `GET /me/goals` → `GoalsDto { active: GoalView[]; completed: GoalView[]; upcoming: GoalView[] }`, where `GoalView = { id; title; metric; startValue; targetValue; deadline; coachNote; percent; completedAt }`
  - `GET /me` → `ProfileDto { firstName; lastName; fitId; sex; birthDate; heightCm; membershipPlan; membershipStart; membershipEnd; coach: { name } | null; showFitScore; fitScoreOnLeaderboard }`
  - `PATCH /me/settings { showFitScore?: boolean; fitScoreOnLeaderboard?: boolean }` → `{ showFitScore: boolean; fitScoreOnLeaderboard: boolean }`. Both fields are optional `@IsBoolean`; a non-boolean or an empty body is a 400.
  - `GET /me/notifications` → `NotificationDto[]` (newest first, at most 50)
  - `PATCH /me/notifications/:id/read`
  - `POST /me/notifications/read-all`

- [ ] **Step 1: Write the failing tests**

```ts
it('progress is empty array for new member', async () => {
  expect((await authed(newMemberFitId).get('/me/progress').expect(200)).body.assessments).toEqual([]);
});
it('goals grouped by status', async () => {
  const g = (await authed('100001').get('/me/goals')).body;
  expect([g.active.length, g.completed.length, g.upcoming.length]).toEqual([1, 1, 1]);
});
it('cannot mark another member notification read', async () => {
  await authed('100002').patch(`/me/notifications/${demoNotificationId}/read`).expect(404);
});
it('hiding fitScore persists and shows in dashboard', async () => {
  await authed('100001').patch('/me/settings').send({ showFitScore: false }).expect(200, { showFitScore: false, fitScoreOnLeaderboard: true });
  expect((await authed('100001').get('/me/dashboard')).body.member.showFitScore).toBe(false);
  await authed('100001').patch('/me/settings').send({ showFitScore: 'nope' }).expect(400);
  await authed('100001').patch('/me/settings').send({}).expect(400);
});
it('read-all zeroes unread count', async () => {
  await authed('100001').post('/me/notifications/read-all').expect(201);
  expect((await authed('100001').get('/me/dashboard')).body.unreadNotifications).toBe(0);
});
```

- [ ] **Step 2:** Run `npm run test:e2e -- me`. Expected: FAIL.
- [ ] **Step 3:** Implement. Every query filters by `memberId` from the JWT. Updates use `updateMany({ where: { id, memberId } })` and return 404 when the count is 0.
- [ ] **Step 4:** Run the full suite with `npm test && npm run test:e2e`. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat(api): progress, goals, profile, notifications`.

---

## Phase 2 — Mobile (Ionic React, repo: `LevelUP`)

All paths and commands in Phase 2 are relative to the root of this repo. Running the app against the real API needs a `levelup-backend` checkout running locally (see its README); the app reads its URL from `VITE_API_URL`.

### Task 10: Ionic scaffold, branding, tab bar, API client

**Files:**
- Create: Ionic CLI scaffold at the repo root, `src/api/schema.d.ts` (generated), `src/api/types.ts`, `src/brand.config.ts`, `src/theme/applyBrand.ts`, `src/components/TabBar.tsx`, `src/api/client.ts`, `public/brand/logo.png` (copied from the root `logo.png`)
- Test: `src/theme/applyBrand.test.ts`, `src/components/TabBar.test.tsx`

**Interfaces:**
- Produces:
  - `brand: { gymName: string; logo: string; tagline: string; colors: { primary: string; secondary: string; background: string; surface: string; text: string } }`
  - `applyBrand(b = brand, root = document.documentElement): void`. It sets `--ion-color-primary`, `--ion-color-secondary`, `--ion-background-color`, `--lu-surface`, and `--ion-text-color`, and sets `document.title = gymName`.
  - `api<T>(path: string, init?: RequestInit): Promise<T>`. It reads the base URL from `VITE_API_URL` and adds `Authorization: Bearer <token>` from `getToken()`. On 401 it calls the registered `onUnauthorized()` handler.
  - Routes: `/splash`, `/login`, `/tabs/home`, `/tabs/progress`, `/tabs/goals`, `/tabs/leaderboard`, `/tabs/profile`

- [ ] **Step 1:** Scaffold with `npx @ionic/cli start levelup tabs --type=react --capacitor --no-git` and move the generated files to the repo root. Add `openapi-typescript` and the script `api:types`, which runs `openapi-typescript ${OPENAPI_SRC:-../levelup-backend/openapi.json} -o src/api/schema.d.ts`. `OPENAPI_SRC` can also be the raw GitHub URL of the API repo's `openapi.json`. Run it, and make `src/api/types.ts` re-export each DTO from the generated `components['schemas']`.
- [ ] **Step 2: Write the failing tests**

```ts
it('applyBrand sets css vars and title', () => {
  applyBrand({ ...brand, gymName: 'Iron Gym', colors: { ...brand.colors, primary: '#ff0000' } });
  expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe('#ff0000');
  expect(document.title).toBe('Iron Gym');
});
it('tab bar has 5 tabs in order', () => {
  render(<MemoryRouter><TabBar /></MemoryRouter>);
  expect(screen.getAllByRole('tab').map(t => t.textContent)).toEqual(['Home','Progress','Goals','Leaderboard','Profile']);
});
```

- [ ] **Step 3:** Run `npm test`. Expected: FAIL.
- [ ] **Step 4:** Implement. The tab bar floats with `position: absolute; bottom: 16px; border-radius: 24px`. A pill indicator `div` sits behind the active tab and animates with `transform: translateX(index * 100%)` (`transition: transform 250ms ease`). Its offset comes from the matched route.
- [ ] **Step 5:** Re-run. Expected: PASS. Run `grep -rn "#[0-9a-fA-F]\{6\}" src --include=*.tsx`. Expected: no matches (colors live only in the config).
- [ ] **Step 6:** Commit: `feat(mobile): ionic scaffold, white-label theme, tab bar`.

### Task 11: Splash, Fit ID login, sound toggle, auth

**Files:**
- Create: `src/pages/Splash.tsx`, `src/pages/Splash.css`, `src/pages/Login.tsx`, `src/auth/AuthContext.tsx`, `src/sound/useSound.ts`, `public/sounds/tap.mp3`
- Test: `src/pages/Login.test.tsx`, `src/sound/useSound.test.ts`

**Interfaces:**
- Consumes: `api`, `brand`, `LoginResponse`
- Produces:
  - `useAuth(): { token: string | null; login(fitId: string): Promise<void>; logout(): void }`. The token is stored with `@capacitor/preferences` under the key `lu.token`. A 401 from `api` calls `logout()`.
  - `useSound(): { enabled: boolean; toggle(): void; play(name: 'tap'|'success'): void }`. The preference is stored under `lu.sound`, defaults to `true`, and `play` does nothing when the preference is disabled.

Splash shows the logo inside a glow ring (an animated `box-shadow` pulse) over a starfield (a CSS layer of `radial-gradient` dots that drifts slowly), plus the tagline and `Tap to Begin`. Tapping anywhere plays `tap` and goes to `/login`, or to `/tabs/home` if a token exists. Splash and Login both show the sound toggle button (an `aria-label` that switches between "Mute sound" and "Unmute sound"). Login has one `inputmode="numeric"` field and a submit button. On 401 it shows "We couldn't find that Fit ID. Check with the front desk."

- [ ] **Step 1: Write the failing tests**

```tsx
it('rejects non-numeric input client-side', async () => {
  renderLogin(); await user.type(screen.getByLabelText('Fit ID'), '12ab');
  expect(screen.getByLabelText('Fit ID')).toHaveValue('12');
});
it('shows front-desk message on 401', async () => {
  mockApi.reject(401); renderLogin(); await user.type(screen.getByLabelText('Fit ID'), '999999');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText(/check with the front desk/i)).toBeInTheDocument();
});
it('has no password field', () => { renderLogin(); expect(document.querySelector('input[type=password]')).toBeNull(); });
it('sound off means play is a no-op', () => {
  const { result } = renderHook(useSound); act(() => result.current.toggle());
  result.current.play('tap'); expect(audioPlay).not.toHaveBeenCalled();
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement. Respect `prefers-reduced-motion` by turning off the starfield drift and the ring pulse.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): splash, fit id login, sound toggle`.

### Task 12: Dashboard (Home tab)

**Files:**
- Create: `src/lib/greeting.ts`, `src/pages/Dashboard.tsx`, `src/components/dashboard/{Greeting,LeaderboardSummaryCard,FitScoreCard,MissionCard,MonthlyWins}.tsx`, `src/components/NotificationBell.tsx`
- Test: `src/lib/greeting.test.ts`, `src/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `GET /me/dashboard` → `DashboardDto`
- Produces:
  - `greeting(firstName: string, now: Date): { headline: string; quote: string }`. Hours 5–11 give `Good morning, {name}`, 12–16 `Good afternoon, {name}`, and 17–21 `Good evening, {name}`. Other hours give `Late session, {name}? Respect.` The quote is `QUOTES[dayOfYear % QUOTES.length]`, with at least 14 quotes in `greeting.ts`.
  - `<NotificationBell unread={number} onClick={() => void} />`. It shows a dot when `unread > 0` and has `aria-label="Notifications, {n} unread"`.

Card copy:
- **Leaderboard:** `#{rank} in the gym · Top {topPercent}%`, `{membersBehind} members behind you`. The nudge is `{pointsToNextRank} FitScore points to climb to #{rank-1}`, or `You're #1, defend it!` at rank 1. When `optedIn` is `false`, the card says "Join the FitScore leaderboard" and links to Profile → Settings. When opted in but `standing` is `null`, it says "You'll be ranked after your first scan."
- **FitScore:** the score, the tier, and `▲ +n` / `▼ −n` / `—` since last scan. The card is labelled "Private". When `member.showFitScore` is `false`, the card is not rendered.
- **Mission:** a percent ring, `{doneKg} of {doneKg+remainingKg} kg`, the estimated date or "Keep going to see your ETA", and the coach note.
- **Monthly Wins:** 2 tiles (body fat change, muscle gained). A null delta shows `—`.

- [ ] **Step 1: Write the failing tests**

```ts
it.each([[8,'Good morning, Sam'],[13,'Good afternoon, Sam'],[19,'Good evening, Sam'],[2,'Late session, Sam? Respect.']])
  ('hour %i', (h, text) => expect(greeting('Sam', new Date(2026, 10, 13, h)).headline).toBe(text));
it('same quote all day, different next day', () => {
  expect(greeting('S', new Date(2026,10,13,6)).quote).toBe(greeting('S', new Date(2026,10,13,22)).quote);
  expect(greeting('S', new Date(2026,10,13)).quote).not.toBe(greeting('S', new Date(2026,10,14)).quote);
});
it('renders empty states for new member', async () => {
  mockApi.get('/me/dashboard', newMemberDashboard); render(<Dashboard />);
  expect(await screen.findByText(/first scan/i)).toBeInTheDocument();      // FitScore empty state
  expect(screen.getByText(/no active mission/i)).toBeInTheDocument();
  expect(screen.queryByText('NaN')).toBeNull();
});
it('hides FitScore card when showFitScore is false', async () => {
  mockApi.get('/me/dashboard', { ...demoDashboard, member: { ...demoDashboard.member, showFitScore: false } }); render(<Dashboard />);
  await screen.findByText(/Good|Late/); expect(screen.queryByTestId('fitscore-card')).toBeNull();
});
it('opted-out member sees join prompt', async () => {
  mockApi.get('/me/dashboard', { ...demoDashboard, leaderboard: { optedIn: false, standing: null } }); render(<Dashboard />);
  expect(await screen.findByText('Join the FitScore leaderboard')).toBeInTheDocument();
});
it('bell shows unread dot', () => { render(<NotificationBell unread={3} onClick={vi.fn()} />);
  expect(screen.getByLabelText('Notifications, 3 unread')).toBeInTheDocument(); });
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement. Use `IonRefresher` for pull-to-refresh and `IonSkeletonText` while loading. The bell opens `NotificationsModal` (Task 15); until then it can be a no-op.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): dashboard with greeting, fitscore, mission, wins, leaderboard summary`.

### Task 13: Progress page

**Files:**
- Create: `src/pages/Progress.tsx`, `src/components/progress/{BodyCompChart,FitScoreChart,LatestScanTable}.tsx`
- Test: `src/pages/Progress.test.tsx`

**Interfaces:**
- Consumes: `GET /me/progress` → `ProgressDto`, `GET /me/assessments`

Layout, top to bottom:
1. A body-composition line chart with 3 series: weight kg, muscle kg, body fat %. Body fat uses the right y-axis.
2. A FitScore line chart with a fixed 0–100 y-axis.
3. A latest-scan table with all 9 metrics: weight, muscle, fat, BMI, visceral fat, water, protein, minerals, BMR.

With fewer than 2 assessments, the line charts are replaced by "Your trends appear after your second scan." When the member's `showFitScore` is `false` (read from `GET /me`), the FitScore chart and the fitScore value in the latest-scan table are not rendered.

- [ ] **Step 1: Write the failing tests**

```tsx
it('shows all 9 metrics of latest scan', async () => {
  render(<Progress />);
  for (const label of ['Weight','Muscle','Body Fat','BMI','Visceral Fat','Water','Protein','Minerals','BMR'])
    expect(await screen.findByText(label)).toBeInTheDocument();
});
it('no FitScore chart when hidden', async () => {
  mockApi.get('/me', { ...profile, showFitScore: false }); render(<Progress />);
  await screen.findByText('Weight'); expect(screen.queryByTestId('fitscore-chart')).toBeNull();
});
it('one scan shows trend placeholder', async () => {
  mockApi.get('/me/progress', oneScanProgress); render(<Progress />);
  expect(await screen.findByText(/after your second scan/i)).toBeInTheDocument();
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement with `react-chartjs-2`. Chart colors come from `brand.colors`. Mock `react-chartjs-2` in tests, because canvas is not available in jsdom.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): progress page charts`.

### Task 14: Goals page and Leaderboard page

**Files:**
- Create: `src/pages/Goals.tsx`, `src/pages/Leaderboard.tsx`
- Test: `src/pages/Goals.test.tsx`, `src/pages/Leaderboard.test.tsx`

**Interfaces:**
- Consumes: `GET /me/goals` → `GoalsDto`, `GET /leaderboard` → `LeaderboardDto`

**Goals:** an `IonSegment` with Active / Completed / Upcoming. Each card shows the title, `start → target kg`, the deadline, and a progress bar (Active only) or the completed date. Empty segments say "Nothing here yet".

**Leaderboard:** an `IonSegment` switches between the boards: "Top Score", "Top Progress", "Most Muscle", and "Most Fat Lost". Switching refetches `?board=`, and the chosen board is remembered in Preferences under `lu.board`. Each row shows the rank, name, and value: `72` for score, `+4 pts` for progress, `+0.8 kg` for muscle, and `−1.2%` for fatLoss. An empty board says "No results yet this month". The caller's row (`isMe`) is highlighted and auto-scrolled into view. When `optedIn` is `false`, a banner at the top says "Your FitScore is hidden from the leaderboard" with a "Join" button that calls `PATCH /me/settings { fitScoreOnLeaderboard: true }` and refetches.

- [ ] **Step 1: Write the failing tests**

```tsx
it('switching segment shows completed goals', async () => {
  render(<Goals />); await user.click(await screen.findByText('Completed'));
  expect(screen.getByText(seedCompletedGoal.title)).toBeInTheDocument();
});
it('my row is highlighted', async () => {
  render(<Leaderboard />); expect((await screen.findByTestId('row-me'))).toHaveClass('is-me');
});
it('switching to Top Progress refetches with board=progress', async () => {
  render(<Leaderboard />); await user.click(await screen.findByText('Top Progress'));
  expect(mockApi.lastPath()).toBe('/leaderboard?board=progress');
});
it('formats muscle value', async () => {
  mockApi.get('/leaderboard', { board: 'muscle', optedIn: true, rows: [{ rank: 1, memberId: 1, name: 'Sam K.', value: 0.8, isMe: true }] });
  render(<Leaderboard />); expect(await screen.findByText('+0.8 kg')).toBeInTheDocument();
});
it('join button opts in and refetches', async () => {
  mockApi.get('/leaderboard', { optedIn: false, rows: [] }); render(<Leaderboard />);
  await user.click(await screen.findByRole('button', { name: 'Join' }));
  expect(mockApi.calls()).toContainEqual(['PATCH', '/me/settings', { fitScoreOnLeaderboard: true }]);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): goals and opt-in leaderboard pages`.

### Task 15: Profile page and notifications

**Files:**
- Create: `src/pages/Profile.tsx`, `src/components/NotificationsModal.tsx`
- Modify: `src/pages/Dashboard.tsx` (connect the bell to the modal)
- Test: `src/pages/Profile.test.tsx`, `src/components/NotificationsModal.test.tsx`

**Interfaces:**
- Consumes: `GET /me` → `ProfileDto`, `GET /me/notifications`, `PATCH /me/notifications/:id/read`, `POST /me/notifications/read-all`, `useSound`, `useAuth`

**Profile** has three sections:
- **Personal:** name, Fit ID, age (derived from `birthDate`), and height.
- **Membership:** the plan, the `start – end` dates, and a "Renews soon" badge when the end date is ≤ 14 days away.
- **Coach:** the coach's name, or "No coach assigned".

The Settings area has the sound toggle, a "Show FitScore" toggle, a "Show my FitScore on the leaderboard" toggle, and Sign out. Both FitScore toggles call `PATCH /me/settings` with only their own field, and updates the screen right away. If the request fails, the toggle reverts and a toast says "Couldn't save. Try again." Sign out clears the token and goes to `/login`.

**NotificationsModal:** a list with unread items in bold. Tapping an item marks it read. There is a "Mark all read" button. When the modal closes, the bell's count refreshes.

- [ ] **Step 1: Write the failing tests**

```tsx
it('shows renews-soon when membership ends in 10 days', async () => {
  mockApi.get('/me', { ...profile, membershipEnd: addDays(new Date(), 10).toISOString() }); render(<Profile />);
  expect(await screen.findByText('Renews soon')).toBeInTheDocument();
});
it('Show FitScore toggle saves and reverts on failure', async () => {
  mockApi.reject('PATCH', '/me/settings', 500); render(<Profile />);
  const t = await screen.findByLabelText('Show FitScore'); await user.click(t);
  expect(mockApi.lastCall()).toEqual(['PATCH', '/me/settings']);
  expect(await screen.findByText("Couldn't save. Try again.")).toBeInTheDocument(); expect(t).toBeChecked();
});
it('sign out clears token and routes to login', async () => {
  render(<Profile />); await user.click(await screen.findByText('Sign out'));
  expect(logout).toHaveBeenCalled(); expect(history.location.pathname).toBe('/login');
});
it('mark all read calls endpoint', async () => {
  render(<NotificationsModal isOpen onClose={vi.fn()} />); await user.click(await screen.findByText('Mark all read'));
  expect(mockApi.lastCall()).toEqual(['POST', '/me/notifications/read-all']);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): profile page and notifications`.

### Task 16: End-to-end smoke test and README

**Files:**
- Create: `playwright.config.ts`, `e2e/{fixtures,smoke}.spec.ts` (remove the Cypress folder Ionic scaffolds), `README.md`
- Modify: `package.json` scripts: `dev` (the app only), `test`, `test:e2e`

- [ ] **Step 1: Write the smoke test.** Visit `/`, click `Tap to Begin`, type `100001`, and sign in. Assert that the Home tab shows `Good` or `Late` in the greeting, a FitScore number, and the mission percent. Visit each of the 5 tabs and assert each one's page heading. Sign out from Profile and assert that `/login` is shown.
- [ ] **Step 2:** In the `levelup-backend` checkout, run `docker compose up -d && npm run db:reset && npm run start:dev`. In this repo, run `npm run test:e2e`. Expected: PASS.
- [ ] **Step 3:** Write the README with setup steps (including cloning `levelup-backend` next to this repo), the env vars, `npm run api:types`, how to rebrand (edit only `brand.config.ts` and `public/brand/logo.png`), and the Capacitor build steps (`npx cap add ios|android`, `npx cap sync`). The staff API examples (`curl` with `x-staff-key`) go in the `levelup-backend` README.
- [ ] **Step 4:** Commit: `test: e2e smoke; docs: readme`.

---

## Spec Coverage

| # | Feature | Task |
|---|---|---|
| 1 | Splash Screen | 11 |
| 2 | Fit ID Login | 5, 11 |
| 3 | Sound Toggle | 11, 15 |
| 4 | Personalized Greeting | 12 |
| 5 | Leaderboard Summary | 8, 12 |
| 6 | FitScore | 3, 7, 12 |
| 7 | Current Mission | 4, 6, 7, 12 |
| 8 | Monthly Wins | 4, 7, 12 |
| 9 | Notifications | 6, 9, 12, 15 |
| 10 | Body Composition Assessments | 2, 6, 9, 13 |
| 11 | Progress Page | 9, 13 |
| 12 | Goals Page | 9, 14 |
| 13 | Full Gym Leaderboard | 8, 14 |
| 14 | Member Profile | 9, 15 |
| 15 | White-Label Branding | 10 |
| 16 | Bottom Tab Navigation | 10 |
| 17 | Backend API | 1–9 (`levelup-backend` repo) |
