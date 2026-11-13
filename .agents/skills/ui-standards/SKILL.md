---
name: ui-standards
description: Use when building or changing any screen, component, style, copy text, or layout in the LevelUP app, including Arabic/RTL text, dark mode, responsive breakpoints, notch or safe-area issues, and frontend performance.
---

# LevelUP UI Standards

A UI task is done only when it passes every row of the checklist at the bottom.

## Languages: English and Arabic

- Use `i18next` + `react-i18next`. Strings live in `src/i18n/locales/{en,ar}.json`, keyed by screen: `dashboard.fitScore.title`.
- Every key exists in both files. `npm run i18n:check` fails on missing keys.
- When the language changes, set `<html lang dir>`: `dir="rtl"` for `ar` and `dir="ltr"` for `en`. Ionic mirrors its own components from `dir`.
- **Logical CSS only:** `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`. Never `left`/`right` in layout CSS.
- Mirror directional icons (back arrows, chevrons, progress direction) in RTL with `:dir(rtl) .icon-directional { transform: scaleX(-1); }`. Don't mirror logos, charts, or the ▲/▼ change indicators.
- Format numbers, dates, and units with `Intl`, using locale `ar-u-nu-latn` for Arabic so digits stay Latin. Never concatenate strings around numbers. Use interpolation: `t('mission.progress', { done, total })`.
- Language setting order: the user's choice in Settings, then the device language, then `en`. Store it in Preferences under `lu.lang`.
- Arabic font: `IBM Plex Sans Arabic` (self-hosted, `font-display: swap`). Arabic text needs about 10% more line-height.
- Check every screen in Arabic for clipped text, because Arabic words run longer and wrap differently.

## Themes: light and dark

- Use Ionic 8's dark palette with the class strategy (`@ionic/react/css/palettes/dark.class.css`), toggling `ion-palette-dark` on `<html>`.
- Setting: System / Light / Dark, stored under `lu.theme`. System follows `prefers-color-scheme` live.
- `brand.config.ts` defines `colors.light` and `colors.dark`. Components use only CSS variables (`--ion-color-*`, `--lu-*`). Never write a hex color in a component.
- Charts read their colors from CSS variables at render time and re-render when the theme changes.
- Check contrast in both themes. Text needs ≥ 4.5:1 and large text or icons need ≥ 3:1.

## Responsive

- Design mobile-first at 360 px. It must still work at 320 px with no horizontal scroll.
- Breakpoints: Ionic grid sizes `sm 576`, `md 768`, `lg 992`, `xl 1200`.
  - At `md` and above, dashboard cards use a 2-column grid.
  - At `lg` and above, content is capped at `max-width: 960px` and centered. The tab bar stays floating and centered.
- Tap targets are at least 44×44 px.
- Support landscape on phones. The splash and login screens must not need scrolling to reach the main button at 667×375.
- Use `clamp()` for large display numbers (FitScore, rank) so they scale between sizes.

## Notch and safe areas

- `index.html` viewport: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Ionic's `IonHeader`/`IonContent` handle the top inset. Custom fixed elements must add it themselves:
  - Floating tab bar: `bottom: calc(16px + var(--ion-safe-area-bottom))`.
  - Full-bleed splash: pad content with `var(--ion-safe-area-top)` and `var(--ion-safe-area-bottom)`. The starfield background may extend under the notch.
  - Landscape: respect `--ion-safe-area-left` and `--ion-safe-area-right`.
- Capacitor: `StatusBar.setOverlaysWebView({ overlay: true })`, with the status bar style switching with the theme.
- Make sure the last scrollable item clears the floating tab bar: `IonContent` bottom padding = tab bar height + 16px + safe-area-bottom.

## Animation

Pick the lightest tool that does the job:

| Need | Tool | Examples |
|---|---|---|
| A loop or a simple state change | CSS (`transition`, `@keyframes`) | Tab pill slide, glow pulse, skeleton shimmer, button press |
| Animation driven by React state: something appears, leaves, reorders, or follows a gesture | Motion (`motion/react`) | Icon swap on a toggle, cards entering a list, leaderboard rows changing rank, swipe to dismiss |
| A scripted sequence with steps and timing, SVG drawing, or scroll-driven effects | GSAP (`gsap` + `useGSAP` from `@gsap/react`) | Splash intro and exit, a mission-complete celebration, a FitScore count-up with staged reveals |
| Page-to-page transitions | Ionic's built-in router animation | Never wrap Ionic pages in Motion or GSAP |

Rules:
- **Motion:** use `m.*` components inside the app-wide `<LazyMotion features={…} strict>` (in `src/motion/MotionProvider.tsx`), never `motion.*`. That keeps Motion's first load at about 5 KB, and the animation features load in their own chunk.
- **GSAP:** animate inside `useGSAP(() => { … }, { scope: ref })` so everything is cleaned up when the component unmounts. Register plugins only in the component that uses them.
- **Reduced motion:** Motion follows the device setting through `<MotionConfig reducedMotion="user">`. In GSAP, wrap timelines in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`, and jump to the end state otherwise. CSS uses `@media (prefers-reduced-motion: reduce)`.
- Animate `transform` and `opacity` only.
- Content must be readable with no animation running. Never leave something hidden until a timeline finishes. If JS fails, the screen still works.
- Navigation never waits more than 600 ms on an exit animation.
- Direction-aware movement (slide in from the start side) flips in RTL. Read the direction from `i18n.dir()`.

## Performance

| Budget | Limit |
|---|---|
| Initial JS (gzip) | ≤ 200 KB |
| Each lazy route chunk (gzip) | ≤ 80 KB |
| Largest image on splash | ≤ 100 KB, WebP or AVIF |
| Dashboard API calls on load | 1 (`/me/dashboard`) |
| Lighthouse mobile performance (staging) | ≥ 90 |

- Lazy-load every tab page with `React.lazy`. The splash and login screens stay in the main bundle.
- Register only the Chart.js components a chart actually uses. Never `import 'chart.js/auto'`.
- Memoize list rows (`React.memo`) on the leaderboard. Virtualize it once there are more than 100 rows.
- Use CSS animations on `transform`/`opacity` only, and respect `prefers-reduced-motion`.
- Fetch each screen's data in as few calls as the API allows. Query-level rules (Prisma `select`, indexes, no N+1) live in the `levelup-backend` repo's CLAUDE.md.
- Run `npm run build` and check the size report against the budget table above.

## Done checklist

| Check | How |
|---|---|
| English and Arabic strings exist | `i18n:check` passes |
| RTL layout is correct | View the screen with `ar`. Nothing is clipped or misaligned. |
| Light and dark both correct | Toggle the theme. There are no hard-coded colors (`grep -rn "#[0-9a-fA-F]\{3,6\}" src --include=*.tsx` is empty). |
| 320 px, 390 px, 768 px, 1280 px all work | Playwright viewport projects pass |
| Notch-safe | The iPhone project screenshot shows nothing under the notch or home indicator |
| Bundle within budget | Build size report |
| E2E test added or updated | See the `e2e-testing` skill |
