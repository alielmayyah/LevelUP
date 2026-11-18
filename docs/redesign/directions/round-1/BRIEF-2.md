# Round 2 brief: dark app, logo colors (overrides parts of BRIEF.md)

The owner rejected all six round-1 directions and said: "choose from the logo colors and make it a dark app."

Read `BRIEF.md` in this folder for the product, data, copy, page rules and quality bar, then apply these OVERRIDES:

## Overrides
- **Palette comes from the LevelUP logo** (look at `c:\Users\aliel\Downloads\LevelUP\levelup-frontend\docs\business-technical-plan-source\logo.png` and `levelup-frontend\public\brand\mark.webp`): gradient lilac-pink `#E19CFB` → violet `#B98CFF` → deep violet `#6B3BF5` (deepest ≈ `#5A2FF0`), white wordmark ("Level" white, "UP" in the gradient), tagline in a grey-lavender. Violet IS allowed and is the brand. You may tune lightness/chroma for contrast, but every brand hue must clearly come from the logo.
- **Dark app.** All five phone frames are dark: (a) Home, Arabic · (b) Scan report, Arabic · (c) Trend chart, Arabic · (d) Body balance + compare-to-last-scan, Arabic · (e) Home, English (LTR). Still give a light token set in the palette section (the app must support light mode), but design and judge it dark-first.
- **What the owner disliked in the current app** (so avoid it even with these colors): a lavender light background, frosted-glass cards with backdrop blur everywhere, several radial glows/aurora behind content, gradient on many elements at once, small cramped text. Use solid surfaces. The logo gradient is precious: use it in very few places (see your variant).
- Keep from BRIEF.md: amber = needs attention (dark text on it), neutral grey = stable / within noise, never red on body metrics, muscle/fat/water distinguishable without red-vs-green, contrast rules, Arabic rules (Western digits, كجم, bdi, no letter-splitting), dot-on-range rows, weight split fat + fat-free, unmirrored body figure, RTL time on charts, verdict first.
- Fonts: free choice from Google Fonts with real Arabic; the logo's wordmark is a geometric sans (Poppins-like), so pick type that sits well beside it.
- File: `c:\Users\aliel\Downloads\LevelUP\discovery\directions\v2-<slug>.html`.

## Owner feedback (added mid-round): "really basic, no icons, nothing special or unique"
Round 1 read as plain lists of numbers on flat surfaces. This round must feel rich and distinctive, without returning to glass/aurora:
- **Icons everywhere they help:** tab bar, every metric row (muscle, fat, water, weight, visceral, BMR), buttons, chips, section headers, the next-scan card, empty state. Use Lucide icon shapes (the app already ships `lucide-react`) as inline SVG, consistent stroke 1.75–2, or draw a small custom set for muscle / fat / water / scale that feels ownable. Icons sit in tinted rounded containers where useful.
- **One signature, ownable element per screen**, e.g. a detailed stylized body figure (front view with segments that fill by % of ideal), a big progress ring or arc in the logo gradient with tick marks, a composition "stack" visual of weight = fat + fat-free, a milestone/streak badge, a timeline with scan "stamps". Make Home's hero something a member would screenshot.
- **Depth and craft:** layered dark surfaces (2–3 elevation steps with subtle borders and inner highlights), soft shadows, rich data viz (rings, arcs, mini sparklines on cards, gradient strokes on charts), illustrated empty state, a greeting header with avatar initials and the gym badge, a real-looking status bar, a polished floating or docked tab bar with an active indicator.
- **Personality:** micro-copy, a milestone chip ("أعلى عضل لحد دلوقتي"), and one celebratory touch on Home (e.g. a small streak/medal badge for 3 scans in a row of muscle gain).
- Still: no frosted glass, no aurora, verdict first, contrast rules, Arabic rules.

## Final message
File path, dark and light token hex values, fonts, and three sentences on how this variant uses the logo colors differently from the others.
