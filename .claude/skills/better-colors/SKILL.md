---
name: better-colors
description: Builds and checks color systems by generating palettes, naming semantic tokens, converting between formats and measuring contrast.
---

# Colors

## LevelUP notes

- **One OKLCH source, hex for Ionic.** Ionic reads `--ion-color-primary` and its `-rgb`, `-contrast`, `-contrast-rgb`, `-shade` and `-tint` variants, which `src/theme/applyBrand.ts` derives from the hex values in `src/brand.config.ts` (`parseHex` accepts only hex, shade and tint are RGB mixes, and the contrast text is picked by WCAG 2 luminance). Define each hue once in OKLCH, generate its hex and ramp steps from that with a color library, and never hand-edit a derived value.
- **Ionic keeps `primary`.** The `primary` → `accent` rename in **Before you finish** and [token-naming.md](token-naming.md) stops at Ionic's layer: `--ion-color-primary`, `color="primary"` and the Tailwind `primary` utilities stay. Apply the naming grammar to `--lu-*` tokens only, and note that `--lu-accent` is the amber badge color today, not the brand.
- **One switching mechanism, already in place.** Tokens live in `src/theme/tokens.css` (light in `:root`, dark in `:root.ion-palette-dark`) and reach Tailwind through `@theme inline` in `src/theme/tailwind.css`. `src/theme/theme.ts` sets the class even when following the system. Translate this skill's `.dark` and non-`inline` `@theme` examples to that setup instead of "fixing" it.
- **One accent, one attention color, no red on the body.** The single accent means action and positive progress: the primary button, progress rings, trend lines, "improved". Amber means "needs attention" only and takes dark text (measure the pair). Never use red on body metrics or their changes; red is for errors and destructive actions. Keep every status hue at least `15°` of OKLCH hue from the accent.
- **Dark is its own palette.** Lower the accent's chroma, widen the dark end and remeasure every pair in both themes. The intro and login screens (`.lu-on-ink`) stay dark in both themes, so measure them as a third set of surfaces.
- **No text on translucent surfaces.** Text sits on solid tokens, never on alpha fills, `color-mix()` with `transparent`, or `backdrop-filter` glass. The frosted-glass and glow look (`--lu-glass*`, `--lu-frost`, `--lu-brand-glow`) is being removed in the redesign.
- **Where literals live, and what the checks catch.** Color literals belong only in `src/theme/tokens.css` and `src/brand.config.ts`. `npm run check-colors` (run in CI) flags hex, `rgb()` and `hsl()` elsewhere but not `oklch()`, so check new `oklch()` literals by hand. Pass or fail is WCAG 2 (axe-core in `e2e/a11y.spec.ts`); APCA values are extra information.

On any conflict, LevelUP's `ui-standards` and `ionic-mobile-experience` skills win.

---

This skill builds and audits color systems. It generates ramps, maps their steps to roles and token names, converts notation and measures rendered contrast pairs.

Never report a contrast value you did not measure, and never estimate a color you could compute. Notation, a tinted neutral and a gradient's interpolation space are project choices, not findings. A broken role mapping, a failing pair and an out-of-gamut step are findings. Perceived lightness throughout means OKLCH `L`, from `0` to `1`.

Whether a pair is required to pass belongs to `better-accessibility`. Surfaces, shadows and icon color belong to `better-ui`.

## Match the project's color system

Reuse the project's tokens and notation. A consistent hex system beats hex with `oklch()` scattered through it.

For a new system, `oklch()` is the best default, because its numbers behave the way the ramp rules below describe. Everywhere else, a color library produces the same ramp in the project's own notation ([color-formats.md](color-formats.md)).

## A system is ramps, not colors

One neutral ramp, one accent ramp and only the status ramps the product actually renders. A `warning` ramp nothing imports is maintenance for zero pixels. A second accent hue earns its place only when two things must be distinguishable at a glance. Otherwise use more steps of the one accent ramp.

## Every step has a job

A ramp is not a gradient to pick from by eye. Each step exists because a role needs it: page background, component hover, border, solid fill, body text. Do not generate a step no role consumes. Both the Tailwind `50`–`950` and Radix `1`–`12` conventions map to those roles ([palette-structure.md](palette-structure.md)).

## Name primitives by hue, semantics by role

Primitives name a value (`--blue-600`) and are never applied in a component. Semantic tokens name a job (`--color-text-secondary`), point at a primitive and are the only tier components reference. That seam is what lets a theme repoint colors without touching components ([token-naming.md](token-naming.md)).

## Use a token only in its role

Never borrow a token because its value is right today. A separator used as a text color works until borders get lighter, and then the text goes with them. If a role has no token, add the token.

## Hold the hue across the ramp

A ramp holds one hue end to end, peaks in vividness mid-ramp and steps more finely at the light end. Build it with a color library, never by eye ([palette-generation.md](palette-generation.md)).

## One color, one meaning

Use a color for one purpose across the whole interface, treating anything within `15°` of OKLCH hue as the same color ([color-usage.md](color-usage.md)). Never let color be the only carrier of meaning. Pair it with an icon or a label, a requirement `better-accessibility` owns.

## Fill exactly one action per view

When filled color encodes primary emphasis, one primary action gets it and peers stay neutral. Put the color on the background, not the label. A filled button reads as primary across the room; accent-colored text on a neutral button reads as a link.

Keep an established hierarchy that already signals emphasis another way. Several colored backgrounds are fine when they encode distinct states or categories rather than competing as peers.

## Measure the rendered pair, then report

Measure a foreground against the background it actually renders on, not the page background. When a pair fails, report the pair, its measured value and the threshold it misses, then leave the colors alone. They are a design decision. Change them only when asked, and remeasure after ([contrast.md](contrast.md)).

## Pick a gradient's interpolation space

The space is a look, not a correctness setting. Default to `in oklab`, and reach for `in oklch` when a two-hue gradient goes gray in the middle ([color-usage.md](color-usage.md)).

## Before you finish

| Pattern | Fix |
| --- | --- |
| A hex, `rgb(` or `oklch(` literal in a component file where a token exists | Reuse or add the role token, in the project's notation |
| One `oklch(` value in a codebase otherwise written in hex | Write it in the established notation unless a migration is in scope |
| `var(--blue-600)` or `bg-blue-600` in a component file | Point a semantic token at the primitive and use that |
| A semantic name containing a hue or a component, as in `--color-blue-button` or `--color-sidebar-gray` | Rename it for its role: `--color-accent-solid`, `--color-bg-surface` |
| `--color-primary` and `--color-text-primary` both defined | Rename the brand token `accent` |
| A `border` or `separator` token inside `color:`, or a `text` token inside `background:` | Add a token for the missing role |
| `hsl(` ramp values that differ only in lightness | Rebuild with a constant perceived hue, in the project's notation |
| `50`–`200` stepping as far apart in OKLCH `L` as mid-ramp steps do | Tighten the light end to about `0.04`–`0.05` per step |
| One chroma or saturation number copied across every hue's ramp | Use the same proportion of each hue's own maximum |
| A status hue within `15°` of the accent hue | Move it at least `15°` away, or give the destructive action a distinct treatment |
| Dark tokens equal to the light ramp in reverse step order | Lower the accent's chroma, widen the dark end and remeasure every pair |
| Color tokens set under both `prefers-color-scheme` and a `.dark` class | Pick one switching mechanism and use it throughout |
| A contrast fix that changes hue and leaves lightness | Change lightness, the channel contrast responds to |
| `prefers-contrast: more` overriding a color for both appearances in one block | Give each appearance its own increased-contrast value |
| Text on a color with alpha, such as `/50`, `rgba(` or `color-mix(` with `transparent` | Measure the rendered result, or use a solid token |
| `text-white` on a Tailwind `500` fill | Measure and report it; white on most `500` hues and several `600` hues fails 4.5:1 |
| `oklch()` chroma beyond sRGB with no sRGB value declared before it | Declare the sRGB value first, then the vivid one inside `@media (color-gamut: p3)` |

## Reporting

**Verification.** Without a browser: token values, the gamut of every declared color, both theme blocks present and contrast computed from the declared token pair. With one: the background actually rendered behind the text, including opacity and any image beneath it, measured in both light and dark. Report every check you could not run as `Not verified`.

A standalone review takes its severity ladder and format from [reporting.md](reporting.md).
