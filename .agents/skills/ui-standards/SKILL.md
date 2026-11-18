---
name: ui-standards
description: Use when building or changing any screen, component, style, copy text, or layout in the LevelUP app, including Arabic/RTL text, dark mode, gym brand colors, responsive breakpoints, notch or safe-area issues, motion, and frontend performance.
---

# LevelUP UI Standards

A UI task is done only when it passes every row of the checklist at the bottom.

This is the design system of the redesign in `docs/redesign/PLAN.md` (the Story + Level Journey concept). The mockups it comes from are `docs/redesign/directions/round-3/story.html` and `journey.html`; open them when a rule below needs a picture. Where the plan and this skill disagree on a product rule, the plan wins; on how to build UI, this skill wins.

**Migration state.** Until the foundation lands (tokens, fonts, base components), the code still has the old look: violet glass (`--lu-glass*`, `.lu-hero`, `backdrop-filter`), Alexandria + IBM Plex, the cartoon avatar, medals, FitScore and sound. Don't extend any of it. New and rebuilt screens follow this skill. When a rebuilt screen no longer needs an old token or kit class, delete it in the same change.

## The concept in one paragraph

Dark-first, in the logo's violet, re-colored per gym. **Story** sets the structure: every screen is a short story told top to bottom in cards, each card with an icon header and exactly one action. **Level Journey** sets the meaning: progress is a road with a stamped stop per scan, and only real body changes (beyond the machine's noise) earn levels and badges. Every screen answers three questions in this order: did I improve (a verdict sentence), what does this number mean (a dot on its normal range), what do I do next (one action).

## Colors

Three layers. Components use only the tokens below (CSS variables or the Tailwind utilities mapped to them), never a hex value. `tokens.css` and `brand.config.ts` are the only files with color literals; `npm run check-colors` enforces it.

**Neutrals (fixed):**

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--lu-bg` | `#0C0A14` | `#F6F4FB` | Page |
| `--lu-surface-1` | `#15121F` | `#FFFFFF` | Cards |
| `--lu-surface-2` | `#1D1929` | `#F1EEF8` | Raised parts inside a card, the tab bar, sheets |
| `--lu-surface-3` | `#26213A` | `#E8E3F4` | Icon tiles, pressed rows, tracks |
| `--lu-border` | `#2E2843` | `#DCD5EC` | Hairlines and card rims |
| `--lu-text` | `#F4F2FA` | `#15121F` | Text |
| `--lu-text-muted` | `#A9A3BF` | `#5B5470` | Secondary text (≥ 6.3:1 on every surface) |
| `--lu-line` | `#6F6987` | `#8E87A6` | Dashed lines, chart gridlines, locked-badge outlines. **Never text** (3.0–3.8:1) |

**Brand layer (per gym).** Buttons, the active tab, selection, focus rings, the road, the level emblem's rim and the wordmark's "UP". It never draws body data.

| Token | LevelUP dark | LevelUP light | Rule |
|---|---|---|---|
| `--lu-brand` | `#8B5CF6` | `#6B3BF5` | Graphics only in dark (4.05:1 on surface-2; fails white text at 4.23) |
| `--lu-brand-strong` | `#6B3BF5` | `#5A2BE0` | Fills under `--lu-on-brand`: the primary button, the selected chip |
| `--lu-brand-soft` | `#B98CFF` | `#5B2EE0` | Brand-colored text and icons |
| `--lu-brand-tint` | `#2A1F4D` | `#EEE7FF` | Tinted containers (secondary button, icon tiles of brand icons) |
| `--lu-on-brand` | `#FFFFFF` | `#FFFFFF` | Text on `--lu-brand-strong` |
| `--lu-brand-gradient` | `linear-gradient(135deg, #E19CFB 0%, #B98CFF 45%, #6B3BF5 100%)` | same | Only the road, the emblem rim, the active-tab indicator and the wordmark. **Never under text**: no text color passes across all of it |

A gym sets one brand color (plus its logo) in `brand.config.ts`; `applyBrand` derives the rest for both themes and writes them on `<html>`:
- `--lu-brand-strong`: the brand darkened until white reaches 4.5:1. If that takes it more than 15% toward black, keep the brand and set `--lu-on-brand` to `#0C0A14` instead (Iron Box orange `#FF6A1A` and Pulse Gym teal `#12B5A6` both take the dark label).
- `--lu-brand-soft`: lightened (dark theme) or darkened (light theme) until it reaches 4.5:1 on `--lu-surface-2`.
- `--lu-brand-tint`: the brand mixed about 20% into `--lu-surface-1` (dark) or 12% into white (light).
- The gradient: two stops, `--lu-brand-soft` to `--lu-brand-strong`.
- Unit-test the derivation with LevelUP violet, Iron Box and Pulse Gym, asserting every pairing above meets its ratio.
- Gym onboarding (admin, not this app) flags a brand within about 30° of hue of a meaning color. In the app, the rule that keeps it safe is: data colors always come with an icon and a word.

**Meaning layer (fixed in every gym, never follows the brand):**

| Token | Dark | Light | Means |
|---|---|---|---|
| `--lu-good` | `#4ADE9A` | `#0F7A4A` | A real improvement |
| `--lu-attention` | `#FFC857` | `#8A5800` (text) | Needs attention. As a fill, use `#FFC857` with `--lu-on-attention` `#2A1D00` text in both themes. Always with an icon |
| `--lu-stable` | `#8B8AA3` | `#62617A` | About the same, inside the noise |
| `--lu-muscle` | `#5B9CFF` | `#2160D2` | Skeletal muscle |
| `--lu-fat` | `#F2A65A` | `#A4500F` | Body fat |
| `--lu-water` | `#3FD0E0` | `#0A7380` | Body water |
| `--lu-lean` | `#C9C3E3` | `#6A638E` | Fat-free mass |

Rules:
- **Never red on a body metric**, and no red anywhere except a destructive confirm in a dialog. Sign-out is a neutral row.
- Green means a change cleared the noise, never "number went down". A change inside the noise is `--lu-stable` grey, with the words "about the same".
- `--lu-stable` text never sits on `--lu-brand-tint` (4.47:1).
- Every color that carries meaning also carries an icon and a word (chip text, a check, a warning triangle), so nothing depends on seeing green or amber.
- Contrast: text ≥ 4.5:1, icons and chart marks ≥ 3:1, in both themes and for every gym. The light values above are checked on `--lu-bg`, `--lu-surface-1` and `--lu-surface-2`; on `--lu-surface-3` use them for graphics only.
- **No glass, blur, glow, aurora or decorative gradient.** Depth comes from the three surfaces, a 1px `--lu-border` rim and one soft shadow (`--lu-shadow`, light theme only; dark relies on the surfaces).

## Themes

- **Dark is the default.** Settings offers System / Dark / Light, stored under `lu.theme`. A new install starts on Dark, not System.
- Ionic 8's dark palette with the class strategy (`ion-palette-dark` on `<html>`); `tokens.css` holds both themes.
- Charts read colors from CSS variables at render time and re-render on a theme or brand change.
- Check every screen in both themes and with the two demo gym brands.

## Type

- **Text: Readex Pro** (`@fontsource-variable/readex-pro`, weight axis, subsets `arabic` and `latin`). One family for Arabic and Latin; its Latin is Lexend, geometric like the logo's wordmark. Weights used: 400 body, 500 labels and buttons, 600 titles, 700 the verdict and big numbers.
- **Numbers that line up or count: Alexandria** (`@fontsource-variable/alexandria`, already installed) with `font-variant-numeric: tabular-nums`. Readex Pro has no tabular figures (no `tnum` feature; its digits run 500–620 units wide), so a number in Readex jitters when it counts up and misaligns in a column. Use the `Num` component (or `.lu-num`) for every standalone figure: metric values, changes, tables, chart labels, the level number, countdowns. A number inside a sentence stays in the sentence's font.
- Digits are 0–9 in both languages. Format with `Intl` and the locale `ar-u-nu-latn` for Arabic (plain `ar-EG` gives ٠–٩). Units: "كجم" and "kg", "%" after the number. Wrap every number with its sign and unit in `<bdi>` (`Num` does) so `−0.9 كجم` never reorders.
- Remove IBM Plex Sans and IBM Plex Sans Arabic when the foundation lands.

**Scale** (rem, so text follows the device setting; Arabic gets about 10% more line-height):

| Role | Size / line-height | Weight | Where |
|---|---|---|---|
| Display number | `clamp(2.5rem, 11vw, 3.25rem)` / 1 | 700, Alexandria | The one big number on a hero (level, a main change) |
| Verdict | 1.375rem / 1.35 | 700 | The verdict sentence |
| Title | 1.5rem / 1.25 | 600 | Page title (one `h1`) |
| Card title | 1.0625rem / 1.35 | 600 | Card headers (`h2`) |
| Body | 1rem / 1.5 | 400 | Running text |
| Label | 0.875rem / 1.4 | 500 | Row labels, buttons, chips |
| Caption | 0.75rem / 1.4 | 500 | Axis labels, footnotes. **The floor: nothing under 0.75rem (12 px)** |

Seven roles, no others. Sentence case everywhere; no all-caps. Tight tracking (`-0.01em`) on Latin titles only, never on Arabic.

## Space, shape, icons

- **4 px grid.** Page gutter 16 px (20 px at `md`+). Gap between feed cards 12 px. Card padding 16 px (20 px at `md`+). Separate rows inside a card with a hairline; never nest a card in a card.
- **Radii:** card 20 px, icon tile 12 px, button 16 px, chip and tab indicator full pill, sheet top 24 px.
- **Icons:** `lucide-react` through `src/components/Icon.tsx` and `iconMap.ts` (app-level names, imported one by one). 24 px grid, **stroke 1.9**, `currentColor`. Card headers and metric rows put the icon in a 40 px tile (`--lu-surface-3`, radius 12): data icons take their data color, brand icons take `--lu-brand-soft` on `--lu-brand-tint`. Badge glyphs are drawn for LevelUP on the same grid and stroke so the two sets sit together. Icons are `aria-hidden` unless they are the only label. Mirror directional icons in RTL (`rtl:-scale-x-100`); never mirror the logo, the body figure or ▲/▼.

## Components

Build screens from these. Don't restyle them per screen.

| Component | Rule |
|---|---|
| `AppHeader` | Greeting ("صباح الخير يا كريم"), the member's initials in a brand-tint circle (no avatar art), the gym's logo badge. Clears the top safe area |
| `FeedCard` | The one card anatomy: icon tile + card title + optional subtitle, then the body, then **one** action row at the bottom (a button or a chevron row). `--lu-surface-1`, 1 px border, radius 20 |
| `Road` | **The signature visual.** A true date axis with a stamped stop per scan, today highlighted, the next scan dashed at the end. Oldest scan at the reading start (right in Arabic). Drawn in `--lu-brand-gradient`; no text on the stroke. Stops on a different machine get a hollow stamp. Used on Home, the Scans tab and the reveal |
| `LevelEmblem` | The current level number (Alexandria) in a ring with the gradient rim. Next to it, the next level as a body target in words ("عضل +0.9 كجم كمان"), never a progress bar |
| `Verdict` | One sentence, judged against the member's own history and the noise rules. Comes before any number on the screen |
| `RangeRow` | A metric's icon, name, value (`Num`) and one word ("طبيعي", "أعلى شوية"), above its value as a dot on a shaded normal band. Low end at the reading start. The band comes from the machine's printed range when present, otherwise `standards.ts` |
| `WeightSplit` | Weight drawn only as fat + fat-free mass (`--lu-fat`, `--lu-lean`), never muscle + fat |
| `NoiseMeter` | A change as a tick on a band: grey zone = the machine's noise for that metric, centre = zero. Inside the zone: grey "about the same". Outside: green or amber with an icon |
| `TrendLanes` | Muscle and fat in two lanes on one true date axis, fixed scales, a dot per scan, a dashed line across gaps, the noise band around the first scan, a level flag where a line leaves the band |
| `BodyFigure` | Front view, **never mirrored**: the member's right side is on the drawing's left, and each side is named in words. Shows lean mass ("lean mass", not "muscle") as % of ideal; balance beams shade the ±2% balanced zone. Imbalance is flagged only after two scans |
| `PassportStamp` | Opens a scan report: stop number, gym, machine, date and time. Every number on the screen below it carries that source |
| `Badge` | Earned: its glyph in its data color on a tile. Next: a dashed `--lu-line` outline stating its real-change rule. Never a usage chore (opening the app, logins, taps) |
| `Chip` | Pill, label weight 500, icon + word. Variants `good`, `attention`, `stable`, `brand` (selected filter). Meaning chips are tinted fills of their color with the word in the full color |
| `Button` | **Primary:** `--lu-brand-strong` fill, `--lu-on-brand` label, height 52, full width on phones; **one per screen**. **Secondary:** `--lu-brand-tint` fill, `--lu-brand-soft` label. **Quiet:** text only in `--lu-brand-soft`. Disabled: 40% opacity. Replaces `CtaButton`'s gradient pill |
| `TabBar` | Four tabs: Home · Scans · Compare · Account (الرئيسية · القياسات · مقارنة · حسابي). Docked on `--lu-surface-2` with a top hairline (not floating glass). Active tab: icon and label in `--lu-brand-soft` and a short gradient indicator bar above the icon that slides between tabs. Labels always visible |
| `Sheet` | Bottom sheet on `--lu-surface-2`, top radius 24, grab handle, a title, ✕ in the top-end corner. Used for tap-to-explain ("what does this number mean?") and "more numbers" |
| `StateCard` | Empty, loading and error, in the `FeedCard` anatomy: an icon tile, one sentence of what is missing or wrong, one action (Retry, Book a scan) |
| `Num` | Every standalone number: Alexandria tabular, `<bdi>`, `Intl` formatting, sign and unit included |

## Screens

The plan fixes the order of content on each screen; keep it.

- **Home:** `AppHeader` → hero card (`LevelEmblem`, `Verdict`, `Road`) → body today (`WeightSplit`, muscle and fat changes) → latest milestone or badge → next stop (book the re-scan; the test conditions: "3 hours after eating, no workout, same time as last time"; the screen's one primary button) → coach (WhatsApp).
- **Scan report:** `PassportStamp` → headline → `WeightSplit` → `RangeRow` for weight, muscle, fat, fat %, visceral fat, body water → "more numbers" sheet (protein, minerals, BMI, BMR, ECW ratio, phase angle, InBody Score) → the "fitness information, not diagnosis" line → coach.
- **Scans tab:** `TrendLanes` → the timeline of scan cards, next stop (dashed) on top.
- **Body balance:** `Verdict` → `BodyFigure`.
- **Compare:** before at the reading start (right in Arabic, left in English), after beside it; machine match stated first, a `NoiseMeter` per row, the last card hands the news to the trend.
- **New-result reveal:** three beats with progress bars at the top (verdict → the main change on the `Road` → the milestone), staged as a level-up. Plays only for a same-machine change beyond the noise; a flat scan gets a quiet "on the way" stamp instead. Share sends the change, never the weight.
- **Account:** grouped `FeedCard` lists: profile, places (gyms and machines), milestones and badges, the current goal and goal history, consents as switches, language, theme, sign out.

## Data on screen

- **Verdict before numbers** on every screen.
- **Real change uses the plan's thresholds** (muscle ≈ 0.9 kg, fat ≈ 1.5 kg, weight ≈ 1.9 kg, fat % ≈ 1.9 points; smaller only when 3+ same-machine scans move one way and the total clears the floor). The API decides; the app never re-derives a verdict or a level.
- **Different machine:** direction only. No verdict color, celebration, level or badge.
- **Never celebrate weight loss alone.** Celebrate records, real changes and on-time re-scans.
- **Levels never go down on screen**; a later loss shows in the verdict and the trend in neutral or amber words.
- **Medical wording:** ECW ratio, phase angle and visceral fat say "fitness information, not diagnosis". No disease names.
- Never show the machine's own status labels; the app names zones itself.

## Empty and partial data

Every number needs enough data behind it. Design each screen for each stage a member can be in.

| Stage | Example | Show |
|---|---|---|
| No data at all | A new member with no scans | A `StateCard` that says what is missing and the next step ("احجز أول قياس من الريسبشن"). Never a blank card, `0`, `—` or `NaN`. No "set a goal" before the first scan |
| Not enough data to compare | One scan: changes, trends, levels and Compare need two | The first scan's values plus a line saying when the comparison appears. Never a change of 0 |
| Inside the noise | Every change is under its threshold | "About the same" in grey; hand the news to the trend since the first scan |
| Different machine | The latest scan is on another machine | Direction only, and say why |
| Nothing in this period | No scan this month | Say so; keep earlier data visible |
| Loading or failed | Request in flight or errored | No skeleton for loads under 300 ms; then a skeleton in the card's own shape. `StateCard` with Retry on error. Keep data already on screen when a refresh fails |

- The API returns `null` for anything it can't compute yet. `null` means "not known yet", never 0; branch on it in the component, and give each `null` its own copy.
- The mock personas cover the stages: Lina (102) has no scans, Omar (103) has one. Unit-test each state and check new screens with both.

## Styling: Tailwind first, Sass for the custom parts

- **Tailwind CSS v4** (`@tailwindcss/vite`) for layout, spacing, type and colors as utilities in the JSX. Entry: `src/theme/tailwind.css`, imported first in `main.tsx`.
- Tailwind's default palette is removed. Color utilities map to the tokens: `bg-bg`, `bg-surface-1/2/3`, `border-line`, `text-ink`, `text-muted`, `bg-brand-strong`, `text-on-brand`, `bg-brand-tint`, `text-brand-soft`, `text-good`, `text-attention`, `text-stable`, `text-muscle`, `text-fat`, `text-water`, `text-lean`. Arbitrary color values (`bg-[#fff]`) fail `check-colors`.
- Type utilities map to the seven roles (`text-display`, `text-verdict`, `text-title`, `text-card-title`, `text-body`, `text-label`, `text-caption`); don't size text with raw values.
- **Variants:** `dark:` follows `.ion-palette-dark`, `ar:` targets Arabic text, `rtl:` the reading direction, `short-landscape:` a phone held sideways, `split:` / `wide:` the two-column layouts (≥ 900 px).
- **Sass** (`.scss` next to the component) only for what utilities can't say: SVG strokes, the gradient on the road and emblem, pseudo-elements, keyframes, Ionic part and CSS-variable overrides. Wrap rules in `@layer components` so utilities still win; rules on Ionic's scoped elements (`ion-label`) stay unlayered.
- Shared component styles go in `src/theme` (or the component's own file imported by the component); a shared style placed in a lazy chunk ranks below Ionic in the production build.
- **Cascade layers:** `theme < base < ionic < components < utilities`. No Tailwind preflight, so set every border side you mean.
- Keep a space between a class and a `${…}` expression. `npm run format` sorts classes.

## Languages: Arabic and English

- **Arabic is the default language** (the plan, decision 17); English is in Settings. Setting order: the member's choice (`lu.lang`), then Arabic. The device language no longer decides.
- **Arabic is Egyptian Arabic (عامية مصرية), never Modern Standard Arabic.** "دوس عشان تبدأ" not "اضغط للبدء", "جرّب تاني" not "إعادة المحاولة", "مفيش" not "لا يوجد", "عشان" not "لكي", "إنت" not "أنت". Everyday loanwords ("الريسبشن", "الجيم"). Brand and product names stay in Latin script (LevelUP, InBody). Punctuation: ، ؛ ؟.
- `i18next` + `react-i18next`. Strings in `src/i18n/locales/{ar,en}.json`, keyed by screen. Every key in both files; `npm run i18n:check` fails on a missing key. Interpolate numbers (`t('scan.change', { value })`), never concatenate.
- Set `<html lang dir>` on every language change. Ionic mirrors its own components from `dir`.
- **Logical CSS only** (`margin-inline-start`, `inset-inline-end`, `text-align: start`). Never `left`/`right` in layout CSS.
- **Charts and the road run in reading direction:** time flows from the reading start, so in Arabic the oldest scan is on the right and the y-axis sits on the right. The same in every chart. Bars and meters fill from the inline-start edge. Digit order never reverses. The body figure and the logo never mirror.
- Animate Arabic by word, never by letter (letters join).
- Check every screen in Arabic for clipped text; Arabic runs longer.

## Responsive

- Mobile-first at 360 px; works at 320 px with no horizontal scroll.
- Breakpoints: Ionic's `sm 576`, `md 768`, `lg 992`, `xl 1200`. At `md`+ the feed may go two columns; at `lg`+ content is capped at 960 px and centered.
- Tap targets ≥ 44×44 px. Inputs use 16 px text (iOS zooms smaller inputs).
- Phone landscape (667×375): login reaches its button without scrolling.
- Hover styles only under `@media (hover: hover)`.

## Notch and safe areas

- `index.html` viewport has `viewport-fit=cover`.
- `IonHeader`/`IonContent` handle the top inset; custom fixed elements add `var(--ion-safe-area-*)` themselves. The docked tab bar pads its bottom with `--ion-safe-area-bottom`; landscape respects left and right.
- Capacitor: `StatusBar.setOverlaysWebView({ overlay: true })`, style following the theme.
- The last item on a page clears the tab bar.

## Motion

**Daily screens stay still; the new result moves.** Motion explains a change or rewards a real one; it never delays reading.

| Need | Tool |
|---|---|
| A state change or loop (press, tab indicator slide, skeleton) | CSS `transition` / `@keyframes` |
| React-driven appear, leave, reorder, gesture | Motion (`m.*` inside the app's `<LazyMotion strict>`, never `motion.*`) |
| A scripted sequence: the new-result reveal, the road drawing in, the emblem landing | GSAP (`useGSAP` with `scope`, loaded with `import()` outside the main bundle) |
| Page-to-page | Ionic's router animation; never wrap Ionic pages in Motion or GSAP |

Rules:
- **No entrance replay on tab visits.** Tabs render settled. A screen may animate in once per app session at most; `useReveal`'s replay goes away with the foundation.
- **Count-ups only on a real new scan**, never on revisits.
- **The reveal** is the delight budget: the road slides in from the last stops, the emblem lands, the changed pips turn green, one haptic. About 1.6 s in total, skippable by tap, and the numbers are readable at every frame.
- Ease out for entering (`power3.out` / `cubic-bezier(0.22, 1, 0.36, 1)`), 150–250 ms for UI responses, ≤ 400 ms for anything the member waits on. Press: scale 0.97, 120 ms.
- Animate `transform` and `opacity` only. Pause GSAP timelines when an Ionic page leaves (`ionViewWillLeave`).
- Movement from the start side flips in RTL; read the direction from `i18n.dir()`.
- **Reduced motion:** Motion follows `<MotionConfig reducedMotion="user">`; GSAP uses `gsap.matchMedia()` and jumps to the end state; CSS uses `@media (prefers-reduced-motion: reduce)`. The reveal becomes a cross-fade.
- Content is never hidden waiting for a timeline (`opacity`, never `visibility`); if JS fails, the screen still works.
- **Haptics** (Capacitor), not sound: a selection tick when switching scans, success when a result improves, a warning on an amber metric. Sound effects are removed.

## Performance

| Budget | Limit |
|---|---|
| Initial JS (gzip) | ≤ 200 KB |
| Each lazy route chunk (gzip) | ≤ 80 KB |
| Fonts on first paint | Readex Pro `arabic` + `latin` subsets only; Alexandria loads with the first `Num` |
| Home API calls on load | 1 |
| Lighthouse mobile performance (staging) | ≥ 90 |

- Lazy-load every tab page with `React.lazy`; login stays in the main bundle.
- Charts are hand-made SVG components. Don't add a chart library, state library, date library or Lottie (plan, decision 10).
- No Ionic overlays (`IonAlert`, `IonToast`, `IonActionSheet`, `IonPopover`); use `Dialog`, `Toast` and `Sheet`.
- Data via `api()` / `useApi` with the offline cache; refresh on resume.
- Run `npm run build` and check the size report.

## Accessibility

Target WCAG 2.2 AA. `e2e/a11y.spec.ts` runs axe-core on every screen in both languages and both themes, and must stay at zero violations.

- **Charts are images with a summary:** SVG charts (`Road`, `TrendLanes`, `NoiseMeter`, `BodyFigure`) get `role="img"` and a translated sentence of what changed and by how much; the numbers are also on screen as text. Chart points are reachable with arrow keys.
- **Label in name:** a control's accessible name contains its visible text. The tab bar has no `aria-label` on `IonTabButton` and is a `<nav>` landmark.
- **Keyboard:** everything works from the keyboard; focus is visible in both themes (2 px `--lu-brand-soft` ring, offset 2 px).
- **Text size:** rem only; check 200% text and the text-spacing override for clipping.
- **Headings:** one `h1` per page; an `h2` per card.
- **Dialogs and sheets** have a name; Escape and the back gesture close them.

## Done checklist

| Check | How |
|---|---|
| Arabic and English strings exist, Arabic is Egyptian | `npm run i18n:check`; read the Arabic |
| RTL is correct | View in `ar`: nothing clipped, charts run right to left, body figure unmirrored |
| Dark, light and two gym brands | Toggle the theme; set Iron Box and Pulse Gym brands. `npm run check-colors` passes |
| One primary action, verdict before numbers | Look at the screen |
| 320, 390, 768, 1280 px and phone landscape | Playwright viewport projects pass |
| Notch-safe | The iPhone project screenshot shows nothing under the notch or home indicator |
| Every data stage | Checked as Lina (no scans), Omar (one scan), an inside-the-noise member and a different-machine scan |
| Stress test | Long Arabic, 200% text, missing values, lean-only segments (`break-ui` skill) |
| Motion | No replay on tab visits; reduced motion checked |
| Bundle within budget | Build size report |
| E2E test added or updated | `e2e-testing` skill |
| No dead ends | Every screen, sheet and dialog has a visible way out by tap alone |
| Accessibility | `e2e/a11y.spec.ts` covers the screen with zero violations |
