# Skills digest: out-of-scope-sweep

Batch: 111 skills whose main topics sit outside the LevelUP stack: video (HyperFrames, Remotion, HTML-rendered films), Three.js / 3D / WebGL, Vue / Nuxt, React Native, SwiftUI, and slide decks. The batch contains no shadcn skill.
Source: `discovery/ui-skills/_batches/out-of-scope-sweep.json` and the skill folders under `discovery/ui-skills/`.
Read as data only. No skill commands run, no skill URLs fetched, nothing installed. The only network calls were `gh api repos/<owner>/<repo>/license` lookups for the top picks.

Relevance: 0 none, 1 low, 2 useful, 3 high. "dashboard-later" = mainly useful for the future React + Vite + shadcn gym dashboard.

**Counts:** 3 high: 0 · 2 useful: 5 · 1 low: 21 · 0 none: 85 · dashboard-later: 0

**Summary.** Nothing in this batch is core to the app redesign. What it offers:

- a few motion rules that carry over to in-app GSAP and motion/react work;
- a clear path to a short promo video and marketing stills;
- a little native-feel vocabulary (haptics, semantic colour roles).

No skill covers health-data presentation or shadcn. Every match for "health" or "fitness" was a false hit, such as font weight.

## All skills

| pathSlug | rel | reason | red flags |
|---|---|---|---|
| 1weiho/cinematic-shot | 2 | Strongest promo-film and marketing-stills method in the batch. Its restraint (no glow, flares or added colour) matches the brief, and its Appear / Select / Press recipes work as in-app motion tokens. | None. The references contain ffmpeg examples only. |
| antfu/nuxt | 0 | Nuxt SSR and routing. | None. |
| antfu/pinia | 0 | Vue state management. | None. |
| antfu/vitepress | 0 | Vue docs-site generator. The RTL flag is VitePress i18n. | None. |
| antfu/vue | 0 | Vue 3 Composition API. | None. |
| arifszn/slide-wright | 0 | Animated web slide decks. | None. |
| callstackincubator/react-native-best-practices | 1 | RN / Hermes performance. Only the "measure, fix, re-measure; no memoization without profiler evidence" guardrails carry over to React web. | Shell: `agent-device react-devtools …`, `npx expo --version`. Has its own security-notes section. |
| cloudai-x/threejs-animation | 0 | Three.js clips, skeletal and morph animation. | None. |
| cloudai-x/threejs-asset-pipeline | 0 | glTF compression. | Shell: unpinned `npx @gltf-transform/cli …`. |
| cloudai-x/threejs-fundamentals | 0 | Three.js scene basics. | None. |
| cloudai-x/threejs-geometry | 0 | Three.js geometry. The RTL flag is a false hit. | None. |
| cloudai-x/threejs-interaction | 0 | Raycasting and orbit controls. | None. |
| cloudai-x/threejs-lighting | 0 | 3D lights and shadows. | None. |
| cloudai-x/threejs-loaders | 0 | 3D asset loading. | None. |
| cloudai-x/threejs-materials | 0 | PBR and shader materials. | None. |
| cloudai-x/threejs-performance | 0 | 3D draw-call and GPU tuning. | None. |
| cloudai-x/threejs-postprocessing | 0 | Bloom and depth of field, the glow look being removed. | None. |
| cloudai-x/threejs-react-three-fiber | 0 | R3F. A 3D body model would be off-brief; the plan uses hand-made SVG. | None. |
| cloudai-x/threejs-shaders | 0 | GLSL / TSL. | None. |
| cloudai-x/threejs-textures | 0 | Texture workflows. | None. |
| danny/motion-ad | 1 | A paused GSAP timeline rendered frame by frame to MP4, with a "phone → before/after scan reveal" beat, fits LevelUP in concept. The template and scripts are not in the fetched files, and the template look (3D wall, orbs, circle wipe) is flashy. | No YAML frontmatter. WebFetch of the destination page. Scrapes site images with a spoofed browser user agent. `npm install` inside the skill folder, `npx playwright install chromium`, `pip install pillow`. Writes to `~/Downloads`. Not on GitHub, so no licence found. |
| dimillian/swiftui-ui-patterns | 1 | SwiftUI architecture. Two generic rules carry over: enum-driven modals instead of several booleans, and scroll reveals driven by one normalized progress value. | None. |
| figma/figma-3d-transforms | 0 | 3D tilt inside the Figma canvas. At most useful for store-screenshot mockups. | None. |
| flornkm/webgl-components | 0 | WebGL orbs, glass and iridescent decor, the look being removed. | Shell: a local `python3 -m http.server` probe. |
| google-gemini/gemini-omni-flash-api | 0 | Generative AI video. A promo should show the real UI. | `pip install -U google-genai`. Links to remote `.md` docs. Paid API. |
| heygen-com/canopy-part-title | 0 | HyperFrames title block (leaves). | Install via `npx hyperframes add` (local HyperFrames CLI). |
| heygen-com/captions-overlay | 1 | Caption rules for a voiced promo: captions overlay the film with no reserved band, most phrases ride a rail, a few are embedded. HyperFrames-specific. | None. |
| heygen-com/changelog-video | 0 | Weekly changelog video with a branded VO. | Shell: ffmpeg, node scripts, HeyGen TTS. |
| heygen-com/code-slice-hero | 0 | HyperFrames title block. | `npx hyperframes add`. |
| heygen-com/cuboid-carousel | 0 | HyperFrames 3D carousel block. | `npx hyperframes add`. |
| heygen-com/cut-the-curve | 1 | GSAP transition catalog. Only the "stagger by element weight" idea (heavy elements travel further and longer, light ones snap) carries over, at gentler values. | None. |
| heygen-com/figma | 0 | Figma → HyperFrames import. | Usage-beacon telemetry at skill start. Reads `FIGMA_TOKEN` from the shell or the project `.env`. |
| heygen-com/frost-sequence-camera-orbit | 0 | Frosted ice logo block. | `npx hyperframes add`. |
| heygen-com/glass-shard-title | 0 | Glass-shard title block. | `npx hyperframes add`. |
| heygen-com/hyperframes | 1 | HTML + GSAP video compositions match LevelUP's motion stack, but they need the HyperFrames CLI and ecosystem. | Usage-beacon telemetry at skill start (`npx hyperframes events`). |
| heygen-com/hyperframes-cli | 0 | CLI reference. | Usage beacon. Sends `feedback --rating` after renders. Cloud, Lambda and Cloud Run rendering. |
| heygen-com/hyperframes-registry | 0 | Block registry. | Usage beacon. `npx hyperframes add` / `catalog`. |
| heygen-com/media-use | 0 | Music, SFX, TTS and LUT resolver. | Usage beacon. HeyGen CLI sign-in. Generation calls. |
| heygen-com/motion-doctrine | 2 | Motion laws that carry over to in-app motion: no idle wobble, stillness before the climax, timing budgets, no bounce or elastic eases, directions that carry meaning. | Claims its rules "SUPERSEDE generic / upstream motion guidance". Tells the agent to run node gate scripts that are not in the fetched files. `metadata.internal: true`. |
| heygen-com/orbit-card | 0 | Card-orbit block. | `npx hyperframes add`. |
| heygen-com/oversized-cursor | 0 | Big desktop cursor that leads the eye. The app is touch-only. | None. |
| heygen-com/remotion-to-hyperframes | 0 | Port Remotion to HyperFrames. | Usage beacon. |
| heygen-com/reverse-any-video | 0 | Recreate an existing video. | Usage beacon. |
| heygen-com/seam-craft | 0 | HyperFrames seam render mechanics. | None. |
| heygen-com/slideshow | 0 | HyperFrames decks. | Usage beacon. |
| heygen-com/style-sampling | 0 | New episode in a stock video style. | Usage beacon. `npx hyperframes auth status` on every run (sign-in, credits). |
| heygen-com/wireframe-portal-title | 0 | Title block. | `npx hyperframes add`. |
| jdhruv14/ascii-diorama | 0 | ASCII 3D miniatures. | None. |
| kosta4a/stopmotion-video | 0 | Beat-synced stop-motion video style. Off-brand niche. | Shell: `npx create-video@latest`, `npx remotion render`, audio scripts. |
| latent-spaces/brag | 1 | Full launch-video flow that delegates to HyperFrames. brag-slim does the same job self-contained. | Model-conditional routing ("If you are Claude Opus 5.5 … switch"). Hand-off to HyperFrames (`npx hyperframes check`) and its telemetry ecosystem. |
| latent-spaces/brag-slim | 2 | Self-contained 15–25 s promo recipe built from the project's own components. Includes a placeholder-records rule for health data and a vertical safe band. | Clean. Asks before fetching tools (`uv run --with imageio-ffmpeg`, `npx -y`), treats fetched content as data, never reads `.env` or keys. |
| memex-lab/gemini-tts | 1 | Promo voiceover via Gemini TTS. Egyptian Arabic quality not verified. | `npm install @google/genai`. Runs bundled scripts. Needs an API key. |
| memex-lab/product-launch-video | 1 | Remotion launch-video planning: pacing ratios per length, storyboard schema, an "AI slop" list. Its "unlimited visual budget" and dislike of plain backgrounds clash with the calm brief. | Shell: Remotion CLI. Has an optional asset-generation phase. |
| mengto/3d-cloth-material | 0 | 3D cloth shading. | None. |
| mengto/3d-falling-leaves | 0 | 3D particles. | None. |
| mengto/3d-four-seasons | 0 | Seasonal 3D scenes. | None. |
| mengto/3d-high-poly-models | 0 | 3D modelling. | None. |
| mengto/3d-high-resolution-textures | 0 | 3D textures. | None. |
| mengto/3d-metal-material | 0 | 3D metal. | None. |
| mengto/3d-orbit-inspect-demo | 0 | 3D inspect view. | None. |
| mengto/3d-paper-material | 0 | 3D paper. | None. The shell flag is a false hit on "curl". |
| mengto/3d-retina-resolution | 0 | WebGL DPR handling. | None. |
| mengto/3d-sky-background | 0 | 3D sky. | None. |
| mengto/3d-sky-rays | 0 | God rays. | None. |
| mengto/3d-ultra-realistic-water | 0 | Ocean shader. | None. |
| mengto/3d-underwater-god-rays | 0 | Underwater rays. | None. |
| mengto/3d-virtual-tour | 0 | 3D walkthroughs. | None. |
| mengto/3d-wood-lighting-scorecard | 0 | 3D wood lighting with a self-scoring loop. | None. |
| mengto/3d-wood-material | 0 | 3D wood. | None. |
| mengto/aura-asset-images | 0 | Stock image URLs. | None. |
| mengto/cobejs | 0 | WebGL globe. | None. |
| mengto/create-ai-avatar | 0 | AI avatar from your own footage and voice. | HeyGen and ElevenLabs API keys, paid training, uploads. Confirms prices first. |
| mengto/digital-twin | 0 | Photoreal self-clone (stills, voice, talking clips). | Face and voice cloning. curl API wrapper, API keys, paid credits. Has consent steps. |
| mengto/game-dev-character-model | 0 | Rigged 3D game characters. | Paid generation credits. `npm i playwright-core`. |
| mengto/html-explainer-video | 1 | One-minute voiced explainer. A few rules carry over: never show a wireframe, check every claim, licence the fonts for a public film. | Paid Fil MCP credits, ElevenLabs voice, curl uploads. Asks before spending. |
| mengto/html-reel | 1 | Most specific 9:16 reel rules in the batch: cover frame, safe area, captions, loudness. Its tooling is not in the fetched files or is paid. | Paid Fil MCP and an ElevenLabs voice clone. About 15 scripts are not in the fetched files. Asks before spending over $1. |
| mengto/threejs | 0 | Three.js basics. | None. |
| mengto/unsplash-asset-images | 0 | Stock image URLs. | None. |
| mengto/webgl-landing-steering | 0 | WebGL landing pages. | None. |
| millionco/improve-threejs | 0 | Three.js / R3F audit. | Fetches "canonical recipe" prompts from `react.doctor/prompts/rules/<plugin>/<rule>.md` at runtime. Runs unpinned `npx react-doctor@latest`. |
| moguzbulbul/blueprint-animation | 1 | Animates UX decisions from a Figma design. Only useful for a "before/after redesign" post. | None. |
| oso95/scroll-world | 0 | AI-generated 3D scroll-through landing page. | Frontmatter `allowed-tools: Bash, Read, Write, Edit, AskUserQuestion, Skill`. Pay-per-clip video billing (Monid / Higgsfield). curl uploads. |
| remotion-dev/remotion-best-practices | 1 | Router for the Remotion set. Only relevant if the promo is built in Remotion. | Shell: `npx remotion studio` / `render`. |
| remotion-dev/remotion-captions | 1 | Captions for a Remotion promo. | Fetches a component's source from remotion.dev and saves it into the project unchanged. |
| remotion-dev/remotion-create | 1 | Remotion project scaffolding. | `npx create-video@latest --yes`. |
| remotion-dev/remotion-docs | 0 | Remotion docs lookup. | Fetches remote docs pages at runtime. |
| remotion-dev/remotion-interactivity | 1 | Studio-editable markup. remotion-markup depends on it. | `npx remotion add …`. |
| remotion-dev/remotion-maps | 0 | Maps in video. | None. |
| remotion-dev/remotion-markup | 2 | Core Remotion authoring rules, plus an Arabic rule (set the direction, animate by word, keep letters joined) that also applies to in-app text reveals. | `npx remotion add`, ffmpeg. References `arabic-text.md`, which is not in the fetched files. |
| remotion-dev/remotion-multimedia | 0 | Media metadata helpers. | Points to a remote `llms.txt`. |
| remotion-dev/remotion-render | 1 | Render and still export if Remotion is chosen. | `npx remotion render`. Licence-key handling. |
| remotion-dev/remotion-saas | 0 | Video-rendering SaaS (Player, Lambda). | AWS credential setup. |
| remotion-dev/remotion-studio | 0 | Studio CLI flags. | `npx remotion studio`. |
| remotion-dev/remotion-upgrade | 0 | Remotion upgrades. | `npx skills update …` rewrites installed skills. |
| rieranthony/product-film | 2 | Remotion film built from the product's own components and tokens. Its quality floor matches the brief. | Shell: `npx remotion still`, `uv run`, python beat scripts (not in the fetched files). Asks before committing or pushing. |
| samyost1/3dicon | 0 | Animated 3D icons as WebP. | `pip install -r requirements.txt`. Calls image and video generation models. |
| slidevjs/slidev | 0 | Vue slide decks. | Global `npm i -g pnpm`. |
| vercel-labs/react-native-skills | 1 | RN rule index; the rule files themselves were not fetched. "Animate only transform and opacity" and "hoist Intl objects" carry over (useful for Arabic count-ups with `Intl.NumberFormat`). | None. |
| vincentwei1021/video-shotcraft | 1 | Remotion product videos from screenshots with 2.5D camera moves. Docs are Chinese-only. | `pip install`, a local workbench server, Freesound downloads. |
| vuejs-ai/create-adaptable-composable | 0 | Vue composables. | None. |
| vuejs-ai/vue-best-practices | 0 | Vue architecture. | None. |
| vuejs-ai/vue-debug-guides | 0 | Vue debugging. | None. |
| vuejs-ai/vue-jsx-best-practices | 0 | Vue JSX. | None. |
| vuejs-ai/vue-options-api-best-practices | 0 | Vue Options API. | None. |
| vuejs-ai/vue-pinia-best-practices | 0 | Pinia. | None. |
| vuejs-ai/vue-router-best-practices | 0 | Vue Router. | None. |
| vuejs-ai/vue-testing-best-practices | 0 | Vue testing. | None. |
| vueuse/vueuse-functions | 0 | VueUse composables. | None. |
| wshobson/mobile-ios-design | 1 | Best native-feel item in the batch: haptic vocabulary, semantic colour roles, Dynamic Type reflow. Generic, SwiftUI-only code, and it promotes frosted materials. | None. |
| wshobson/react-native-design | 1 | RN / Reanimated code. Its press-scale, sheet and swipe patterns are already covered by Ionic and motion/react. | None. |
| zarazhangrui/frontend-slides | 0 | HTML slide decks. | `pip install python-pptx`, `npx vercel` deploy, `brew install node`. |

## Top picks

Ordered by value to the redesign. Two are low-relevance (rel 1) and are listed only because they are the best of their kind in this batch.

### 1. heygen-com/motion-doctrine (rel 2): mine 6 rules

- **Contributes** to "motion that means something":
  - **No idle wobble.** Breathe, float, drift and glow-pulse loops are banned as sustained motion. A screen that has finished arriving stays still. That rules out the current glowing look.
  - **Stillness before the climax.** Schedule a 0.3–0.75 s pause between an action and its result. For the "new result" reveal: the one-sentence answer lands, a beat, then the count-up and the ring fill.
  - **Causal motion.** A reaction starts on the frame of its cause, never "shortly after". Big elements rebound slower; small ones snap.
  - **Timing budgets.** One entry ≤ ~800 ms; exit ≈ 75% of entry; total stagger ≤ 500 ms (tighten per-item delay at 8+ items); no `bounce` or `elastic` eases. Similar elements share one ease and duration, which maps straight to motion tokens. Ease names are GSAP's.
  - **Reserved directions.** One default direction means "next". Upward motion is spent only on meaning (a conclusion or reveal rising), so it can mean "improved" and stay rare.
- **Conflicts:**
  - It is written for multi-scene video, so the seam rules (cut mid-motion, vector ledger, Seam Gate) don't apply to app screens.
  - Its default direction is LEFT; make it logical inline-end so it mirrors in Arabic RTL.
  - It allows `back.out(1.4–1.7)` overshoot, which a calm canvas may not want.
  - It never mentions `prefers-reduced-motion`; LevelUP has to add that.
- **Size:** 11.8 KB, no references. **License:** Apache-2.0 (heygen-com/hyperframes).
- **Install or mine:** mine the rules into the motion spec. Don't install: it claims to supersede other motion guidance and routes to HyperFrames scripts that are not in the fetched files.

### 2. 1weiho/cinematic-shot (rel 2): install whole for the promo; mine the motion table now

- **Contributes:**
  - **Film grammar.** 45–55 s and 8–10 "hero shots" of the real UI at a steep oblique angle with shallow focus and a slow, motivated camera drift. Hard cuts on the action. Process shots of 5–9 s alternate with 2–3.5 s accents. One wide, near-frontal shot is saved for the payoff (for LevelUP, the whole result screen answering "did I improve?"). It ends on one line of copy (≤ 5 words) and a still logo.
  - **Restraint that matches the brief.** The stage follows the product's real theme (a light studio or a black void). "Colour belongs to the product": no glows, flares, rings, tinted light or animated logo.
  - **Stills section.** Hero image, Open Graph card (1200 × 630, subject inside the central 80%), square and 4:5 portrait. "Freeze a moment, not a state". Render at 2×, Lanczos downsample, light grain, lossless PNG. Good for store screenshots and launch posts, not for in-app share cards.
  - **In-app motion recipes** (`look.md`, "Other motion"):
    - Appear: opacity 0 → 1, translateY 12 → 0 px, blur 6 → 0 over 0.35 s on `cubic-bezier(0.22, 1, 0.36, 1)`, no overshoot.
    - Select: the pill slides over 0.35 s ease-in-out.
    - Press: scale 0.97 in 0.08 s, back in 0.2 s.
    - Connectors draw on with `stroke-dashoffset` over 0.4–0.6 s, which fits trend lines.
  - **Recording the real app.** Install a fake clock before navigation, step CSS animations through `document.getAnimations()`, click with `element.click()`, capture regions with CDP `clip.scale`.
- **Conflicts:**
  - It bans music and captions and has no 9:16 film format; social reels usually need all three.
  - Its per-glyph "stipple" reveal and 12–13 characters-per-second typing would break Arabic letter joining. Arabic must reveal by word or line.
  - GSAP and motion/react need the fake requestAnimationFrame clock (the skill installs one); check that Ionic's transitions step too.
  - The Appear blur is expensive on large surfaces in Android WebViews. Keep it to small elements in the app.
- **Size:** 30.7 KB SKILL.md, 62.1 KB with 2 references (both fetched). **License:** MIT.
- **Install or mine:** install whole when making the promo; it is self-contained. Mine the motion table into the token spec now.

### 3. latent-spaces/brag-slim (rel 2): install whole for the promo

- **Contributes:** a one-file, tool-agnostic recipe for a 15–25 s launch video built from the project's own components and stylesheet.
  - **Structure.** A hook in the first 2 s. A stranger must learn what it is, who it is for and how to get it. Show the product in use: entry → key action → result (scan arrives → plain-language answer → comparison).
  - **Health data.** "If the product displays … health or finance records, show the real interface with obviously placeholder records, never rows from the project's database." This applies directly to InBody data.
  - **Readability.** A line stays settled about 0.3 s per word, and every frame should be postable. Check stills from mid-transition before the full render. Bake the strongest settled frame in as frame 0 so it becomes the thumbnail.
  - **Vertical safe band.** Keep readable content between y 250–1536 of 1920 and clear of the right 140 px in the lower half.
  - **Tones.** `polished` (3–4 scenes, long holds, soft fades) or `deadpan` fit a calm brand.
  - **Clean hygiene.** It never reads `.env` or keys, treats fetched content as data, and asks before installing tools.
- **Conflicts:**
  - It composes its own music and SFX, which is a quality risk; a licensed track may be better.
  - Its default tone is "punchy, playful".
  - Platform overlays may sit on the other side for Arabic-language viewers, so keep both lower corners clear.
  - It writes `brag-output/` into the current directory; run it outside the repo or ignore that folder.
  - Frames must be a pure function of time, so GSAP timelines have to be seeked per frame.
- **Size:** 11.3 KB, no references. **License:** MIT (latent-spaces/brag).
- **Install or mine:** install whole (one file) when the promo is due. Prefer it over `brag`, which hands off to HyperFrames.

### 4. rieranthony/product-film (rel 2): install from the repo only if the promo is built in Remotion

- **Contributes:** a Remotion film built beside the codebase that reuses the real components, tokens, logo and copy. "Their design wins", and it interviews the user before writing the story.
  - **Quality floor:**
    - Only the product's own surfaces, colours and borders.
    - Fewer words rather than smaller words.
    - Text is never covered, never crosses other text, and never re-centres while it builds.
    - Loading states keep their width and use the product's own loading pattern (skeletons).
    - Scene boundaries land on bars, and a muted landing loop must still read.
    - No glows, particles, click rings, bouncy easing or shaders.
  - **Traps it documents:**
    - Remotion masters are limited-range BT.601, so a `#0a0a0a` page comes out as `#171717` unless you check.
    - `interpolateColors` can't parse `color-mix()`, so animated colours need hex tokens.
    - Async avatar components can render empty.
    - Dashed borders crawl while a box resizes.
    - Pin every `@remotion/*` version.
- **Conflicts:**
  - Tailwind v4 colours are usually `oklch()` / `color-mix()`, so animated colours need hex twins.
  - Remotion bundles with webpack, not Vite, so the app's import aliases must be mapped.
  - Ionic web components and GSAP / motion/react animations run their own clocks and need frame-driven twins.
  - Only the 5.6 KB index was fetched; `reference/`, `templates/kit/` and `scripts/` are not in the fetched files.
  - Remotion itself needs a company licence unless the team qualifies for the free tier.
- **Size:** 5.6 KB fetched (index only). **License:** MIT (Rieranthony/product-film-skill).
- **Install or mine:** install whole from the repo if Remotion is chosen. Otherwise mine the quality floor as a promo checklist.

### 5. remotion-dev/remotion-markup and its set (rel 2, only with Remotion): install the set, mine the Arabic rule now

- **Contributes:**
  - The authoritative Remotion rules: animate with `useCurrentFrame()` and `interpolate()`; CSS transitions, keyframes and Tailwind animation classes don't render; time with `Easing.bezier` / `spring`; keep `useCurrentFrame` in the smallest component; derive seconds from `fps`. It also covers transitions, text highlights, text measurement, fonts and captions.
  - The Arabic rule: "set the base direction, animate by word, and split letters only in a way that keeps them joined." This also applies to LevelUP's in-app GSAP text reveals: no per-character SplitText on Arabic.
- **Set and sizes:**
  - `remotion-best-practices`: router, 4.2 KB.
  - `remotion-create`: 4.0 KB.
  - `remotion-markup`: 13.8 KB, 112.7 KB with 30 references.
  - `remotion-interactivity`: 15.5 KB; markup depends on it.
  - `remotion-render`: 5.3 KB.
  - `remotion-captions`: 14.9 KB.
- **Conflicts:** the same as product-film (frame-driven only, webpack instead of Vite, Ionic). `arabic-text.md` is referenced but not in the fetched files. The router pins version 4.0.545.
- **License:** none (remotion-dev/skills returns 404). The Remotion library has its own licence: a free tier, otherwise a company licence. The render and saas skills handle licence keys.
- **Red flags:**
  - captions fetches a component's source from remotion.dev and saves it unchanged.
  - docs fetches pages at runtime.
  - upgrade runs `npx skills update` over installed skills.
- **Install or mine:** install the set only if Remotion is the promo path. Mine the Arabic rule now.

### 6. mengto/html-reel (rel 1): mine rules for a 9:16 reel

Instagram and TikTok reels are the likely main channel for gym promos, and this skill has the most specific vertical-video rules in the batch.

- **Contributes:**
  - **The first frame is the cover.** Show the whole title landed over the best picture, held 0–0.2 s, and save it as `cover.jpg`. Feeds and grids show frame 0.
  - **Safe area.** Everything meant to be read stays within y 280–1640 of 1920 (inside the 3:4 grid crop) and at least 16 px from the sides.
  - **Type and captions.** Setup lines about 52 px and payoff words 90–110 px on a 540-wide stage. Captions about 78 px in a heavy sans, up to 3 words, the spoken word in the accent colour, never over a face or the UI being shown.
  - **Pacing and sound.** New framing every 2–4 s. Cut to word timestamps, never to guesses. SFX at 0.1–0.2 volume under the voice. −14 LUFS, true peak under −1 dBTP.
  - **Honesty.** Say only what the source says.
- **Conflicts:**
  - It is built on Fil's paid video editor over MCP and an ElevenLabs voice clone.
  - Its ~15 scripts and its references are not in the fetched files.
  - The Inter Tight captions need an Arabic face, and word-by-word caption highlighting must keep Arabic words whole.
- **Size:** 27.5 KB (scripts not in the fetched files). **License:** MIT (MengTo/Skills).
- **Install or mine:** mine the rules into a promo checklist; don't install.

### 7. wshobson/mobile-ios-design (rel 1): mine 5 rules

This is the only native-feel material in the batch worth keeping.

- **Contributes:**
  - **Haptic vocabulary**, mapped to `@capacitor/haptics`: a selection tick when switching scans or segments, a success notification when a new result shows improvement, a warning for an amber metric, and a light impact on primary presses.
  - **Semantic colour roles** as a naming model for light and dark tokens: label 1/2/3, background / secondary / grouped, fill tiers, and separator vs opaque separator.
  - **Dynamic Type reflow.** At large text sizes, side-by-side rows switch to stacked. The same rule suits 320 px.
  - **Defaults and states.** Spacing of 16 / 8 / 24 and list-row insets of 12 / 16. Empty and error states have one clear action ("No scans yet" plus what to do).
  - **Accessibility.** Combine a metric card into one accessible element: "Muscle, 35.8 kg, up 0.6 kg since last scan".
- **Conflicts:**
  - All code is SwiftUI.
  - It recommends `.ultraThinMaterial` and `.regularMaterial` blur, which is the frosted glass the owner wants gone.
  - It suggests blue and purple tints and SF Symbols, which are iOS-only; Android needs its own conventions.
  - It says nothing about presenting health data.
- **Size:** 6.9 KB, 49.4 KB with 3 references. **License:** MIT (wshobson/agents).
- **Install or mine:** mine the rules above and skip the rest.

### Not picked, worth knowing

danny/motion-ad has the approach closest to LevelUP's stack: one HTML page, a paused GSAP timeline, `window.seek(t)`, a Playwright screenshot per frame, then ffmpeg. Its "before → after scan reveal" beat is exactly the comparison story. However, its template and scripts are not in the fetched files, it has no frontmatter and no licence, and its look is flashy. Reuse the idea, not the skill.

## Notable red flags

- **HeyGen HyperFrames family, usage beacon.** Nine skills (figma, hyperframes, hyperframes-cli, hyperframes-registry, media-use, remotion-to-hyperframes, reverse-any-video, slideshow, style-sampling) tell the agent to run `npx hyperframes events --skill=<name>` when the skill starts. This sends telemetry that is account-linked when signed in (with an opt-out). hyperframes-cli also sends `feedback --rating` after renders, and heygen-com/figma reads `FIGMA_TOKEN` from the shell or the project `.env`.
- **heygen-com/motion-doctrine, precedence claim.** It says its rules "SUPERSEDE generic / upstream motion guidance", a precedence claim aimed at the agent. Treat it as data.
- **oso95/scroll-world, pre-approved tools.** Its frontmatter sets `allowed-tools: Bash, Read, Write, Edit, AskUserQuestion, Skill`. It also bills video per clip (Monid / Higgsfield) and uploads with curl.
- **millionco/improve-threejs, remote prompts.** It fetches "canonical recipe" prompts from `react.doctor/prompts/rules/…` at runtime and runs unpinned `npx react-doctor@latest`.
- **remotion-dev, remote code and docs.** remotion-captions saves remotely fetched source unchanged. remotion-docs and remotion-multimedia fetch remote docs or `llms.txt`. remotion-upgrade runs `npx skills update`, which rewrites installed skills.
- **latent-spaces/brag, model routing.** It switches behaviour by model name ("If you are Claude Opus 5.5 …") and hands off to HyperFrames.
- **danny/motion-ad, scraping.** It has no frontmatter, WebFetches the target page, scrapes images with a spoofed user agent, runs `npm install` inside the skill folder, and writes to `~/Downloads`.
- **MengTo create-ai-avatar and digital-twin, cloning.** Face and voice cloning with API keys and paid credits; both include consent steps.
- **No classic prompt injection.** Nothing like "ignore previous instructions" or hidden directives turned up anywhere in the batch.
