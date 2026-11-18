# Skills digest: visual-mengto-2

73 skills, all from `MengTo/Skills` (license MIT, checked with `gh api repos/MengTo/Skills/license`). Triaged on 2026-11-18 against the LevelUP member-app redesign: calm and data-forward, bilingual with RTL, light and dark themes from tokens, Ionic React 8 in a Capacitor 7 WebView, GSAP plus motion/react.

**Verdict:** a thin batch for this app. Most of it is landing-page aesthetics, WebGL or Three.js effects, game development, illustration kits, and MengTo's own agent workflows. The real value is in two places. First, the anti-slop pair (`no-ai-design-slop`, `audit-ai-design-slop`), whose rules target exactly what the owner wants gone: decorative glow, glass and gradient stacking. Second, a handful of concrete rules for shadows, offscreen animation hygiene, clock-driven count-ups, and one-accent color discipline. No skill covers RTL, Arabic type, Ionic, Capacitor or safe areas. No skill is useful only for the dashboard. `beautiful-shadows` is also a drop-in for it later.

**Counts:** 3 high: 1 · 2 useful: 4 · 1 low: 17 · 0 none: 51

**Fetched scope:** only `SKILL.md` per skill, plus `landing-page/REFERENCES.md`. Many skills point to `scripts/`, `references/`, `demo/`, `examples/` or `ARTICLE.md` files that were **not** fetched. This matters for the top pick: both anti-slop skills defer to `no-ai-design-slop/ARTICLE.md` for full redesign passes.

**Red-flag scan:** no skill has `allowed-tools` (every frontmatter is just `name` and `description`). No prompt-injection text was found. No skill fetches remote instructions at runtime; the one link to another author's raw `SKILL.md` sits in `landing-page/REFERENCES.md` as optional reading. The real risks are shell commands, bundled scripts that were not fetched, subagent fan-out, publishing or committing steps, and one skill that drives the user's logged-in X account (see the summary at the end).

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| mengto/add-shader-cursor-trail | 0 | WebGPU cursor-trail hero effect. Phones have no cursor, and it is GPU-heavy in a WebView. | none (refers to an unfetched verify script) |
| mengto/agency-grid-layout-minimal | 1 | Template family (see below). Agency site. Only "an oversized headline is the anchor, accent used very sparingly" transfers, supporting one answer per screen. Its uppercase micro-labels don't exist in Arabic. | none |
| mengto/atmosphere-background | 0 | Dark glowing light-fold background: the glow look being removed. | none |
| mengto/audit-ai-design-slop | 2 | Evidence-based, removal-first audit: decorative stacking (glow, glass, gradient text), card-everything, motion theater, fake proof, UI failures, reported as a P0–P3 table. Run it once on the current app before redesigning. | none; full-site mode needs the unfetched `../no-ai-design-slop/ARTICLE.md` |
| mengto/audit-verify-explain-grade-5 | 1 | Governs how an agent reports its own work, not product UI. Three of its rules could guide InBody copy: lead with the answer, define terms in plain words, separate fact from judgment. | none |
| mengto/beam-glow-states | 1 | Animated border glow from the `border-beam` package, and glow is disliked. Keep only: the state must read without the animation, the correct `aria-busy`/`aria-selected`/`aria-current`, and one animated accent per viewport. | tells the agent to `npm install` / `pnpm add` / `yarn add border-beam` |
| mengto/beautiful-shadows | 2 | Three exact neutral, layered shadow recipes (sm/md/lg) with no tint. Light theme only. Also dashboard-later (drop-in Tailwind classes). | none |
| mengto/blue-cloudy-clean-modern | 0 | Template family. Sky-blue cloud marketing hero. | none |
| mengto/blue-laser-clean-glass-layout | 0 | Template family. Dark frosted glass plus a laser glow: the exact look being removed. | none |
| mengto/bright-green-tech-system-webgl | 0 | Template family. Acid-green WebGL "console". | none |
| mengto/browser-video-recording | 0 | Turns Codex in-app browser captures into 4K demo videos. | runs a bundled Python renderer (not fetched), `ffmpeg`/`ffprobe`, writes to `/tmp` |
| mengto/build-daily-inspiration-sites | 0 | Turns inspiration captures into five landing pages. | spawns five separate Codex tasks; runs a bundled node validator (not fetched); publishes via Sites; rebrands third-party references |
| mengto/build-game-audio-feedback | 0 | Game audio. | none |
| mengto/build-game-camera-controls | 0 | Three.js game cameras. | none |
| mengto/build-game-changelog | 0 | In-game changelog. | none |
| mengto/build-game-inventory | 0 | Game inventory. | none |
| mengto/build-interactive-particle-trail | 0 | Pointer particle trail. | none |
| mengto/build-threejs-enemy-systems | 0 | Game enemies. | none |
| mengto/build-vesperfall-review-assets | 0 | Asset catalog for one specific game project. | runs bundled `scripts/validate_pair.py` (not fetched) |
| mengto/build-wireframe-scan-reveal | 0 | Three.js mesh "scan" reveal: 3D geometry, nothing to do with body-scan data. | none |
| mengto/cinematic-gsap-lenis-motion-system | 1 | GSAP motion for marketing sites. Lenis scroll-jacking fights `ion-content`, cursor and magnetic effects are useless on touch, and its 0.75–1.1 s reveals are too slow for app UI. Worth keeping: animate transform and opacity only, reveal once, the page must read with motion removed, revert the GSAP context. | tells the agent to `npm i gsap lenis` |
| mengto/corner-diagonals | 0 | Sci-fi chamfered corners. The clip-path polygons don't mirror in RTL. | none |
| mengto/css-border-gradient | 1 | Its default stops are violet on dark glass, the disliked look. Only "tune alpha separately per theme" and "one hierarchy level at a time" transfer. | none |
| mengto/design-action-combat | 0 | Game combat. | none |
| mengto/design-game-encounters | 0 | Game encounters. | none |
| mengto/editorial-portfolio-chapters | 0 | Page-archetype family. Agency portfolio site. | none (refers to an unfetched `ARTICLE.md`) |
| mengto/editorial-tech | 1 | Template family. Editorial layout with mono labels. Only "restrained neutrals, one active accent" transfers. | none |
| mengto/falling-leaves | 0 | Decorative particles. | none |
| mengto/fire-paper-loader | 1 | WebGL burning-paper loader, not calm. Transferable: progress shown as text with `role="progressbar"`, never let progress look stalled, say "still loading" after about 12 s on slow connections. | none |
| mengto/framed-grid-layout | 0 | Technical web framing (corner brackets, diagonal texture, 12 columns): pure decoration on a 320 px phone. | none |
| mengto/framed-tech-dark-border-gradient | 0 | Template family. Dark monochrome border-gradient shells. | none |
| mengto/game-dev-combat-animation | 0 | Game animation. | many bundled node, python and swift scripts; pushes and publishes via another skill |
| mengto/game-dev-combat-skill-polish | 0 | Scores and polishes game combat VFX. | spawns two subagent judges per round; many bundled scripts |
| mengto/generate-reference-inspired-brand-worlds | 0 | Brand campaigns generated as images. | drives the image-generation tool; producing "closer-to-reference" imitations is IP-sensitive |
| mengto/glass-dark-mode-clock | 0 | Template family. Frosted black glass plus glow (disliked). The dial motif is decorative. | none |
| mengto/gooey-blob-system | 0 | SVG goo-filter blobs. | none |
| mengto/html-demo | 1 | Engine for animated product demos on marketing pages. Worth mining its motion rules: every frame computed from one clock `t`, designed end frames under reduced motion, a working → result → settle sequence, real data only, play only when visible. | parallel helper agents; Playwright and ffmpeg via bundled scripts (not fetched) |
| mengto/ice-frost-skill-vfx | 0 | Three.js game VFX. | none |
| mengto/illustration-bold-pop | 0 | Illustration family. Loud pop style. | node/Playwright render scripts from a kit that was not fetched |
| mengto/illustration-grainy-gouache | 0 | Illustration family. Animals on hot pink. | same |
| mengto/illustration-halftone-line | 1 | Illustration family. Monochrome ink with halftone could suit calm empty states, but only if redrawn with gym subjects and recolored per theme. | same |
| mengto/illustration-ink-sketch | 0 | Illustration family. Googly-eyed critters. | same |
| mengto/illustration-isometric-mono | 0 | Illustration family. Isometric server and developer dioramas. | same |
| mengto/illustration-line-interior | 1 | Illustration family. Airy thin-line scenes with people, a fit for onboarding or empty states. Its indigo line and lavender decor would have to be recolored. | same |
| mengto/illustration-two-colour-brush | 0 | Illustration family. Bold marker zine style. | same |
| mengto/illustration-vintage-emblem | 0 | Illustration family. Screen-print badges. | same, plus `npm i -D playwright-core` |
| mengto/image-first-grid-layout | 0 | Template family. Photo-led hero. | none |
| mengto/implement-fog-of-war | 0 | Game. | none |
| mengto/iterate-until-verified | 1 | Generic make-then-judge loop with quality gates. Could structure redesign QA; has no design content. | subagent fan-out; "loop until done" (open-ended cost) |
| mengto/landing-page | 0 | Structure and copy for a conversion landing page. Not the member app; at most a future gym marketing page. | `REFERENCES.md` points to a raw third-party `SKILL.md` on GitHub (optional reading) |
| mengto/mesh-gradient-dark-blue-clean | 0 | WebGL mesh hero with glass pills. The only concrete content is navy tokens. | none |
| mengto/no-ai-design-slop | 3 | Passive anti-slop gate: one focal point per viewport, hierarchy before labels, every glow, glass, gradient or shadow must have a role, motion must explain state, the full set of states, no invented metrics, and a removal test. It matches the owner's dislikes almost line for line. | none; always-on trigger; its redesign mode needs the unfetched `ARTICLE.md` |
| mengto/number-details | 0 | Decorative 01/02/03 numerals would compete with the app's real metric numbers. | none |
| mengto/operational-enterprise-ai | 1 | Page-archetype family. Enterprise marketing. Transferable: tabular numerals, data legibility ahead of atmosphere, 160–220 ms control motion, settled states under reduced motion. | none |
| mengto/optimize-web-animations | 2 | Pause offscreen animations (including skeleton shimmers), gate requestAnimationFrame loops, clean up GSAP and observers, check for leaks. Fits GSAP running in a WebView. | `git status`/`git diff`, `npm run lint/build`, `rm -f /tmp/...`, commits through a temporary git index; needs the unfetched `references/browser-profiling.md` |
| mengto/orange-clean-paper-saas | 2 | Template family. Warm paper neutrals with one disciplined signal color: the closest match to "calm canvas, one accent". Prose only. | none |
| mengto/paper-cinder-transition | 0 | WebGL burn transition. | none |
| mengto/product-proof-saas | 1 | Page-archetype family. SaaS landing page. Transferable: reserve the signal color for active, progress, selection and focus; use black for primary actions. | none |
| mengto/publish-project-to-github | 0 | Publishes local projects publicly. | runs a bundled shell audit script (not fetched); `gh repo create`, `git commit`/`git push`, turns on public GitHub Pages |
| mengto/reveal-hover-effect | 0 | Hover spotlight reveal; on touch it falls back to a static image. | none |
| mengto/scroll-progress-timeline | 1 | Ordered list first, then a progress line drawn with compositor-only `scaleY`; reduced motion shows discrete states; `aria-current="step"`. Its horizontal `transform-origin: left` breaks in RTL, and it assumes document scrolling, while Ionic scrolls inside `ion-content`. Could become a scan-history rail. | none |
| mengto/skeuomorphic-ui | 0 | Tactile layered gradients and inner shadows: the opposite of a calm flat canvas. | none |
| mengto/tech-green-dark-mode-modern | 1 | Template family; the dark counterpart. Keep: tonal surface steps, accent only on the active chart mark. Its glow, glass, corner brackets and mono labels conflict. Dashboard-later layout ideas at most. | none |
| mengto/test-playable-web-games | 0 | Game QA. | none |
| mengto/threejs-weather | 0 | Three.js weather. | none |
| mengto/tune-enemy-ai | 0 | Game AI. | none |
| mengto/unicorn-studio | 0 | Embed for no-code WebGL scenes. | the product would load a third-party SDK and remote scene JSON at runtime |
| mengto/water-crystal-skill-vfx | 0 | Three.js game VFX. | none |
| mengto/webgl-3d-object | 0 | 3D hero object. | none |
| mengto/workflow-progress-screenshots | 1 | Before and after screenshots at the same viewport and state: a useful habit during the redesign. | acts "without being asked"; its bundled capture and compare scripts were not fetched |
| mengto/workflow-score-to-target | 1 | Scoring against an anchored rubric. Could score screens against the 3-second-answer goal. | blind subagent judges |
| mengto/workflow-threads-manager | 0 | Manages other Claude sessions. | runs bundled shell and python scripts; archives other sessions, which deletes their worktrees; its live check fetches remote pages |
| mengto/x-bookmark-quote-posts | 0 | Drafts X/Twitter posts. | drives the user's logged-in X account (bookmarks plus their 100 latest posts); `git commit` |

## Same template, different colors

- **Named-aesthetic family (10):** `agency-grid-layout-minimal`, `blue-cloudy-clean-modern`, `blue-laser-clean-glass-layout`, `bright-green-tech-system-webgl`, `editorial-tech`, `framed-tech-dark-border-gradient`, `glass-dark-mode-clock`, `image-first-grid-layout`, `orange-clean-paper-saas`, `tech-green-dark-mode-modern`. All ten use the same nine-section skeleton (Use When / **empty** Workflow / Scope / Visual target / Implementation guidance / Recommended patterns / Tuning knobs / Avoid). Each is about 4–4.9 KB and written as prose rewritten per palette, with no tokens, hex values or code. `atmosphere-background` is the same skeleton minus Recommended patterns. These are mood boards for landing pages, not design systems.
- **Page-archetype family (3):** `product-proof-saas`, `operational-enterprise-ai`, `editorial-portfolio-chapters`. Each runs Establish the Story / Build the Visual System / Compose the Page / Motion Defaults / Validate / Avoid.
- **Illustration family (8):** `illustration-*`. One skeleton (The look in one sentence / Palette / Line and fill / Characters / … / Failure modes / Workflow / Verify). Each is a fixed-palette, light-only, 480×360 SVG card style for coding scenes, and each needs its own unfetched `scripts/*.mjs` kit plus a Playwright render loop.
- **Effect-mechanism skills (10):** WebGL, WebGPU and canvas effects (`add-shader-cursor-trail`, `build-interactive-particle-trail`, `build-wireframe-scan-reveal`, `falling-leaves`, `fire-paper-loader`, `paper-cinder-transition`, `threejs-weather`, `webgl-3d-object`, `ice-frost-skill-vfx`, `water-crystal-skill-vfx`). Good engineering hygiene (reduced motion, pausing when hidden), but nothing for a calm data app.
- **Game development (13):** all `build-game-*`, `build-threejs-enemy-systems`, `build-vesperfall-review-assets`, `design-action-combat`, `design-game-encounters`, `game-dev-combat-*`, `implement-fog-of-war`, `test-playable-web-games`, `tune-enemy-ai`.

## Top picks

### 1. mengto/no-ai-design-slop: install whole, after reading `ARTICLE.md` (7,007 B SKILL.md; `ARTICLE.md` not fetched; MIT)
**Relevance 3.** It works as a passive quality gate for the whole redesign. Its key rules map almost one to one onto the LevelUP plan:
- **Slop is "a choice made by reflex rather than for the product."** It is suspect when it could be pasted into an unrelated product, carries no information or state, or competes with content.
- **One focal point per viewport, one primary action per flow:** the "one answer per screen" rule.
- **Hierarchy before labels:** size, weight, placement and contrast do the work, not pills, eyebrows or captions. **Proximity before containers;** don't turn every block into a card; use depth only when there is a real layering model.
- **Color and material gate:** "Does each gradient, glow, glass layer, border, shadow, and accent have a clear role?" This is the most direct argument against the current violet glass and glow.
- **Motion must explain state, causality, hierarchy, continuity or spatial change.** Keep complete static states for reduced motion.
- **Full state coverage:** loading, empty, error, disabled, selected, success.
- **Never invent metrics or activity.** For a health app, every number must come from a real scan.
- **Removal test:** name the element, state its job, delete it if clarity survives, never compensate with a new effect.

**Conflicts:**
- Its default stance is to preserve established decisions and not prescribe a new palette "unless the task authorizes it". The prompt must state that the redesign is authorized, or the skill will defend the violet look.
- Parts are worded for landing pages ("buying journey").
- It has no RTL, bidi, i18n, theme, 320 px or safe-area checks. Add a LevelUP addendum covering both languages including RTL, both themes, 320 px, safe areas, amber only for attention, and a single progress accent.
- Its redesign mode reads `ARTICLE.md`, which was not fetched: unknown content, so review it before installing.

**If `ARTICLE.md` is not wanted:** mine Core Judgment, Compact Quality Gates and Removal Test (about 40 lines) into LevelUP's own design skill.

### 2. mengto/audit-ai-design-slop: use once at kickoff, don't keep installed (6,210 B; MIT)
**Relevance 2.** Contributes a structured, evidence-cited inventory of what to delete from the current app before the new system is designed:
- **Decorative stacking:** glow plus gradient text plus glass plus borders doing the same job.
- **Repetition:** card treatment on every block, nested rounded containers, repeated icon tiles.
- **Motion theater.**
- **UI failures:** competing primary actions, information available only on hover, missing states, contrast.

Findings are classified P0–P3 in a fixed table (Priority | Class | Pattern | Evidence | Harm | Remove or fix), and the report ends with the single highest-impact removal.

**Conflicts:**
- "Preserve the existing direction" and "don't prescribe a palette" are the opposite of the goal. Use it only for the removal list, then design the new direction separately.
- Full-site mode needs the same unfetched `ARTICLE.md`.
- Its checklist largely overlaps pick 1. If only one is installed, take pick 1.

### 3. mengto/beautiful-shadows: mine the three recipes into tokens (2,540 B; MIT)
**Relevance 2.** Contributes three exact neutral elevation recipes, each a stack of three to six low-alpha layers (sm and md also carry a 1 px hairline ring):
- **sm:** controls, pills, quiet cards.
- **md:** the default card.
- **lg:** modal-like containers only, never dense lists.

Its rules: no colored tint, one shadow strength per state, never mix with Tailwind's default shadow scale, never stack utilities, and don't use shadow as a substitute for borders in low-contrast layouts. These are calm and match "no glow".

**Conflicts:**
- Light theme only. Black alphas vanish on dark surfaces, so in dark use tonal surface steps and swap the hairline ring to a light alpha.
- It is written as arbitrary `shadow-[…]` classes. In Tailwind v4, define them as `--shadow-*` theme variables overridden per theme, so they follow LevelUP's token rule.

**Fit:** RTL-safe (zero x-offset). Also directly usable in the later shadcn dashboard.

### 4. mengto/optimize-web-animations: mine the rules, skip the workflow (8,257 B; `references/browser-profiling.md` not fetched; MIT)
**Relevance 2.** Contributes:
- Pause offscreen CSS animations, including skeleton shimmers on `::before`/`::after`, with an `IntersectionObserver` (threshold about 0.01) toggling an `is-offscreen` class.
- Gate requestAnimationFrame loops directly, because `animation-play-state` can't stop JS loops.
- Kill GSAP tweens, including those on mutable objects.
- Disconnect all observers and remove listeners with the same handler reference.
- Use `isDisposed` guards for async loads that resolve after unmount.
- Cap frame deltas after a pause.
- Verify with route cycles that DOM counts return to baseline.
- Never "fix" performance by deleting all motion.

**Conflicts:**
- Ionic keeps previous pages mounted in `IonRouterOutlet`, so unmount cleanup alone won't stop their JS animation work. Also pause on `useIonViewWillLeave` and resume on `useIonViewDidEnter`.
- `useGSAP` from `@gsap/react` already reverts its context; don't double-manage it.
- The workflow assumes Codex Browser and desktop profiling. It tells the agent to run `git status`, lint and build, `rm -f /tmp/...`, and to commit via `GIT_INDEX_FILE`. That clashes with the owner's commit rules.

### 5. mengto/orange-clean-paper-saas + tech-green-dark-mode-modern: mine about five lines (4,038 B + 4,028 B; MIT)
**Relevance 2 and 1.** These are the light and dark members of the same template, and the only two in the family with anything for LevelUP.

From the orange skill:
- Warm off-white, stone or cream canvas instead of stark white.
- One accent used purely as a signal (steps, primary action, small progress indicators), never flooding the page.
- Keep readable contrast between the warm background, cards and gray copy.
- Generous radius, but not "bubbly consumer UI".

From tech-green:
- Separate dark surfaces by tonal steps.
- Charts stay neutral, with the accent only on the active bar or node.
- Don't add extra accents that dilute the signal.

**Conflicts:**
- Orange as the action color collides with LevelUP's amber-for-attention. With a warm canvas, pick a non-warm progress accent.
- Both templates recommend glassy panels, floating cards, tinted shadows, ambient floating motion, glow, corner brackets and mono uppercase labels: the look being removed. Uppercase doesn't exist in Arabic, and mono labels read poorly in it.
- Prose only (no tokens or hex values; the Workflow section is empty). Not worth installing.

### 6. mengto/html-demo: mine four motion rules (14,485 B; React engine, scripts and references not fetched; MIT)
**Relevance 1, but its rules hit the motion plan directly:**
- **Draw from `t` alone.** Drive count-ups, ring fills and reveals from one progress value (one GSAP tween or one motion value), not chained CSS transitions. Any frame is then reproducible in tests, and reduced motion simply renders `t = 1`.
- **Reduced motion means designed end frames.** Every end state must be a complete picture on its own.
- **Working → result → settle.** This maps to skeleton → "new result" reveal → settle.
- **Real results only, with honest time compression.** The numbers stay true.

**Conflicts:** it is built for a fixed 1200×750 scaled marketing stage with a scripted cursor, and it relies on unfetched scripts and parallel helper agents. Use the rules, not the skill.

## General principles worth keeping (distilled across the batch)

**Color and surface**
- One signal color, reserved for active, progress, selection and focus. Everything else is neutral (`product-proof-saas`, `orange-clean-paper-saas`, `tech-green`). For LevelUP: progress accent means "improved", amber means attention, nothing else is colored.
- Charts use a neutral base, with the accent only on the current or active mark (`tech-green`).
- Every gradient, glow, glass layer, border and shadow needs a named job, or it goes (`no-ai-design-slop`).
- The same alpha rarely works in both themes, so tune light and dark separately (`css-border-gradient`). Dark surfaces separate by tone, not shadow (`tech-green`, `beautiful-shadows`).
- Use neutral, layered, untinted shadows, one strength per state (`beautiful-shadows`).

**Type and hierarchy**
- Hierarchy before labels: the headline answer is the focal point, not badges or eyebrows (`no-ai-design-slop`).
- Use tabular numerals for metrics, so count-ups don't jitter and comparison columns align (`operational-enterprise-ai`). Check this for both Latin and Arabic-Indic digits in the chosen fonts.
- Drop the recurring mono and uppercase micro-label motif. It doesn't carry into Arabic.

**Motion**
- Motion explains state, causality or continuity. Reveals run once. Content must read with all decorative motion removed (`no-ai-design-slop`, `cinematic-gsap`).
- Animate transform and opacity only. Controls take about 160–220 ms (`operational-enterprise-ai`). The 0.75–1.1 s "cinematic" reveals are marketing-paced.
- No bounce, elastic or overshoot on health numbers. A spring overshoot briefly shows a false weight or fat value (from `cinematic-gsap`'s "avoid bounce" rule plus `html-demo`'s "numbers stay true").
- The state must read without the animation (`aria-busy`, `aria-current`); one animated accent per viewport (`beam-glow-states`).
- Pause offscreen work and clean up everything (`optimize-web-animations`). If loading runs long, say so instead of spinning forever (`fire-paper-loader`).
- If a word-split text reveal is ever used, test it with Arabic mixed with numerals. Wrapping words in inline-blocks can reorder bidi runs, and per-character splitting breaks Arabic letter joining.

**Honesty**
- Never invent metrics, activity or proof. Every number comes from a real scan (`no-ai-design-slop`, `audit-ai-design-slop`, `html-demo`).

**Process**
- Take before and after screenshots at identical viewport and state (`workflow-progress-screenshots`). Score screens against an anchored rubric such as "is the answer clear in 3 seconds?" (`workflow-score-to-target`).

## Red flags summary

- **No `allowed-tools`, no prompt injection, no runtime fetching of remote instructions** anywhere in the batch.
- **Package installs:** `beam-glow-states` (`border-beam`), `cinematic-gsap-lenis-motion-system` (`gsap lenis`), `illustration-vintage-emblem` (`playwright-core`).
- **Git and publishing:**
  - `optimize-web-animations` commits through a temporary git index and runs `rm -f /tmp/...`.
  - `publish-project-to-github` runs `gh repo create`, pushes, and turns on public GitHub Pages after running an unfetched shell script.
  - `x-bookmark-quote-posts` and `game-dev-combat-animation` commit or push.
- **Account and session access:**
  - `x-bookmark-quote-posts` reads the user's logged-in X bookmarks and their 100 latest posts.
  - `workflow-threads-manager` lists and archives other Claude sessions; archiving deletes their worktrees.
- **Agent fan-out:** `build-daily-inspiration-sites` (five Codex tasks), `game-dev-combat-skill-polish` and `workflow-score-to-target` (subagent judges), `iterate-until-verified`, `html-demo` (helper agents).
- **Bundled scripts that were not fetched** and would run unreviewed: every `illustration-*` kit, `browser-video-recording`, `build-daily-inspiration-sites`, `build-vesperfall-review-assets`, `publish-project-to-github`, `workflow-progress-screenshots`, `workflow-threads-manager`.
- **Remote pointers:** `landing-page/REFERENCES.md` links a raw `SKILL.md` from another author's repo (optional reading). `unicorn-studio` would make the product load a third-party SDK and remote scene JSON at runtime.
- **Behavioral:** `workflow-progress-screenshots` acts "without being asked". `no-ai-design-slop` is an always-on passive gate, which is intended, but it means it fires on every UI task.
