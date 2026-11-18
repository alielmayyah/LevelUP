# Mock API

With `VITE_USE_MOCKS=true` (the default in `.env.development`), `api()` in `src/api/client.ts` sends every call here instead of to the network. The routes, status codes, and DTOs match the backend contract in the core plan (Tasks 5, 7, 9). Live API integration is pilot work.

Only `src/api/client.ts` and test files may import from this folder. ESLint (`no-restricted-imports`) fails the lint step otherwise.

## Mock members

| Fit ID | Name | Use it to test |
| --- | --- | --- |
| 101 | Mohamed Omran | Six scans, active and completed goals, earned medals, and two unread notifications |
| 102 | Lina Haddad | No scans or goals, with the female portrait and hijab options |
| 103 | Omar Aziz | One scan and goal creation from that assessment |
| 104 | Karim Mansour | The redesign's example member (`inbodyExample.ts`): three scans on one InBody 770 at Iron Box with `origin`, printed `ranges`, `extra` readings and lean-only `segmentalLean` (`segments` is null). The latest scan is the corrected `docs/inbody` example. A real trend since the first scan; the last change is inside the noise |

## Behavior

- **Sign in:** `POST /auth/login { fitId }` returns `mock.<fitId>`. Unknown or malformed IDs get the same 401. The 6th attempt within 60 s gets 429.
- **Auth:** every other route needs a `mock.<fitId>` token, or it returns 401 and the client calls the `onUnauthorized` handler.
- **Dates:** fixtures are built relative to the time the mock server starts, so scan history and goal estimates stay relative to the demo date. Months use UTC (the API's default `GYM_TZ`).
- **State** Notification read state resets on reload. Avatar edits and member-created goals persist in Preferences under the Fit ID.
- **Latency:** each response waits `VITE_MOCK_LATENCY_MS` (120 ms in `.env.development`, enough to see loading states without feeling slow; 300 ms if unset; 0 in unit tests).
- **Tests:** call `resetMockServer(new Date(...))` in `beforeEach` to pin "today".
