# Mock API

With `VITE_USE_MOCKS=true` (the default in `.env.development`), `api()` in `src/api/client.ts` sends every call here instead of to the network. The routes, status codes, and DTOs match the backend contract in the core plan (Tasks 5, 7, 8, 9), so Sprint 2 switches to the real API by setting the flag to `false`.

Only `src/api/client.ts` and test files may import from this folder. ESLint (`no-restricted-imports`) fails the lint step otherwise.

## Mock members

| Fit ID      | Name          | Use it to test                                                                                                                                                                                                                         |
| ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `101`       | Mohamed Omran | The full experience and the top member: 183 cm, 80 kg, 8% body fat, 6 monthly scans with segmental (body-part) readings, 1 active / 2 completed / 1 upcoming goal, 4 notifications (2 unread), #1 on every men's board, coach assigned |
| `102`       | Lina Haddad   | A brand-new member: no scans, no goals, no notifications, not on the leaderboard                                                                                                                                                       |
| `103`       | Omar Aziz     | One scan only, FitScore hidden (`showFitScore=false`), membership ending in 10 days                                                                                                                                                    |
| `104`–`139` | Fillers       | 36 opted-in members (18 men, 18 women) so both leaderboards have a podium and a second page. Every board ranks the latest scan.                                                                                                        |

Mohamed's values: FitScore 91 (Elite, computed from the scan with the InBody Score method), +2 since the last scan, rank #1 of 19 on all three men's boards (Top Score, Muscle 41.3 kg, Body fat 8.0%), mission "Gain 3 kg of muscle" at 2.0 of 3.0 kg, and this month body fat −1.1% and muscle +0.9 kg.

## Behavior

- **Sign in:** `POST /auth/login { fitId }` returns `mock.<fitId>`. Unknown or malformed IDs get the same 401. The 6th attempt within 60 s gets 429.
- **Auth:** every other route needs a `mock.<fitId>` token, or it returns 401 and the client calls the `onUnauthorized` handler.
- **Dates:** fixtures are built relative to the time the mock server starts, so "this month", "renews soon", and goal ETAs always hold. Months use UTC (the API's default `GYM_TZ`).
- **State:** read notifications and other changes live in memory and reset on page reload. Settings are also saved to Preferences (`lu.mock.settings.<fitId>`), so they survive a reload.
- **Latency:** each response waits `VITE_MOCK_LATENCY_MS` (120 ms in `.env.development`, enough to see loading states without feeling slow; 300 ms if unset; 0 in unit tests).
- **Tests:** call `resetMockServer(new Date(...))` in `beforeEach` to pin "today".
