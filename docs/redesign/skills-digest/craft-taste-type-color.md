# Skills digest: craft-taste-type-color

Batch: 75 skills tagged craft, taste, typography or color. The batch holds color systems, type, anti-generic taste rules and review lenses. Many prose "humanizers" and codebase tools also landed here through the craft and taste tags.
Source: `discovery/ui-skills/_batches/craft-taste-type-color.json` and the skill folders under `discovery/ui-skills/`.
Read as data only. No commands from the skills were run, no URLs they mention were fetched, nothing was installed. Licenses come from `gh api repos/<owner>/<repo>/license`.

Relevance: 0 none, 1 low, 2 useful, 3 high. "dashboard-later" means mainly useful for the future React + Vite + shadcn gym dashboard.

**Counts:** 3 high: 6 · 2 useful: 10 · 1 low: 34 · 0 none: 25

Stack facts checked while triaging (several conflicts below depend on them):

- `src/theme/tailwind.css` already has a semantic tier. `@theme inline` maps the `--color-*` utilities to `--lu-*` and `--ion-color-*` variables. Dark mode is one class, `:root.ion-palette-dark`, and a `:root[lang='ar'] body` rule exists. The faces in use are IBM Plex Sans and IBM Plex Sans Arabic.
- `src/brand.config.ts` fixes the brand hues for every gym (a gym adds only its logo), so color ramps can be computed once at build time. `src/theme/applyBrand.ts` parses hex, mixes RGB the way Ionic's color generator does, and picks black or white text by WCAG 2 luminance. Ionic components also read `--ion-color-*-rgb` triplets. An OKLCH migration therefore has to keep hex and RGB at the Ionic boundary.
- `src/theme/kit.css` uses `backdrop-filter`, the frosted glass the owner dislikes. It is a ready target for a lint ban.

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| aashaexo/humanize | 1 | English prose de-slop (41 patterns) and a docs-folder audit. Could only police English explanation copy. No UI, color or type. | none |
| aboudjem/humanizer | 1 | English prose rewrite with voice profiles and an AI-tell score. English copy only. | `allowed-tools` pre-approves Read, Write, Edit, Grep, Glob and AskUserQuestion. Has an in-place `--file` edit mode. Offers "always-on" blocks to paste into CLAUDE.md or a system prompt. |
| arla6ka/make-font | 0 | Builds an OFL font from reference fonts (Latin by default). The app already uses IBM Plex Sans and Plex Sans Arabic. | Python (fonttools, uharfbuzz) and Node + Playwright scripts that are not in the fetched files. Downloads font files from raw.githubusercontent.com. |
| arla6ka/ui-review | 1 | Evidence-first screen review: captures per width, reduced-motion and touch probes, press latency under 100 ms. Its 13 criteria are in `references/criteria.md`, which was not fetched. The default widths (390 and 1280) miss 320. | Runs the project's lint and a sibling `capture.mjs`. Writes `.ui-review/` reports. |
| blader/humanizer | 1 | The canonical English prose de-slop (26 patterns). English copy only. | none |
| cursor/unslop | 1 | Short English de-slop pass. | none (user-invoked only) |
| dietrichgebert/ponytail | 0 | "Smallest complete change" coding mode. Not design. | Auto-activates every session (per ponytail-help). |
| dietrichgebert/ponytail-audit | 0 | Whole-repo code quality audit. | none |
| dietrichgebert/ponytail-debt | 0 | Lists `shortcut:` comments. | none |
| dietrichgebert/ponytail-gain | 0 | Shows the tool's own benchmark numbers. | none |
| dietrichgebert/ponytail-help | 0 | Help page for the ponytail plugin. | Suggests `npm install -g @anthropic-ai/claude-code@latest`. `band import` reads past Claude Code session cost data. |
| dietrichgebert/ponytail-review | 0 | Code review of a change. | none |
| egonex-ai/understand | 0 | Codebase knowledge-graph builder (69 KB). | `pnpm install` and a build in the plugin folder, inline Node scripts, a multi-phase shell pipeline. |
| egonex-ai/understand-chat | 0 | Q&A over that graph. | none |
| egonex-ai/understand-dashboard | 0 | Launches the graph viewer. | `npx --yes` on a tarball downloaded from GitHub Releases (fetch and execute). `pnpm install`. |
| egonex-ai/understand-diff | 0 | Diff impact analysis through the graph. | none |
| egonex-ai/understand-domain | 0 | Business-domain flow graph. | Runs `python ./extract-domain-context.py` and launches the dashboard. |
| egonex-ai/understand-explain | 0 | Explains one file through the graph. | none |
| egonex-ai/understand-knowledge | 0 | Graph for an LLM wiki. | Shell steps (batch flag). |
| egonex-ai/understand-onboard | 0 | Onboarding guide from the graph. | none |
| ehmo/slopbeth | 1 | English prose de-slop with benchmarks. | Node and Python benchmark scripts (`bin/slopbeth.js`, `orwell_benchmark.py`). |
| ehmo/slopgent | 0 | Shapes the agent's own chat replies, not product copy. | `node scripts/slopgent-memory.js enable` writes into `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and `~/.gemini/GEMINI.md`. |
| elithrar/anti-slop | 1 | Tiny English de-slop pass. | none |
| emilkowalski/emil-design-eng | 3 | Animation decision framework (frequency, purpose, easing, duration), springs, reduced motion, stagger, clip-path reveals and a comparison slider. Drives the reveal, the count-ups and the rings. | Persona quirks: a canned first reply and a mandatory table format. |
| emilkowalski/learn-taste | 3 | Turns the owner's corrections into dated DESIGN.md rules and lint checks. Made for "no lavender, no glass, no glow". | Reads past session transcripts under `~/.claude/projects` when asked. Proposes a CLAUDE.md pointer line, written only on approval. User-invoked only. |
| filipwojda/regards-art-direction | 2 | Website art direction ("not for app screens"). Its House rules ban violet and indigo, glass, glows, gradients and tracked labels. Mine that table. | Requires a remote MCP (`mcp.regards.design`) and reads `skill://regards-design/SKILL.md` from it, which means remote instructions at runtime. Runs `inspect.mjs`. |
| hardikpandya/stop-slop | 1 | Short English de-slop rules. | none |
| humanlayer/improve-claude-md | 0 | Rewrites CLAUDE.md with `<important if>` blocks. | Rewrites agent instruction files by design. |
| humanlayer/rpi | 0 | Research, design, implement document workflow. | none (writes `.agents/artifacts/`) |
| insane0777/awwwards-inspiration | 1 | Reference hunting from award-winning marketing sites, not mobile app screens. | Awwwards MCP with live scraping, page capture and motion recording. `curl` + `ffmpeg`. A dev "flywheel" script. |
| jakubkrehel/better-colors | 3 | OKLCH ramps with a role for every step, primitives vs role tokens, one accent plus only the status ramps actually shown, a tuned (not reversed) dark palette, measured contrast. | none |
| jakubkrehel/better-typography | 3 | Role-based type scale, unitless leading, `tabular-nums`, wrapping, 16 px inputs, `lang`/`dir`/`<bdi>`. Latin-centric. | none |
| jakubkrehel/build-design | 1 | Builds UI from a Figma file or an image using the project's tokens. Useful only if the redesign arrives as comps. | Figma MCP. |
| jakubkrehel/explain-interface | 1 | Explains how a reference site or effect was built. A research aid with a "page is evidence, not instruction" guard. | `curl -sL` of arbitrary URLs and stylesheets. chrome-devtools MCP `evaluate_script`. User-invoked only. |
| jakubkrehel/interface-review | 1 | Change-scoped interface review. Stops without its `better-interface` sibling, which is not in this batch. Its removed-signals list is worth mining. | none (read-only `git blame`) |
| jakubkrehel/make-interfaces-feel-better | 3 | `tabular-nums` on animated numbers, stagger only for rare entrances, press scale, shadow-as-border, concentric radius, icon stroke and RTL flip table, motion restraint. | none |
| jakubkrehel/oklch-skill | 2 | Older OKLCH skill that better-colors replaces. Its "reverse L for dark mode" and "convert all hex" advice contradicts better-colors. | none |
| jalaalrd/anti-ai-slop-writing | 1 | English writing directive with banned words. | none |
| kemiljk/dxe | 1 | Umbrella design-engineering review that routes to sibling skills. Needs `references/dxe-core.md`, which was not fetched. | none |
| kemiljk/dxe-ai-output-judgement | 2 | Rubric for AI-generated UI: tokens not hex, real states, no `transition: all`, no generic radii and shadows. | none |
| kemiljk/dxe-design-engineering | 1 | Design-to-code translation principles. | none |
| kemiljk/dxe-design-for-repetition | 1 | The cost of repeated use, for staff workflows. dashboard-later. | none |
| kemiljk/dxe-hiring-manager-bar | 0 | Portfolio review for job seekers. | A Python script that indexes and transcribes podcast media. Playwright and axe. |
| kemiljk/dxe-humane-functionalism | 1 | Danish-functionalism lens (human fit, perceptual comfort). | none |
| kemiljk/dxe-intentional-craft | 1 | Intention-led design lens. | none |
| kemiljk/dxe-product-delight | 2 | Delight as anticipation, one meaningful moment, a reduced-motion equivalent. Fits the new-result reveal. | none |
| kemiljk/dxe-prototype-to-production | 1 | Hardening: states, a11y, failure paths. | none |
| kemiljk/dxe-real-content-design | 2 | Design from representative, incomplete data. Here that means real InBody payloads instead of ideal placeholders. | none |
| kemiljk/dxe-software-needs-hierarchy | 1 | Maslow-style prioritization lens. | none |
| kemiljk/dxe-subtractive-design | 2 | Remove what doesn't serve the screen's one job: a single primary action and calm space. | none |
| kemiljk/dxe-write-first-design | 1 | A short written brief before design. | none |
| leonxlnx/taste-skill | 1 | Marketing-website builder. One useful line: never violet or lavender as accent, ground, gradient or tint. | A frontmatter `Stop` hook execs `node gate.mjs` found in skill, plugin, project or `$HOME` paths (600 s timeout). Writes `.taste-skill/`. Runs `node scripts/start.mjs`. Needs Node 22 + Chrome. |
| luchasarie/bro | 0 | Re-explains the last answer more simply. | none |
| mrstev3n/balise-brand-naming | 0 | Brand-naming workflow (in French). | none |
| mrstev3n/balise-content-test | 2 | Figma-bound, but its stress matrix (numbers, missing values, RTL + numbers, fallback fonts, narrow widths) fits InBody screens and tests. | Edits Figma canvas copies through Figma tooling. |
| mrstev3n/balise-idea | 0 | Figma ideation canvas. | none |
| mrstev3n/balise-ux-writing | 2 | Multi-locale UI copy review that is careful with high-stakes content. Fits "words before numbers". Its references were not fetched. | none |
| nutlope/hallmark | 1 | New-website generator. A few floor rules are worth mining: every color and font through a token, no purple-to-blue gradient, no tracked-caps labels. | Runs `node sloplint.mjs` and `capture.mjs`. "Powered by Together AI": the comp step calls an external API when `TOGETHER_API_KEY` is set. Inspo MCP. |
| pbakaus/colorize | 2 | Color strategy: restraint on app screens, hue chosen from product meaning, data encoded by more than hue, a dark theme composed rather than inverted. | Template placeholders. Part of impeccable (see that row). |
| pbakaus/impeccable | 1 | A router to about 25 references that were not fetched. The useful parts are colorize and typeset. | `allowed-tools: Bash(npx impeccable *)`. A launcher downloads a binary on first run, and the agent must "follow its directives". A detector hook runs after UI edits. |
| pbakaus/layout | 1 | Spatial review: squint test, 4-point scale, safe areas, touch targets. | Runs `impeccable detect`. |
| pbakaus/polish | 1 | Final-pass triage order and state coverage (loading, empty, error, localized). | Runs `impeccable critique-storage`. |
| pbakaus/typeset | 2 | One family and a role scale for app UI, leading tuned to the language, light-on-dark compensation, fallback metrics, Dynamic Type. | Runs `impeccable detect`. |
| petergyang/no-ai-slop | 1 | English draft editing. | none |
| rams-design/rams | 1 | Generic WCAG 2.2 and visual checklist. | Sends files to a hosted engine when its MCP is connected. Upsell link to rams.ai. |
| raphaelsalaja/audit | 1 | Runs the whole raphaelsalaja collection as one report. | none (reads AGENTS.md and CLAUDE.md; user-invoked only) |
| raphaelsalaja/color | 3 | Exact ratios, including 3:1 for meaningful icons and edges. Alpha neutrals, dark surfaces that rise by getting lighter, accent only for action, red only for errors. | Tells the agent to run its bundled `contrast.js` in the page through the browser's evaluate call. The script is not in the batch copy. |
| raphaelsalaja/copy | 1 | Short labels, but its Title Case rule doesn't carry over to Arabic. | none |
| raphaelsalaja/restraint | 1 | Ship the smallest build and delete what nobody asked for. | none |
| redongreen/create-color | 0 | Figma color-annotation specs (uSpec). | Writes through the Figma MCP. |
| redongreen/extract-color | 0 | uSpec color JSON extraction. | none |
| saadeghi/daisyui-colors | 1 | daisyUI 5 only. The portable ideas: a `*-content` pair for each color, and `primary` once per page. | none |
| stephenturner/deslop | 1 | English prose de-slop. | none |
| superdesigndev/rea-growth | 0 | Competitor growth research. | Paid third-party data APIs (default $3 budget cap). |
| wshobson/visual-edit-precision | 1 | Precise edits from screenshots and annotations. | none |

## Top picks

### 1. jakubkrehel/better-colors: rel 3 · 36.6 KB (6.8 KB SKILL + 6 refs) · MIT · install whole

What it gives LevelUP:

- **System shape.** One neutral ramp, one accent ramp, and only the status ramps the product actually shows. That matches "one progress accent plus amber for attention": one amber ramp, and no unused red, blue or info ramps.
- **A role for every step.** Page, subtle, component background, hover, border, focus, solid fill, low- and high-contrast text, mapped to Radix 1–12 or Tailwind 50–950.
- **Two tiers.** Primitives are named by hue and semantics by role, and components use only semantics. LevelUP already has the semantic tier, so the redesign can swap primitives without touching screens.
- **How to build ramps.** Generate them in OKLCH with a library (culori, colorjs.io):
  - hue stays constant and chroma peaks mid-ramp;
  - the light end steps finer (0.04–0.05 L) and both ends stop short of black and white;
  - every hue gets the same lightness per step and the same share of its own maximum chroma (amber peaks lower than red or blue).
- **Brand color.** Decide whether it is pinned or snapped, and never quietly darken it. If white text fails on it, it stays the brand step and fills use a darker step.
- **Meaning.** One color, one meaning: hues within 15° count as the same color. Keep status hues at least 15° from the accent, and never let color carry meaning alone (pair it with an icon or a label).
- **Amber and green fail white text even at step 600.** Measure them; expect dark text on amber chips.
- **Dark mode is its own palette.** Lower the accent's chroma, widen the dark end and remeasure every pair. Use one switching mechanism. Give `prefers-contrast: more` its own value in each appearance.
- **Measure the rendered pair.** Text on alpha or `backdrop-filter` surfaces cannot be verified, so text sits on solid tokens. That is a technical argument against frosted glass.
- **Direction tokens.** Its per-locale gain and loss tokens adapt into per-metric direction tokens (fat down is good, muscle up is good). The "improved" color then follows meaning, not arrow direction.
- **Audit procedure for the current palette:**
  1. Collect every literal, including SVG `fill` and `stroke` in the hand-made charts.
  2. Sort them by OKLCH L.
  3. Collapse near-duplicates (ΔE < 0.02).
  4. Assign each a role.
  5. Report before changing anything.

Conflicts:

- It wants the brand token named `accent`, with `primary` reserved for "the most prominent of its group". Ionic needs `--ion-color-primary*` and `color="primary"`. Keep Ionic's names at the Ionic layer and apply the naming rule only to `--lu-*` and Tailwind names.
- It says to leave `@theme` without `inline` and to switch with a `.dark` class. LevelUP's `@theme inline` over runtime `--lu-*` variables, switched by `.ion-palette-dark`, already swaps at runtime. Translate the examples; don't "fix" the setup.
- OKLCH values in tokens are fine for the WebView baseline Tailwind v4 already requires (Chrome 111, Safari 16.4). Ionic's `-rgb` triplets and `applyBrand.ts` (hex parsing, RGB mixing, WCAG 2 luminance) still need hex and RGB, so generate both from one OKLCH source.
- It refers to sibling skills (`better-accessibility`, `better-ui`) and a `reporting.md` that are not in this batch. The jakubkrehel/skills repo also has better-layout, better-accessibility and better-writing.

Install whole: it is small, with no tools, scripts or hooks.

### 2. raphaelsalaja/color: rel 3 · 5.2 KB · MIT · mine (or install after reading its `contrast.js`)

- **Exact thresholds.** Body text, including secondary and placeholder text, must reach 4.5:1. Field edges, toggle tracks and icons that carry meaning must reach 3:1, which covers ring tracks, chart strokes, body-map segment outlines and range bars.
- **Measure the composited color** (after opacity and translucency) in each theme and on each surface.
- **Scrims.** Text over images sits on a scrim, measured at the image's lightest point under the text. Applies to share cards with photos.
- **Role tokens.** Components use role tokens, and only the theme file maps roles to palette steps.
- **Alpha neutrals.** Borders, dividers and hover and pressed fills are alpha neutrals, so they read on any surface.
- **Dark mode.** Raised surfaces get lighter instead of relying on a shadow, which replaces shadow and glow elevation in dark. Accents and status colors get dark-tuned values (its example: #2563eb on #0a0a0a measures 3.8:1; #60a5fa measures 7.8:1).
- **Accent and status meaning.** The accent marks the primary action, the selection and focus; never headings or rows of icons. Each status color keeps one meaning: red is only for errors and destructive actions.
- **Report format.** Each rule has an ID with a broken/replacement pair. Findings read `file:line - [rule-id] … (ratio)` with HIGH, MEDIUM or LOW severity, a good shape for PR review.

Conflicts:

- "The accent marks action" clashes with the plan's "one progress accent". The owner should decide whether the single accent means progress (rings, trend lines, "improved") or action (buttons). If it means progress, buttons take a strong neutral (ink) fill and the accent stays with data. Write the decision down.
- Alpha neutrals vs better-colors' "solid tokens under text": they are compatible if alpha is used only for borders and hover fills, never for surfaces that carry text.
- It tells the agent to run its bundled `contrast.js` in the page through the browser's evaluate call. The script and an `agents/` folder are in the repo but were not in the batch copy. It also points to sibling skills `reuse`, `defaults` and `restraint`.

Mine about 10 rules into DESIGN.md › Color (they overlap with better-colors), or install it with the script after reading the script.

### 3. jakubkrehel/better-typography: rel 3 · 23.7 KB (11.5 KB SKILL + 6 refs) · MIT · install whole + Arabic addendum

- **A role-named scale where each role is one decision** (size / line-height / weight):

  | Role | Size | Line-height | Weight |
  |---|---|---|---|
  | display | 36 px | 1.1 | 600 |
  | title | 24 px | 1.2 | 600 |
  | heading | 18 px | 1.3 | 600 |
  | body | 16 px | 1.5 | 400 |
  | caption | 13 px | 1.4 | 400 |

  Emphasis inside a role is one weight step up, not a size change.
- **Leading and size floors.** Unitless line-height, and at least 1.4 for anything that wraps to three or more lines. Weight 400 or heavier under 18 px. Sizes in rem so the reader's font size applies.
- **Numbers.** `tabular-nums` on changing values: count-ups, kg deltas, trend axes. Use CSS properties rather than raw OpenType tags.
- **Wrapping.** `text-wrap: balance` on headings and `pretty` on paragraphs. `text-align: start`. `&nbsp;` between a value and its unit ("77.9 kg").
- **Bidi.**
  - Set `lang` and `dir`.
  - Wrap mixed-direction values in `<bdi>`.
  - Digit runs keep left-to-right order.
  - A paragraph of three or more lines aligns to its own script.
- **Inputs.** 16 px inputs on iOS, with two recipes. The scale recipe already includes `rtl:origin-right`.
- Its "Before you finish" table converts directly into lint and review checks.

Conflicts and gaps:

- Its tracking rules (−0.01 to −0.02 em on headings, +0.05 em on small uppercase labels) must be scoped to Latin with `:lang(en)`. Letter-spacing distorts or breaks Arabic joining, depending on the browser engine.
- It has nothing on:
  - Arabic line-height: Arabic generally needs more leading than Latin at the same size;
  - Arabic size floors;
  - Arabic punctuation (، ؛ ؟): its smart-punctuation table is English;
  - Western vs Eastern Arabic digits for count-ups: `Intl` with `ar-EG` gives ٠–٩ by default.
- `text-box: trim-both cap alphabetic` uses Latin metrics. Check it on Arabic labels.
- It refers to sibling skills and a `reporting.md` that are not in this batch.

Install whole, plus a five-line Arabic addendum in DESIGN.md: no tracking in Arabic, more leading, the digit system, punctuation, and a minimum Arabic size.

### 4. jakubkrehel/make-interfaces-feel-better: rel 3 · 41.8 KB (11.8 KB SKILL + 5 refs) · MIT · install whole

- **Numbers.** `tabular-nums` on any animated number; it names animated number transitions explicitly.
- **Entrances.** Split and stagger only for rare entrances such as a first load or a success state: about 100 ms between semantic chunks and about 80 ms per title word. That is the "new result" reveal. Never stagger routine taps.
- **Exits and transitions.**
  - Exits are subtle: a small fixed translateY.
  - Set `initial={false}` on AnimatePresence, except for intentional entrances.
  - Use interruptible CSS transitions for state changes, never `transition: all`.
  - Add `will-change` only when the first frame stutters.
- **Touch.** Scale 0.96 on press, with a `static` opt-out. 44×44 hit areas through a pseudo-element, and hit areas never overlap.
- **Surfaces.**
  - Concentric radius: outer radius = inner radius + padding.
  - Instead of solid borders that fake depth: a 3-layer transparent shadow-as-border in light, a single white 8% ring in dark.
  - Image outlines are pure black or white at 10%.
- **Icons.**
  - Stroke matches the text weight: 1.5 px beside 400, 2 px beside 600.
  - One icon set per surface, recolored with `currentColor`; outline by default and fill for the active state.
  - An RTL flip table: flip back/forward chevrons and send glyphs; never flip checkmarks, clocks or media controls.
- **Motion restraint.** No custom animation on high-frequency interactions, and motion is never the only feedback: there is always a static cue too.

Conflicts:

- It assumes motion/react or CSS and says nothing about GSAP.
- Its icon swaps animate `filter: blur(4px→0)`. That is costly on low-end Android WebViews and part of the blurry look the owner dislikes; use opacity and scale only.
- macOS font smoothing has no effect in Android or iOS WebViews (harmless).
- Shadow-as-border keeps elevation quiet, but it still has to respect the "no shadows on things at rest, no glows" ban (pick 7). Use it on floating sheets and menus, and tone steps on cards.

### 5. emilkowalski/emil-design-eng: rel 3 · 28.2 KB single file · MIT · mine

- **Animation decision framework.** Frequency comes first:
  - 100+ times a day: no animation;
  - tens of times a day: reduce;
  - occasional: standard;
  - rare or first-time: may add delight.

  Then purpose, easing and duration. For LevelUP: the reveal and the count-ups run once per new scan. Revisiting the same result shows the final state. Tabs and list taps get no decorative motion.
- **Easing.** Ease-out for enter and exit, with strong custom curves such as `cubic-bezier(0.23, 1, 0.32, 1)`. Ease-in-out for on-screen moves. Never ease-in for UI. It includes Ionic's drawer curve.
- **Durations.** Press feedback 100–160 ms, small popovers 125–200 ms, UI under 300 ms, sheets and drawers up to 500 ms.
- **Springs and performance.**
  - motion/react springs for gestures and interruptible motion, with bounce kept to 0.1–0.3.
  - Animate only transform and opacity.
  - CSS and WAAPI stay smooth under load where requestAnimationFrame drops frames, which matters on low-end Android.
  - Motion 14.2+ shorthand properties are hardware-accelerated.
- **Accessibility.** Reduced motion means fewer and gentler animations, keeping opacity and color. Gate hover behind `(hover: hover) and (pointer: fine)`. Stagger 30–80 ms. Test on real devices and in slow motion.
- **clip-path.** clip-path reveals, plus a comparison-slider pattern (two layers, clip the top one) for before/after scan comparison.

Conflicts:

- No GSAP coverage, and it prefers CSS or WAAPI for predetermined sequences. Keep GSAP for the reveal timeline but apply this skill's frequency, easing and duration rules.
- `clip-path: inset()` sides are physical, so mirror the reveals and the slider in RTL.
- Large parts are desktop-only (keyboard shortcuts, tooltips, pointer tracking).
- Persona quirks: a canned "Initial Response" when invoked without a question, a mandatory Before/After table, and a link to a missing `../choreograph/SKILL.md`.
- Its press scale is 0.97, against 0.96 in pick 4. Pick one token.

Mine the decision framework, duration table, performance rules and reduced-motion rules into DESIGN.md › Motion. It covers motion, not color, so drop it if a stronger motion skill turns up in another batch.

### 6. emilkowalski/learn-taste: rel 3 · 9.1 KB · MIT · install whole

- **The tool for an owner-led redesign.**
  1. It collects the owner's corrections in a session: explicit corrections, silent edits, repeated nudges, rejections and confirmed choices.
  2. It filters out one-offs and generalizes each correction to the class of component.
  3. It records the owner's own why, or an *inferred* why for the owner to confirm.
  4. It writes dated rules into DESIGN.md under Surfaces, Color, Typography, Spacing, Motion, Interaction and Copy.
- **"A check beats a sentence."** Anything that can be matched in code becomes a lint rule, token restriction or test. Candidates here:
  - ban `backdrop-filter`;
  - ban colored `box-shadow` glows;
  - ban hex literals outside the token files;
  - ban violet and lavender hues (OKLCH H ≈ 270–320) in tokens.
- **Propose, then stop.** It never adds a rule the owner didn't express. A `prune` mode merges duplicates and resolves contradictions.

Conflicts: none with the stack. It is user-invoked only (`disable-model-invocation`). It may read earlier session transcripts under `~/.claude/projects` (local, but private). It proposes a "read DESIGN.md" line for CLAUDE.md, written only on approval. It writes DESIGN.md at the repo root, so decide deliberately where that file should live.

### 7. filipwojda/regards-art-direction: rel 2 · 35.3 KB · MIT · mine one table

- **Its House rules read like the owner's complaint written as a rule set.** They name the "AI assistant" look and its replacement:
  - no violet or indigo (and no cream with terracotta): take colors from the subject;
  - no glass (no backdrop-blur panels, no floating pill navigation): use a plain bar;
  - no shadows on things at rest and no glows: use a tone step between surfaces, with shadows only on what really floats;
  - no gradients on backgrounds, buttons or text (a neutral scrim on photos is the one exception);
  - no tiny letter-spaced uppercase labels, no eyebrows or pill badges above headings, no styled accent word in a heading;
  - two typefaces at most, and tabular figures instead of monospace;
  - no rows of identical icon cards, no emoji, gradient blobs or fake grey-bar dashboards;
  - removing ornament leaves space; never fill it with another ornament.

Conflicts:

- It is written for public websites and says "Not for dashboards or app screens".
- "No thin rules, 1 px boxes or grid lines" and "headlines two lines or fewer" are web-page rules. Trend charts need gridlines and lists need dividers; its own earned-exception clause allows hairlines that carry data.
- The rest of the skill (regards MCP research, `inspect.mjs`, the photo workflow) doesn't apply.

Mine the table into DESIGN.md bans; feed it to learn-taste as the owner's stated taste. Do not install it.

### 8. mrstev3n/balise-content-test: rel 2 · 13.5 KB · Apache-2.0 · mine the case matrix

- **Stress families for InBody screens and their tests:**
  - numbers: 0, 1, high, decimals, sign, unit;
  - presence: absent, partial, unknown, unavailable (InBody models report different field sets);
  - locale: text expansion, non-Latin script, regional formats;
  - direction: RTL layout, RTL + numbers, mixed-direction values, directional icons;
  - typography: fallback font, missing glyph, taller metrics;
  - narrow viewport: 320 px.
- **Keep zero, empty, unknown, loading and error distinct.** Test each boundary alone first, then one or two likely combinations (long + narrow, RTL + numbers).
- **Content criticality.** Decision-critical values (the "did I improve" answer, the normal ranges) are never truncated. Values compared across scans keep their alignment. Explanatory text may clamp, as long as there is a way back to the full text.
- **Data.** Synthetic data only, never real health data.

Conflicts: it is built around Figma canvas edits (duplicate frames, Auto Layout) and has no code procedure. Use the matrix for Vitest and React Testing Library fixtures and for the redesign review.

## Also worth mining (not top picks)

- **pbakaus/colorize** (Apache-2.0, part of impeccable, 4.5 KB). On app screens, color encodes action, selection and status, and "rarity gives an accent force". Choose the hue from product meaning, not category habit. On colored surfaces, derive secondary text from the surface hue instead of a washed-out gray. Encode data with lightness, shape and labels too, not hue alone.
- **pbakaus/typeset** (Apache-2.0, part of impeccable, 7 KB). One well-tuned family and a fixed role scale. Tune line height to the face, width and language. Light text on dark gets more leading and one step more weight; skip its extra tracking for Arabic. Use metric-compatible fallbacks and respect Dynamic Type. Both pbakaus files call `{{scripts_path}}/impeccable detect` and link files not in this batch.
- **kemiljk/dxe-subtractive-design, dxe-ai-output-judgement, dxe-product-delight, dxe-real-content-design** (MIT, 2–5 KB each):
  - a subtraction process for one job per screen;
  - an AI-output rubric: tokens not hex, real states, no `transition: all`, no generic radii and shadows;
  - "one meaningful moment, not confetti";
  - design with representative, incomplete records, here real InBody payloads.
- **mrstev3n/balise-ux-writing** (Apache-2.0). Copy diagnosis dimensions (clarity, action, recovery, trust, localization) and the high-stakes rule "do not turn uncertainty into certainty", which matters for health explanations. Its five reference files were not fetched.
- **jakubkrehel/interface-review**, `removed-signals.md`: PR checks for dropped `lang` or `dir`, logical properties swapped for left/right, and new strings without a catalog entry. On its own the skill stops without its `better-interface` sibling.
- **One-line bans:**
  - leonxlnx/taste-skill: no violet or lavender as accent, ground, gradient, effect or tint.
  - nutlope/hallmark: every color and font through a token, no purple-to-blue gradient, no tracked-caps labels, no decorative status dots, a reduced-motion fallback for every animation.
- **jakubkrehel/oklch-skill**: only its multi-hue rule (the same percentage of each hue's maximum chroma). Its other advice (dark mode by reversing L, converting all hex to oklch) contradicts better-colors.
- **kemiljk/dxe-design-for-repetition**: dashboard-later, for staff workflows repeated daily.

## Notable red flags in this batch

- **leonxlnx/taste-skill.** A frontmatter `hooks: Stop` entry runs `exec node gate.mjs --hook claude` on every stop (600 s timeout). It looks for the script in the skill folder, the plugin root, the project's `.claude/skills` and `.agents/skills`, and `$HOME`. It writes `.taste-skill/` files and needs Node 22 + Chrome.
- **pbakaus/impeccable.**
  - `allowed-tools` pre-approves `Bash(npx impeccable *)` and `Bash({{scripts_path}}/impeccable *)`.
  - Setup runs a launcher that "downloads [a binary] once on first run", and the agent must "follow its directives": instructions generated at runtime.
  - An optional detector hook runs automatically after UI edits.
  - It opens with "gives you the tools and permission".
  - Its references (colorize, typeset, layout, polish) call the same binary.
- **filipwojda/regards-art-direction.** It asks the user to add a remote HTTP MCP (`mcp.regards.design`), then has the agent read `skill://regards-design/SKILL.md`, served by that server, before the first search. Those are remote instructions at runtime.
- **egonex-ai/understand-dashboard.** Runs `npx --yes` on a tarball downloaded from GitHub Releases, which is remote code execution. The rest of the family runs `pnpm install`, builds and Python scripts.
- **ehmo/slopgent** writes into `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and `~/.gemini/GEMINI.md` through `node scripts/slopgent-memory.js enable`. **aboudjem/humanizer** pre-approves Read, Write, Edit, Grep, Glob and AskUserQuestion, and offers copy-paste "always-on" blocks for CLAUDE.md or a system prompt.
- **Outbound data:**
  - nutlope/hallmark's comp step calls Together AI when `TOGETHER_API_KEY` is set;
  - rams-design/rams sends files to its hosted engine when its MCP is connected, and carries an upsell link;
  - superdesigndev/rea-growth spends money on paid data APIs (default $3 cap);
  - insane0777/awwwards-inspiration scrapes and records live sites through its MCP and runs `curl` + `ffmpeg`.
- **raphaelsalaja/color (a top pick)** tells the agent to run its bundled `contrast.js` in the page through the browser's evaluate call. The script was not in the fetched copy, so read it before installing.
- **Mild:**
  - emilkowalski/emil-design-eng scripts a canned first reply;
  - dietrichgebert/ponytail auto-activates every session;
  - arla6ka/make-font downloads font files from raw.githubusercontent.com and runs Python and Playwright scripts.
- **No classic prompt-injection text** (for example "ignore previous instructions" or hidden directives) turned up in a grep across all 75 folders or in the files read in full.
