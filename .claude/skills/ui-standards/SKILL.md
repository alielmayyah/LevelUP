---
name: ui-standards
description: Use when building or changing any screen, component, style, copy text, or layout in the LevelUP app, including Arabic/RTL text, dark mode, responsive breakpoints, notch or safe-area issues, and frontend performance.
---

# LevelUP UI Standards

A UI task is done only when it passes every row of the checklist at the bottom.

## Styling: Tailwind first, Sass for the custom parts

- **Tailwind CSS v4** (`@tailwindcss/vite`) styles layout, spacing, type, and simple colors as utility classes in the JSX. Entry: `src/theme/tailwind.css`, imported first in `main.tsx`.
- **Colors are theme tokens only.** Tailwind's default palette is removed; utilities like `bg-surface`, `text-muted`, `border-line`, `text-primary`, `bg-fat` point at `--lu-*` / `--ion-*` variables in `tokens.css`, so dark mode and brand colors keep working. `npm run check-colors` also scans `.scss` files and arbitrary values (`bg-[#fff]` fails).
- **Variants:** `dark:` follows Ionic's `.ion-palette-dark` class, `ar:` targets Arabic text, `rtl:` the reading direction, `short-landscape:` a phone held sideways, `split:` / `wide:` the two-column layouts (≥ 900 px).
- **Sass (`.scss` next to the component) for what utilities can't say cleanly:** gradients and `color-mix` art, pseudo-elements, keyframes, SVG strokes, and Ionic part/CSS-variable overrides. Wrap rules in `@layer components` so a utility on the same element still wins. Rules that style Ionic's scoped elements (`ion-label`) stay unlayered, or Ionic's own styles beat them (see `TabBar.scss`).
- **Shared pixel kit** (`lu-px-card`, `lu-chip`, `lu-segment`, `lu-switch`, `lu-state`, …) lives in `src/theme/pixel.css` as component classes; add utilities beside them to adjust (`lu-px-card p-3`).
- **Cascade layers:** `theme < base < ionic < components < utilities`. Ionic's global CSS sits in the `ionic` layer, so utilities override it. No Tailwind preflight (Ionic's normalize does that job), so set every border side you mean: `border-2` sets all four; for one side use `[border-block-start:2px_dashed_var(--lu-border)]`.
- **Class strings:** use sized values that don't carry a line height (`text-[0.875rem]`, not `text-sm`) unless you want Tailwind's. Keep a space between a class and a `${…}` expression, or Tailwind won't see the class and Prettier's Tailwind plugin may glue them: `` `base ${on ? 'is-on' : ''}` ``.
- `npm run format` sorts classes (prettier-plugin-tailwindcss).

## Languages: English and Arabic

- **Arabic is Egyptian Arabic (عامية مصرية), not Modern Standard Arabic.** Write it the way a member in a Cairo gym talks: "دوس عشان تبدأ" not "اضغط للبدء", "جرّب تاني" not "إعادة المحاولة", "مفيش" not "لا يوجد", "عشان" not "لكي", "إنت" not "أنت". Use everyday loanwords Egyptians use ("الريسبشن", "الجيم"). Keep brand and product names in Latin script (LevelUP, FitScore). Every new Arabic string follows this, and so does any copy in the backlog or tickets.
- Use `i18next` + `react-i18next`. Strings live in `src/i18n/locales/{en,ar}.json`, keyed by screen: `dashboard.fitScore.title`.
- Every key exists in both files. `npm run i18n:check` fails on missing keys.
- When the language changes, set `<html lang dir>`: `dir="rtl"` for `ar` and `dir="ltr"` for `en`. Ionic mirrors its own components from `dir`.
- **Logical CSS only:** `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`. Never `left`/`right` in layout CSS.
- Mirror directional icons (back arrows, chevrons, progress direction) in RTL with `:dir(rtl) .icon-directional { transform: scaleX(-1); }`. Don't mirror logos, charts, or the ▲/▼ change indicators.
- Format numbers, dates, and units with `Intl`, using locale `ar-u-nu-latn` for Arabic so digits stay Latin. Never concatenate strings around numbers. Use interpolation: `t('mission.progress', { done, total })`.
- Language setting order: the user's choice in Settings, then the device language, then `en`. Store it in Preferences under `lu.lang`.
- Arabic font: `IBM Plex Sans Arabic` in weights 400, 600 and 700 (self-hosted via `@fontsource`, loaded in `App.tsx`, `font-display: swap`). Load every weight the UI uses, or regular text renders from the bold file. Arabic text needs about 10% more line-height.
- Check every screen in Arabic for clipped text, because Arabic words run longer and wrap differently.

## Themes: light and dark

- Use Ionic 8's dark palette with the class strategy (`@ionic/react/css/palettes/dark.class.css`), toggling `ion-palette-dark` on `<html>`.
- Setting: System / Light / Dark, stored under `lu.theme`. System follows `prefers-color-scheme` live.
- `brand.config.ts` defines `colors.light` and `colors.dark`. Components use only CSS variables (`--ion-color-*`, `--lu-*`) or the Tailwind color utilities mapped to them. Never write a hex color in a component.
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
| A scripted sequence with steps and timing, SVG drawing, or scroll-driven effects | GSAP (`gsap` + `useGSAP` from `@gsap/react`) | Splash exit (loaded on demand from `src/pages/splash/splashMotion.ts`), a mission-complete celebration, the FitScore count-up |
| Hundreds of moving pieces: particles, star fields, line fields | `<canvas>` + `requestAnimationFrame` | Confetti burst, a particle background |
| Page-to-page transitions | Ionic's built-in router animation | Never wrap Ionic pages in Motion or GSAP |

Rules:
- **Motion:** use `m.*` components inside the app-wide `<LazyMotion features={…} strict>` (in `src/motion/MotionProvider.tsx`), never `motion.*`. That keeps Motion's first load at about 5 KB, and the animation features load in their own chunk.
- **GSAP:** animate inside `useGSAP(() => { … }, { scope: ref })` (or `gsap.context`) so everything is cleaned up when the component unmounts. Register plugins only in the component that uses them. **Never import GSAP from a screen in the main bundle** (splash, login): load it with `import()` so it stays out of the initial download. Simple one-off intros are CSS keyframes.
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
- Charts are the small SVG `LineChart` (`src/pages/progress/LineChart.tsx`), loaded as a lazy chunk. Don't add a chart library; extend `LineChart` instead.
- Don't use Ionic overlays (`IonAlert`, `IonToast`, `IonActionSheet`, `IonPopover`): `@ionic/react` is one module, so any overlay used anywhere lands in the initial bundle. Use `PixelDialog` and `PixelToast`. (`IonModal` for the notifications sheet is already paid for.)
- Memoize list rows (`React.memo`) on the leaderboard. Virtualize it once there are more than 100 rows.
- Use CSS animations on `transform`/`opacity` only, and respect `prefers-reduced-motion`.
- Fetch each screen's data in as few calls as the API allows. Query-level rules (Prisma `select`, indexes, no N+1) live in the `levelup-backend` repo's CLAUDE.md.
- Run `npm run build` and check the size report against the budget table above.

## Pixel style

The look is pixel-art: build screens from the shared pieces, don't restyle per screen.

| Piece | Where | Rule |
|---|---|---|
| Card | `.lu-px-card` (`src/theme/pixel.css`, Tailwind `components` layer) | 2px border, 10px corners, hard unblurred drop shadow `0 4px 0 var(--lu-pixel-shadow)` |
| Page | `TabPage` | Big display title (`.lu-display`, Jersey 10: one weight, 400; sized about 20% larger than a regular face) and subtitle; body clears the notch and the tab bar |
| Primary action | `CtaButton` | One per screen. Secondary actions: `.lu-link-button` or the dialog's secondary button |
| Segmented switch | `.lu-segment` | Tabs pattern with arrow keys (`src/components/roving.ts`) |
| Choice | `.lu-choice` | Radio group pattern with arrow keys |
| Switch | `.lu-switch` | `role="switch"`, `aria-describedby` its one-line hint |
| Icons | `PixelIcon` for body metrics (flame = fat, muscle, calendar, trophy); ionicons for UI chrome | Every icon is `aria-hidden` unless it is the only label |
| Colors | `tokens.css` | One hue per metric (`--lu-fat`, `--lu-muscle`), tiers `--lu-tier-1..5`, medals `--lu-gold/silver/bronze` |

Labels in small caps (`.lu-card-kicker`) use the normal font, never a pixel font: small pixel text is hard to read.

## Empty and partial data

Every number on screen needs enough data behind it. Before showing a value, ask what it takes to exist, and design the screen for each stage a member can be in.

| Stage | Example | Show |
|---|---|---|
| No data at all | A new member with no scans or goals | An empty state that says what is missing and the next step ("Book your first scan at the front desk"). Never a blank card, `0`, `—`, or `NaN`. |
| Not enough data to compare | One scan: muscle gained, fat lost, FitScore change, trends, and charts all need at least two scans | The value that does exist (the first scan's numbers) plus a line saying when the comparison appears ("Your change shows after your second scan"). Never show a change of 0 when there is nothing to compare. |
| Nothing in this period | No scan this month, so monthly wins are `null` | Say there is no scan this month yet. Keep earlier data visible. |
| Hidden or opted out | FitScore hidden, off the leaderboard | Say it is hidden and where to turn it back on. Don't show it as missing or zero. |
| Loading or failed | Request in flight or errored | Skeleton while loading; `lu-state` with Retry on error. Keep data already on screen when a refresh fails. |

- The API returns `null` for any value it can't compute yet (see the DTO comments in `src/api/types.ts`). Treat `null` as "not known yet", never as 0, and branch on it in the component.
- Each partial state has its own copy in both languages, written in Egyptian Arabic.
- Mock members cover the stages: Lina (102) has no scans, Omar (103) has one scan. Unit-test each state and check new screens with both.

## Accessibility

Target WCAG 2.2 AA. `e2e/a11y.spec.ts` runs axe-core on every screen in both languages and both themes; it must stay at zero violations.

- **Label in name (2.5.3):** a control's spoken name contains its visible text. Don't give a card-button a shorter `aria-label`; don't put a different word on screen than in the name (the tab bar shows "Board" because it is part of "Leaderboard").
- **Tab bar:** no `aria-label` on `IonTabButton`; the visible label names the tab. The bar is a `<nav>` landmark.
- **Keyboard:** every action works from the keyboard, including chart points (arrow keys) and segmented switches (arrow keys, one Tab stop). Focus is always visible in both themes.
- **Text size:** sizes in `rem`, so text follows the device setting. Check 200% text and the 1.4.12 text-spacing override for clipping.
- **Headings:** each tab has one `h1`; each card or section an `h2` (visually hidden if the card already shows a title).
- **Dialogs:** have a name; Escape and the back gesture close them.

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
| No dead ends | Every screen, sheet, and dialog has a visible way out by tap alone (iPhone has no back button): tab bar, top-start Back, ✕/Cancel, or Retry |
| Empty and partial data | The screen is checked as Lina (no scans) and Omar (one scan); every `null` has its own message |
| Accessibility | `e2e/a11y.spec.ts` covers the screen and passes with zero violations |
