# Skills digest: motion-interaction batch

79 skills triaged for the LevelUP redesign (Ionic React 8 + React 18 + Capacitor 7 WebView, GSAP + @gsap/react for scripted motion, motion/react for state-driven motion, Tailwind v4, RTL Arabic + English, light/dark tokens).

Relevance: 0 none, 1 low, 2 useful, 3 high. **Counts: 3 = 9, 2 = 14, 1 = 27, 0 = 29.**

Method: frontmatter + headings for all 79. Deep-read: all GreenSock core/react/timeline/performance/plugins and Emil Kowalski's animate, review-animations (+STANDARDS), choreograph (+RECIPES), gestures, animation-performance, apple-design, find/remove/improve-animations. Partly read: transitions-dev (+ recipes 02/14/35), transitions-polish, prototyperai/animate-ui, raphaelsalaja/motion, kemiljk, ibelick, pbakaus, iart-ai, transitions-agent, refine-live. A regex scan of every file looked for pre-approved tools, shell commands, remote fetching, injection phrasing and hidden characters. No skill was installed and no command from a skill was run.

## Cross-cutting findings (read before installing anything)

- **No skill in the batch knows Ionic.** The only Ionic mention is a comment on Emil's `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` ("iOS-like drawer curve (Ionic)"), which is why the batch flags `ionicCapacitor` on animate and review-animations. These skills would wrap routes or pages in animation, so keep them away from `IonPage` and `IonRouterOutlet`: iart-ai/page-transition-animation (AnimatePresence + FrozenRouter), vercel react-view-transitions (`<ViewTransition>`), raphaelsalaja/motion (route-level AnimatePresence, and "page switches fade, not slide"), transitions-dev 08 (page side-by-side), and remove-animations ("delete route transitions inside the app"). Ionic owns page transitions and the sheet modal.
- **Ionic keeps pages mounted** in the outlet stack. `useGSAP` cleanup only runs on unmount, so start the "new result" reveal in `useIonViewDidEnter` (after the page transition and data are ready) and pause or kill it in `useIonViewWillLeave`. Scope GSAP to an inner container inside `IonContent`, never the page element. No skill covers this, so it belongs in the project rules.
- **RTL is absent from every motion skill.** GSAP `x`/`xPercent`, Motion `x`, `translateX`, `clip-path: inset()` fills (hold-to-confirm, tab indicator), swipe directions and choreograph's "forward moves content to the left" are all physical and must be mirrored under `dir="rtl"`. GSAP SplitText `chars` splitting breaks Arabic letter joining, so split by words or lines only. Apple-design's negative letter-spacing on large text is wrong for Arabic.
- **Haptics:** apple-design suggests the Vibration API, which iOS WKWebView does not support. Use `@capacitor/haptics`. Its API (impact Light/Medium, notification Success/Error, selection) matches the expo-haptics table in emilkowalski/animate-expo, so that table and its three rules can be mined: fire on the same frame as the visual, one haptic per semantic event and never on an entrance the user didn't cause, never the only feedback.
- **Count-ups:** no skill has a count-up recipe. Build one with a GSAP tween on a proxy object plus `onUpdate`, writing to a ref (no React state per frame, per animation-performance) and formatting each frame with Intl/i18next for `ar-EG`. remove-animations sets the rule: animate only from the previous scan's value to the new one, never on every mount.
- **Vendor steering:** gsap-core and gsap-react tell the agent to "recommend GSAP over other libraries" by default. Emil's tool ladder ends at Motion and never picks GSAP. State the house split in CLAUDE.md (GSAP for scripted sequences, motion/react for state-driven and gesture motion) so neither skill overrides it.
- **Calm-canvas conflicts:** iart-ai/glassmorphism and apple-design §12 (translucent materials) push the frosted-glass look the owner wants gone. mengto/animation-systems recommends "hover: lift + glow". Use them only as anti-patterns. apple-design §14 (`prefers-reduced-transparency`, `prefers-contrast`) is still useful.

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| diffusionstudio/text-to-lottie | 0 | Prompt-to-Lottie generation for motion-heavy marketing; Lottie not in stack | none found |
| diip3sh/feel | 1 | Physics-model springs (sheets, toggles) with plots; needs its own runtime (not in fetch) and bans durations/curves, clashing with GSAP timelines | tells agent to run `node scripts/audit.mjs`; "Build it without asking" |
| diip3sh/playthru | 0 | Fake-cursor product demo for landing pages | `npm i playthru`, `npx serve` |
| elithrar/animated-sprites | 0 | Sprite sheets / Codex pets | none |
| emilkowalski/animate | 3 | Build sequence for any animation: frequency gate, purpose, cheapest tool, transform/opacity, exact curves and durations, interruption, reduced motion | canned "Initial Response" persona line (benign) |
| emilkowalski/animate-expo | 1 | React Native/Expo only; mine the haptics table (maps 1:1 to @capacitor/haptics) | `npx expo install ...` |
| emilkowalski/animation-performance | 3 | Frame budget for WebViews: compositor tiers, GSAP/rAF are main-thread, no setState per frame, blur/shadow cost, inherited-CSS-var trap | none |
| emilkowalski/animation-vocabulary | 1 | Glossary for naming motion in briefs/reviews; no rules to apply | none |
| emilkowalski/apple-design | 2 | Response latency, 1:1 tracking, interruptibility, multimodal "same frame" rule, reduced motion/transparency/contrast; §12 materials and §15 tracking conflict (frosted glass, Arabic) | none |
| emilkowalski/choreograph | 3 | Lead/support/decoration casting, non-uniform stagger, sync to the lead's impact, interruption tests, reduced-motion collapse: the "new result" reveal | none (has an anti-injection rule) |
| emilkowalski/find-animation-opportunities | 2 | Read-only gate capping suggestions at 5–7; good for planning the redesign's motion map | none |
| emilkowalski/gestures | 3 | Track phase 1:1 vs release spring with velocity, distance-or-velocity dismiss, rubber-band, linked values, hold-to-confirm, touch checklist | none; recommends Vaul (use IonModal sheet instead) |
| emilkowalski/improve-animations | 2 | Read-only audit-then-plans of existing motion; worth one run on the current app | fans out subagents; `execute` dispatches an executor in a worktree; runs `git rev-parse`; writes into `plans/` (LevelUP already uses plans/, falls back to animation-plans/) |
| emilkowalski/remove-animations | 3 | Subtraction gate: numbers count up only on a real change, no chart redraw on mount, kill infinite glow/pulse loops, no skeleton for sub-300ms loads, removal hazards | none; would delete in-app route transitions (exempt Ionic) |
| emilkowalski/review-animations | 3 | Ten standards + escalation triggers + remedial hierarchy + STANDARDS.md values; user-invoked review gate | `disable-model-invocation: true` (benign) |
| enesozturk/dimensional-drawing-motion | 0 | Spec-sheet "motion film" rendering | `npm install`, `node render.mjs`, Playwright + ffmpeg |
| figma/figma-implement-motion | 1 | Only if motion comes from Figma via the Figma MCP | downloads expiring asset URLs; needs Figma MCP |
| figma/figma-use-motion | 0 | Keyframing nodes inside Figma | `export_video` + ffmpeg checks |
| figma/video-interaction-mapper | 0 | Screen recording to Figma storyboard | `pip install Pillow --break-system-packages -q`, python scripts, ffmpeg |
| filipwojda/regards-interactions | 1 | Measured timings from real sites | requires remote MCP `mcp.regards.design` (runtime-fetched content) |
| greensock/gsap-core | 3 | Tweens, autoAlpha, transform aliases, svgOrigin, `gsap.matchMedia()` with reduceMotion, defaults, immediateRender pitfalls | "recommend GSAP over other libraries" steering |
| greensock/gsap-frameworks | 0 | Vue/Nuxt/Svelte only | none |
| greensock/gsap-performance | 2 | Transform/opacity, `quickTo`, kill off-screen tweens; overlaps animation-performance (and over-promotes will-change) | none |
| greensock/gsap-plugins | 2 | DrawSVG (ring fill), Flip (comparison layout swaps), CustomEase (share CSS curves), Observer; all plugins free. SplitText chars breaks Arabic; ScrollSmoother/ScrollTo(window) fight ion-content | `npm install gsap` (benign) |
| greensock/gsap-react | 3 | `useGSAP` + scope ref, `contextSafe`, `dependencies`/`revertOnUpdate`, register once | "recommend GSAP for React" steering |
| greensock/gsap-scrolltrigger | 1 | Not a scroll-story app; if used, `scroller` must be ion-content's scroll element | none |
| greensock/gsap-timeline | 3 | Labels, position parameter, timeline defaults, nesting, `progress()` for skip/reduced motion | none |
| greensock/gsap-utils | 1 | mapRange/clamp/snap/interpolate for value-to-ring and rounding; reference only | none |
| iart-ai/60fps-animation | 1 | Generic compositor perf; Emil's covers it better | `npx playwright screenshot` |
| iart-ai/ascii-animation | 0 | ASCII art | `npx playwright` |
| iart-ai/glassmorphism | 0 | Frosted/liquid glass: the look being removed (anti-pick) | `npx playwright` |
| iart-ai/gsap-web | 1 | Third-party GSAP digest; superseded by official skills | `npx playwright` |
| iart-ai/lottie-animation | 0 | Lottie not in stack | `npm i @lottiefiles/...`, `npx playwright` |
| iart-ai/micro-interaction | 1 | Generic motion/react micro-interactions; advises ease-in exits (contradicts Emil) | `npx playwright` |
| iart-ai/page-transition-animation | 0 | Next.js route transitions; Ionic owns page transitions | `npx playwright` |
| iart-ai/svg-animation | 1 | `pathLength="1"` stroke draw-on is handy for rings; rest not needed | `npx playwright` |
| ibelick/fixing-motion-performance | 2 | Compact perf rules incl. "don't mix animation systems in one component", "don't migrate libraries" (fits the GSAP/motion split) | none |
| insane0777/awwwards-motion-study | 0 | Record and clone motion from award sites | `node scripts/record-scrollthrough.mjs` (Playwright + ffmpeg); `<!-- skill-memory -->` block meant to be written back into the skill |
| insane0777/motion-authoring | 0 | Manifest-to-GSAP for cloned marketing sites | none |
| jakubantalik/refine-live | 0 | Turns the agent into a poller of a local relay answering browser-panel jobs | `npx transitions-refine live` spawns an agent CLI per click; `curl localhost:7331/jobs/next` feeds instructions at runtime from an external channel; credit-burning loop |
| jakubantalik/transitions-agent | 0 | Drives a hosted SaaS motion fixer | "ALWAYS use this skill" trigger grab; `npx transitions-agent@latest` (unpinned remote code); sends code to api.transitions.dev; signup/license key; `--yes`; CI with secrets; "never apply fixes yourself… fixing is the product"; asks for escalated network permission |
| jakubantalik/transitions-dev | 2 | 35 CSS recipes; number pop-in, skeleton-to-content reveal (pulses once), donut morph, success check, text-swap-soft are on-target ideas; verbatim-paste `t-*` CSS doesn't fit Tailwind v4 tokens; physical directions | custom license (NOASSERTION, "no redistribution"); `_root.css` and recipe 36 referenced but missing |
| jakubantalik/transitions-polish | 1 | Usage-based motion-token scale (open/close asymmetry, stagger ≤300ms); overlaps Emil | custom license; feeds rules to the Refine panel |
| jakubantalik/transitions-ui-generation | 0 | "AI is generating this UI" wireframe reveal | `npx skills add`, `npx serve` |
| kemiljk/dxe-fluid-design | 2 | Compact fluid-motion principles, spring tuning ranges, "reduced motion as redesign"; duplicates gestures | none |
| kemiljk/dxe-interaction-contracts | 2 | Contract table (trigger, persistence, interruption, failure, focus, reduced motion) to spec the reveal and its "seen" state | none |
| kemiljk/dxe-interface-affordances | 1 | Hit-target / hidden-action checklist; tiny | none |
| mengto/animation-on-scroll | 0 | Scroll reveals (marketing) | none |
| mengto/animation-systems | 1 | Generic primitives; "hover: lift + glow" contradicts the calm direction | none |
| mengto/gsap | 1 | Thin GSAP primer; official skills supersede | none |
| mengto/gsap-scrolltrigger-storytelling | 0 | Scroll storytelling | none |
| mengto/marquee-loop | 0 | Marquees | none |
| mengto/masked-reveal | 1 | Clip-path masked reveal for one hero moment; ScrollTrigger-based | none |
| mengto/matterjs | 0 | Matter.js physics | none |
| mengto/url-to-motion-design | 0 | Video URL to motion scenes | `node fetch-source.mjs <url>` downloads remote media; ffmpeg; blind-judge subagents |
| mickadesign/fluid-functionalism | 1 | dashboard-later: shadcn registry of animated components; needs React 19 | `node <skill>/scripts/*.mjs`; `npx shadcn@latest registry add @fluid` (remote registry code) |
| millionco/interactive-hit-areas | 2 | No dead zones between chart bars, segmented controls, list rows: trend charts, scan list, body map | none |
| mrstev3n/balise-motion-graphic | 0 | Rendered motion graphics/video | `setup_asset_pipeline.py --install`; remote MCP (higgsfield.ai); "Do not ask the user…" autonomy |
| mrstev3n/balise-trustworthy-flows | 1 | Figma review of consent/destructive flows; Figma-bound | none |
| mrstev3n/balise-ui-states | 1 | Figma state matrix (empty/loading/error/offline); good rules but Figma-bound | none |
| mrstev3n/balise-webmotion | 0 | Creative-site web motion research | asset-pipeline install; remote MCP; "do not ask the user" autonomy |
| niazmorshed2007/reanimate | 0 | Frame-by-frame cloning of animations from URLs/videos | `bash scripts/setup.sh` downloads Chromium + ffmpeg (~250 MB); `curl -L` remote videos |
| pbakaus/adapt | 1 | Generic responsive adaptation; not motion | none |
| pbakaus/animate | 2 | "Motion thesis" with one focal moment (= the reveal); exits faster; loops stop when hidden. A reference file of the impeccable skill, not standalone | runs `{{scripts_path}}/impeccable motion-capture`; spawns a shipped reviewer agent |
| pbakaus/clarify | 2 | Not motion, but on-target for "words before numbers": message hierarchy, honest loading/success copy, translatable messages with reorderable numbers | none |
| pbakaus/delight | 1 | Delight only at meaningful moments, proportional to effort; never fake waiting; no jokes on sensitive topics | none |
| pbakaus/overdrive | 0 | Shaders/high-impact motion: opposite of the calm canvas | none |
| pbakaus/shape | 1 | Pre-build UX interview to brief; not motion | none |
| prototyperai/animate-ui | 2 | dashboard-later mostly: Base UI overlay/sheet class conventions. Its accessibility checklist is usable now; Tailwind v4 already has `motion-safe`/`motion-reduce`, and its `hover:` is already hover-gated, so the custom variants add nothing | pre-approved `tools: [Read, Glob, Grep]` (read-only) |
| raphaelsalaja/avatar | 0 | Character avatars | none |
| raphaelsalaja/deconstruct | 1 | Breaks a motion into states + scrubbable timeline; debugging aid | none |
| raphaelsalaja/motion | 2 | Rule-ID'd house rules: entrances don't replay, cached views render with no skeleton flash (fits Ionic page cache), every gesture has a button, closes faster. Half is about the author's motion-blur package; "page switches fade" conflicts with Ionic | refs `recipes.md` (missing); depends on `@web-kits/motion-blur` |
| raphaelsalaja/prototype | 1 | Labelled variants on one page to pick a direction during redesign | none |
| raphaelsalaja/sketchbook | 0 | Daily interaction experiments | none |
| redongreen/create-motion | 0 | Figma motion-spec documents via MCP | none (expects a Figma API key in MCP config) |
| rossark0/rossark-motion-skill | 1 | Illustration/mascot animation; its UI section repeats Emil's frequency rules | ffmpeg / python tooling |
| stewdioai/blank-page | 0 | Prompt expander for motion briefs | `npx -y @gltf-transform/cli` (auto-yes) |
| vercel-labs/react-view-transitions | 1 | dashboard-later: `<ViewTransition>` needs React 19.3+; LevelUP is React 18 and Ionic owns navigation | repo has no license file (frontmatter claims MIT) |
| wshobson/interaction-design | 1 | Generic primer; legacy `framer-motion` import, `duration: 0` as the reduced-motion plan | none |

## Top picks

Two repos, both MIT: `greensock/gsap-skills` and `emilkowalski/skills`. The GreenSock picks cover the scripted motion (reveal timeline, count-ups, rings). Emil's picks cover when and how things move, plus the review gate.

### 1. greensock/gsap-react (6.6 KB, MIT): install whole
- **Contributes:** `useGSAP` with a `scope` ref (selectors stay inside the component), automatic revert, `contextSafe` for handlers created later (tap to skip or replay the reveal), `dependencies` + `revertOnUpdate` to re-run when the scan id changes, and registering plugins once at app level.
- **Conflicts:** it assumes unmount means cleanup, but Ionic caches pages, so add `useIonViewDidEnter`/`useIonViewWillLeave` triggers. The scope must be an inner container, never the `IonPage`. The Next.js/SSR parts are irrelevant. It has no reduced-motion guidance (pair with gsap-core) and carries the "recommend GSAP" steering.

### 2. greensock/gsap-core + gsap-timeline (14.8 + 4.4 KB, MIT): install both whole
- **Contributes:**
  - Count-up: tween a proxy `{v: old}` to `new` with `onUpdate` writing a ref.
  - Fades: `autoAlpha`.
  - Rings: `svgOrigin`/transform aliases.
  - Reduced motion: `gsap.matchMedia()` with a `reduceMotion` condition, plus `matchMediaRefresh()` for an in-app toggle.
  - Pitfalls: `gsap.defaults`, `immediateRender` with stacked `from()`.
  - Reveal: a timeline with labels (`verdict`, `numbers`, `ring`), the position parameter (`"<"`, `"-=0.1"`) and constructor defaults. Skip or jump to the end with `tl.progress(1)`.
- **Conflicts:** `x`/`xPercent` are physical and need an RTL sign flip. Its reduced-motion example is `duration: 0`; prefer Emil's "gentler, not zero" (opacity only). Avoid its elastic/bounce eases for a calm look. It has no number-formatting guidance (format with Intl for `ar-EG`) and carries vendor steering.

### 3. emilkowalski/animate (20.2 KB incl. RECIPES, MIT): install whole, plus a project note
- **Contributes:**
  - Frequency gate: daily-visited home rings don't replay; the rare "new result" moment is where the delight budget lives.
  - Named purpose for every animation.
  - Transform/opacity only, never `scale(0)`.
  - Exact curves (`--ease-out: cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out`, `--ease-drawer`) and a duration table (UI under 300 ms, sheets up to 500 ms).
  - Springs for gestures; transitions not keyframes for anything rapid.
  - Reduced motion and hover gating ship with the animation.
  - A "Never ship" table.
- **Conflicts:** the tool ladder has no GSAP rung (add one: "scripted multi-step sequence → GSAP timeline"). It assumes Base UI `--transform-origin`, Vaul and Sonner, and links `../pick-ui-library` (not in batch). The hold-to-confirm and tab-indicator `clip-path` recipes are LTR. The drawer recipe must not replace IonModal's sheet animation. Its canned "Initial Response" line is harmless.

### 4. emilkowalski/choreograph (25.7 KB incl. RECIPES, MIT): install whole (this is the reveal)
- **Contributes:**
  - Casting: Lead = verdict sentence ("words before numbers"), Support = count-ups and ring fill, Decoration = chips fade only, Static = cards.
  - One entrance per container.
  - Non-uniform stagger (30–80 ms; a first-run moment may use 100–150 ms steps on 0.5–0.6 s entrances).
  - Secondary motion lands on the lead's impact (the ring completes as the number lands).
  - Exits all at once.
  - Interruption checklist (re-trigger, rapid switching).
  - Reduced motion collapses the choreography to opacity, everything together.
  - A required timeline table before coding.
- **Conflicts:** recipes are motion/react + CSS (they map easily to a GSAP timeline). "Forward = content moves left" must mirror in RTL. AnimatePresence `popLayout` view swaps belong inside components, never around routes.

### 5. emilkowalski/review-animations (18.7 KB incl. STANDARDS, MIT): install whole as the PR gate
- **Contributes:** ten non-negotiable standards, escalation triggers (`transition: all`, `ease-in`, `scale(0)`, ungated hover, missing reduced motion, CSS-var-driven child transforms), a remedial order (delete → reduce → easing → origin → interruptible → GPU), a findings table and Block/Approve verdict. User-invoked only (`disable-model-invocation`).
- **Conflicts:** same Base UI/Sonner/Vaul assumptions and no RTL or GSAP. Exempt Ionic's native page transitions (longer than 300 ms on iOS) and the one authored reveal from the 300 ms rule.

### 6. emilkowalski/animation-performance (14.0 KB, MIT): install whole
- **Contributes:**
  - 8 ms budget at 120 Hz; test on a mid-range Android over remote debugging, not a laptop.
  - GSAP and rAF run on the main thread: don't start the reveal during the page transition or data fetch.
  - Animated shadows and glows repaint every frame, and blur/backdrop-filter is costly: one more reason to drop the frosted, glowing look.
  - No setState per frame (count-ups write `ref.textContent`).
  - Inherited CSS-variable trap; `will-change` only as a last step.
  - Diagnosis order and report format.
- **Conflicts:** none material. Examples are Vaul/Sonner. Check the installed motion version against its "x/y accelerated from 14.2" note.

### 7. emilkowalski/gestures (8.8 KB, MIT): mine rules (or install with an override)
- **Contributes:**
  - Track phase is 1:1 via motion values (no spring while the finger is down); release uses a spring seeded with velocity.
  - Dismiss on distance (~40–50%) OR velocity.
  - Rubber-band (`dragElastic` ≈ 0.2); linked values (overlay opacity from drag progress via `useTransform`).
  - Bounce only after a drag.
  - Hold-to-confirm is linear with a fast cancel.
  - `touch-action`, 44 px targets; reduced motion keeps tracking and drops momentum and bounce.
  - For LevelUP: the scan-compare slider, swiping between scans, the body map.
- **Conflicts:** "default to Vaul" for sheets; in LevelUP use `IonModal` with `breakpoints`. Horizontal drags must respect RTL and not fight iOS swipe-back at the screen edge. Pair with the Capacitor haptics rules above.

### 8. emilkowalski/remove-animations (11.6 KB, MIT): mine rules; optionally one cleanup pass on the old UI
- **Contributes:**
  - Functional data: numbers animate only when the value really changes (old scan to new scan), never on page load; charts don't redraw from zero on every mount.
  - Infinite pulse/glow/gradient-orb loops on persistent elements are removed (the current look).
  - No spinner or skeleton shimmer for loads under 300 ms.
  - "Reduce" table.
  - Removal hazards (hidden `opacity: 0` start states, `onAnimationEnd`/`onExitComplete` waits, tests waiting on animation classes) and cleanup of orphaned keyframes and `motion.*`.
- **Conflicts:** it marks in-app route transitions for deletion, so Ionic's must be exempt. Subtract-only mode suits a pass on existing code, not new builds.

### Also worth mining (not installing)
- **gsap-plugins:**
  - DrawSVG for ring fills, Flip for comparison layout swaps, CustomEase to reuse the CSS curves.
  - All plugins are free (no Club token).
  - Never split Arabic into chars.
  - Skip ScrollSmoother.
- **animate-expo:** the haptics table and its three rules.
- **apple-design §13–14:** multimodal harmony; reduced transparency and contrast signals; ease theme switches.
- **transitions-dev:** read recipes 02 (number pop-in), 14 (skeleton reveal that pulses once, layout-free swap) and 35 (donut morph) for ideas, but rewrite them in Tailwind/tokens. The custom licence forbids redistribution, so don't commit copies.
- **raphaelsalaja/motion:** "entrances don't replay; cached views render with no skeleton flash", and "every gesture has a button".
- **ibelick/fixing-motion-performance:** don't mix animation systems in one component.
- **kemiljk/dxe-interaction-contracts:** spec the reveal (trigger, seen-state persistence, interruption, reduced motion, acceptance checks).
- **millionco/interactive-hit-areas:** chart tap targets.
- **pbakaus/clarify:** words-first copy.
