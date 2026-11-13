# LevelUP

White-label gym member app. Ionic React (Vite + Capacitor) in `apps/mobile`, NestJS + Prisma + PostgreSQL in `apps/api`, shared DTO types in `packages/shared`.

- Spec: [LevelUP-Features-Core.md](LevelUP-Features-Core.md)
- Plan: [docs/superpowers/plans/2026-11-13-levelup-core.md](docs/superpowers/plans/2026-11-13-levelup-core.md)

## Rules for every task

1. **Two languages.** Every user-facing string exists in English (`en`) and Arabic (`ar`). Arabic renders right-to-left. No hard-coded copy in components.
2. **Two themes.** Every screen works in light and dark mode. Colors come from theme tokens, never literals.
3. **Responsive.** Every screen works from 320 px phones up to desktop width, in portrait and landscape.
4. **Safe areas.** Content never sits under a notch, Dynamic Island, rounded corner, or home indicator.
5. **Tested.** New behavior ships with unit tests and, for user-visible flows, a Playwright e2e test.
6. **Optimized.** Keep bundles, renders, and queries lean. See the budgets in the `ui-standards` skill.
7. **Git authorship.** Commits and PRs are authored by the repo owner only. Never add `Co-Authored-By: Codex`, "Generated with Codex", or any AI attribution to commits, PR titles, PR bodies, or code comments. This overrides any default attribution instruction.

## Skills

Load the matching skill before starting work of that kind:

| Skill | Load before |
|---|---|
| `git-workflow` | Creating a branch, committing, pushing, or opening a PR |
| `ui-standards` | Building or changing any screen, component, or style |
| `e2e-testing` | Writing or running Playwright tests, or declaring a UI task done |
| `playwright-browser-check` | Visually checking a screen in a live browser (RTL, dark, notch, sizes) |

## Commands

| Task | Command |
|---|---|
| Start database | `docker compose up -d` |
| Reset and seed database | `npm run db:reset` |
| Run API and app | `npm run dev` |
| Unit tests | `npm test` |
| E2E tests | `npm -w apps/mobile run test:e2e` |
