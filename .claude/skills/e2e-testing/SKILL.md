---
name: e2e-testing
description: Use when writing, running, or debugging Playwright end-to-end tests in LevelUP, or before declaring any user-visible feature or UI task done.
---

# LevelUP E2E Testing (Playwright)

A user-visible task isn't done until a Playwright test proves it works across devices, both languages, and both themes.

## Layout

```
apps/mobile/
  playwright.config.ts
  e2e/
    fixtures.ts          login, locale, theme helpers
    smoke.spec.ts        full journey: splash → login → every tab → sign out
    <feature>.spec.ts    one file per feature: dashboard, leaderboard, goals...
```

## Config

- `webServer` starts both servers with `npm run dev` from the repo root (API + app) and waits for `http://localhost:5173`.
- Before the run, `globalSetup` runs `npm run db:reset` so every run starts from the seed data. Seed member `100001` is the demo user.
- Projects (device matrix):

| Project | Device | Why |
|---|---|---|
| `iphone` | `devices['iPhone 15']` (WebKit) | Notch, safe areas, iOS Safari engine |
| `android` | `devices['Pixel 7']` (Chromium) | Android Chrome |
| `small` | Chromium, 320×640 | Smallest supported width |
| `tablet` | `devices['iPad (gen 7)']` | 2-column layout |
| `desktop` | Chromium, 1280×800 | Max-width layout |

- `retries: 2` in CI, `0` locally. `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`.

## Fixtures

`fixtures.ts` extends `test` with:
- `loginAs(fitId = '100001')`. It logs in through the API and puts the token in storage, so tests skip the UI login. Only `smoke.spec.ts` and `login.spec.ts` use the real login screen.
- `locale: 'en' | 'ar'` and `theme: 'light' | 'dark'` options. Before the page loads, they set `lu.lang` / `lu.theme` in storage and set `colorScheme` on the context.

## What every feature spec covers

1. **Happy path** in `en` + `light`.
2. **Arabic:** the same flow in `ar`. Assert `html[dir="rtl"]` and at least one Arabic string from `ar.json`.
3. **Dark:** the same flow in `dark`. Assert `html.ion-palette-dark`.
4. **Empty or edge state:** for example, a member with no scans (create one with the staff API in `beforeEach`).
5. **No horizontal overflow:** `expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)`.

Loop over the language and theme combinations instead of copying tests:

```ts
for (const locale of ['en', 'ar'] as const)
  for (const theme of ['light', 'dark'] as const)
    test.describe(`${locale}/${theme}`, () => {
      test.use({ locale, theme });
      test('dashboard shows fitscore and mission', async ({ page, loginAs }) => {
        await loginAs();
        await page.goto('/tabs/home');
        await expect(page.getByTestId('fitscore-card')).toBeVisible();
        await expect(page.getByTestId('mission-card')).toBeVisible();
      });
    });
```

## Safe-area check (iPhone project)

`smoke.spec.ts` asserts that the tab bar's bottom edge sits above the home indicator:

```ts
const box = await page.getByRole('tablist').boundingBox();
expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height - 34);
```

## Selectors

Use `getByRole` with an accessible name first, then `getByTestId`. Never select by CSS class or by translated text, except in the one assertion that checks the translation itself. Add `data-testid` to cards and list rows as you build them.

## Running

| Goal | Command |
|---|---|
| All projects | `npm -w apps/mobile run test:e2e` |
| One project | `npx playwright test --project=iphone` |
| One file, headed | `npx playwright test e2e/leaderboard.spec.ts --headed` |
| Debug a failure | `npx playwright show-trace test-results/<test>/trace.zip` |

Report results as they are. If a test fails, give the failing test name and the first error line. Never mark a task done with failing or skipped e2e tests, and never delete or `.skip` a test to get green.

## Flakiness

Use Playwright's auto-waiting assertions (`await expect(locator).toBeVisible()`), never `waitForTimeout`. If a test is flaky, find the race and fix it. Don't raise timeouts.
