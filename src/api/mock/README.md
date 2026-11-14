# Mock API

With `VITE_USE_MOCKS=true` (the default in `.env.development`), `api()` in `src/api/client.ts` sends every call here instead of to the network. The routes, status codes, and DTOs match the backend contract in the core plan (Tasks 5, 7, 8, 9), so Sprint 2 switches to the real API by setting the flag to `false`.

Only `src/api/client.ts` and test files may import from this folder. ESLint (`no-restricted-imports`) fails the lint step otherwise.

## Mock members

| Fit ID      | Name        | Use it to test                                                                                                                                          |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `101`       | Sam Khalil  | The full experience: 6 monthly scans, 1 active / 2 completed / 1 upcoming goal, 4 notifications (2 unread), opted in to the leaderboard, coach assigned |
| `102`       | Lina Haddad | A brand-new member: no scans, no goals, no notifications, not on the leaderboard                                                                        |
| `103`       | Omar Aziz   | One scan only, FitScore hidden (`showFitScore=false`), membership ending in 10 days                                                                     |
| `104`–`139` | Fillers     | 36 opted-in members (18 men, 18 women) so both leaderboards have a podium and a second page. Every board ranks the latest scan.                         |

Sam's values match the backlog screenshots: FitScore 72 (Strong), +3 since the last scan, rank #6 of 19 on the men's Top Score board (men and women are ranked separately), mission "Lose 5 kg of body fat" at 3.0 of 5.0 kg, and this month body fat −1.2% and muscle +0.8 kg.

## Behavior

- **Sign in:** `POST /auth/login { fitId }` returns `mock.<fitId>`. Unknown or malformed IDs get the same 401. The 6th attempt within 60 s gets 429.
- **Auth:** every other route needs a `mock.<fitId>` token, or it returns 401 and the client calls the `onUnauthorized` handler.
- **Dates:** fixtures are built relative to the time the mock server starts, so "this month", "renews soon", and goal ETAs always hold. Months use UTC (the API's default `GYM_TZ`).
- **State:** read notifications and other changes live in memory and reset on page reload. Settings are also saved to Preferences (`lu.mock.settings.<fitId>`), so they survive a reload.
- **Latency:** each response waits `VITE_MOCK_LATENCY_MS` (120 ms in `.env.development`, enough to see loading states without feeling slow; 300 ms if unset; 0 in unit tests).
- **Tests:** call `resetMockServer(new Date(...))` in `beforeEach` to pin "today".
