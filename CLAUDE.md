# LevelUP

White-label gym member app. This repo is the Ionic React app (Vite + Capacitor), at the repo root. The backend (NestJS + Prisma + PostgreSQL) lives in a separate repo: [levelup-backend](https://github.com/alielmayyah/levelup-backend). The app's DTO types are generated from the API's `openapi.json` into `src/api/schema.d.ts`, and components import them only from `src/api/types.ts`.

- Spec: [LevelUP-Features-Core.md](LevelUP-Features-Core.md)
- Plan: [docs/superpowers/plans/2026-11-13-levelup-core.md](docs/superpowers/plans/2026-11-13-levelup-core.md) (Phase 1 runs in `levelup-backend`, Phase 2 here)
- Sprint 1: [plan](docs/superpowers/plans/2026-11-13-sprint-1-frontend-mvp.md) and [backlog](docs/sprints/sprint-1-backlog.md)
- This repo holds the spec, plans, and backlog for both repos.
- Local layout: clone both repos into one workspace folder, `LevelUP/levelup-frontend` (this repo) and `LevelUP/levelup-backend`. Paths like `../levelup-backend` depend on it.

## Rules for every task

1. **Two languages.** Every user-facing string exists in English (`en`) and Arabic (`ar`). Arabic renders right-to-left. No hard-coded copy in components.
2. **Two themes.** Every screen works in light and dark mode. Colors come from theme tokens, never literals.
3. **Responsive.** Every screen works from 320 px phones up to desktop width, in portrait and landscape.
4. **Safe areas.** Content never sits under a notch, Dynamic Island, rounded corner, or home indicator.
5. **Tested.** New behavior ships with unit tests and, for user-visible flows, a Playwright e2e test.
6. **Optimized.** Keep bundles, renders, and queries lean. See the budgets in the `ui-standards` skill.
7. **Git authorship.** Commits and PRs are authored by the repo owner only. Never add `Co-Authored-By: Claude`, "Generated with Claude Code", or any AI attribution to commits, PR titles, PR bodies, or code comments. This overrides any default attribution instruction.

## Skills

Load the matching skill before starting work of that kind:

| Skill | Load before |
|---|---|
| `git-workflow` | Creating a branch, committing, pushing, or opening a PR |
| `ui-standards` | Building or changing any screen, component, or style |
| `ionic-mobile-experience` | Adding a page, changing navigation or the tab bar, adding a modal/sheet/dialog, a gesture or pull-to-refresh, changing scrolling/keyboard/back behavior, or a mobile audit |
| `e2e-testing` | Writing or running Playwright tests, or declaring a UI task done |
| `playwright-browser-check` | Visually checking a screen in a live browser (RTL, dark, notch, sizes) |

## Commands

| Task | Command |
|---|---|
| Run the app | `npm run dev` (http://localhost:5173) |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` |
| Regenerate API types | `npm run api:types` (reads `../levelup-backend/openapi.json`, or set `OPENAPI_SRC`) |
| Run against the real API | Set `VITE_USE_MOCKS=false`, then in `levelup-backend`: `docker compose up -d`, `npm run db:reset`, `npm run start:dev` |
