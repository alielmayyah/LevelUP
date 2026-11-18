# LevelUP

LevelUP is a gym member app for body composition scans, personal goals, and medals. Members sign in with a Fit ID from the front desk. Built with Ionic React, Vite, and Capacitor. It supports English and Egyptian Arabic (right-to-left), light and dark themes, and phones through desktop.

Try it: **[alielmayyah.github.io/LevelUP](https://alielmayyah.github.io/LevelUP/)** (the `staging` branch, on mock data; sign in with `101`).

The backend (NestJS, Prisma, PostgreSQL) lives in [levelup-backend](https://github.com/alielmayyah/levelup-backend). Sprint 1 runs entirely on an in-memory mock of its API, so you don't need the backend to try the app.

## Run it

You need Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:5173
```

| Task | Command |
|---|---|
| Unit tests | `npm test` |
| End-to-end tests (5 device sizes, both languages, both themes, accessibility) | `npm run test:e2e` |
| Lint and type checks | `npm run lint` |
| Production build with size report | `npm run build` |
| Check that no colors are hard-coded outside the theme | `npm run check-colors` |

The first e2e run needs browsers: `npx playwright install chromium webkit`.

## Mock members

With mock data on (the default), sign in with any of these Fit IDs:

| Fit ID | Member | Shows |
|---|---|---|
| `101` | Mohamed Omran | Six scans with body-part readings, FitScore, active goals, and unread notifications |
| `102` | Lina Haddad | New member with no scans or goals and the female portrait editor |
| `103` | Omar Aziz | One scan |

`999` shows "not found". Six quick wrong tries show "too many tries". Mock avatars, member-created goals, and device settings persist across reloads.

Demo path: tap the splash → onboarding → sign in as `101` → visit the four tabs → open the Trophy Room → switch to Arabic and dark mode in Settings → sign out → sign in as `102` for the empty states and hijab option.

## Android test build

`npm run build:demo` builds the app on mock data (there is no hosted API yet). Then, with Android Studio's SDK installed and JDK 17 or 21 as `JAVA_HOME` (Gradle 8.11 can't run on JDK 25):

```bash
npm run build:demo
npx cap sync android
cd android && ./gradlew assembleDebug
```

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to the phone and open it (allow installs from unknown sources).

## Turn the mock data off

Mock mode is set in `.env.development`:

```bash
VITE_USE_MOCKS=true            # false to call the real API
VITE_MOCK_LATENCY_MS=300       # fake delay per mock response
VITE_API_URL=http://localhost:3000
```

To run against the real API, set `VITE_USE_MOCKS=false`, then in `levelup-backend`: `docker compose up -d`, `npm run db:reset`, `npm run start:dev`.

Two contract notes for the backend:
- The app's mock IDs are 3 digits, so the login screen accepts 3–8 digits. The core plan's Fit ID rule says 6–8: one of the two must change before switching mocks off.
- Home's "Member since" tile reads `member.memberSince` from `GET /me/dashboard`, so Home stays at one request. The backend needs to add this field.

## Rebrand for another gym

LevelUP's name, logo, and colors are the same in every gym's deployment. A gym adds only its own logo:

1. Put the gym's logo in `public/gym/` (WebP or AVIF, 100 KB or less).
2. In `src/brand.config.ts`, set `gym.logo` to its path, for example `'/gym/iron-gym.webp'`.

All brand values live in `src/brand.config.ts` (name, logo, mark, and the primary, secondary, and accent colors). Text color on each brand color is picked automatically. Backgrounds, surfaces, and text come from the light and dark tokens in `src/theme/tokens.css`. No other file may contain a color (`npm run check-colors` enforces this).

## Bundle sizes

Measured with `npm run build` at the end of Sprint 1 (gzip):

| Chunk | Size | Budget |
|---|---|---|
| Initial JS (splash, login, app shell) | 163.9 KB | ≤ 200 KB |
| Home tab | 5.3 KB | ≤ 80 KB |
| Progress tab | 1.9 KB, plus charts 2.6 KB (loaded after the page) | ≤ 80 KB |
| Goals tab | 2.0 KB | ≤ 80 KB |
| Profile tab | 3.8 KB | ≤ 80 KB |
| GSAP (splash exit, FitScore count-up; loaded on demand) | 27.4 KB | — |
| Motion animation features (loaded on demand) | 18.9 KB | — |

## Project guides

- [Avatars](docs/avatar-handoff.md) covers portrait options, saved settings, and rebuilding the artwork.
- [Business plan](docs/LevelUP-Business-Plan.md) and its [PDF edition](docs/LevelUP-Business-Plan.pdf).
- [CLAUDE.md](CLAUDE.md): rules for every change (two languages, two themes, responsive, safe areas, tests, budgets).
- `ui-standards` skill (`.claude/skills/ui-standards/SKILL.md`): the clean modern visual style, accessibility rules, animation tools, and performance budgets.
- [Sprint 1 plan](docs/superpowers/plans/2026-11-13-sprint-1-frontend-mvp.md).
