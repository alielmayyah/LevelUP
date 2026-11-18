# Visual direction brief (shared by every direction agent)

You are a senior product designer creating ONE visual direction for the redesign of LevelUP, a mobile app for gym members in Egypt that explains their InBody body-composition scans in plain Egyptian Arabic (primary, RTL) and English. Gyms pay; members use it free. LevelUP's look is the same in every gym, with the gym's logo shown alongside.

This is a mockup only. Do not modify any file in `c:\Users\aliel\Downloads\LevelUP\levelup-frontend` or `levelup-backend`.

## Read first
- `c:\Users\aliel\Downloads\LevelUP\discovery\DISCOVERY.md` (the decisions, especially 1–5, 11–17, and "What the InBody data requires").
- `c:\Users\aliel\Downloads\LevelUP\discovery\ux-patterns.md` (patterns 1–4, 7, 9, 11, 12, 13).
- Skills to apply (read their SKILL.md): `levelup-frontend\.claude\skills\frontend-design`, `interface-design`, `no-ai-design-slop`, `better-colors`, `better-typography`.

## Hard constraints
- The owner rejected the current look: NO violet, purple, lavender, magenta or indigo; NO frosted glass / backdrop blur; NO glow, aurora or decorative gradients; no uppercase tracked labels.
- One accent hue = action + positive progress. Amber = needs attention (with dark text). Neutral grey = stable / within noise. NEVER red on a body metric.
- Muscle, fat and water have their own data colors, distinguishable in both themes and without relying on red vs green (vary lightness too).
- Contrast: text ≥ 4.5:1, numbers ≥ 24 px and meaningful graphics (rings, chart lines, range bars, body figure) ≥ 3:1, in both themes. Compute ratios; don't guess.
- Tap targets ≥ 44 px. Tabular figures for numbers.
- Arabic uses Western digits (0–9) and "كجم"; numbers and units must not reorder (wrap in `<bdi>`). Fonts only from Google Fonts, and they must have real Arabic glyphs (check). Animate/split Arabic by word, never by letter.
- Values are shown as a dot on a line with the normal band shaded, plus one word (طبيعي / أعلى شوية / أقل شوية). Weight is split into fat + fat-free mass, never muscle + fat. The body figure is never mirrored; sides are named in words. Time on charts runs right-to-left in Arabic (oldest on the right).
- One focal point and one primary action per screen. Words before numbers: the verdict sentence leads.

## Data (use exactly these numbers)
Member: Karim (كريم), male, 38, 178.5 cm. Gym: Iron Box, New Cairo (show its logo as a small neutral "IB" monogram next to the LevelUP wordmark). All scans on the same InBody 770.

| Date | Weight | Muscle (SMM) | Fat mass | Fat % | Fat-free mass | Visceral |
|---|---|---|---|---|---|---|
| 2 Aug 2026 (first) | 79.0 | 34.8 | 17.2 | 21.8 | 61.8 | 8 |
| 14 Oct 2026 | 78.3 | 35.3 | 15.95 | 20.4 | 62.35 | 7 |
| 18 Nov 2026 (latest) | 77.9 | 35.8 | 14.92 | 19.15 | 62.98 | 6 |

Latest scan, value (normal range): muscle 35.8 (29.8–36.4); fat 14.92 (10.8–17.2); fat % 19.15 (10–20); weight 77.9; BMI 24.45 (18.5–25); body water 46.4 L (40.0–49.0); protein 12.4 (10.7–13.1); minerals 4.18 (3.70–4.52); ECW ratio 0.377 (0.360–0.390); visceral fat level 6 (goal under 10); BMR 1,730 kcal; InBody Score 79 (a detail, never the hero).
Segmental lean mass kg (% of ideal): right arm 3.48 (105%), left arm 3.44 (104%), trunk 28.4 (102%), right leg 9.62 (104%), left leg 9.58 (103%). Left/right gap: arms 1.2%, legs 0.4% → balanced.

Since the first scan (3 scans, 3.5 months): muscle +1.0 kg, fat −2.3 kg, weight −1.1 kg → a real trend (clears the noise floors of ≈0.9 kg muscle, ≈1.5 kg fat).
Latest vs previous scan: muscle +0.5, fat −1.0 → each within measurement noise on its own, so show them as "about the same" (neutral), with the trend carrying the message.
Next scan due 16 Dec 2026 (in 4 weeks): come 3 hours after eating, no workout before, same time as last time (8:00).

## Copy (tighten if you like, keep it plain)
Arabic: صباح الخير يا كريم · تقدّمك من أول قياس · 3 قياسات في 3 شهور ونص · عضل +1.0 كجم · دهون −2.3 كجم · وزن −1.1 كجم · Verdict: «وزنك نزل كيلو، بس الأهم إن جسمك اتغيّر: عضل أكتر ودهون أقل.» · القياس الجاي بعد 4 أسابيع · تعالى بعد الأكل بـ3 ساعات ومن غير تمرين · Report header: 18 نوفمبر · Iron Box التجمع · InBody 770 · Report headline: «عضلك بيزيد ودهونك بتقل من 3 شهور» · مقارنة بالقياس اللي فات: تقريباً زي ما هو (التغيير أصغر من فرق الجهاز) · Metric names: الوزن · العضل · الدهون · نسبة الدهون · الدهون الحشوية · مية الجسم · Body: توازن الجسم — متوازن: الفرق بين اليمين والشمال أقل من 2% · Hint: اضغط على أي رقم عشان تفهمه · Disclaimer: معلومات للياقة، مش تشخيص طبي. · Next step: كلّم مدربك على واتساب · Tabs: الرئيسية · القياسات · مقارنة · حسابي
English: Good morning, Karim · Your progress since your first scan · 3 scans in 3.5 months · Muscle +1.0 kg · Fat −2.3 kg · Weight −1.1 kg · "Your weight dropped a kilo, but what matters is your body changed: more muscle, less fat." · Next scan in 4 weeks · Come 3 hours after eating, no workout · Tabs: Home · Scans · Compare · Account

## Deliverable
One self-contained HTML page at `c:\Users\aliel\Downloads\LevelUP\discovery\directions\<your-slug>.html`, under 70 KB:
1. Header: direction name, 3 mood words, rationale under 70 words.
2. Palette: light and dark token sets as swatches with role, hex, and the computed contrast ratio of text/graphics on their background. Roles: background, surface, raised surface, border, text, muted text, accent, on-accent, attention, muscle, fat, water, stable.
3. Type: Arabic + Latin pairing, a short specimen in both scripts, the size scale.
4. Five phone frames (390×844 CSS px, rounded corners, status bar and home-indicator areas respected, bottom tab bar where relevant):
   a. Home, Arabic, dark · b. Home, Arabic, light · c. Scan report, Arabic, default theme (headline, normal-range rows for weight/muscle/fat/fat %, weight split bar fat vs fat-free, body-balance figure, disclaimer) · d. Trend chart screen, Arabic (muscle and fat across the 3 scans, dots on a true date axis, right-to-left time) · e. Home, English (LTR), other theme.
5. Component strip: metric row with range bar, change chip (improved / about the same / attention), primary + secondary button, tab bar states, empty state ("no scans yet").

Page rules (it will be published as a web page):
- `<!doctype html>`, `<meta charset="utf-8">`, viewport meta, a `<title>` of 2–4 words.
- Page-chrome colors as CSS custom properties on `:root`, dark overrides under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` and again under `:root[data-theme="dark"]`; explicit `body` background. Each phone frame carries its own theme via a `data-frame-theme` attribute and its own tokens, independent of the page.
- Inline CSS and inline SVG only; Google Fonts `<link>` is the only external resource; no JavaScript.
- No horizontal page scroll at 375 px wide: frames stack and scale to fit with a 16 px side gutter.
- Charts and body figure drawn in inline SVG with the real numbers.

Quality bar: a shipped app from a top studio, not a template. Restraint, typography and spacing over decoration. Make your direction clearly different from the others.

## Final message
The file path, the light and dark token hex values, the font pairing, and three sentences on what makes this direction distinct.
