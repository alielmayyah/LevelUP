# Skills digest: visual-mengto-1

73 skills, all from `MengTo/Skills` (license MIT). Triaged on 2026-11-18 against the LevelUP member-app redesign: calm, data-forward, bilingual with RTL, light and dark from tokens, Ionic React in a Capacitor WebView.

**Verdict:** a weak batch for this app. Most skills are landing-page aesthetics, Three.js scenes, game development, or MengTo's own publishing workflows. None scores 3 (high). Five score 2 (useful), and all five are better mined for a few rules than installed. No skill covers RTL, Arabic type, Ionic, Capacitor, or data visualization as its main subject. Nothing here is worth holding for the gym dashboard either.

**Counts:** 3 high: 0 · 2 useful: 5 · 1 low: 12 · 0 none: 56

**Red-flag scan:** no skill has `allowed-tools` in its frontmatter (every frontmatter is just `name` and `description`). There is no classic "ignore previous instructions" text and no runtime fetching of remote instructions. Every remote URL is a citation, a CC0 asset link, or a CDN script. The real risk is in the workflow skills: one grants itself push and publish rights, and several commit, run scripts, or call paid APIs. See the table and the summary at the end.

## All skills

Relevance: 0 none, 1 low, 2 useful, 3 high.

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| mengto/add-mouse-driven-orbit | 0 | Three.js hero pointer parallax; desktop pointer effect, no use in a touch data app | none |
| mengto/ambient-section-particles | 1 | Particle layer itself is off-brief; its lifecycle rules (pause offscreen and in hidden tabs, one rAF loop, DPR cap, static under reduced motion) transfer | none |
| mengto/article-prompts-to-skills | 0 | Meta workflow that turns articles into skill packages | ends in a commit; references unfetched `agents/openai.yaml` |
| mengto/audit-reference-originality | 0 | Plagiarism audit of a site against its reference sources | runs a bundled Python helper (not fetched) |
| mengto/author-game-levels | 0 | Three.js game level design | none |
| mengto/background-grid-webgl | 0 | WebGL perspective-grid hero background | none |
| mengto/book-serif-index | 0 | Archival serif-reader aesthetic (named-aesthetic template) | none |
| mengto/build-awwwards-quality-sites | 1 | Marketing-site art direction; a few rules transfer: reduced motion renders the final state, one system per animated property, no glass everywhere, no motion without a narrative role | none (smooth-scroll engines would fight `ion-content`) |
| mengto/build-game-map-editor | 0 | Game map editor with password-gated route | none |
| mengto/build-game-monster-system | 0 | Rigged game monsters | none |
| mengto/build-hybrid-game-assets | 0 | Game asset pipeline | none |
| mengto/build-isometric-arpg | 0 | Isometric action RPG | none |
| mengto/build-mobile-threejs-games | 0 | Touch HUD and safe areas, but for Three.js games; 20 generic lines | none |
| mengto/build-rigged-game-assets | 0 | FBX/GLB game characters | references a Python validator script (not fetched) |
| mengto/build-threejs-scroll-worlds | 0 | Scroll-driven 3D worlds | links an outside GitHub repo as a reference; 5 reference files not fetched |
| mengto/cinematic-scroll-storytelling | 0 | Landing-page Lenis and ScrollTrigger choreography; 0.8 to 1.2 s reveals are too slow for app UI, and Lenis fights Ionic's scroll container | `npm i gsap lenis` |
| mengto/clean-minimal-beige-light-mode | 2 | Closest mood to "calm canvas, one progress accent": warm neutral layers, low-contrast borders, accent only for progress, active and primary; prose only, light mode only | none |
| mengto/codex-gpt-image-2-5-flare | 0 | Codex-only image generation workflow | Codex `// @exec` tool-call block; runs a bundled Python script |
| mengto/corner-lasers | 0 | Glow and bloom laser effect | none |
| mengto/create-game-vfx | 0 | Game visual effects | none |
| mengto/css-alpha-masking | 1 | `mask-image` edge fades for horizontal scrollers; Tailwind v4 already ships mask utilities | none |
| mengto/daily-ui-inspiration-capture | 0 | MengTo's inspiration-archive routine | runs a Node script; `git add -f` and commit; reads `AGENTS.md` |
| mengto/dark-blue-contrasting-clean | 0 | Cobalt-glow marketing aesthetic (template) | none |
| mengto/dark-glass-clean-layout | 0 | Frosted dark-glass console, the exact look being removed | none |
| mengto/design-first-ui-prompting | 2 | Per-screen brief: "what is the single message of this screen", one accent only, lock the system then change one variable at a time, constraints card; ARTICLE.md is opinion and promotion | none (REFERENCES.md is plain links) |
| mengto/dither-background | 0 | Dithered canvas background | none |
| mengto/dither-laser-dark-mode | 0 | Dither plus laser dark aesthetic (template) | none |
| mengto/documentary-brutalist-agency | 0 | Brutalist agency site | none |
| mengto/editorial-service-booking | 2 | Calm, trustworthy wellness and clinic system with real numbers: ink for decisive actions, one muted accent for status, no glass or gradients, 160 to 220 ms and 500 to 760 ms timings, full state list, honest results | none |
| mengto/elevenlabs-tts | 0 | Text-to-speech generation | reads `ELEVENLABS_API_KEY` from env or nearest `.env`; calls an outside API through a bundled script |
| mengto/fire-smoke-skill-vfx | 0 | Three.js fire VFX | Node build scripts (not fetched); remote CC0 asset link |
| mengto/funky-purple-container-tech | 0 | Purple and fuchsia glow, the violet look being removed (template) | none |
| mengto/glass-dark-ui | 1 | Anti-reference: frosted panels with a violet-tinted glow border; only its dark checklist transfers (no pure-black overlays, visible focus rings, solid fallback when blur is missing) | none |
| mengto/globe-gl | 0 | 3D globe data visualization | none |
| mengto/globe-particles | 0 | Particle globe | none |
| mengto/high-contrast-skeuomorphic-clean | 0 | Industrial dark bevels and inset depth; not calm (template) | none |
| mengto/horizontal-scroll-scenes | 0 | Scroll-jacked horizontal chapters | none |
| mengto/html-to-interaction-prompts | 1 | Article tooling, but its "Library Guidance" block is a clean decision table for CSS, Motion and GSAP that matches LevelUP's split | `git add -f` and commit |
| mengto/illustration-flat | 0 | Flat people in lavender and indigo doing design and coding work | Node plus Playwright render scripts (not fetched) |
| mengto/illustration-flat-with-black | 0 | Flat people with black; dev-themed scenes | Node plus Playwright scripts (not fetched) |
| mengto/illustration-framed-panel | 0 | Periwinkle-violet framed cartoon | Node plus Playwright scripts (not fetched) |
| mengto/illustration-one-line | 0 | One-line riso-style figures | Node plus Playwright scripts (not fetched) |
| mengto/illustration-outlined-cartoon | 0 | Outlined cartoon characters | `npm i -D playwright-core`; Node scripts (not fetched) |
| mengto/illustration-teal-spot | 1 | One-object spot art with an exact 11-color palette; could inspire empty-state art, but its subjects are dev tools and teal may clash with the new accent | Node plus Playwright scripts (not fetched) |
| mengto/light-mode-paper-technical | 1 | Paper-toned sibling of the beige skill; its dark outer frame, brackets and diagonal texture do not suit a 320 px app | none |
| mengto/lightning-energy-skill-vfx | 0 | Three.js lightning VFX | Node build scripts (not fetched); remote CC0 asset link |
| mengto/liquid-metal-border | 0 | WebGL metallic glow borders, the opposite of calm | `npm install metal-fx` (third-party package) |
| mengto/nested-container-clean-agency | 0 | Agency marketing shells (template) | none |
| mengto/nested-container-frames | 0 | Container-in-container marketing layout stub | none |
| mengto/optimize-threejs-games | 0 | Three.js game performance | none |
| mengto/performance-profiling | 1 | Apple Instruments and MetricKit for native apps; useful only for the Capacitor iOS shell (launch, memory), not WebView JS; not visual | none (4 reference files not fetched) |
| mengto/pointer-trail-emitter | 0 | Cursor trail effect | none (flag hit "curl" is a false positive) |
| mengto/pricing-page | 0 | Conversion pricing page; only relevant if a gym-facing marketing site appears, which is not in the plan | none (optional reading links) |
| mengto/progressive-blur | 0 | Stacked `backdrop-filter` blur is frost; GPU-heavy in Android WebView; a mask fade does the edge job | none |
| mengto/scroll-scrubbed-visual-sequence | 0 | Scroll-scrubbed image or video sequence | none |
| mengto/scroll-scrubbed-word-reveal | 1 | Scroll pacing conflicts with a 3-second answer, but its split-text rules transfer: keep an unsplit accessible copy, never split by line (wraps change with language and zoom), check contrast in both states | none |
| mengto/scroll-world-storytelling | 2 | Mode 3 only ("HTML / data / type"): one chart grammar, SVG with text labels, animated stroke offsets and counters, truthful scales, values in accessible text; the rest is video and 3D scroll pages | ffmpeg command; includes a good guardrail ("never publish or deploy without approval") |
| mengto/shaders-cursor-ripples | 0 | WebGPU cursor ripples over images | `npm install shaders` (package has telemetry; skill says to disable it) |
| mengto/ship-web-games | 0 | Game release and deploy | deploys and polls production |
| mengto/solar-duotone-bold | 1 | "One icon family, labelled icons" rule; Iconify must be bundled offline in Capacitor and directional icons mirrored in RTL | none |
| mengto/split-layout-technical | 0 | Split-screen marketing layout (template) | none |
| mengto/staggered-word-reveal | 2 | Exact word-reveal motion values with Motion and GSAP equivalents; splitting by word keeps Arabic letters joined | none |
| mengto/stitched-full-page-capture | 0 | Full-page screenshot repair | Node, Playwright and ffmpeg script; commit |
| mengto/technical-wireframe-info-layout | 0 | Monochrome wireframe diagnostic aesthetic (template) | none |
| mengto/thinking-orbs | 1 | AI-activity loader package; its "announce status once" pattern transfers to skeleton and processing states | `npm install thinking-orbs` |
| mengto/threejs-landscape | 0 | Procedural Three.js landscape | none |
| mengto/threejs-towers | 0 | Procedural Three.js architecture | none |
| mengto/vantajs | 0 | Animated WebGL backgrounds | loads three.js and Vanta from CDNs at runtime (remote code; breaks offline in a Capacitor WebView) |
| mengto/video-to-superprompt | 0 | Reference video to recreation prompt | ffmpeg frame extraction |
| mengto/web-technique-to-skill | 1 | Meta: how to write a skill (tie each rule to the failure it prevents, numbers not adjectives); handy if LevelUP writes its own design-system skill | commit step; `agents/openai.yaml` not fetched |
| mengto/webgl-laser | 0 | Full-screen WebGL laser background | none |
| mengto/workflow-ship-change | 0 | MengTo's game ship workflow | **HIGH**: description triggers it "at the end of every change"; declares push and publish "standing authorizations" so the agent should not ask; amends WIP commits; ends commits with "the attribution line the system gives you" (breaks the owner's no-attribution rule); runs `push-main.sh` and `verify-live.sh`; deploys to Netlify and Supabase |
| mengto/write-like-meng-on-x | 0 | Writes X posts in a real person's voice | impersonation of a named person; runs Node and Python scripts; reads `AGENTS.md`; commits |

## Same template, different adjectives

- **Named aesthetics (11):** book-serif-index, clean-minimal-beige-light-mode, dark-blue-contrasting-clean, dark-glass-clean-layout, dither-laser-dark-mode, funky-purple-container-tech, high-contrast-skeuomorphic-clean, light-mode-paper-technical, nested-container-clean-agency, split-layout-technical, technical-wireframe-info-layout.
  - All share the same 8 headings (Use When, an empty Workflow, Scope, Visual target, Implementation guidance, Recommended patterns, Tuning knobs, Avoid) and run 520 to 700 words.
  - None contains a single hex value or numeric unit. The "colors" exist only as adjectives.
  - Word overlap between pairs is low (0.19 to 0.24), so they are not literal copies. They are one generated mood-board template with stock phrases repeated throughout ("one restrained accent", "thin frame lines", "corner markers", "masked text reveals").
  - Read one and you have read them all.
- **Effect variant of the same skeleton:** background-grid-webgl, corner-lasers.
- **Illustration template (6):** illustration-flat, -flat-with-black, -framed-panel, -one-line, -outlined-cartoon, -teal-spot. They share 12 identical headings and differ by palette and line rules. All six depend on Node and Playwright scripts that were not fetched.
- **Library-wrapper template:** liquid-metal-border, shaders-cursor-ripples, thinking-orbs (Core Contract, Install, usage, Verification, Failure Diagnosis, Handoff).
- **Snippet template:** css-alpha-masking, progressive-blur, globe-gl, vantajs.
- **Skill-VFX template:** fire-smoke-skill-vfx, lightning-energy-skill-vfx.
- **Three.js game family:** author-game-levels, build-game-*, build-isometric-arpg, build-mobile-threejs-games, create-game-vfx, optimize-threejs-games, ship-web-games.

## Top picks

All are MIT-licensed (`gh api repos/MengTo/Skills/license` returns `MIT`). None should be installed whole. Each one is either aimed at websites or would be broken without its unfetched demo and script files. Mine the rules into LevelUP's own design skill or spec.

### 1. mengto/editorial-service-booking: mine (4,419 B, MIT)
**What it contributes**
- **Visual system:** warm ivory with near-black. Ink for decisive actions, one muted accent only for selection and status. Hairline rules, minimal radius, generous whitespace. No glossy cards, glass, loud gradients or ornament.
- **Motion values:** 160 to 220 ms for controls, 500 to 760 ms for section entrances. Shallow transforms. Reserve the exact final layout pixels so nothing shifts. Under reduced motion, render the final state immediately.
- **States:** design loading, empty, disabled, stale, invalid, failure, retry and success states. Return focus to the right field after an error. Validate with keyboard and touch, 200% zoom, visible focus and contrast.
- **Honesty:** show results only when they are real. That maps directly onto health data.

**Conflicts:** it is written for booking websites. Its serif-led identity and documentary photography do not carry over to an Arabic data app: a high-contrast Latin serif has no direct Arabic match, so it would need a deliberate Arabic and Latin pairing. It covers neither RTL nor a dark theme.

### 2. mengto/staggered-word-reveal: mine (4,925 B, MIT)
**What it contributes:** values for the "new result" headline.
- From `y: 20px, opacity: 0` over 0.8 s with `cubic-bezier(0.16, 1, 0.3, 1)` (GSAP `expo.out`), staggered 0.06 to 0.08 s per word, played once.
- Animate words, not letters. Animate transform and opacity only. No bounce, rotation or big blur. Short text only. Start after fonts load. Reduced motion shows static text. The Motion (`motion/react`) and GSAP equivalents are spelled out.
- Splitting by word keeps Arabic letter joining intact. Splitting by letter would break it.

**Conflicts**
- The vanilla splitter rewrites `textContent` and sets `aria-label` on the heading. That fights React and i18next language switches, so render the word spans in JSX instead.
- At 0.8 s plus 70 ms per word, a long Arabic sentence can blow the 3-second budget. Cap the total stagger.
- An above-the-fold result does not need the IntersectionObserver trigger.

### 3. mengto/clean-minimal-beige-light-mode: mine as a mood brief (3,791 B, MIT)
**What it contributes**
- Layered warm neutrals (beige, stone, cream, off-white) separated by very low-contrast borders and tone instead of shadows.
- The accent is used only for badges, active indicators, progress and the primary action. No heavy shadows, loud gradients or decoration. No harsh black-on-white jumps.
- Tiny status dots, low-key progress bars, and mild fades for motion.

**Conflicts**
- Prose only: no tokens or hex values, and no dark-mode counterpart, so LevelUP must build both themes itself.
- Its anatomy (framed shell, centered hero, process grid) is landing-page structure.
- Its "very low-contrast borders" can fail the 3:1 non-text contrast needed for chart tracks and range bars.
- A warm beige canvas lowers the contrast of amber "attention" marks, so test the separation.

### 4. mengto/design-first-ui-prompting: mine SKILL.md only (3,055 B; 6,414 B with ARTICLE.md and REFERENCES.md; MIT)
**What it contributes**
- A brief skeleton per screen: goal, persona and success; layout; type system; color with "one accent only"; copy rendered exactly; constraints; negatives.
- The question "what is the single message of this screen?", which is the "one answer per screen" rule.
- Lock layout, hierarchy and copy first, then vary one variable at a time (accent, background tone, card arrangement). Use a small "constraints card" to anchor the style.
- Its FORMAT block (size, aspect, safe margins) fits share-card specs.

**Conflicts:** aimed at image generators and AI site builders ("generate without text, typeset in Figma"). No RTL or bilingual copy guidance. ARTICLE.md is opinion and promotion (selling templates, model picks); skip it.

### 5. mengto/scroll-world-storytelling: mine Mode 3 only, about 10 lines (11,889 B, MIT)
**What it contributes:** rules for trend charts, rings and count-ups.
- One chart grammar per view (bars, line, range, slope or comparison).
- Inline SVG with labels kept as real, selectable text.
- Animate transforms, opacity, clip paths, counters and stroke offsets.
- Keep scales truthful and expose the values as accessible text or a table.
- Reduced motion removes interpolation but keeps the state changes and their order.

These fit hand-made SVG charts, segmental lean-mass bars and normal-range bands.

**Conflicts:** everything else is scroll-driven landing pages (pinned stages, video scrubbing, Three.js) plus ffmpeg. The demos were not fetched.

### 6. mengto/html-to-interaction-prompts: mine the "Library Guidance" block only (15,114 B, MIT)
**What it contributes:** a decision table that matches LevelUP's stack.
- CSS transitions for hover, focus and simple states.
- IntersectionObserver or the Web Animations API for light reveals.
- Motion for React component entrances, layout and shared-element transitions, staggered lists, modals, drawers and state-driven motion.
- GSAP for anything that needs timeline control.
- CSS scroll-snap first for horizontal strips. Lottie or Rive paused offscreen.
- Every animation plan must state its reduced-motion, touch, keyboard and focus behavior, and its performance limits.

**Conflicts:** the skill itself is an article-generation workflow with screenshots and `git add -f` commits; do not install it. Its Lenis and ScrollTrigger advice does not apply inside `ion-content`.

### 7. mengto/thinking-orbs: mine the accessibility pattern; skip the package (9,673 B, MIT)
**What it contributes:** rules for loading and processing states.
- One announcement source: visible text inside `role="status"` with `aria-live="polite"`, and the decorative indicator set to `aria-hidden`.
- No rapid label churn.
- Remove the indicator on done, error or cancel, and render the real terminal state.
- An indeterminate indicator must never imply progress.

**Conflicts:** the npm package is a monochrome canvas orb for AI activity, in 20 or 64 px only, with no brand colors. The plan uses skeletons.

### 8. mengto/ambient-section-particles: mine the lifecycle rules (4,081 B, MIT)
**What it contributes:** rules for any continuous animation (ring fills, count-ups, an optional restrained celebration).
- Start only when visible (IntersectionObserver) and cancel on `document.hidden`.
- Run one rAF loop that survives remounts. Clamp large time deltas and cap DPR at 2.
- Tear everything down on unmount.
- Under reduced motion, show a static frame or nothing.
- Decorative layers get `aria-hidden` and `pointer-events: none`.

**Conflicts:** particle atmospheres contradict the calm canvas, and its pointer forces are a desktop idea. Demo not fetched.

## General principles worth keeping (distilled across the batch)

1. **One accent as a signal, never as decoration.** Every aesthetic skill repeats this. With editorial-service-booking it becomes: ink for decisive actions, one accent for progress, active and status. LevelUP's "progress accent plus amber for attention" fits if amber never appears outside attention states.
2. **Separate surfaces by tone and hairline, not by shadow, glow or blur.** Warm neutrals over stark white. glass-dark-ui, dark-glass-clean-layout and funky-purple-container-tech are useful only as pictures of what to remove.
3. **Motion values:** controls 160 to 220 ms, entrances 500 to 760 ms, word stagger 60 to 80 ms, one expo-out ease, transform and opacity only, play once. Reduced motion means the final state immediately, not just a shorter animation.
4. **One animation system per property** (build-awwwards-quality-sites): CSS for simple states, Motion for state-driven React, GSAP for timelines. Never let GSAP and Motion drive the same element property.
5. **Charts:** one chart grammar per view, truthful scales, labels as real text, values readable by screen readers, animate stroke offsets and counters.
6. **Reserve final layout pixels** for reveals and skeletons, so loading never shifts layout.
7. **Loading states:** one `role="status"` announcement, a decorative indicator hidden from assistive tech, and a real terminal state.
8. **Split text by word, never by letter or line,** and keep an unsplit accessible copy. Arabic joins letters, and wraps change with language and zoom.
9. **Pause offscreen and hidden-tab work, cap DPR, and tear down on unmount.** This matters in a mobile WebView.
10. **Show results only when real.** Never fabricate or round up an "improvement".
11. **When writing LevelUP's own design skill** (web-technique-to-skill): tie each rule to the failure it prevents, and carry numbers, not adjectives. This batch's aesthetic skills show the cost of the opposite.

## Red flags summary

- **mengto/workflow-ship-change (high; never install):**
  - Its description makes it trigger "at the end of every change".
  - It tells the agent that pushing to `main` and publishing live are "standing authorizations", so the agent should not ask first.
  - It amends WIP commits and appends "the attribution line the system gives you", which breaks the owner's global no-attribution rule.
  - It runs project shell scripts and deploys to Netlify and Supabase.
- **mengto/write-like-meng-on-x:** ghost-writes posts as a named real person; runs scripts; commits.
- **mengto/elevenlabs-tts:** reads an API key from the environment or `.env` and sends text to an outside paid API through a bundled script.
- **mengto/codex-gpt-image-2-5-flare:** a Codex-specific `// @exec` tool-call block plus a bundled Python script.
- **Package installs:** metal-fx (liquid-metal-border); shaders, which ships telemetry (shaders-cursor-ripples); thinking-orbs; gsap with lenis (cinematic-scroll-storytelling). mengto/vantajs loads three.js and Vanta from CDNs at runtime.
- **Commit, `git add -f`, Playwright and ffmpeg workflows:** daily-ui-inspiration-capture, html-to-interaction-prompts, stitched-full-page-capture, article-prompts-to-skills, video-to-superprompt, audit-reference-originality, and the six illustration skills.
- **Incomplete snapshot:** many skills point at `demo/`, `scripts/` or `references/` files that were not fetched (all illustration skills, build-threejs-scroll-worlds, performance-profiling, scroll-world-storytelling and others). Installing any of them from this snapshot would leave them broken.
