# Round 3 brief: one shared palette, compete on UI/UX

The owner's direction: **dark app, major colors from the LevelUP logo, re-colorable per gym brand.** Every agent uses EXACTLY the palette below; you compete only on UI and UX: structure, navigation, components, icons, data visualization, interaction, delight.

Read first: `../round-1/BRIEF.md` (product, data, copy, Arabic rules, page rules), `c:\Users\aliel\Downloads\LevelUP\discovery\DISCOVERY.md` (decisions and "What the InBody data requires") and `c:\Users\aliel\Downloads\LevelUP\discovery\ux-patterns.md`. Look at the logo: `c:\Users\aliel\Downloads\LevelUP\levelup-frontend\docs\business-technical-plan-source\logo.png`. Useful skills (read SKILL.md): `levelup-frontend\.claude\skills\interface-design`, `frontend-design`, `better-ui`, `better-accessibility`. Do not modify any repo file.

## The palette (use these exact tokens; no other colors)

**Neutrals (fixed, violet-tinted dark):**
`--bg #0C0A14` · `--surface-1 #15121F` · `--surface-2 #1D1929` · `--surface-3 #26213A` · `--border #2E2843` · `--text #F4F2FA` · `--text-muted #A9A3BF` · `--text-faint #6F6987`

**Brand layer (swaps per gym; default = LevelUP logo):**
`--brand #8B5CF6` (buttons, active tab, selection, hero accents) · `--brand-strong #6B3BF5` (pressed, fills) · `--brand-soft #B98CFF` (brand text/icons on dark) · `--brand-tint #2A1F4D` (tinted containers) · `--on-brand #FFFFFF` · `--brand-gradient linear-gradient(135deg, #E19CFB 0%, #B98CFF 45%, #6B3BF5 100%)`
Use the gradient sparingly: the hero element, the primary button, the wordmark's "UP". Never as page background.

**Meaning layer (fixed in every gym, never follows the brand):**
`--good #4ADE9A` (real improvement) · `--attention #FFC857` (needs attention; always with an icon, dark text `#2A1D00` on fills) · `--stable #8B8AA3` (about the same / within noise) · `--muscle #5B9CFF` · `--fat #F2A65A` · `--water #3FD0E0` · `--lean #C9C3E3` (fat-free mass). Never red on body metrics.

**Gym re-coloring demo (required):** include a strip showing your Home hero/header re-themed for two other gyms by swapping ONLY the brand layer: "Iron Box" brand `#FF6A1A` (orange) and "Pulse Gym" brand `#12B5A6` (teal), deriving `--brand-strong`, `--brand-soft`, `--brand-tint` and a two-stop `--brand-gradient` from each. Show the gym logo badge changing too. The meaning colors must stay identical. Implement it with CSS custom properties on a wrapper (`data-gym="ironbox"`), so it's obvious how theming works.

Check contrast for every text/icon pairing you use (4.5:1 text, 3:1 graphics), including white on each gym's brand; if white fails, use dark `--on-brand` for that gym and say so.

## UI/UX bar (owner: "really basic, no icons, nothing special or unique")
- Icons everywhere they help (Lucide shapes as inline SVG, stroke 1.75–2, in tinted rounded containers): tab bar, every metric, buttons, chips, section headers, cards, empty states.
- One signature, ownable visual per screen; layered surfaces (surface-1/2/3, subtle borders, soft shadows); rich data viz (rings, arcs, sparklines, gradient strokes); greeting header with initials avatar + gym badge; polished tab bar with active indicator; milestone/streak personality.
- No frosted glass, no aurora backgrounds. Verdict before numbers. All BRIEF.md Arabic and data rules apply.

## Screens (all dark, Arabic RTL unless noted), 390×844 phone frames
1. Home · 2. Scan report (latest scan, normal-range rows, weight = fat + fat-free) · 3. Trends (muscle and fat over the 3 scans) · 4. Body balance (segmental lean on a body figure) · 5. Compare (latest vs previous: changes inside the noise shown as "about the same") · 6. New-result reveal (the moment a new scan arrives: verdict, the main change, milestone) · 7. Account (profile, gyms/places, consents, language, theme, sign out) · 8. Home in English (LTR).
Plus: the gym re-coloring strip, a component sheet (icons set, metric card, chips, buttons, tab bar states, empty/loading states), and short annotations on each frame explaining the key UX decision (one or two lines).

## Output
`c:\Users\aliel\Downloads\LevelUP\discovery\directions\v3-<slug>.html`, under 120 KB, no JavaScript, Google Fonts only external resource (choose fonts with real Arabic that sit well beside the logo's geometric wordmark). Page rules from BRIEF.md apply (title, tokens on :root, no horizontal scroll at 375 px).
**Write the file in several steps** (create the skeleton and styles first, then append one or two screens per edit) so no single response is huge; long single writes have been timing out.

## Final message
File path, fonts, the UX concept in three sentences, and anything in the shared palette that didn't work (with the contrast numbers).
