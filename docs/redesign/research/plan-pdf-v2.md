# Plan v2 PDF: discovery notes

Source: `levelup-frontend/docs/LevelUP-Business-Technical-Plan-v2.pdf`, 24 A4 pages, dark, printed 2026-11-18 from `docs/business-technical-plan-source/plan.html`. Read can't render PDFs here (no pdftoppm), so I rendered all 24 pages with pypdfium2, phones at 5× zoom. Glosses are mine.

## 1. Page by page

1. Cover: logo, "Every body scan, finally understood.", three stats, a phone showing Home.
2. At a glance: problem, solution, model; key numbers; owner wins; 4-phase build strip.
3. Market: pains, competitors, first segments, ~5,300 gyms; key unknown: is LookinBody120 on a PC?
4. B2B2C flow diagram (visual only); who pays, who uses it, why it sticks.
5. Gym gains ranked strong/real/weak; bar chart: EGP 990 plan vs EGP 4,200 gain.
6. Pricing: Pilot free 60 days, Starter 990, Pro 2,490, per scan 15, Member Plus 49–79 (EGP).
7. Revenue chart and table: margin 71% → 92%, 62% with a partner.
8. Pitch 1: 15-minute script, hook, questions, demo.
9. Pitch 2: money line, objections, close, pilot agreement.
10. Design principles, the "new result" moment, prototype test and gate.
11. Design system.
12. Member app: Login, Home, Report.
13. Member app: Timeline, Compare, Charts.
14. Member app: Body map, Reveal, Share card.
15. Dashboard: Add scan, Bulk upload.
16. Dashboard: Follow-up, Stats.
17. Explanation engine: 10 patterns with rules, messages and lead types; templates, not AI.
18. Architecture diagram (visual only); 6 ways data gets in.
19. Libraries.
20. Data model, API endpoints, $25–85 a month.
21. Five checks before a member sees a scan; Law 151/2020; design responses.
22. 22 edge cases with fixes.
23. Roadmap: phase timeline with gates (visual only), weekly plan, pilot metrics, milestones.
24. Risks, this-month list, closing quote.

## 2. Mockup screens

**All member screens:** Arabic, RTL, dark, notch, "9:41" status bar. A 4-tab bar (right to left: Home, Scans, Compare, Account) with placeholder icons sits on Home, Timeline, Compare, Charts and Body map; the last two highlight Scans. Login, Report, Reveal and Share have none. The gym is always text ("IRON BOX"), never an image. Not mocked: Account, consent, light mode, English UI, the tap-to-explain sheet, empty, loading or error states.

**Login:** LevelUP mark and wordmark, "with IRON BOX"; headline "نتايج الـ InBody بتاعتك في مكان واحد" (your InBody results in one place); phone field (+20, LTR) and 4 OTP boxes on one screen; gradient "ادخل" (Enter) button; "we sent the code on WhatsApp".

**Home:** greeting "صباح الخير يا كريم", title "تقدّمك من أول قياس" (progress since your first scan); hero card (violet glow): "last 3 months · 4 scans", big green +2.1 kg muscle, fat −1.8 kg (green), weight +0.3 kg; verdict card with "عضل أكتر ودهون أقل" (more muscle, less fat) in green; unlabelled ring "78" beside "next scan in 9 days" and "صايم · من غير تمرين" (fasted, no workout); goal card "+3 kg muscle", 70%, bar filling from the right.

**Report:** "‹" back glyph top right in the status row, not mirrored; meta "12 نوفمبر · Iron Box التجمع · InBody 570"; headline card "أحسن نتيجة ممكنة: عضل زاد ودهون قلّت" (best possible result: muscle up, fat down); top 3 changes: muscle +1.1, fat −0.9 (green), fat % "22.4% =" with a note it held because muscle rose; 2×2 metric cards, values only (weight 82.3, muscle 36.8, fat 18.4, visceral 7); "tap any number to understand it"; outlined "see the original sheet" button; disclaimer "معلومات للياقة، مش تشخيص طبي.".

**Timeline:** place chips (All, Iron Box, Dr Sara's clinic); rows (date; place · branch · machine; chip): 12 Nov "+1.1 kg عضل" and 14 Oct "−0.6 kg دهون" (green); a dashed blue "different machine: compare the overall trend only" banner; 10 Sep, clinic, InBody 270, "stable"; 2 Aug, "manual, from an old sheet", "first scan".

**Compare:** before/after pickers (14 Oct; 12 Nov selected); green "✓ same machine · accurate comparison"; old → new rows, LTR, no units: weight, muscle, fat, fat %, water, visceral. Only beyond-noise changes (muscle, fat, visceral) are green. Summary card.

**Charts:** range chips 3 months, 6 months, All; "your weight: fat or muscle?" stacked bars (blue lean under orange fat), no axes or dates; muscle vs fat lines (blue up to 36.8, orange down to 18.4), end labels only; time runs left to right. Per-metric trends aren't shown.

**Body map:** block figure: trunk 27.9, arms 3.6 and 3.4, legs 9.8 (blue) and 8.9 (orange); no L/R labels; amber card "left leg 9% lower, ask your coach about single-leg exercises".

**Reveal:** push banner (gradient icon, title "Iron Box", "نتيجتك الجديدة وصلت 🎉" (your new result is here)); violet glow; ring ~80% full around a green +0.8 kg muscle; "شغلك باين!" (your work shows!); "muscle up for the third month in a row"; rows: fat −0.5 kg and "InBody Score 78 → 80" (English label); "swipe up for details".

**Share:** purple gradient card: LevelUP mark "× IRON BOX", green +2.1 kg "muscle in 3 months", English line "−1.8 kg fat · same weight", 4 rising bars, "track your progress at Iron Box"; WhatsApp (primary) and Instagram buttons; "numbers only, without your weight or photo".

**Dashboard:** English, LTR, browser frame; sidebar items vary per mock.
- Add scan: dropzone (CSV + image), test date from the machine, machine and branch, a "Does the file match this member?" table with ✓s, "Confirm and send to Karim" / Cancel, "Saved as: Mona (front desk) · logged". No preview of scan values.
- Bulk upload: "412 rows · 388 matched · 21 check · 3 unknown"; match chips Exact, Mobile, Name only, Unknown; actions Approved, Review, → Unassigned.
- Follow-up: chips All 12, Muscle loss 4, Re-scan due 5, Imbalance 3; reason, trainer, status (New, Contacted, Reminded, Sold PT, Sold package), EGP value, WhatsApp button with a pre-written message.
- Stats: "EGP 11,700 vs EGP 2,490 plan · 4.7×"; tiles for scans, members on the app, PT leads → sold, shared cards.

## 3. Design system as shown

- **Logo gradient:** #E19CFB → #B98CFF → #6B3BF5 (buttons, rings, the "UP").
- **Swatches:** Primary #6B3BF5, Secondary #B98CFF, Accent #F5A524, Success #5BE38F, Muscle #4D8DFF, Fat #FF8A3D, Background #0B0916, Surface #17132A. All except the gradient match `src/brand.config.ts` / `src/theme/tokens.css`; the app's gradient is #7F50FF → #6B3BF5 → #4F24DC.
- **Unlisted mockup colours** (plan.html): screen #0E0B1C, borders #2B2546 and #36305C, text #F5F3FC, #AAA4C4 and #7F789C, chips #231D3C, red #FF7A85 (risk chips only). #7F789C on Surface is about 4.4:1, under the plan's own 4.5:1.
- **Type:** Alexandria bold for titles, buttons and big "scoreboard" numbers; IBM Plex Sans Arabic / IBM Plex Sans for body. All three are embedded.
- **Shape:** 4-point grid; radius 20 cards, 14 buttons, full chips; 44×44 tap targets; 4.5:1 contrast.
- **Motion:** fast 120 ms, base 240 ms, reveal 0.5 s spring, stagger 60 ms; reduce motion: crossfades only; light haptic on reveal and goal reached.
- **Components drawn:** violet, amber and blue delta chips; gradient primary and outlined secondary buttons. Named only: metric card, headline card, ring score, timeline row, compare row, body map, share card, tap-to-explain sheet.

## 4. What the text misses, and contradictions

**Visual only:**
- Page 4: money gym → platform, leads and stats back, reports → member, plus the loop "Member spends more at the gym: re-scans, personal training, packages, renewals".
- Page 18: InBody → LookinBody120 → web dashboard (both "On the gym's existing PC") → NestJS API → member app, trainer view, owner stats.
- Page 23: months 5–6 "Paid + partners", months 7–12 "Grow" ("Tanita, Evolt, photo", "Distributor, GCC"); gates "5/5 understand", "3 pilots signed", "3 of 5 pay", "20 paying venues".

**Rendering differs from the text:**
- 🇪🇬 renders as "EG".
- Status-bar text falls back to Times New Roman (CSS asks for unloaded Inter), an accident.
- The 4th OTP box looks short only because it's empty (the source has 4).

**Stated two ways:**
- The "Accent" swatch is amber, but the principles say "one accent colour for progress, amber for attention". Screens show progress in green.
- Muscle gain is green on screens, violet on the design-system chip, and blue in charts and share bars. The weaker leg is drawn in the Fat orange.
- Gym logo "in every gym" (page 12) vs Pro-only "Gym logo in the app and on share cards".
- Guardian consent under 15 (law) vs under 18 (edge cases, share card).
- The share card promises "never weight" but prints "same weight", and mixes in English.
- Reveal: "3 key changes slide up", but 2 rows are shown.
- The Home caption names an "InBody score"; the ring is unlabelled.
- Lead statuses new/contacted/sold/lost vs the mock's Reminded, Sold PT, Sold package. Filter chips total 12, but "No scan in 63 days" fits none.
- Sample data: Karim's next scan 9 days (app) vs 2 days (dashboard); "third month in a row" vs September "stable".
- Phases: page 2 "Months 5–12" vs page 23's 5–6 and 7–12. Costs "$25–85" (pages 2, 20) vs "hosting ($25–150)" (page 7).

**Plan vs repo docs:** the plan's Scan keeps the machine's `inbodyScore` and lacks BMI, protein and minerals; `docs/inbody/README.md` maps all three and computes the score in the API. The plan's stack (MongoDB, Turborepo, Framer Motion, ECharts, Zustand, Day.js) differs from the repos; `levelup-backend` isn't scaffolded yet.

## 5. Member-app requirements checklist

**Screens**
- [ ] Login: +20 phone, OTP by WhatsApp (SMS fallback; 4 digits per the mock), gym co-brand; earlier scans show at once; web version and desk QR code.
- [ ] Tabs: Home, Scans, Compare, Account.
- [ ] Home: since-first-scan card (muscle, fat, weight, period, scan count), verdict sentence, next-scan countdown with conditions, score ring, goal progress.
- [ ] Report: date, place, branch, machine; headline; top 3 changes; tap-to-explain metric cards; original sheet image; disclaimer.
- [ ] Timeline: every scan from every place, place filter, source label, machine-change markers.
- [ ] Compare: any two scans, across places too; same-machine check; highlight only beyond-noise changes; shared fields only; summary.
- [ ] Charts: 3 months/6 months/all; fat vs lean bars; muscle and fat lines; a trend per metric; machine markers.
- [ ] Body map: segmental lean, gentle note above ~8% left/right difference.
- [ ] Reveal from push: glow, count-up, ring fill, haptic, staggered changes, swipe up.
- [ ] Share card: change only, both brands, WhatsApp/Instagram/native share, PNG; hidden under 18.
- [ ] Account (not mocked): profiles, per-gym access, consents, export, delete, language.

**Features and data**
- [ ] Words before numbers: human-written Egyptian Arabic and English templates, no AI.
- [ ] 10 patterns: recomposition, fat loss, muscle gain, muscle loss, imbalance, water noise, within noise, different machine, re-scan due (4–6 weeks), gone quiet (60 days).
- [ ] Metrics (all optional): weight, SMM, BFM, PBF, TBW, ICW, ECW, ECW/TBW, BMR, visceral fat, InBody score, segmental lean and fat.
- [ ] Trust labels (verified, typed, manual); member manual entry from old sheets.
- [ ] Pre-scan conditions with a note when they differ; Ramadan note.
- [ ] Goals, with a haptic when reached.
- [ ] Push: new result, re-scan reminders.
- [ ] "This isn't my scan"; family profiles with "Is this you?".
- [ ] Scans saved before sign-up; phone changes; history kept if the gym stops paying.
- [ ] Member Plus, later: manual entry, PDF export, "ask your gym to join".

**States and quality**
- [ ] Opens in under 1 s; offline last data; skeletons, no spinners; reduce-motion crossfades.
- [ ] First-scan, missing-field and different-brand states (no verdict across brands); youth ranges under 18.
- [ ] Arabic RTL first plus English; light and dark (plan shows dark only); 320 px up; safe areas.

**Consent and legal**
- [ ] Consent at gym registration and again at first login, with timestamp and version.
- [ ] Separate consent per gym; share-full-history toggle per gym; revoke.
- [ ] Guardian consent (age threshold unresolved).
- [ ] Minimum data: phone, first name, sex, birth year, height; no national ID.
- [ ] Privacy notice in Arabic and English; export and delete.
- [ ] "Fitness information, not diagnosis" on every report; no disease names; "consider talking to a doctor" for repeated high ECW/TBW.
- [ ] Result images behind expiring links; "InBody" stays out of the product's name and logo.
