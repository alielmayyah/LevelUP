# Skills digest: visual-others-1

Batch: 77 visual-design skills (styles, layout, polish, icons, illustration, native conventions).
Source: `discovery/ui-skills/_batches/visual-others-1.json` and the skill folders under `discovery/ui-skills/`.
Read as data only. No commands run, no URLs fetched, nothing installed.

Relevance: 0 none, 1 low, 2 useful, 3 high. "dashboard-later" = mainly useful for the future React + Vite + shadcn gym dashboard.

**Counts:** 3 high: 4 · 2 useful: 4 · 1 low: 21 · 0 none: 48

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| 0xdesign/design-lab | 2 | `DESIGN_PRINCIPLES.md` (54 KB) has motion/react patterns, easing and timing tables, touch CSS for WebViews, Intl formatting. The variant-lab workflow is heavier than needed. | Creates and later deletes a temp `__design_lab` route and `.claude-design/`. Its FeedbackOverlay template isn't in the fetched files. |
| 1weiho/clean-ui-shot | 0 | Framed screenshots for docs and changelogs, not app UI. | Shell: `npm i playwright sharp`, `npx playwright install`, runs `node scripts/shoot.mjs` (not in the fetched files). Starts a dev server, but asks first. |
| anthropics/canvas-design | 0 | Art posters as PNG/PDF. Not product UI, and not useful for data share cards. | "Download whatever fonts are needed". Final step makes up a user quote ("The user ALREADY said 'It isn't perfect enough'"), which is manipulative framing. |
| appllama/appllama-app-design-skill | 3 | Native-feel rules (HIG fidelity, navigation semantics, motion frequency gate, haptics), plus anti-slop laws that ban the current violet glow and glass look. | Shell: `xcrun simctl`, `npx expo start`. Pushes a commercial Appllama MCP (study 20–30 screens) and the Higgsfield image MCP. |
| arla6ka/blur-reveal | 0 | WebGL headline dissolve on coloured panels. Showpiece, heavy for a WebView. | All 35 arla6ka skills: copy `assets/template/` (not in the fetched files) and run `node scripts/check.mjs` (not in the fetched files). Demo link only. |
| arla6ka/checker-conveyor | 0 | Canvas checkerboard transition. Decorative. | Same as blur-reveal. |
| arla6ka/code-trail | 0 | Cursor trail of code chips. Desktop pointer toy. | Same as blur-reveal. |
| arla6ka/design-tiles | 0 | Colour-blocked word bar that shuffles through a vivid palette. Opposite of a calm canvas. | Same as blur-reveal. |
| arla6ka/dot-cut | 0 | Halftone dot-grid knockout type. Decorative. | Same as blur-reveal. |
| arla6ka/dot-globe | 0 | Tiled 3D globes. Decorative. | Same as blur-reveal. |
| arla6ka/fade-motion | 0 | WebGL long-exposure type trail. Decorative glow. | Same as blur-reveal. |
| arla6ka/ghosty-reveal | 1 | Cheap CSS `mask-position` feathered reveal. Possible idea for a soft "new result" reveal. | Same as blur-reveal. |
| arla6ka/glass-type | 0 | WebGL lens distortion on serif type. | Same as blur-reveal. |
| arla6ka/hover-video | 0 | Hover-video 3D text button. Hover-only, desktop. | Same as blur-reveal. |
| arla6ka/image-galaxy | 0 | Parallax photo field. | Same as blur-reveal. |
| arla6ka/image-sphere | 0 | three.js photo sphere. | Same as blur-reveal. |
| arla6ka/kinetic-typography | 0 | Rippling serif letter. | Same as blur-reveal. |
| arla6ka/liquid-metal | 0 | Metallic WebGL type. | Same as blur-reveal. |
| arla6ka/liquid-ui | 0 | Gooey fused SVG cards. Novelty. | Same as blur-reveal. |
| arla6ka/misprint-type | 0 | Screen-print misregistration type. | Same as blur-reveal. |
| arla6ka/orbit | 0 | Multiplayer cursor swarm. | Same as blur-reveal. |
| arla6ka/phase-table | 0 | Lissajous curve grid. | Same as blur-reveal. |
| arla6ka/pixel-scan | 0 | Glitch text reveal. | Same as blur-reveal. |
| arla6ka/ransom-note | 0 | Cut-paper letters. | Same as blur-reveal. |
| arla6ka/ripple-grid | 0 | Metaball shader background. | Same as blur-reveal. |
| arla6ka/roll-type | 0 | Drum-roll phrase loop. | Same as blur-reveal. |
| arla6ka/rush-type | 0 | Hyperspace smear type. | Same as blur-reveal. |
| arla6ka/sandbox | 0 | Glyph halftone video shader. | Same as blur-reveal. |
| arla6ka/shutter-type | 0 | Rolling-shutter glitch type. | Same as blur-reveal. |
| arla6ka/slide-stack | 0 | Sliding block loop. | Same as blur-reveal. |
| arla6ka/spike-type | 0 | Spiky outlined wordmark. | Same as blur-reveal. |
| arla6ka/squircle | 1 | Superellipse (continuous) corners as an SVG clip-path. The idea fits an iOS feel, but the glossy 18-layer button doesn't. | Same as blur-reveal. |
| arla6ka/stamp-type | 0 | Kinetic poster. | Same as blur-reveal. |
| arla6ka/swing-type | 0 | Pendulum letters. | Same as blur-reveal. |
| arla6ka/text-reveal | 1 | Quiet blur-to-focus reveal (WebGL). Its shared `references/perf.md` is worth mining (see below). | Same as blur-reveal. |
| arla6ka/vector-editor | 0 | Design-tool selection box. | Same as blur-reveal. |
| arla6ka/verb-type | 0 | Verbs acting out their meaning. | Same as blur-reveal. |
| arla6ka/voice-wave | 0 | Voice visualiser ribbon. | Same as blur-reveal. Mic access only after an explicit click. |
| arla6ka/warp-type | 0 | Hard-cut kinetic sentences. | Same as blur-reveal. |
| bencium/design-audit | 1 | Generic audit table and "reduction filter". Expects DESIGN_SYSTEM/APP_FLOW/PRD files and references that aren't in the fetched files. | None. |
| bencium/relationship-design | 0 | Agentic AI "relationship UX". Off-brief. | None ("announce at start" boilerplate). |
| chunkithwang/design-playful-app-icons | 1 | Playful mascot app icons. Its iOS and Android adaptive-icon handoff rules could help an icon refresh. `style-profile.yaml` isn't in the fetched files. | None. |
| coldteadotai/agent-skill | 0 | PR architecture diagrams. | **Loads its real instructions at runtime** from `npx @coldtea/pr-lens-cli@latest skill` (unpinned remote code). Pushes diagrams to prlens.dev. Manual uses a GitLab token. |
| coldteadotai/eli5 | 0 | Codebase ELI5 canvas. | Same remote-instruction loading via `npx …@latest`. Runs `git remote get-url origin`. |
| dammyjay93/interface-design | 3 (+dashboard-later) | Product-UI craft: one focal point per view, numbers that carry meaning, one accent, subtle layering, state coverage, motion essentials. Written for dashboards and shadcn. | None. Offers to write `.interface-design/system.md`. |
| danny/explore-design | 2 | Several distinct visual directions side by side in one HTML file. Real data plus a Real/Sometimes/Aspirational field manifest. | First step runs `bash <skill>/scripts/scan-brand.sh` (not in the fetched files) "always, no exceptions". Opens a browser. Plugs the Landingfolio MCP. Not on GitHub. |
| edenspiekermann/fix-design-system-finding | 0 | Figma design-system fixes through the Figma MCP. | Figma MCP write calls. |
| elayadesign/figma-designer | 1 | Figma-only. The two-layer colour tokens (core to semantic, light/dark modes) and dark surface list are worth mining. | Figma MCP write calls. |
| elayadesign/landing-page-design | 0 | Landing pages and conversion copy. | Over-broad trigger ("all web UI work… this file wins over framework defaults"). |
| enesozturk/dimensional-drawing | 1 | Monochrome component spec sheets. Possible handoff documentation later. | None. |
| ericzakariasson/scandinavian-design | 3 | Calm neutral system: alpha-ink ladders for light and dark with contrast maths, one accent, semantic colour kept for state, no glows or gradients. | Mentions `node scripts/*.js` with playwright-core (not in the fetched files). `websites.md` harness launches Chrome with CSP bypass. Only invoked by the user (`disable-model-invocation`). |
| figma/figma-code-connect | 0 (dashboard-later at most) | Maps Figma components to code. Needs a Figma Org/Enterprise plan. | Needs the Figma MCP. |
| figma/figma-shaders | 0 | Figma shader authoring. | Needs the Figma MCP. |
| humanlayer/show-me | 0 | Conversation diagrams. | None. |
| jakubkrehel/variant | 2 | Three real variants of one UI piece behind a URL-param picker in the real page, with an accessibility floor and a tradeoff table. Then promote one and delete the rest. | None. User-invoked. |
| kelvinkn17/fun-isometric | 1 | Animated isometric stickers for empty states. The playful Riso look clashes with a calm canvas. | Bun and ffmpeg. Playwright Chromium installs itself into `~/.cache` on first use. `bun install && bun run dev`. |
| millionco/budge | 0 | Next.js App Router only. | **Injects a remote, unpinned third-party script** (`budge.design/budge.iife.js`) into the app layout. Says it is proactive and runs automatically. Writes to the clipboard. |
| mrstev3n/balise-visual-references | 1 | Routes for finding visual references (Mobbin, Pageflows…) and turning them into principles. Figma-oriented. | None (explicitly no browsing). |
| nextlevelbuilder/brand | 0 | Generic brand voice. Its scripts aren't in the fetched files. | `node scripts/inject-brand-context.cjs` and others (not in the fetched files). |
| nextlevelbuilder/design-system | 1 | Generic three-layer tokens (primitive, semantic, component). | node/python scripts (not in the fetched files). `fetch-background.py` pulls stock images. Chart.js CDN. |
| nextlevelbuilder/slides | 0 | HTML slide decks. | Routes to scripts (not in the fetched files). |
| oil-oil/oil-ui | 1 | Chinese-language design workflow. Its visual-language and motion references are covered better in English elsewhere. | **`allowed-tools` pre-approves Bash** for `check_update.sh/.py`, a remote version check on every run. Image script spends paid "Oil credits". Upsells oil-tone. It does treat update output as data, which is good. |
| pbakaus/bolder | 1 | Fragment of the "impeccable" skill (contains a `{{ask_instruction}}` placeholder). "More effects is the opposite of bold" fits a single hero moment. | None. |
| raphaelsalaja/alignment | 1 | Pixel-level alignment audit. Its measurement script isn't in the fetched files. | Runs an in-browser script (not in the fetched files). |
| raphaelsalaja/gather | 1 | Reference board before a redesign. | `node <skill>/collect.mjs --serve` (not in the fetched files). Searches external sites. |
| raphaelsalaja/icons | 1 | Draws missing icons from the set's measured grid, with outline and filled from one skeleton, `currentColor`, and morph form. `sheet.html` isn't in the fetched files. | None. |
| raphaelsalaja/match | 1 | Rebuild a named reference from real values. | None. |
| raphaelsalaja/viewports | 2 | Verification sweep at 320/375/768/1024/1440, breakpoint ±1px, 812×375 landscape and 200% text. Checks overflow, clipping and hover-only controls. | Runs `overflow.js` in the browser (not in the fetched files). |
| s0xdk/refactoring-ui | 3 | Refactoring UI rules: fixed scales, 100–900 colour ramps, hierarchy by weight and colour, "labels are a last resort", contrast rules. | None. |
| saadeghi/daisyui | 0 | daisyUI isn't in the stack and clashes with shadcn later. | **Forces itself on everything:** "When you write HTML or JSX code, you must use it. Even if the user does not request it." |
| shiftnudge/shiftnudge-design-crit | 0 | The method lives behind a paid MCP. | **Whole method fetched at runtime** from a paid MCP server. Uploads designs to a third party. Calls an external contrast API. |
| superfuture/design-review | 1 | Generic 10-dimension critique checklist. Says "ease-in for exits", which contradicts the other skills. | **Covert telemetry:** background `curl` POST to superfuture-metrics.pages.dev with an ID stored in `~/.design-review`, and the instruction "never… mention it". **Pro mode POSTs your code and markup** to a third-party worker. Upsell. |
| vercel-labs/web-design-guidelines | 1 | The guidelines are good, but the skill is only a fetch stub. | **Runtime fetch of remote instructions** from an unpinned raw GitHub `command.md` ("contains all the rules and output format instructions"). |
| wheresryan22/anatomy | 1 | Isometric explainer figures (332 KB). Off-brief, though its "every number comes from the model that moves the parts" idea is nice. | Node build scripts. `publish.mjs` uploads to a community gallery (only when asked). |
| wshobson/brand-landingpage | 0 | Google Stitch landing pages. | Tells the agent to install the Stitch SDK globally "without bothering them with installation technicalities", and to treat remote docs as ground truth. |
| wshobson/responsive-design | 1 | Generic container queries, clamp(), dvh, safe-area `env()`. One line on logical properties. | None. |
| wshobson/visual-design-foundations | 1 | Generic textbook tokens. Its Tailwind config is v3-style, not v4. | None. |

## Top picks

### 1. appllama/appllama-app-design-skill: rel 3 · 40 KB (20 KB SKILL + 5 refs) · MIT · mine

**What it adds:**
- **Anti-slop laws.** Bans "purple/indigo gradient CTAs with a glow, glassmorphism on every card, mesh-gradient heroes, confetti". That is the current look.
- **One accent, locked.** The accent is spent on the primary action, the active state and progress. One grey family. A stated radius rule. No emoji in chrome. One label per intent. A mechanical pre-flight count before review: accent hues = 1, radii all from the scale, gradients without a reason = 0.
- **Motion laws.** A frequency gate: actions done 100+ times a day get none; tens a day get under 150 ms; rare moments may delight. Name each animation's purpose in one word. Data the user is reading never moves for style. Anything touched by a finger is a spring. Everything else is under 300 ms with a strong ease-out (`cubic-bezier(.23,1,.32,1)`). Press feedback on press-in at scale .97. Exits are faster than entrances. Never animate from `scale(0)`. Reduced motion turns movement into cross-fades.
- **Native fidelity.** Both themes on day one. Tabular numerals. One display size per screen. Continuous corners. One elevation system. A 4/8 base. Safe areas and the home indicator are part of the design. Haptics as punctuation (same frame as the visual, one per action, never on scroll); maps to Capacitor Haptics. Product-style number formatting.
- **Navigation.** Push vs replace. Modal vs sheet vs action sheet. Onboarding and login are one-way doors, so Android back never shows Login again. Tabs never slide and each keeps its own stack.
- **Perceived performance.** Skeletons shaped like the final layout. No full-screen spinner for a partial update. Prefetch on press-in.
- **Checklists.** A per-screen definition of done, and a device matrix that includes a small SE-class phone.

**Conflicts:**
- Expo/React Native APIs (Reanimated, FlashList, expo-image, Expo Router, zeego, SF Symbols) need translating to Ionic: router push/replace, IonModal with breakpoints, IonActionSheet, Ionic toggles and segments, an SVG icon set, GSAP/motion.
- The simulator loop uses `xcrun` (macOS). Use the Android emulator or browser device mode instead.
- Its research step depends on the commercial Appllama MCP.
- No RTL guidance: back chevrons and the edge-swipe direction need mirroring.

**Verdict:** mine about 30 rules into the design rules doc. Installed whole, its RN code would mislead the agent.

### 2. ericzakariasson/scandinavian-design: rel 3 · 66 KB (52 KB SKILL + 14 KB websites.md) · license: none · mine

**What it adds:** a ready calm-canvas colour system.
- **Light ladder.** Ink at 100%, 64% for secondary and 44% for tertiary (lift to about 56% when real content sits there). Border 10%, strong border 18%, hover 5%, pressed 9%, scrim 44%.
- **Dark translation with measured contrast.** `#0A0A0A` canvas. Secondary 56% white. Tertiary 46–50%, and 50% when the canvas is above `#1A1A1A`. Hover 9%, pressed 14%. Focus ring at least 2 px.
- **Neutrals.** No tinted neutrals, judged by channel spread. A neutral derived consistently from the brand is allowed.
- **Accent and state.** One accent, used sparingly. Semantic state colours must survive restyling, which fits amber for attention. A "signature datum colour" may follow the primary number everywhere, so the progress accent can live on the result.
- **Charts.** Neutral by default, but a colour that acts as the legend stays.
- **Escalation triggers.** Glows, decorative gradients, large shadows, uniform card grids, uppercase labels.
- **Layout and order.** Heading gap above vs below at about 3:1. Use space instead of rules. A remediation order (hierarchy first, motion last). A review output format.

**Conflicts:**
- "Left-align by default" has to become `text-align: start` for RTL.
- The default font, Inter, has no Arabic glyphs; pick an Arabic-capable sans.
- Pure black and white may feel stark for a health app; a brand-derived warm neutral is allowed.
- Its verification scripts aren't in the fetched files.
- Too long to be an always-on skill, and user-invoked only.
- No license, so reuse the ideas, don't copy the text.

**Verdict:** mine the Color & Opacity section and the escalation triggers into the token spec.

### 3. dammyjay93/interface-design: rel 3 (+dashboard-later) · 30 KB single file · MIT · install whole

**What it adds:**
- **One focal point per view.** This is "one answer per screen".
- **Numbers must carry meaning.** "A progress ring and a stacked label both show '3 of 10' — one tells a story." Worked metric: a large tabular hero number with a small delta in one accent.
- **Hierarchy.** Weight and colour do more than size, with three tiers at one size.
- **Restraint.** 60/30/10 colour split, one accent.
- **Subtle layering.** Dark elevation at +7/+9/+12% lightness. rgba borders at .06–.12. Inputs darker than their surroundings.
- **Depth.** Choose one depth strategy.
- **Polish.** Concentric radius (outer = inner + padding). Tabular numbers. `text-wrap: balance/pretty`. 44 px hit areas. States always designed. Motion timings.
- **Process.** A mandatory per-component checkpoint (intent, hierarchy, palette, depth, surfaces, type, spacing). A "colour world" from the product's domain. Swap, squint, signature and token tests.
- **Dashboard-later.** Directly fits the shadcn dashboard.

**Conflicts:**
- Its uppercase tracked label example and "avoid system/Inter fonts" clash with Scandinavian and with Arabic, which has no letter case.
- Its ratio-based type scale clashes with Refactoring UI's hand-picked scale. Pick one.
- Headless/Radix guidance applies to the dashboard. In the app, use Ionic components.
- No RTL or mobile-native specifics.

### 4. s0xdk/refactoring-ui: rel 3 · 14 KB (tokens.css and 3 refs live in the repo, not in the fetched files) · MIT text (GitHub reports NOASSERTION) · install whole once the refs are fetched, else mine

**What it adds:**
- **Scales.** Spacing from 4 to 768 with steps at least 25% apart. Type from 12 to 72. Two weights. A fixed opacity scale.
- **Colour.** Ramps from 100 to 900, built outward from 500. 8–10 greys. Success, warning and danger accents. Never generate shades at runtime.
- **Text and hierarchy.** At most three text colours, all at least 4.5:1. **"Labels are a last resort, fold the label into the value"**, which supports "words before numbers". One primary action. Destructive actions are tertiary until the confirm dialog.
- **Hard rules.** No grey text on coloured backgrounds. Never colour as the only signal. Chart series told apart by lightness. Large elements shrink faster than small ones across breakpoints. More space around a group than within it. 3:1 contrast for non-text control edges.
- **Process.** Work in grayscale first, at about 400 px first.

**Conflicts:**
- It writes colours in HSL; Tailwind v4 uses OKLCH.
- "Very dark grey, not black" vs Scandinavian's `#000` ink.
- Five shadow elevations vs Scandinavian's "avoid shadows". Pick one depth strategy.

### 5. jakubkrehel/variant: rel 2 · 13.5 KB (SKILL + picker.md) · MIT · install whole

**What it adds:**
- Three variants of one piece, such as the "did I improve?" hero card, placed on one named axis (structure, density, emphasis, type or voice).
- A grouped picker in the real page, driven by the `?__variant=` param, with arrow keys and `H` to hide it.
- Real content and the real item count.
- A non-negotiable floor: 320 px and 200% zoom, contrast, no meaning carried by colour or motion alone, reduced motion, focus.
- A tradeoff table with no favourite marked. Then promote one and delete the harness.

**Conflicts:**
- Picker CSS uses a physical `right:`.
- Run it in the browser dev server; the Capacitor shell has no URL bar.
- Sibling skills it names aren't included, but the floor is written out inline.

### 6. raphaelsalaja/viewports: rel 2 · 4.5 KB · MIT · mine (or install with `overflow.js` from the repo)

**What it adds:**
- Exact render sizes: 320×568, 375×812, 768, 1024, 1440, plus ±1 px around each breakpoint.
- Touch emulation below 1024.
- A short 812×375 landscape pass in which sheet and dialog actions must stay reachable.
- A pass with the root font at 200%.
- Findings: no sideways scroll, no clipped text, no hover-only controls.
- Severity levels, and a report that names the width of each finding.

**Conflicts:**
- Needs browser automation and its own `overflow.js`.
- No RTL, dark-theme or safe-area pass (those belong to a sibling skill that isn't included). Add `dir="rtl"` and dark passes.

### 7. 0xdesign/design-lab: rel 2 · 85 KB (30 KB SKILL + 54 KB DESIGN_PRINCIPLES.md) · license: none · mine the principles file only

**What it adds (from the principles file):**
- **motion/react patterns.** AnimatePresence icon cross-fade, `layoutId` shared transitions, `useMotionValue` vs `useState`, `useSpring` jump vs set, 30–50 ms stagger, exits 20–30% faster.
- **Motion tokens.** Easing tokens and a timing table.
- **Loading thresholds.** Show nothing under 100 ms, a subtle change up to 300 ms, a spinner up to 1 s, a skeleton beyond.
- **WebView touch CSS.** `touch-action: manipulation`, `overscroll-behavior: contain`, hover gated to fine pointers, pseudo-element hit areas, logical `scroll-padding-inline`.
- **Formatting.** Intl for dates and numbers.

**Conflicts:**
- Its workflow says "extract the visual language from the project", which would re-import the disliked violet look.
- "Never reuse spring values" contradicts Appllama's "one spring vocabulary".
- Next.js-first.
- The FeedbackOverlay template isn't in the fetched files.
- No license.

### 8. danny/explore-design: rel 2 · 9 KB (scan script and 2 refs not in the fetched files) · license unknown (danny.md, not GitHub) · mine

**What it adds:**
- One self-contained HTML file with 3–6 genuinely different directions side by side. Each has a one-line thesis and a stated tradeoff.
- Going off-brand is allowed when a rebrand is requested, which is LevelUP's case.
- **Ground variants in real data, with a manifest.** Each data-bound element is marked Real, Sometimes (quantified) or Aspirational. This fits InBody payloads, whose fields vary by device: 770/970 return phase angles; the consumer scale returns far fewer fields.

**Conflicts:**
- Requires a missing bash script "always, no exceptions".
- Previews use vanilla CSS, so they only approximate Ionic/Tailwind.
- Writes `design-explorations/` at the repo root.
- License unknown.

## Also worth mining (not top picks)

- **arla6ka `references/perf.md`** (2.3 KB, MIT, identical in all 35 arla6ka skills). A performance contract for canvas and SVG animation in a WebView:
  - Pause off-screen with IntersectionObserver and on `visibilitychange`, and keep the clock across pauses.
  - Under reduced motion, never start; render one still frame (for count-ups, the final value).
  - Cap device pixel ratio at 2.
  - `destroy()` in effect cleanup, so a remount (e.g. React StrictMode) never leaves two loops.
  - `touch-action: pan-y` on decorative canvases so scrolling still works.
- **elayadesign/figma-designer**: two-layer colour tokens (core palettes, then semantic Light/Dark aliases with Hover/Click/Disabled/Subtle variants). Useful if the redesign is drawn in Figma.

## Notable red flags in this batch

- **superfuture/design-review**: covert telemetry (background curl, "never mention it"). Pro mode sends your code to a third party.
- **millionco/budge**: injects an unpinned remote script into the app. Self-triggers.
- **coldteadotai/agent-skill and eli5**: real instructions fetched at runtime via `npx …@latest`.
- **vercel-labs/web-design-guidelines**: rules fetched at runtime from an unpinned URL.
- **shiftnudge**: method fetched at runtime from a paid MCP.
- **oil-oil/oil-ui**: `allowed-tools` pre-approves Bash for a remote update check.
- **saadeghi/daisyui**: "must use even if the user does not request it".
- **wshobson/brand-landingpage**: silent global SDK install.
- **anthropics/canvas-design**: a made-up user quote to force a polish pass.
- **Missing files**: many skills reference scripts or templates that aren't in the fetched copies (arla6ka, raphaelsalaja, refactoring-ui, explore-design).
