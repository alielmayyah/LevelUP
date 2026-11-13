---
name: playwright-browser-check
description: Use when visually verifying a LevelUP screen in a live browser, taking screenshots, checking RTL, dark mode, notch or responsive layout by eye, reproducing a UI bug, or confirming a UI change works before reporting it done. Uses the Playwright MCP browser tools (mcp__plugin_playwright_playwright__*).
---

# LevelUP Live Browser Check (Playwright MCP)

Use this skill to look at the running app with the Playwright MCP browser. It doesn't replace the e2e suite (`e2e-testing` skill). It catches what assertions miss: clipped Arabic text, low contrast in dark mode, elements under the notch, broken alignment.

## Setup

1. Make sure the app is running: `npm run dev` (app on `http://localhost:5173`). Run it in the background if it isn't already up. With `VITE_USE_MOCKS=true` that is all you need. With mocks off, the API must also be running on `:3000` from a `levelup-backend` checkout (`npm run start:dev` there).
2. Load the browser tools in one call: `ToolSearch` with `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_resize,mcp__plugin_playwright_playwright__browser_take_screenshot,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_evaluate,mcp__plugin_playwright_playwright__browser_click,mcp__plugin_playwright_playwright__browser_type,mcp__plugin_playwright_playwright__browser_console_messages`.
3. Log in as the demo member (`100001`) through the UI once. The token persists for the rest of the session.

## Switching language and theme without the UI

Run with `browser_evaluate`, then reload:

```js
localStorage.setItem('CapacitorStorage.lu.lang', 'ar');   // 'en' | 'ar'
localStorage.setItem('CapacitorStorage.lu.theme', 'dark'); // 'light' | 'dark' | 'system'
location.reload();
```

## Viewports (`browser_resize`)

| Name | Width × Height | Checks |
|---|---|---|
| Small phone | 320 × 640 | No horizontal scroll, nothing clipped |
| iPhone | 393 × 852 | Main target size |
| Phone landscape | 852 × 393 | Splash and login buttons reachable |
| Tablet | 768 × 1024 | 2-column cards |
| Desktop | 1280 × 800 | Content capped at 960 px and centered |

A desktop browser has no real notch. To check safe areas, simulate them, then reload:

```js
document.documentElement.style.setProperty('--ion-safe-area-top', '59px');
document.documentElement.style.setProperty('--ion-safe-area-bottom', '34px');
```

## Check pass for one screen

For the screen you changed, cover these 4 combinations: `en/light`, `en/dark`, `ar/light`, `ar/dark`.
1. Take a screenshot at iPhone size for each combination.
2. Take one extra `ar/dark` screenshot at Small phone size and at Desktop size.
3. Read `browser_console_messages`. Any error or React warning counts as a failure.
4. Check overflow with `browser_evaluate`: `document.documentElement.scrollWidth <= innerWidth`.

Look at every screenshot for:
- **RTL:** text aligned to the right, directional icons flipped, numbers and units in the right order, no Latin text left untranslated.
- **Dark:** no white boxes, readable text, chart lines visible.
- **Safe area:** with the simulated insets, nothing sits in the top 59 px or the bottom 34 px except backgrounds.
- **Layout:** no overlap, no truncated labels, and tap targets that look at least 44 px.

## Reporting

List each issue as `screen · locale/theme · viewport: what's wrong`. Then say plainly whether the check passed. Fix issues in code, re-run only the combinations that failed, and then add a Playwright e2e assertion for any bug you found so it stays fixed. Don't describe a screenshot as passing without having looked at it.
