# LevelUP Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all 14 LevelUP core features from scratch: a white-label Ionic gym member app on a NestJS + Prisma + PostgreSQL API.

**Architecture:** Two repos. [`levelup-backend`](https://github.com/alielmayyah/levelup-backend) is a NestJS REST API (Phase 1). Members sign in with a Fit ID and get a JWT; staff endpoints use an API key. Domain rules (FitScore, goal progress) are pure functions with unit tests, and services call them. [`LevelUP`](https://github.com/alielmayyah/LevelUP) (this repo) is an Ionic React app (Vite + Capacitor) with four tabs, branded from one config file (Phase 2). The API is the source of truth for the contract: its DTO classes carry `@nestjs/swagger` decorators, and it commits the generated `openapi.json`. The app generates its types from that file with `openapi-typescript`, so drift between the two sides shows up as a type error in the app. This plan and the spec live in this repo; the API repo links here.

**Tech Stack:** Node 22 LTS, TypeScript (strict), NestJS 11, Prisma 6, PostgreSQL 16 (docker-compose), Jest + supertest (API), Ionic 8 + React 18 + Vite + Capacitor 7, Vitest + Testing Library (mobile), Chart.js via react-chartjs-2, date-fns + date-fns-tz.

**Spec:** [LevelUP-Features-Core.md](../../../LevelUP-Features-Core.md)

## Global Constraints

- Product scope follows the [core feature list](../../../LevelUP-Features-Core.md). Medals use the member's body composition scans.
- Tagline copy, verbatim: `Track. Improve. Transform.`
- Splash call to action, verbatim: `Tap to Begin`.
- Login uses a numeric Fit ID only. There is no password field.
- FitScore is private.
- FitScore is an integer from 0 to 100.
- Branding (gym name, logo, colors) comes from one file in the app repo: `src/brand.config.ts`. No other file hard-codes a brand value.
- The tab bar is a floating bar with exactly 4 tabs: Home, Progress, Goals, Profile.
- One deployment serves one gym (single-tenant). There is no `gymId` column.
- All month and day boundaries use the `GYM_TZ` env var (IANA zone, default `UTC`).
- Each task follows the `CLAUDE.md` of the repo it runs in. App tasks follow [this repo's CLAUDE.md](../../../CLAUDE.md): English + Arabic (RTL), light + dark themes, responsive from 320 px, safe-area aware, and within the performance budgets in `.claude/skills/ui-standards`. Mobile tasks add `en` and `ar` strings and Playwright coverage per `.claude/skills/e2e-testing`.
- Git follows `.claude/skills/git-workflow`: feature branches off `dev`, `type(scope): summary` commits grouped by topic, and no AI attribution in commits or PRs.

### Decisions this plan makes where the spec is silent (confirm or change before execution)

| Topic | Decision |
|---|---|
| FitScore formula | InBody Score method: `80 + (lean − standardLean) − max(0, fat − standardFat)` in kg (fat below standard earns nothing; checked against two real InBody sheets), rounded and clamped to 0–100. Standard weight = 22·h² (men) / 21.5·h² (women), h in m; ideal fat = 15% (men) / 23% (women) of it, the rest lean. Lean = weight − body-fat kg. Mirrors `computeFitScore` in the app's `src/api/mock/domain.ts` (Task 3) |
| Workouts / visits | Not tracked. There is no Visit model. |
| Assessments and members | Created through staff endpoints protected by `x-staff-key` |
| Personal goals | Created by the member through `POST /me/goals` |
| Sound preference | Stored on the device (Capacitor Preferences), not on the server |
| Repos and contract | Two repos: `levelup-backend` (Phase 1) and `LevelUP` (Phase 2). The API commits `openapi.json` (`npm run openapi`), and the app regenerates `src/api/schema.d.ts` from it (`npm run api:types`). A change to a DTO is two PRs: the API PR first, then the app PR that regenerates types, each linking the other. |

## Review Focus

1. **Fit ID guessing.** Fit IDs are short numbers, so someone can try many in a row. Expected: login is limited to 5 attempts per minute per IP (the 6th gets 429), and an unknown ID gets the same 401 body as a malformed one. Test: Task 5.
2. **A new member with 0 or 1 assessments.** Home shows an empty state until the first assessment. Progress trends require two. See Tasks 7 and 13.
3. **Goal overshoot or regression.** Expected: progress is clamped to 0–100%, and estimated completion is `null` when the trend is flat or moving away from the target. Test: Task 4.

---

## File Structure

```
levelup-backend/                    (separate repo; Phase 1)
  package.json, docker-compose.yml (postgres:16), .env.example
  openapi.json                  generated contract, committed (npm run openapi)
  prisma/schema.prisma, prisma/seed.ts
  src/main.ts, src/app.module.ts
  src/prisma/prisma.service.ts
  src/domain/fitscore.ts        pure: computeFitScore
  src/domain/goal-progress.ts   pure: goalProgress
  src/auth/                     auth.controller, auth.service, jwt.guard, staff-key.guard, dto/
  src/staff/                    staff.controller, ingest.service (assessments, members, goals), dto/
  src/me/                       me.controller, dashboard.service, progress.service, goals.service, dto/
  src/notifications/            notifications.controller, notifications.service, dto/
  test/*.e2e-spec.ts
LevelUP/                        (this repo; Phase 2)
  package.json                  Ionic app at the repo root
  src/brand.config.ts, src/theme/applyBrand.ts
  src/api/client.ts, src/api/types.ts (DTO names), src/api/schema.d.ts (generated)
  src/auth/AuthContext.tsx, src/sound/useSound.ts
  src/lib/greeting.ts
  src/pages/{Splash,Login,Dashboard,Progress,Goals,Profile}.tsx
  src/components/{TabBar,NotificationBell,NotificationsModal}.tsx
  src/components/dashboard/{Greeting,FitScoreCard,MissionCard}.tsx
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
  - `Member { id Int, fitId String @unique, firstName, lastName, sex Sex(MALE|FEMALE), birthDate DateTime, heightCm Float, createdAt }`
  - `Assessment { id, memberId, takenAt, weightKg, skeletalMuscleKg, bodyFatKg, bodyFatPct, bmi, visceralFatLevel Int, totalBodyWaterKg, proteinKg, mineralsKg, bmrKcal Int, fitScore Int }`. All unspecified numbers are `Float`. Index on `(memberId, takenAt)`.
  - `Goal { id, memberId, title, metric GoalMetric(BODY_FAT_KG|MUSCLE_KG|WEIGHT_KG), startValue Float, targetValue Float, startDate, status GoalStatus(ACTIVE|COMPLETED), completedAt DateTime? }`
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
- [ ] **Step 3:** Write the schema. Run `npx prisma migrate dev --name init`. Write the seed: 20 members with fitIds `100001`–`100020`; 6 monthly assessments for the demo member and 1–4 for the others; one ACTIVE and one COMPLETED goal for the demo member. Compute the seed's `fitScore` values with Task 3's function if it exists, or hard-code them for now and re-seed after Task 3. Add the script `db:reset` (`prisma migrate reset --force`, which re-runs the seed); the app repo's e2e setup calls it.
- [ ] **Step 4:** Re-run the test. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): prisma schema and seed`.

### Task 3: FitScore domain

**Files:**
- Create: `src/domain/fitscore.ts`
- Test: `src/domain/fitscore.spec.ts`

**Interfaces:**
- Produces: `computeFitScore(a: { sex: 'MALE'|'FEMALE'; weightKg: number; skeletalMuscleKg: number; bodyFatPct: number; visceralFatLevel: number }): number`.

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
```

- [ ] **Step 2:** Run `npm test -- fitscore`. Expected: FAIL (the module is not found).
- [ ] **Step 3:** Implement `computeFitScore` in `fitscore.ts`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): fitscore formula`.

### Task 4: Goal progress domain

**Files:**
- Create: `src/domain/goal-progress.ts`
- Test: `src/domain/goal-progress.spec.ts`

**Interfaces:**
- Produces:
  - `goalProgress(g: { startValue: number; targetValue: number; startDate: Date }, current: number, now: Date): { percent: number; doneKg: number; remainingKg: number; estimatedCompletion: Date | null; reached: boolean }`

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
```

- [ ] **Step 2:** Run `npm test -- domain`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): goal progress helper`.

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

### Task 6: Staff ingest (members and assessments)

**Files:**
- Create: `src/staff/{staff.module,staff.controller,ingest.service}.ts`, `src/notifications/notifications.service.ts` (the `create` method only)
- Test: `test/staff.e2e-spec.ts`

**Interfaces:**
- Consumes: `computeFitScore` (Task 3), `goalProgress` (Task 4), `StaffKeyGuard` (Task 5)
- Produces (all behind `StaffKeyGuard`):
  - `POST /staff/members` (Member fields minus id) → `{ id, fitId }`
  - `POST /staff/assessments { memberId, takenAt, weightKg, skeletalMuscleKg, bodyFatKg, bodyFatPct, bmi, visceralFatLevel, totalBodyWaterKg, proteinKg, mineralsKg, bmrKcal }` → the Assessment with `fitScore`
    - Sample InBody payload and CSV export, with each field mapped to these: [docs/inbody](../../inbody/README.md).
  - `NotificationsService.create(memberId: number, title: string, body: string): Promise<void>`

`IngestService.recordAssessment` runs in one transaction. It saves the assessment with its computed fitScore and evaluates the ACTIVE goal. If `goalProgress(...).reached`: the goal is marked COMPLETED with `completedAt`, and the notification "Mission complete!" is created. Every assessment also creates the notification "New scan results are in". The current value for each metric comes from the assessment: `BODY_FAT_KG` uses `bodyFatKg`, `MUSCLE_KG` uses `skeletalMuscleKg`, and `WEIGHT_KG` uses `weightKg`.

- [ ] **Step 1: Write the failing tests**

```ts
it('assessment stores computed fitScore', async () => {
  const r = await staff.post('/staff/assessments').send(scan).expect(201);
  expect(r.body.fitScore).toBe(computeFitScore({ ...scan, sex: 'MALE' }));
});
it('reaching target completes goal', async () => {
  await staff.post('/staff/assessments').send({ ...scan, bodyFatKg: activeGoal.targetValue - 0.1 }).expect(201);
  expect((await prisma.goal.findUniqueOrThrow({ where: { id: activeGoal.id } })).status).toBe('COMPLETED');
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
- Consumes: `goalProgress`, `JwtGuard`
- Produces: `GET /me/dashboard` → `DashboardDto`:

```ts
interface DashboardDto {
  member: { firstName: string };
  fitScore: { score: number } | null;
  mission: { goalId: number; title: string; percent: number; doneKg: number; remainingKg: number;
             estimatedCompletion: string | null } | null;
  unreadNotifications: number;
}
```

The mission summarizes an active member-set goal.

- [ ] **Step 1: Write the failing tests**

```ts
it('demo member gets full dashboard', async () => {
  const d: DashboardDto = (await authed('100001').get('/me/dashboard').expect(200)).body;
  expect(d.fitScore!.score).toBeGreaterThanOrEqual(0);
  expect(d.mission!.percent).toBeGreaterThanOrEqual(0);
});
it('member with no scans gets nulls, not NaN', async () => {
  const d = (await authed(newMemberFitId).get('/me/dashboard').expect(200)).body;
  expect(d.fitScore).toBeNull(); expect(d.mission).toBeNull();
});
it('401 without token', () => request(s).get('/me/dashboard').expect(401));
```

- [ ] **Step 2:** Run `npm run test:e2e -- dashboard`. Expected: FAIL.
- [ ] **Step 3:** Implement `DashboardService.forMember(memberId: number, now = new Date()): Promise<DashboardDto>`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(api): member dashboard endpoint`.

### Task 9: Progress, goals, profile, and notifications endpoints

**Files:**
- Create: `src/me/{progress.service,goals.service}.ts`, `src/notifications/notifications.controller.ts`
- Create: `src/me/dto/{progress,assessment,goals,profile}.dto.ts`, `src/notifications/dto/notification.dto.ts`
- Modify: `src/me/me.controller.ts`, `src/notifications/notifications.service.ts`
- Test: `test/me.e2e-spec.ts`

**Interfaces:**
- Produces (all JWT-guarded):
  - `GET /me/progress` → `ProgressDto { assessments: { takenAt; weightKg; skeletalMuscleKg; bodyFatPct }[] }` (ascending)
  - `GET /me/assessments` → the full Assessment records (all 9 metrics plus fitScore), newest first
  - `GET /me/goals` → active and completed member goals with their targets, progress, and completion dates
  - `POST /me/goals` → create a member-set weight, muscle, or body-fat target from the latest scan
  - `GET /me` → `ProfileDto { memberId; firstName; lastName; fitId; sex; birthDate; heightCm; avatar }`
  - `PUT /me/avatar` → save the member's portrait options using the [avatar handoff](../../avatar-handoff.md)
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
  expect([g.active.length, g.completed.length]).toEqual([1, 1]);
});
it('cannot mark another member notification read', async () => {
  await authed('100002').patch(`/me/notifications/${demoNotificationId}/read`).expect(404);
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
  - Routes include `/splash`, `/intro`, `/login`, and four tab roots under `/tabs`. Profile opens the avatar editor, Trophy Room, and Settings.

- [ ] **Step 1:** Scaffold with `npx @ionic/cli start levelup tabs --type=react --capacitor --no-git` and move the generated files to the repo root. Add `openapi-typescript` and the script `api:types`, which runs `openapi-typescript ${OPENAPI_SRC:-../levelup-backend/openapi.json} -o src/api/schema.d.ts`. `OPENAPI_SRC` can also be the raw GitHub URL of the API repo's `openapi.json`. Run it, and make `src/api/types.ts` re-export each DTO from the generated `components['schemas']`.
- [ ] **Step 2: Write the failing tests**

```ts
it('applyBrand sets css vars and title', () => {
  applyBrand({ ...brand, gymName: 'Iron Gym', colors: { ...brand.colors, primary: '#ff0000' } });
  expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe('#ff0000');
  expect(document.title).toBe('Iron Gym');
});
it('tab bar has 4 tabs in order', () => {
  render(<MemoryRouter><TabBar /></MemoryRouter>);
  expect(screen.getAllByRole('tab').map(t => t.textContent)).toEqual(['Home','Progress','Goals','Profile']);
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
- Create: `src/lib/greeting.ts`, `src/pages/Dashboard.tsx`, `src/components/dashboard/{Greeting,FitScoreCard,MissionCard}.tsx`, `src/components/NotificationBell.tsx`
- Test: `src/lib/greeting.test.ts`, `src/pages/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `GET /me/dashboard` → `DashboardDto`
- Produces:
  - `greeting(firstName: string, now: Date): { headline: string; quote: string }`. Hours 5–11 give `Good morning, {name}`, 12–16 `Good afternoon, {name}`, and 17–21 `Good evening, {name}`. Other hours give `Late session, {name}? Respect.` The quote is `QUOTES[dayOfYear % QUOTES.length]`, with at least 14 quotes in `greeting.ts`.
  - `<NotificationBell unread={number} onClick={() => void} />`. It shows a dot when `unread > 0` and has `aria-label="Notifications, {n} unread"`.

Card copy:
- **FitScore** shows the member's latest private number.
- **Mission** shows progress on an active personal goal.

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
it('bell shows unread dot', () => { render(<NotificationBell unread={3} onClick={vi.fn()} />);
  expect(screen.getByLabelText('Notifications, 3 unread')).toBeInTheDocument(); });
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement. Use `IonRefresher` for pull-to-refresh and `IonSkeletonText` while loading. The bell opens `NotificationsModal` (Task 15); until then it can be a no-op.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): dashboard with greeting, fitscore, mission`.

### Task 13: Progress page

**Files:**
- Create: `src/pages/Progress.tsx`, `src/components/progress/{BodyCompChart,LatestScanTable}.tsx`
- Test: `src/pages/Progress.test.tsx`

**Interfaces:**
- Consumes: `GET /me/progress` → `ProgressDto`, `GET /me/assessments`

Layout, top to bottom:
1. A body-composition line chart with 3 series: weight kg, muscle kg, body fat %. Body fat uses the right y-axis.
2. A latest-scan table with all 9 metrics: weight, muscle, fat, BMI, visceral fat, water, protein, minerals, BMR.

With fewer than 2 assessments, the line chart is replaced by "Your trends appear after your second scan."

- [ ] **Step 1: Write the failing tests**

```tsx
it('shows all 9 metrics of latest scan', async () => {
  render(<Progress />);
  for (const label of ['Weight','Muscle','Body Fat','BMI','Visceral Fat','Water','Protein','Minerals','BMR'])
    expect(await screen.findByText(label)).toBeInTheDocument();
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

### Task 14: Goals page

**Files:**
- Create: `src/pages/Goals.tsx`
- Test: `src/pages/Goals.test.tsx`

**Interfaces:**
- Consumes: `GET /me/goals` → `GoalsDto`

The Goals tab shows Active and Completed sections. Members can set weight, muscle, and body-fat targets. Goal cards show the starting value, target, and progress or completion date.

- [ ] **Step 1: Write the failing tests**

```tsx
it('switching segment shows completed goals', async () => {
  render(<Goals />); await user.click(await screen.findByText('Completed'));
  expect(screen.getByText(seedCompletedGoal.title)).toBeInTheDocument();
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(mobile): goals page`.

### Task 15: Profile page and notifications

**Files:**
- Create: `src/pages/Profile.tsx`, `src/components/NotificationsModal.tsx`
- Modify: `src/pages/Dashboard.tsx` (connect the bell to the modal)
- Test: `src/pages/Profile.test.tsx`, `src/components/NotificationsModal.test.tsx`

**Interfaces:**
- Consumes: `GET /me` → `ProfileDto`, `GET /me/notifications`, `PATCH /me/notifications/:id/read`, `POST /me/notifications/read-all`, `useSound`, `useAuth`

**Profile** shows name, Fit ID, age, height, and a customizable portrait. It links to the avatar editor and Trophy Room. Medals recognize supported scan milestones and show an unlock celebration.

Settings has language, theme, sound, and sign-out. Signing out clears the token and goes to `/login`.

**NotificationsModal:** a list with unread items in bold. Tapping an item marks it read. There is a "Mark all read" button. When the modal closes, the bell's count refreshes.

- [ ] **Step 1: Write the failing tests**

```tsx
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

- [ ] **Step 1: Write the smoke test.** Visit `/`, click `Tap to Begin`, type `100001`, and sign in. Assert that the Home tab shows `Good` or `Late` in the greeting, a FitScore number, and the mission percent. Visit each of the 4 tabs and assert each one's page heading. Sign out from Profile and assert that `/login` is shown.
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
| 6 | FitScore | 3, 7, 12 |
| 7 | Current Mission | 4, 6, 7, 12 |
| 9 | Notifications | 6, 9, 12, 15 |
| 10 | Body Composition Assessments | 2, 6, 9, 13 |
| 11 | Progress Page | 9, 13 |
| 12 | Goals Page | 9, 14 |
| 14 | Member Profile | 9, 15 |
| 15 | White-Label Branding | 10 |
| 16 | Bottom Tab Navigation | 10 |
| 17 | Backend API | 1–7, 9 (`levelup-backend` repo) |
