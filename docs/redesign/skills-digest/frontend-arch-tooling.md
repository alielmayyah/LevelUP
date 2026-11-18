# Skills digest: frontend-arch-tooling

Batch: `discovery/ui-skills/_batches/frontend-arch-tooling.json`, 100 skills. Triaged on 2026-11-18 for the LevelUP member-app redesign.

**Counts by relevance:** 3 (high) = 7 · 2 (useful) = 8 · 1 (low) = 29 · 0 (none) = 56. Six of the low ones are useful mainly for the later gym dashboard. They are marked "dashboard-later".

**Stack facts used for conflict checks** (from `levelup-frontend/package.json` and `index.html`): React 18.3, react-router **v5** through `@ionic/react-router`, Ionic 8.8, Capacitor 7 with only the **Android** platform (no `@capacitor/ios`), Vite 8, Vitest 5.1, Tailwind 4.3, `@playwright/test` 1.65, motion 14, GSAP 3.15, i18next 27. `index.html` already has `viewport-fit=cover` and `color-scheme: light dark`, and does not use `user-scalable=no`. The theme CSS already uses `--ion-safe-area-*` and turns off the tap highlight.

**Method:** I read the frontmatter and headings of all 100 skills and ran a pattern scan for red flags across every file. I read 16 candidates in full, including their reference files. Notes such as "missing X.md" mean the snapshot does not include a file that the SKILL.md links to.

## All skills

Red flags cover: pre-approved tools (`allowed-tools`), shell commands the skill tells the agent to run, fetching remote instructions at runtime, writes to agent config, and injection-like text. A dash means none found.

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| addyosmani/api-and-interface-design | 1 | Contract-first APIs, error semantics, discriminated unions. Fits the backend DTO boundary, not the redesign. | – |
| addyosmani/browser-testing-with-devtools | 1 | Chrome DevTools MCP for DOM, console, network, perf and a11y checks. Overlaps the Playwright tooling the project already has. Good rules for treating untrusted content as data. | Tells you to add MCP server `npx -y chrome-devtools-mcp@latest --isolated` (unpinned, auto-yes) |
| addyosmani/frontend-ui-engineering | 2 | "Avoid the AI aesthetic" (purple/indigo, gradients, heavy shadows, rounded-everything). Skeletons instead of spinners. Loading, empty and error states. Container vs presentation. Checks at 320 px. | – (links a missing `accessibility-checklist.md`) |
| aminblg/simple-english | 1 | ASD-STE100 plain English for docs. Translation-friendly, but it rules itself out for brand/UI flair. Its references are missing. | – |
| antfu/antfu | 0 | Anthony Fu's tooling conventions (ni, knip, ESLint, pnpm catalogs). | Shell: `npx`, git hook setup with nano-staged |
| antfu/antfu-design | 0 | Vue + UnoCSS devtools design kit. | Appends a rule to `AGENTS.md` |
| antfu/nitro | 0 | Server toolkit. | – |
| antfu/pnpm | 0 | Package manager guidance. | – |
| antfu/unocss | 0 | UnoCSS, which the project does not use. | – |
| antfu/vite | 1 | Vite 8 index (matches the project version). Only the index is in the snapshot. | – |
| antfu/vitest | 1 | Vitest 5.1 index (matches the project version). Only the index is in the snapshot. | – |
| anthropics/pdf | 0 | PDF processing in Python. | Shell: `pip install`, poppler/qpdf |
| appllama/appllama-usage | 1 | Study top-grossing apps' screens through the paid Appllama MCP. Might inform result and onboarding patterns. | Remote paid MCP that spends credits |
| ayghri/i-have-adhd | 0 | Chat output style. | – |
| cursor/thermo-nuclear-code-quality-review | 1 | Harsh maintainability review. Not specific to the redesign. | – |
| danny/screenshot | 1 | Headless Chrome screenshots by section or device. Its engine `scripts/screenshot.mjs` is missing, and it has leftover "Nuxt app" defaults. | Shell: `npm install` inside `~/.claude/skills`, `npx playwright install chromium`. Not hosted on GitHub. |
| emilkowalski/ask-sonner | 1 | Sonner toasts. The member app uses IonToast. **dashboard-later** (shadcn uses Sonner). | – |
| emilkowalski/break-ui | **3** | Worst-case data behind a dev toggle, plus a catalog of values that break UI. See top picks. | Forced branding "Initial Response" line |
| emilkowalski/mobile-native | **3** | Fixes that make a web app feel native on a phone. See top picks. | Forced branding "Initial Response" line |
| emilkowalski/pick-ui-library | 1 | Curated library list. For the member app, only NumberFlow (count-ups) applies. base-ui, Sonner, Vaul, recharts and next-themes clash with Ionic or the hand-made charts. Mostly **dashboard-later**. | – |
| emilkowalski/prototype | **3** | Genuinely different variants behind a picker. See top picks. | Forced branding "Initial Response" line |
| emilkowalski/write-swift | 0 | Swift. | – |
| figma/figma-code-workflows | 0 | Import HTML into Figma through the Figma MCP. | – |
| figma/generate-project-plan | 0 | FigJam plan boards built from a PRD. | – |
| flornkm/prefer-container-queries | 2 | Tailwind v4 core `@container` and `@md:` for components reused from 320 px up to desktop. Viewport breakpoints only for the page shell. | – |
| github/gh-stack | 0 | Stacked PRs. | Shell: `gh stack`, git commit |
| google-gemini/gemini-api-dev | 0 | Gemini SDK. | "MUST fetch" hosted docs before writing code. `pip`/`npm install`. |
| google-gemini/gemini-live-api-dev | 0 | Gemini Live API. | Remote docs, installs |
| humanlayer/narrow-react-prop-types | 1 | Tighten prop types. General code hygiene. | – |
| iannuttall/seo | 0 | SEO and Search Console. | `npx -y seo`, remote MCP at seoskill.dev that reads analytics |
| ibelick/fixing-metadata | 0 | SEO and Open Graph meta. Share cards in a WebView are images, not OG tags. | – |
| insane0777/awwwards-section-loop | 0 | Rebuild a reference site section by section. | Requires the awwwards MCP |
| insane0777/recreate | 0 | Clone a site from a URL. | MCP, `npm install` |
| jakubkrehel/better-writing | **3** | Interface copy rules. See top picks. | – (`reporting.md` missing) |
| jakubkrehel/break | 2 | One component on a harness page under scenario axes chosen by cues. Lighter than break-ui. | – |
| jakubkrehel/state-machine | **3** | Workbench that shows every state of a component. See top picks. | – (`switcher.md` missing) |
| jane-xiaoer/web-clone | 0 | Site cloning method (in Chinese). | `curl`, `wget --mirror` scraping |
| joe-bell/apple-web-app | 1 | iOS Safari and home-screen web apps. LevelUP ships Android only. All of its references are missing. | – |
| joe-bell/letterboxd-diary | 0 | Letterboxd RSS. | **allowed-tools** pre-approves `curl` to letterboxd.com and WebFetch |
| kemiljk/dxe-android-native-ui | 0 | Native Compose and Views. | – |
| kemiljk/dxe-apple-native-ui | 0 | Native SwiftUI and AppKit. | – |
| kemiljk/dxe-modern-css-html | 2 | oklch palettes, `color-mix()` states, `light-dark()`, logical properties, `dvh`, `@starting-style`, scroll-driven reveals behind a reduced-motion gate. | – |
| kemiljk/dxe-semantic-html-first | 1 | Native elements first. Partly clashes with Ionic components (`ion-modal`, `ion-button`). | – |
| kitlangton/effect | 0 | Effect v4. | – |
| leonxlnx/unlazy | 0 | Gate files that enforce task completion. | Offers to install a Claude Code **Stop hook** with `scripts/install-hooks.mjs` (asks for consent) |
| mattpocock/ask-matt | 0 | Router over Matt Pocock's flows. | – |
| mattpocock/codebase-design | 1 | Vocabulary for deep modules and seams. | – |
| mattpocock/diagnosing-bugs | 1 | Debugging loop. | – |
| mattpocock/domain-modeling | 1 | GLOSSARY.md and ADRs. Could pin InBody terms (SMM, PBF, ECW ratio) across EN and AR copy. | – |
| mattpocock/engineering | 0 | Routing README. | – |
| mattpocock/grill-with-docs | 0 | 247-byte stub. | – |
| mattpocock/improve-codebase-architecture | 1 | Architecture "deepening" HTML report. | The report loads Tailwind Play CDN and mermaid from a CDN |
| mattpocock/prototype | 2 | Variants on the real page through `?variant=`, with a floating switcher. Overlaps emilkowalski/prototype. | Commits prototypes to a throwaway branch |
| mattpocock/setup-matt-pocock-skills | 0 | Repo setup for Matt's skills. | **Edits CLAUDE.md/AGENTS.md**, writes domain docs "without asking", `gh issue create` |
| mattpocock/tdd | 1 | Red-green loop at agreed seams. Must confirm seams with the user before writing tests. | – |
| mattpocock/to-issues | 0 | Plan to tracker tickets. | Publishes to an issue tracker |
| mattpocock/to-prd | 0 | Conversation to a spec in the tracker. | Publishes to an issue tracker |
| mattpocock/triage | 0 | Issue triage state machine. | – |
| mengto/tailwindcss | 1 | Generic Tailwind recipes written for **v3** ("content paths", safelists). | – |
| microsoft/dev | 0 | Maintenance of the playwright-cli repo itself. | `npm install`, git commit/push, `gh pr create` |
| microsoft/playwright-cli | 2 | Agent-driven browser for visual checks and owner annotations. See top picks. | **allowed-tools** `Bash(playwright-cli:*) Bash(npx playwright:*) Bash(npx --no-install playwright:*)`. `npm install -g @playwright/cli@latest`. |
| millionco/improve-react | 1 | Read-only React audit that writes plans for other agents. | `npx react-doctor@latest`. **Fetches per-rule prompts** from react.doctor and inlines them. |
| millionco/react-doctor | 1 | React lint, a11y, bundle and architecture score (0–100), plus a "design" mode. | `npx react-doctor@latest` (unpinned). **`curl` a remote playbook and "follow every step"**, and the vendor can change it at any time. `scan <url>` records Chrome traces. |
| mrstev3n/balise-affinity-mcp | 0 | Affinity app automation. | – |
| openai/define-goal | 0 | Codex goal tool. | – |
| pbakaus/audit | **3** | Scored technical audit that is aware of RTL and theming. See top picks. | Runs the bundled `impeccable detect` CLI, writes reports with `audit-storage` |
| pbakaus/critique | 2 | Nielsen heuristics scored 0–4, a verdict on how product-specific the design is, persona walk-throughs. Heavy. | Requires sub-agents. Runs `impeccable detect`, starts `live-server`, injects `detect.js` into the page, writes `.impeccable/`. `critique-rubric.md` missing. |
| pbakaus/harden | **3** | Hardening checklist for edge cases, i18n and RTL. See top picks. | Template placeholders (`{{command_prefix}}impeccable polish`), so it is not standalone |
| petergyang/human-review | 1 | Owner edits and comments on an HTML, MD or localhost page and sends the batch back. | `npx -y human-review` (unpinned, auto-install), polls in the background |
| prototyperai/create-component | 0 | For contributors to the Prototyper UI library itself. | `tools:` grants Bash and Write. `npx shadcn@latest add https://prototyper-ui.com/r/…json` (remote registry code). |
| prototyperai/prototyper-ui | 1 | Base UI + Tailwind v4 kit with oklch semantic tokens and color-mix hovers. **dashboard-later**. | **"Always fetch docs first"** from prototyper-ui.com `llms.txt`. `npx -y @prototyperco/mcp@latest`. |
| remix-run/react-router-data-mode | 1 | React Router v7 data mode. The member app is on RR v5. **dashboard-later**. | – |
| remix-run/react-router-declarative-mode | 1 | React Router v7 declarative mode. **dashboard-later**. | – |
| remix-run/react-router-framework-mode | 0 | Full-stack SSR framework mode. | – |
| rolldown/tsdown | 0 | Library bundler. | `npx tsdown`, `npx skills add …` |
| saadeghi/daisyui-config | 0 | daisyUI. | – |
| saadeghi/daisyui-install | 0 | daisyUI. | CDN links, `npm i` |
| saadeghi/daisyui-usage | 0 | daisyUI. | – |
| shadcn/improve | 1 | Senior-advisor codebase audit that writes plans. Read-only on source. | Optional `gh issue create`. Treats repo text as data. |
| sidkh/term-radar | 0 | Appends Google Images links for terms. | – |
| sveltejs/svelte-code-writer | 0 | Svelte. | `npx @sveltejs/mcp …` |
| sveltejs/svelte-core-bestpractices | 0 | Svelte. | `llms.txt` doc links |
| tjcages/linear-discipline | 0 | Linear tracking discipline. | **Always-on rules** written into agent config |
| tjcages/linear-finish-install | 0 | Linear tracking install. | **Writes an always-on block into `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`**, and Cursor user rules. Makes Linear the source of truth every session. |
| tjcages/linear-methodology | 0 | Router for the Linear pack. | Same pack as above (always-on) |
| tjcages/linear-monitor | 0 | Linear health check. | Same pack as above |
| tjcages/linear-setup | 0 | Linear bootstrap. | Same pack as above |
| tjcages/linear-sync | 0 | Linear reconcile. | Same pack as above |
| tt-a1i/archify | 0 | Architecture diagrams as HTML. | A rules line can switch on "proactive" or "always-on" explainer mode |
| tt-a1i/archify-review | 0 | Internal maintenance review. | – |
| vercel-labs/agent-browser | 1 | Rust browser-automation CLI. | **allowed-tools** `Bash(agent-browser:*)`. "Prefer over any built-in browser automation." `npm i -g agent-browser && agent-browser install` downloads Chrome. Its **real instructions are served by the CLI at runtime** (`skills get core`). Also covers sending Slack messages and Electron apps. |
| vercel-labs/composition-patterns | 1 | Compound components, avoid boolean props. Its rule files are missing. The React 19 section does not apply. | – |
| vercel-labs/react-best-practices | 2 | Mine the client rules: SVG precision, animate an SVG's wrapper, `content-visibility`, derived state, lazy init, passive listeners. Skip the Next, RSC and React 19 rules. | Mostly remote links. `npx svgo` mentioned. |
| vercel/next-bundle-optimizer | 0 | Next.js only. | `npx skills add …` |
| vercel/next-cache-components | 0 | Next.js only. | **Install the `next-dev-loop` skill "without asking"** in non-interactive runs. `npx @next/codemod@latest agents-md` writes AGENTS.md. |
| vercel/next-cache-components-optimizer | 0 | Next.js only. | `npx @next/codemod` |
| vercel/next-partial-prefetching-adoption | 0 | Next.js only. | `npx skills add`, `npx @next/codemod@latest agents-md` |
| vercel/next-partial-prefetching-optimizer | 0 | Next.js only. | – |
| vercel/turborepo | 0 | Monorepo build tool. | – |
| wshobson/web-component-design | 1 | Generic React, Vue and Svelte component APIs and CSS approaches. The a11y reference is worth a look. Partly **dashboard-later**. | – |

## Top picks

### 1. emilkowalski/mobile-native (rel 3, 16.9 KB, MIT). Mine it.

**What it gives LevelUP:** a table that maps each "this feels like a website in a WebView" symptom to its fix, with a reason for every fix:

- Put hover styles behind `(hover: hover) and (pointer: fine)`. Tailwind v4 `hover:` already compiles to the hover query.
- Give press feedback on `:active` or pointerdown, 100–160 ms ease-out with `scale(0.97)`, plus `touch-action: manipulation`.
- Use `overscroll-behavior: none` on the root and `contain` on inner scrollers and sheets.
- Use `user-select: none` only on controls.
- Inputs need at least 16 px font. Never disable zoom. Use `inputmode="decimal"` for weight and height entry, and set `enterkeyhint`.
- Use `100dvh` for shells and add `interactive-widget=resizes-content`.
- Use `touch-action: pan-y` on a horizontal scan-comparison swiper.
- Test on real hardware and say which fixes still need a phone.

**Conflicts:**

- It is written for mobile browsers and PWAs. A Capacitor Android WebView has no URL bar, and the `theme-color` meta does not tint the system bars there; that needs native or Capacitor config.
- Ionic already supplies `--ion-safe-area-*`, `ion-content` scrolling and button ripples, so don't double them.
- LevelUP's `index.html` and theme already cover viewport-fit, color-scheme, safe-area padding and the tap highlight. What is left is overscroll, touch-action, hover gating, inputs and the keyboard.
- It forces a branding "Initial Response" line.

### 2. emilkowalski/break-ui (rel 3, 22.9 KB = SKILL 14.6 + CATALOG 8.2, MIT). Install it whole, or take the method and write an InBody catalog.

**What it gives LevelUP:**

- A realistic worst-case fixture enters at the data boundary, never through edited markup, behind a dev-only "Demo / Worst case / Empty / One" toggle.
- Check at the real container width, 320 px, 200% zoom, dark mode and RTL.
- A failure-signature table: `min-width: 0`, `flex-shrink: 0`, `overflow-wrap: anywhere`, `tabular-nums`, `Intl.NumberFormat`/`PluralRules`, guards against null and NaN.
- **"Never truncate numbers, amounts, dates or anything the user compares."**
- Report Broken, Ugly or Fragile with `file:line`, then stop. Keep the fixture as a regression test.

**InBody worst cases to build** (from `inbody-data-example.json`): missing segmental fields, values outside `normal_range`, a null range, only one scan (nothing to compare), zero, negative and very large changes, 3-decimal ratios (ECW 0.377), long Arabic names, Arabic digits.

**Conflicts:**

- The catalog is about people and lists (emails, avatars), so it needs a domain catalog alongside it.
- "Intl with the user's locale" gives Arabic-Indic digits for `ar-EG`, so you need an explicit numeral policy.
- Gate the toggle on `import.meta.env.DEV`.
- It forces a branding line.

### 3. jakubkrehel/better-writing (rel 3, 11.6 KB, MIT; `reporting.md` missing). Mine the rules. Install from the repo only if you adopt the whole jakubkrehel family.

**What it gives LevelUP:**

- Inventory the `t(` calls and locale JSON before writing anything.
- One noun and one verb per thing (scan, result, muscle).
- Tone follows the stakes: warm for success and empty states, calm and plain for errors, with no "oops" or exclamation marks.
- Build strings whole, using placeholders and the locale's plural rules.
- Buttons start with a verb. Errors say how to fix the problem, next to the field.
- Empty states point forward, for example "No scans yet. Book your first InBody scan at the front desk".
- Parallel status copy, for example "Loading your scan…" then "Scan loaded".
- `Intl.NumberFormat` with `style: "unit"` for kilogram, liter and percent, plus `RelativeTimeFormat`.
- Write "tap", not "click".

**Conflicts:**

- Its plural examples use ICU MessageFormat. i18next uses suffix plurals, and Arabic needs `_zero/_one/_two/_few/_many/_other`.
- It is English-centric (capitalization policy). The Egyptian-Arabic voice has to be defined separately.
- It hands off to sibling skills that are not in this batch.

### 4. pbakaus/harden (rel 3, 10.8 KB, Apache-2.0). Mine it. It is a reference file of `impeccable`, not a standalone skill.

**What it gives LevelUP:**

- Text overflow: `min-width: 0`, line-clamp, wrapping.
- i18n: logical properties, mirrored direction icons, `Intl` for numbers and dates, locale digits, plurals through the i18n library, a 30–40% space budget for longer translations.
- Per-status error states with retry.
- Loading copy that says what is loading. Skeletons.
- Prevent double submits.
- Interrupted gestures: handle `pointercancel`, `lostpointercapture` and `blur`.
- Clean up on unmount.
- A final verify list: long text, RTL, offline, 3G, empty data, rapid taps.

**Conflicts:**

- `{{…}}impeccable` placeholders.
- Its Arabic examples target Persian and Saudi locales and the Hijri calendar. LevelUP needs `ar-EG`, Gregorian dates and a decision between Latin and Arabic digits.
- "Works without JavaScript" does not apply to a Capacitor SPA.

### 5. pbakaus/audit (rel 3, 11.3 KB, Apache-2.0). Mine it (`impeccable` reference file).

**What it gives LevelUP:**

- Five dimensions scored 0–4 with P0–P3 severities.
- **Theming checks:** hard-coded colors, a broken dark theme, values that don't update on theme switch. This is exactly what the color redesign needs.
- Reduced motion must keep state change and hierarchy. It flags global 0.01 ms motion kills, which fits "motion that means something".
- Touch targets: at least 24 px, aim for 44 px.
- **RTL rules apply only on `dir="rtl"`:**
  - Flag physical properties.
  - `left: 50%; translateX(-50%)` already works in RTL, so don't "fix" it.
  - Check how direction icons actually render before calling them wrong.
- Report where the evidence came from (emulation or a device).

**Conflicts:** the "implementation integrity" dimension needs the bundled `impeccable detect` CLI and report writes. It also links a missing `audit.native.md`.

### 6. emilkowalski/prototype (rel 3, 15.8 KB incl. PICKER.md, MIT). Install it whole. It is user-invoked, and the picker spec is meant to be copied word for word.

**What it gives LevelUP:**

- Three to five variants, each on a named axis (layout, density, personality, motion, interaction model).
- A fixed dev-only picker:
  - Keys 1–N and ←/→ switch variants. R replays the entrance animation.
  - `?v=` keeps the choice across reloads.
- Each variant is shown full-size in real context, on the project's tokens, with real InBody numbers.
- Every variant fully works.
- The hand-off table says when each variant wins and what it costs. Then it stops and waits for the choice.
- The winner is promoted and the harness deleted.
- Craft rules: ease-out entrances, UI motion under 300 ms, transform and opacity, reduced motion.
- Good fit for: the "did I improve?" home screen, the new-result reveal, the body-balance map, comparison.

**Conflicts:**

- It says variants that differ only in color are not real alternatives. Palette exploration needs a separate token-swap harness (mattpocock/prototype says the same).
- The picker is a dark frosted-glass pill. That is fine, because it is harness chrome.
- Arrow keys are not mirrored for RTL.
- Mount it as a dev-only route inside `IonRouterOutlet`.
- It forces a branding line.

### 7. jakubkrehel/state-machine (rel 3, 5.4 KB, MIT; `switcher.md` missing). Install from the repo, because the snapshot is incomplete.

**What it gives LevelUP:**

- A throwaway route renders one component in every state it can reach, fed at the data seam (props or mocks) with data shaped like the real product.
- Loading states stay pending until you switch, so skeletons can be designed.
- A `__state` switcher, grouped in the product's own words.
- Re-check every state after each visual change.
- Removal takes one step.
- LevelUP states: no scans, first scan, improved, declined, mixed, new unseen result (the reveal), stale, offline, error, skeleton.

**Conflicts:**

- "A state the code can't reach isn't a state," so states for new screens must exist in code first.
- Its Next.js "use client" note does not apply.

### 8. microsoft/playwright-cli (rel 2, the best tooling option; 15.7 KB, Apache-2.0; references missing). Install it whole, but narrow the pre-approval.

**What it gives LevelUP:**

- `open --mobile` or `--device`, and `resize 320 …`.
- Emulation: `set-color-scheme dark`, `set-reduced-motion reduce`, `set-forced-colors`, `set-contrast more`.
- Screenshots and accessibility snapshots.
- `route` to feed InBody fixtures through mocked API responses.
- Console and network inspection, tracing, video.
- **`show --annotate`:** the owner draws boxes and comments on the live page, which gives a feedback loop for the redesign.
- `generate-locator` for writing e2e tests.

**CLI:** `playwright-cli`, or `npx playwright cli` from the local `@playwright/test`. I took that fallback from the skill and did not check that 1.65 has the subcommand. Otherwise it installs `npm i -g @playwright/cli@latest`.

**Red flag:** `allowed-tools` pre-approves `Bash(npx playwright:*)`, which covers every Playwright subcommand. `run-code` and `eval` run arbitrary JavaScript in the page.

**Conflicts:**

- Chromium emulation is not the Capacitor WebView. Safe areas, the keyboard and touch still need a device.
- RTL needs an in-app language switch.
- Attaching screenshots to PRs must go through the user's `commit` skill.

**Runners-up (rel 2):**

- flornkm/prefer-container-queries (4.3 KB, MIT)
- addyosmani/frontend-ui-engineering (12.6 KB, MIT). Its "avoid the AI aesthetic" section matches the owner's dislike of violet and glow.
- kemiljk/dxe-modern-css-html (5.7 KB, MIT). oklch, color-mix and light-dark. Check the minimum Android WebView version.
- pbakaus/critique (29 KB, Apache-2.0). Heavy.
- jakubkrehel/break (9.6 KB, MIT)
- vercel-labs/react-best-practices (115 KB, **no license file in the repo** even though the frontmatter says MIT)
- mattpocock/prototype (15.9 KB, MIT)

## Third-party CLIs these skills make the agent run

| Skill | What it runs | What that does |
|---|---|---|
| playwright-cli | `playwright-cli` / `npx playwright cli` | Opens and drives a browser; screenshots, emulation, tracing, owner annotations |
| agent-browser | `agent-browser` | Rust CLI that drives Chrome; downloads Chrome on install; serves its own instructions; also does Slack and Electron |
| browser-testing-with-devtools | `npx -y chrome-devtools-mcp@latest` | MCP server that controls Chrome: DOM, console, network, perf, JS execution |
| react-doctor, improve-react | `npx react-doctor@latest` | Scores the codebase; records Chrome traces; edits its own config. Also `curl`s a remote playbook. |
| human-review | `npx -y human-review` | Opens a browser review UI; blocks until the user sends feedback |
| danny/screenshot | `npm install` and a local script | Installs playwright-core; the script itself is missing |
| pbakaus/audit, pbakaus/critique | `impeccable detect`, `live-server` | Bundled CLI; injects a detector script into the page and saves reports |
| prototyper-ui and siblings | `npx shadcn@latest add <remote json>`, `npx -y @prototyperco/mcp@latest` | Pulls component code from a remote registry; runs an MCP server |
| vercel/next-*, rolldown/tsdown | `npx @next/codemod@latest`, `npx skills add <github url>` | Codemods; installs further skills from GitHub |
| iannuttall/seo | `npx -y seo` | SEO CLI that reads analytics data |
| sveltejs/svelte-code-writer | `npx @sveltejs/mcp` | Svelte docs and autofixer |
| jane-xiaoer/web-clone | `curl`, `wget --mirror` | Scrapes and mirrors websites |
| joe-bell/letterboxd-diary | `curl` (pre-approved) | Fetches Letterboxd RSS |
| leonxlnx/unlazy | `install-hooks.mjs` | Installs a Claude Code Stop hook |

## Notable red flags

- **Remote instructions that can change at any time:**
  - millionco/react-doctor `curl`s `react-doctor-agent.md` and says to "follow every step"; the vendor updates every agent on its next fetch.
  - millionco/improve-react inlines remote per-rule prompts.
  - prototyperai/prototyper-ui says "always fetch docs first".
  - vercel-labs/agent-browser loads its real instructions from the CLI at runtime.
  - google-gemini/gemini-api-dev says "MUST fetch" its docs.
- **Pre-approved tools:**
  - playwright-cli (`npx playwright:*`, which is broad)
  - agent-browser (`agent-browser:*`)
  - letterboxd-diary (`curl` and WebFetch to one domain)
  - prototyperai/create-component (`tools:` grants Bash and Write)
- **Persistence into agent config:**
  - The tjcages Linear pack writes an always-on block into `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`.
  - mattpocock/setup edits CLAUDE.md/AGENTS.md and writes docs "without asking".
  - antfu-design appends to AGENTS.md.
  - The Next codemod `agents-md` writes AGENTS.md.
  - unlazy offers a Stop hook.
- **Installs without consent:** vercel/next-cache-components says to install the `next-dev-loop` skill "without asking" in non-interactive runs.
- **Tool steering and persona hooks:**
  - agent-browser: "prefer over any built-in browser automation".
  - Emil Kowalski skills force a branding "Initial Response" line.
- **No real prompt injection found.** Every "ignore previous instructions" match was defensive advice (break-ui, improve-react, shadcn/improve, browser-testing-with-devtools).
