# Skills digest: systems-a11y-perf

Batch: 85 skills on design systems and tokens, accessibility (WCAG), and performance. Source: `discovery/ui-skills/_batches/systems-a11y-perf.json`. All skill files were treated as untrusted data: nothing they suggest was run or fetched.

Method: frontmatter and headings for all 85. Full read of the strongest candidates: better-layout and better-accessibility (with their reference files), accessible-animation, defaults, frames, baseline-ui, tailwind-design-system (with its references), Lime's rules and anti-slop list, distill, optimize, build-design-system, react-component-performance and all AccessLint files. Repo licenses come from `gh api repos/<owner>/<repo>/license`.

App facts checked read-only, to judge conflicts:
- Viewport meta is already `viewport-fit=cover, width=device-width, initial-scale=1.0`, so zoom is allowed.
- Dark mode is Ionic's `ion-palette-dark` class on `<html>`.
- Tailwind v4 runs alongside Ionic's CSS layers.
- Versions: React 18.3, Ionic 8, Capacitor 7, GSAP 3 with @gsap/react, motion 12.

Counts by relevance: **3 high: 6 · 2 useful: 7 · 1 low: 35 · 0 none: 37** (total 85).

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| accesslint/accessibility-diff | 1 | Diffs accessibility violations before and after a change. Only useful as a CI idea. | Pre-approves Bash, Read, Glob, Grep, Skill and Task. Runs `git symbolic-ref` when the skill loads (`!` syntax). Runs unpinned, auto-confirmed `npx -y @accesslint/chrome@latest ensure` and `npx -y @accesslint/cli@latest scan`. Runs `git stash push -u`, `git stash pop`, `git checkout <branch>` and `git checkout -` on your working tree. Repo has no license. |
| accesslint/accessibility-scan | 1 | Automated WCAG 2.2 scan of a live page, located by selector and file:line. axe in tests gets similar coverage without this tooling. | Pre-approves Bash, Read, Glob, Grep, Skill and Task. Runs `npx -y @accesslint/chrome@latest ensure`, `npx -y @accesslint/cli@latest scan` and `stop --all`. Suggests `npx @accesslint/cli init`. |
| accesslint/audit-and-fix | 1 | Actually `accessibility-audit`: a WCAG-EM multi-page conformance audit. Overkill for one app. | Pre-approves Bash, Task, Skill and the AccessLint MCP tools. Spawns one subagent per sampled page. |
| accesslint/contrast-checker | 1 | Mislabeled: byte-identical copy of `accessibility-inspect`, the manual tier (keyboard, focus, reflow, reduced motion, target size). It is not a contrast checker. | Pre-approves Bash plus 16 chrome-devtools MCP tools, including `evaluate_script` and `navigate_page`. Tells the user to run `claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest`. References a `checkpoints.md` that is not in the folder. |
| accesslint/link-purpose | 1 | Same file as contrast-checker. | Same as contrast-checker. |
| accesslint/refactor | 1 | Actually `accessibility-fix`: a baseline, edit, verify loop. | Pre-approves Read, Edit, Write and Bash plus the AccessLint audit MCP tools. Suggests `npx @accesslint/chrome ensure --headed`. |
| accesslint/use-of-color | 1 | Same file as contrast-checker. | Same as contrast-checker. |
| addyosmani/accessibility | 1 | Solid generic WCAG 2.2 checklist; better-accessibility covers the same ground more precisely. | Suggests `npx lighthouse <url>` and a global install, `npm install @axe-core/cli -g`. |
| addyosmani/best-practices | 0 | Website security and compatibility (CSP, doctype, source maps). | None. |
| addyosmani/core-web-vitals | 1 | LCP, INP and CLS. LCP matters little for a bundled app, and the quick fixes are for Next.js. | None. |
| addyosmani/performance | 1 | Generic web performance. Mostly network, CDN and caching advice that a bundled Capacitor app doesn't need. | None. |
| addyosmani/seo | 0 | SEO doesn't apply inside an app WebView. | None. |
| addyosmani/web-quality-audit | 1 | Lighthouse-style umbrella audit for websites. | None. |
| arla6ka/build-design-system | 1 | Builds the system from the current look ("invent no colour it does not already have"), which works against a recolor. | Runs bundled node scripts that are not in the folder (capture, check-system, pixdiff, find-chromium, land). Needs Playwright and Chromium. Edits `.git/info/exclude` and uses `git worktree add`. |
| arla6ka/component-docs | 1 | Writes one component's docs from its code. Useful later for the new kit. | None. |
| arla6ka/design-system-boss | 1 | Router for the arla6ka suite; needs its sibling skills. | None. |
| arla6ka/glaze | 0 | Black-and-white system for AI products, built on design.how components. | Tells the agent to fetch each component's page from design.how at runtime. Runs `npx shadcn@latest add https://design.how/r/glaze/lint.json`, which installs remote registry code, then `npx eslint`. |
| arla6ka/lime | 2 | Consumer-app system with one accent. Its anti-slop list matches the plan: no stat-card rows, no glass, no scroll reveal, no small grey sentences. | Same as glaze, with the Lime registry. |
| arla6ka/migrate-design-system | 1 | Later phase: moving screens onto the new kit. Has sensible bans. | None. |
| arla6ka/quartz | 0 | System for AI support and agent consoles. | Same as glaze. |
| arla6ka/sodium | 0 | System for infrastructure and data tools (mono capitals, zero radius). | Same as glaze. |
| arla6ka/token-mapping | 1 | Report-only map of hardcoded values to tokens. Handy when migrating to the new tokens. | None. |
| dimillian/react-component-performance | 2 | Isolates ticking state (count-ups), memoization, a Profiler workflow. Works with React 18. | None. |
| dimillian/swiftui-liquid-glass | 0 | SwiftUI. | None. |
| dimillian/swiftui-performance-audit | 0 | SwiftUI. | None. |
| dimillian/swiftui-view-refactor | 0 | SwiftUI. | None. |
| edenspiekermann/apply-design-system | 0 | Figma only. | None. |
| edenspiekermann/audit-design-system | 0 | Figma only. | None. |
| egonex-ai/understand-figma | 0 | Builds a knowledge graph through the Figma REST API. | Cleanup runs `find … -exec rm -rf`, limited to its own folder. Needs a Figma token. |
| elithrar/web-perf | 1 | Short, trace-first performance method focused on page load. | None. |
| figma/figma-generate-design | 0 | Turns code into Figma screens. | Pushy self-trigger wording in its description. |
| figma/figma-generate-library | 1 | Builds the system in Figma, including light and dark variables. Only useful if the redesign is drawn in Figma. | None. |
| figma/figma-generative-plugins | 0 | Figma plugin authoring. | "MANDATORY prerequisite" trigger wording. |
| figma/figma-spec | 0 | Figma specs and PRDs. | None. |
| figma/figma-use | 0 | Figma Plugin API rules for MCP writes. | "you MUST invoke this skill BEFORE every use_figma call". |
| firebenders/sync-figma-token | 0 | Syncs code tokens with Figma variables; only useful with Figma. | None (it has an approval gate). |
| humanlayer/build-iterated-agentic-loop | 0 | Installs a scheduled GitHub Actions coding agent. | Writes CI workflows that run an agent, pushes, runs `gh` commands. |
| humanlayer/design-control-loop | 0 | Same family. | Same. |
| iart-ai/accessible-animation | 3 | Tiered reduced motion for CSS, GSAP (`gsap.matchMedia`) and motion, with a React hook. | Runs `npx playwright screenshot` and bundled `scripts/seek-shot.sh` and `contact-sheet.sh`, which are not in the folder. Its demo HTML loads GSAP from a CDN. `references/patterns.md` is not in the folder. |
| ibelick/baseline-ui | 3 | Short anti-slop rule set: no purple gradients, no glow as affordance, one accent per view, compositor-only motion. | None. |
| ibelick/component-canvas | 1 | Pan-and-zoom canvas of the real components; a dev review tool. | None. |
| ibelick/create-canvas | 0 | Freeform exploration canvas. | None. |
| ibelick/create-design-md | 1 | Documents an existing design in a DESIGN.md. The format could hold the new spec, but documenting the old violet look isn't the goal. | Runs unpinned `npx @google/design.md` (spec, lint, export, diff). |
| ibelick/fixing-accessibility | 1 | Short generic accessibility rules; better-accessibility covers more. | None. |
| ibelick/ui-skills-root | 0 | Router for the ui-skills registry. | Loads skill text at runtime with `npx ui-skills start`, `list` and `get <slug>`: remote instructions. |
| insane0777/awwwards-design-md | 1 | Builds a DESIGN.md from public websites. Could pull palettes from reference sites. | Needs the awwwards MCP and Playwright. Runs `pip install pyyaml`, a bundled `node scripts/validate-design-md.mjs` and `npx --yes --package=@google/design.md`. |
| jakubkrehel/better-accessibility | 3 | Contrast thresholds, a second cue beside color, live regions, SVG labeling, hit areas, reduced motion, 320 px reflow. | None. |
| jakubkrehel/better-layout | 3 | Logical properties and RTL mirroring, one key number and one primary action per view, room for translated text, safe areas. | None. |
| kemiljk/dxe-design-system-evolution | 1 | Helps decide between reuse, a new variant or a new pattern. Useful later. | None. |
| mengto/company-logos | 0 | Logo rows. | None. |
| mengto/container-lines | 0 | Decorative guide lines, the opposite of a calm canvas. | None. |
| millionco/paper-flex | 0 | For the Paper design tool. | None. |
| millionco/paper-to-code-components | 0 | Paper MCP to Next.js and shadcn. | None. |
| millionco/performance | 1 | React Doctor render traces for slow interactions. | Runs unpinned `npx react-doctor@latest scan <url>` and attaches to Chrome over CDP. |
| millionco/reconcile-paper-sync | 0 | Paper sync. | None. |
| millionco/tailwind-token-consolidation | 1 | Tailwind v4 token dedupe. Its "eight bugs" list is worth reading before swapping palettes. | Runs `git checkout -- apps/web`, which discards uncommitted work. Also runs `python3 /tmp/transform.py` and pnpm scripts. |
| mrstev3n/balise-design-system | 2 | In French. Its color reference has a good OKLCH ramp method and a role × light × dark × state × pair matrix. | Runs bundled `python3 …/validate_dtcg.py` and `audit_token_usage.py`, which are not in the folder. |
| mrstev3n/balise-handoff | 1 | Figma handoff readiness, including localization and RTL checks. Only useful if the redesign is drawn in Figma. | None. |
| nolanperk/rad-spacing | 0 | Figma spacing variables; better-layout covers the same proximity rule. | None. |
| nvillapiano/cc-figma-component | 0 | Figma component sets from component contracts. | Its mandatory cleanup runs `npx rimraf scripts/` at the repo root and `rm -f .mcp-*…`. |
| nvillapiano/cc-figma-tokens | 0 | Figma variable collections. | None. |
| pbakaus/distill | 2 | Simplification pass: one goal, 1–2 brand colors, 3–4 type sizes, no nested cards. | No frontmatter. Contains unrendered `{{ask_instruction}}` and `{{command_prefix}}` placeholders. |
| pbakaus/optimize | 1 | Generic performance checklist; the notes on animation and keeping blur areas small are useful. | None. |
| prototyperai/build-primitive | 1 | ARIA and keyboard templates for custom primitives on Base UI. Ionic already provides most of these. | Frontmatter `tools: [Read, Glob, Grep, Write, Edit, Bash]`. |
| raphaelsalaja/defaults | 3 | Mobile-WebView defaults: taps, dvh, safe areas, color-scheme, tabular numbers, skeleton timing, no decoration. | None. Its `recipes.md` is not in the folder. |
| raphaelsalaja/frames | 3 | Frame budgets at 4× CPU throttle. Names per-frame state, animated layout properties and backdrop-filter as causes. | Runs a bundled `observe.js`, not in the folder, through a browser evaluate call. |
| raphaelsalaja/keyboard | 1 | Keyboard-only walk; matters only at desktop widths. | Runs a bundled `tabstops.js`, not in the folder. |
| raphaelsalaja/lab | 1 | Dev-only `/lab` route showing every state of the real components; good for reviewing the new kit. | Copies a bundled `lab.js`, not in the folder, into the app. |
| redongreen/create-anatomy | 0 | Figma annotation. | None. |
| redongreen/create-api | 0 | Figma component API spec. | None. |
| redongreen/create-component-md | 0 | Turns a Figma extract into a component spec. | Runs `npx uspec-skills component-md prepare` and `npm run build:cli`. |
| redongreen/create-property | 0 | Figma annotation. | None. |
| redongreen/create-structure | 0 | Figma annotation. | None. |
| redongreen/create-voice | 0 | Screen-reader specs, but the output goes into Figma. | None. |
| redongreen/extract-api | 0 | uSpec extract. | None. |
| redongreen/extract-structure | 0 | uSpec extract. | None. |
| redongreen/extract-voice | 0 | uSpec extract. | None. |
| shadcn-ui/migrate-radix-to-base | 1 | Dashboard-later, and only if the dashboard starts on Radix. | None. |
| shadcn-ui/shadcn | 2 | Dashboard-later: the official shadcn/ui workflow. | Pre-approves `Bash(npx shadcn@latest *)`, `pnpm dlx` and `bunx`. Runs `npx shadcn@latest info --json` as soon as the skill loads. Tells the agent to run `npx shadcn@latest docs` and fetch the returned URLs before every component task. |
| stephenturner/write-alt-text | 1 | Chart alt text for R and Quarto. Its three-part formula (chart type, data, key insight) is worth mining for the SVG charts. | None. |
| wshobson/accessibility-compliance | 1 | Generic WCAG. Its mobile reference is React Native, SwiftUI and Compose code, not WebView. | None. |
| wshobson/design-system-patterns | 2 | Token tiers, light and dark semantic maps, theming for reduced motion and forced colors. Overlaps the Tailwind one. | None. |
| wshobson/screen-reader-testing | 1 | VoiceOver and TalkBack test scripts for on-device QA. | None. |
| wshobson/tailwind-design-system | 2 | Tailwind v4 token mechanics: `@theme`, OKLCH, `color-mix`, wiping the default palette. | None. |
| wshobson/wcag-audit-patterns | 1 | Tiny generic WCAG audit overview. | None. |

## Top picks

### 1. jakubkrehel/better-layout (relevance 3)
- **Size and license:** 17.4 KB (SKILL plus 2 reference files), MIT.
- **Recommendation:** install whole. It is clean, runs no commands and maps almost one-to-one onto the plan.
- **Contributes:**
  - Write anything that mirrors with logical properties (`ms-`, `pe-`, `text-start`, `inset-inline-*`), using its physical-to-logical table.
  - `translateX` and `background-position` have no logical form and need a `[dir=rtl]` override. This matters for GSAP `x` tweens.
  - Progressions mirror in RTL: progress bars, steps and ratings fill from the leading edge. Digit order inside numbers never reverses.
  - "Never bury the one number the user came for": the primary fact comes first and detail is demoted. This is the "one answer per screen" rule.
  - One primary action per view. Past 3 secondary actions, move them into a menu.
  - Group with space: the gap between groups is at least 2× the gap inside one.
  - Plan for translation growth: `min-height` rather than `height`, `flex-wrap`, `minmax(0,1fr)`, pseudo-localization.
  - Use `dvh` units, `scroll-padding` under sticky headers, and container queries instead of device breakpoints.
  - Ends with a "before you finish" detection table.
- **Conflicts:**
  - Ionic's `ion-header`, `ion-content` and `ion-footer` and its `--ion-safe-area-*` variables already handle safe areas. Prefer them to raw `env()` plus the RTL overrides.
  - It hands off to sibling skills that are not in this batch (better-colors, better-typography, better-ui, better-writing). Its `reporting.md` is missing.

### 2. jakubkrehel/better-accessibility (relevance 3)
- **Size and license:** 34.7 KB (SKILL plus 6 reference files), MIT.
- **Recommendation:** install whole. It is clean and runs no commands.
- **Contributes:**
  - Contrast thresholds: 4.5:1 for text; 3:1 for large text (24 px, or 18.67 px bold); 3:1 for UI boundaries and meaningful graphics. That covers the rings, chart lines and body-map segments, and the amber attention color has to meet it on both canvases.
  - Pair color with a second cue: amber needs an icon or a word, and "improved" vs "declined" can't rely on color alone.
  - Live regions: use `role="status"`, render it empty first, and announce the "new result". For skeletons, set `aria-busy`, announce "Loading…", then the outcome.
  - SVG: `role="img"` plus a label. A complex chart gets a short summary with the data nearby as text.
  - Hit areas: 24 px for WCAG AA, aim for 44 px on touch. Decorative glow layers get `pointer-events: none`.
  - Movement, scale and blur are opt-in under `no-preference`.
  - Never block zoom. Content must reflow at 320 px.
- **Conflicts:**
  - It prescribes a native `<dialog>` and moving focus to the `<h1>` on route change. Ionic's overlays trap focus themselves, and `ion-router-outlet` keeps earlier pages mounted, so follow Ionic's behavior instead.
  - Contrast measurement is delegated to `better-colors`, which is not in this batch.

### 3. iart-ai/accessible-animation (relevance 3)
- **Size and license:** 11.8 KB, MIT.
- **Recommendation:** mine. Take the tier table, the `gsap.matchMedia` pattern, the hook and the gotchas, and skip the "Deliver & verify" section.
- **Contributes:**
  - A three-tier model for reduced motion:
    - Remove entirely: parallax, large slides and zooms, 3D, auto-carousels, smooth-scroll hijacking.
    - Soften to an opacity fade of 200 ms or less.
    - Keep: opacity, color, focus rings, spinners and essential motion.
  - `gsap.matchMedia()` with `motionOK` and `motionReduce` conditions; it reverts automatically when the setting changes. The "new result" reveal fits here.
  - A `useReducedMotion` hook with a live `change` listener.
  - In the CSS safety net, use `0.01ms` rather than `0s` so `transitionend` still fires, and set the iteration count to 1.
  - My inference, not in the skill: under reduced motion, count-ups should jump to the final value and rings should fill with a short fade.
- **Conflicts:**
  - The examples import `framer-motion`; use `motion/react`, which also offers `MotionConfig reducedMotion="user"`.
  - It never mentions `useGSAP`, which handles cleanup in React.
  - The global `*` CSS override probably won't reach Ionic's Web Animations-based page transitions.
  - The "Deliver & verify" section wants a standalone HTML demo with GSAP from a CDN, `npx playwright` screenshots and bundled shell scripts that are not in the folder.

### 4. raphaelsalaja/defaults (relevance 3)
- **Size and license:** 20.2 KB, MIT.
- **Recommendation:** mine about 20 rules into the project's own UI rules. Alternatively, install it whole with those overrides; it runs no commands.
- **Contributes:**
  - Taps feel native: no tap highlight, an `:active` state on everything tappable, `touch-action: manipulation`.
  - Hover styles only under `(hover: hover) and (pointer: fine)`.
  - Height and safe areas: `100dvh`, `min-height: 100svh`, safe-area padding.
  - `user-select: none` on controls.
  - `color-scheme: dark` on the root and one `theme-color` per scheme. A theme switch turns transitions off for one frame.
  - `tabular-nums` so count-ups don't jitter.
  - Format through `Intl` number, date and plural rules; Arabic has several plural forms.
  - Respond within 400 ms. Hold a skeleton back 150–300 ms, keep it up at least 300–500 ms, and match the skeleton to the real layout.
  - No glows, blur or decorative gradients. No nested cards.
  - Status never relies on color alone. Busy buttons keep their label. Destructive actions offer undo. Inputs are at least 16 px.
  - Rule IDs and a severity ladder that work for reviews.
- **Conflicts:**
  - "Links are links" and "state lives in the URL" assume a browser with shareable URLs.
  - "Rounded, not pill" is a taste call.
  - Native `<dialog>` again clashes with Ionic's overlays.
  - The sound and hotkey sections mostly don't apply.
  - Ionic already sets some tap and select defaults.
  - Its `recipes.md` is missing.

### 5. ibelick/baseline-ui (relevance 3)
- **Size and license:** 3.4 KB, MIT.
- **Recommendation:** mine the Design, Animation and Performance sections and drop the Stack and Components sections.
- **Contributes:**
  - Never purple or multicolor gradients. Never glow as the main affordance. No gradients unless asked. This encodes what the owner dislikes.
  - One accent color per view.
  - Animate only `transform` and `opacity`. Never animate large `blur()` or `backdrop-filter` surfaces.
  - `will-change` only during an active animation. Pause loops that are off-screen.
  - Interaction feedback within 200 ms, with ease-out entrances.
  - `h-dvh`, safe areas, structural skeletons, empty states with one next action.
  - `tabular-nums`, `text-balance` and `text-pretty`, a fixed z-index scale.
- **Conflicts:**
  - "MUST use motion/react for JS animation" excludes GSAP.
  - "Use Base UI, React Aria or Radix primitives" plus `tw-animate-css` would mix primitive systems with Ionic, which the skill itself forbids.
  - "Never add animation unless requested" and "no custom easing" are fine defaults, but the plan explicitly asks for meaningful motion.

### 6. raphaelsalaja/frames (relevance 3)
- **Size and license:** 4.9 KB, MIT.
- **Recommendation:** mine the budgets and causes. Don't install it, because its script is missing.
- **Contributes:**
  - A 4× CPU throttle as a stand-in for a mid-range phone.
  - Budgets: every frame within 16.7 ms, no animation frame over 50 ms during motion, every interaction painted within 200 ms.
  - Named causes:
    - Animating layout properties: animate `transform` and `opacity` instead.
    - Forced layout: do all reads before any writes.
    - `setState` on every frame: drive count-ups and ring sweeps through motion values, CSS variables or refs.
    - `backdrop-filter` on large moving layers. That means today's frosted glass is a real cost on Android WebViews.
  - Proof is a before-and-after pair of traces.
- **Conflicts:**
  - It needs a bundled `observe.js`, which is missing, plus a browser automation tool that can throttle the CPU.
  - For LevelUP that means the Vite dev server in desktop Chrome, or `chrome://inspect` on a real Android WebView.
  - It is manual only (`disable-model-invocation`).

### 7. wshobson/tailwind-design-system (relevance 2)
- **Size and license:** 24 KB (SKILL plus 2 reference files), MIT.
- **Recommendation:** mine the token mechanics. The CVA and component patterns are dashboard-later.
- **Contributes:**
  - Tailwind v4 CSS-first tokens with `@theme`.
  - `--color-*: initial` wipes the default palette, so only semantic tokens can be used.
  - `@theme inline` when a token refers to another variable.
  - `color-mix(in oklab, …)` for alpha steps.
  - OKLCH values and paired surface and foreground tokens.
  - Three tiers: brand, then semantic, then component.
  - Update `theme-color` on theme switch.
- **Conflicts:**
  - It says to drop `forwardRef` and pass `ref` as a prop. That only works in React 19, and LevelUP is on 18.3.
  - It includes Next.js `'use client'`.
  - The dark variant is keyed to `.dark`; LevelUP uses Ionic's `ion-palette-dark` class.
  - Ionic's `--ion-color-*` variables have to be fed from the same tokens.
  - Its theme toggle uses `transition-all` and isn't reduced-motion aware.
  - CVA and Radix Slot are shadcn-flavored.

### 8. arla6ka/lime (relevance 2)
- **Size and license:** 31.8 KB, MIT.
- **Recommendation:** mine about 12 anti-slop rules. Never install it.
- **Contributes:**
  - Priority order when rules conflict: accessibility, then tokens, then components, then scales, then polish.
  - One accent per view; the accent never fills a card or section.
  - No row of equal stat cards ("equal boxes make every number equally loud"). Show one figure, a list or a sentence. This fits "words before numbers".
  - No glass blur, blobs or textures.
  - No scroll-reveal fades.
  - No eyebrow labels, icon tiles or side-rail bars.
  - No small grey text for sentences people must read, which matters for readability in sunlight.
  - Sentence case, no emoji, no hype words, believable sample data.
  - A sticky header gains its bottom line only once content scrolls under it.
  - The sticky bottom main action includes the safe-area inset.
- **Conflicts:**
  - It is a money app built on design.how's shadcn and Base UI components.
  - "No chart library, sparkline only" doesn't fit LevelUP's charts.
  - "No weight 700" is a taste call.
  - Its glowing lime action contradicts the "no glow" direction.
  - Red flags: it fetches component pages from design.how at runtime and runs `npx shadcn@latest add https://design.how/r/lime/lint.json`.

### Runners-up (relevance 2)
- **pbakaus/distill** (5.6 KB, Apache-2.0): a "one goal per screen" simplification checklist.
- **mrstev3n/balise-design-system** (112 KB, Apache-2.0, in French): mine only `references/color-and-typography.md` for the OKLCH ramp method and the color-role matrix.
- **wshobson/design-system-patterns** (48 KB, MIT): token tiers; overlaps pick 7.
- **dimillian/react-component-performance** (4.7 KB, MIT): "isolate ticking state" for count-ups.
- **shadcn-ui/shadcn** (95 KB, MIT): dashboard-later, with heavy red flags.

## Notable red flags
- **Pre-approved tools and unpinned npx (AccessLint):** all 7 entries pre-approve Bash, plus the Chrome DevTools or AccessLint MCP tools.
  - They run `npx -y @accesslint/chrome@latest` and `npx -y @accesslint/cli@latest`, which are unpinned and auto-confirmed.
  - `accessibility-diff` runs a git command when the skill loads, and stashes or checks out branches on your working tree.
  - Three of the folders are the same file under misleading names.
  - The repo has no license.
- **Load-time execution and remote instructions:**
  - `shadcn-ui/shadcn` pre-approves `npx shadcn@latest`, runs it when the skill loads, and fetches doc URLs before every task.
  - `ibelick/ui-skills-root` pulls skill text through `npx ui-skills get`.
  - The four arla6ka systems fetch component pages from design.how and install a remote lint config.
- **Destructive commands:**
  - `millionco/tailwind-token-consolidation`: `git checkout -- apps/web`.
  - `nvillapiano/cc-figma-component`: `npx rimraf scripts/` at the repo root.
- **Bundled scripts that are not in the folder** (the agent is told to run them):
  - arla6ka/build-design-system (also edits `.git/info/exclude` and uses `git worktree`)
  - mrstev3n/balise (Python validators)
  - iart-ai (shell scripts plus `npx playwright`)
  - raphaelsalaja frames, keyboard and lab (JS files)
  - awwwards-design-md (also `pip install`)
- **Global install:** addyosmani/accessibility suggests `npm install @axe-core/cli -g`.
- **No classic prompt injection found.** Figma's official skills use pushy self-trigger wording, and the pbakaus files contain unrendered template placeholders.
