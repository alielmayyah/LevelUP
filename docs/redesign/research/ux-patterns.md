# Body-composition UX patterns for LevelUP

Discovery, 18 Nov 2026. Fourteen patterns adapted to Egyptian Arabic, RTL and the InBody export. Headings state each pattern; "unverified" marks what I couldn't confirm.

## Patterns

### 1. Answer "did I improve?" with one sentence, judged against the member's own history
- **Who:** Apple Fitness Trends compares your last 90 days with the last 365 and shows arrows only after 6 months of data ([Apple](https://support.apple.com/en-us/HT210343)). Oura compares 14-day averages with your two-month average ([Oura](https://support.ouraring.com/hc/en-us/articles/360025589793)).
- **Why:** A personal baseline answers "better than before?", and evaluative labels help less numerate people use numbers ([Peters et al. 2009, abstract only](https://www.aminer.org/pub/53e9b62db7602d9704184e24/bringing-meaning-to-numbers-the-impact-of-evaluative-categories-on-decisions)).
- **LevelUP:** The rules engine picks the Egyptian Arabic sentence; muscle, fat and weight chips follow with the period ("في 3 شهور · 4 قياسات"). Arrows and colour mean better or worse, not up or down: fat −0.9 kg is good news. Say "trend" only after 3 same-machine scans.

### 2. Show each value as a dot on a line with the normal band shaded, not in a table
- **Who:** InBody's sheet scales bars to 100% of the average for your height and sex ([InBody](https://au.inbody.com/result-sheet-interpretation/)). Number lines made near-normal lab results feel less urgent than tables did ([Zikmund-Fisher 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5565988/)), and a marker reading "Many doctors are not concerned until here" cut urgent-contact intent further ([2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5891666/)).
- **Why:** A dot shows distance from normal; "17.5 (15.2–18.6)" makes readers work it out.
- **LevelUP:** Use the export's `normal_range` plus one word: "طبيعي", "أعلى شوية". Add a second marker only where InBody's own status changes (visceral fat level 10). Fields with no range (BMR, phase angle) get a trend only. In RTL, flip the line like a slider: low on the right.

### 3. Draw weight as fat plus fat-free mass, so "same weight, different body" is visible
- **Who:** InBody's Muscle-Fat Analysis lines up weight, muscle and fat bars; their shape (C, I, D) summarises the body, D being "the ideal" ([InBody](https://au.inbody.com/result-sheet-interpretation/)). Withings' Body Profile places you on a 16-zone grid of muscle index against fat index ([Withings](https://support.withings.com/hc/en-us/articles/47369660647825)).
- **Why:** It fixes the plan's founding story: the scale didn't move, so the member thought nothing changed.
- **LevelUP:** Stack fat mass and fat-free mass (14.92 + 62.98 = 77.9 kg in the sample). Never stack skeletal muscle with fat; they sum to 50.7, not weight. Describe the shape in words; C, I and D mean nothing in Arabic.

### 4. Show segment balance on a body figure that is never mirrored
- **Who:** InBody compares each segment's lean mass with the expected amount for height and sex; clients "should always work to be at 100% or higher" ([InBody](https://au.inbody.com/result-sheet-interpretation/)). Evolt calls segmental analysis "descriptive rather than judgement-based": an imbalance "does not mean something is wrong" ([Evolt](https://knowledge.evolt.health/knowledge/understanding-segmental-analysis-on-your-evolt-360-results)).
- **Why:** Left/right and upper/lower gaps are spatial; a figure shows them at once.
- **LevelUP:** Fill segments from `percentage_ideal`; compute left/right gaps from kg (sample: arms 1%, legs 0.4%, balanced). Don't mirror the figure in RTL; Apple's HIG says not to flip real objects or real directions ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left)). Write "الدراع اليمين", "الرجل الشمال".

### 5. Call changes smaller than the measurement error "ثابت", not progress or loss
- **Who:** Bone-density reports use a least significant change, "the smallest amount of change that can be considered real"; smaller changes read "no significant change", and each facility measures its own ([ISCD](https://iscd.org/wp-content/uploads/2025/10/6-ISCD-Patient-Resources-Are-the-comparisons-of-your-DXA-scans-reliable.pdf)).
- **Why:** Under tightly controlled conditions, one person's ten InBody 770 readings spanned on average 1.0 kg of muscle and 1.5 kg of fat ([Frontiers 2024](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1491931/full)). Gyms are less controlled.
- **LevelUP:** The plan's 0.3 kg recomposition rule sits inside that spread. Run a short repeat-scan test on each pilot machine to set thresholds, draw a faint "ثابت" band, and need two scans in the same direction before a "muscle loss" lead.

### 6. When the machine changes, compare direction only, and say so
- **Who:** ISCD: "Do not…report change between instruments that are not cross-calibrated"; return to the same device; compare the measurement, not reference-based scores ([ISCD](https://iscd.org/wp-content/uploads/2025/10/6-ISCD-Patient-Resources-Are-the-comparisons-of-your-DXA-scans-reliable.pdf)). InBody: "Outputs vary by InBody model" ([InBody](https://inbodyusa.com/inbody-app/)).
- **Why:** Calibration differs between machines and can swamp a month of real change.
- **LevelUP:** Every scan shows place, branch, model and source. Across machines: hollow dot, dashed line, kg only, no InBody Score or "% of ideal" comparison (inferred from ISCD's T-score rule), and no verdict, celebration or trainer lead.

### 7. Put two scans side by side with the change already worked out
- **Who:** Styku's split screen puts oldest left, newest right, with locked views; its dashboard auto-summarises "the change to each measurement" ([Styku](https://help.styku.com/how-can-i-show-a-client-their-before-and-after-scans-and-highlight-progress-with-styku/)). ScanProgress, a gym-provided InBody app, lists side-by-side comparison ([App Store](https://apps.apple.com/us/app/scanprogress/id6761957284)).
- **Why:** Members think "this time vs last time"; the app should do the subtraction.
- **LevelUP:** In Arabic, "قبل" sits right and "بعد" left. The top line states machine match. Rows run by meaning: muscle, fat, weight, fat %, visceral, water. Grey out changes inside the noise zone. Skip Styku's red-old, green-new colouring; on a body it reads as bad and good.

### 8. Put the test conditions in the reminder, and record them at the scan
- **Who:** InBody: same time of day, at least 3 hours after a meal, only after full recovery from exercise (1–3 days), restroom first, stand 5–10 minutes; retest "every 2–4 weeks under the same conditions" ([InBody](https://inbodyusa.com/general/inbody-test/)).
- **Why:** Conditions are the biggest avoidable noise, and reminders arrive in time to act.
- **LevelUP:** "ميعاد قياسك. تعالى بعد الأكل بـ3 ساعات، من غير تمرين، الساعة 8 الصبح زي آخر مرة", using the last scan's time from the machine. Say "3 hours after eating", not "fasted". Two taps at the desk record conditions; mismatches get a note, Ramadan its own message.

### 9. Celebrate records, streaks and milestones, and show the next one in progress
- **Who:** Apple Watch awards cover "personal records, streaks, and major milestones", plus awards "you're making progress towards" ([Apple](https://support.apple.com/guide/watch/track-daily-activity-with-apple-watch-apd3bf6d85a6/watchos)).
- **Why:** They reward what members control, and visible progress pulls them back.
- **LevelUP:** "أعلى عضل لحد دلوقتي", "3 قياسات ورا بعض عضلك بيزيد", "5 قياسات في ميعادها" (that one sells re-scans). Only same-machine changes beyond the noise zone trigger the reveal; a flat scan gets a calm screen. Never celebrate weight loss alone.

### 10. Share the change, never the weight
- **Who:** Strava lets you hide start time, pace, speed, calories, power and heart rate, set defaults, and still see them yourself ([Strava](https://support.strava.com/hc/en-us/articles/360028654291)). Withings' Eyes Closed mode hides weight on the scale's screen, shows encouraging messages, and still syncs it to the app ([MacRumors](https://www.macrumors.com/2023/04/18/withings-body-smart-scale/)).
- **Why:** Hiding is per field and the owner keeps the data, so privacy costs nothing.
- **LevelUP:** Default card: muscle and fat change, period, gym logo. Weight, fat % and absolute values are opt-in toggles with a live preview. Add a "خبّي وزني" mode (useful in women-only gyms). No cards for under-18s.

### 11. With a scan every 4–6 weeks, plot each one as a labelled dot on a true date axis
- **Who:** Datawrapper: symbols on every point are "the most intuitive way to make visible where your actual data points are" when points are few ([Datawrapper](https://www.datawrapper.de/academy/missing-data-in-line-charts)).
- **Why:** Smoothing and evenly spaced dates invent data between scans.
- **LevelUP:** Time-proportional axis, straight segments, a value on each dot, dashed segments for gaps over about 8 weeks. One scan: a single dot and "محتاجين قياس كمان عشان نرسم الخط". Two scans: open Compare. Fix the y-scale so 0.3 kg doesn't look like a cliff.

### 12. Choose the digit system on purpose and format every number through the locale API
- **Who:** W3C lists Egypt among Arabic-Indic digit users, with "٫" as decimal separator ([W3C](https://w3c.github.io/alreq/)). Apple: usage "varies ... even among areas within the same country"; digits within a number never reverse ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left)). Android 14 lets users pick a numbering system ([Android](https://developer.android.com/about/versions/14/features)).
- **Why:** Mixed digits look like a bug, and defaults change with the locale tag.
- **LevelUP:** In Node (CLDR 48), 77.9 prints "77.9" for `ar` but "٧٧٫٩" for `ar-EG`, and kilograms as "كغم", not the usual Egyptian "كجم" (unverified). Set `ar-EG-u-nu-latn` or `-u-nu-arab` explicitly, charts and dates included, and test both; Western digits match an English printed sheet (check pilot samples). Wrap numbers in `<bdi>`; use `signDisplay`, not string concatenation.

### 13. In Arabic, run time right to left and keep "more" up
- **Who:** Tversky et al. found writing direction shaped how people laid out time (Arabic speakers mostly right to left), and "more or better" mapped upward across cultures ([Cognitive Psychology 1991](https://www.tc.columbia.edu/faculty/bt2158/faculty-profile/files/uralanddevelopmentaltrendsingraphicproductions.pdf)). Apple's HIG flips progress controls and chronological sequences in RTL ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/right-to-left)).
- **Why:** Newest-on-the-left matches reading order and the mirrored layout.
- **LevelUP:** Arabic charts: oldest right, newest left, y-axis on the right (ECharts `xAxis.inverse`, `yAxis.position: 'right'`). That evidence comes from Arabic-speaking children and teens in 1991, so test both directions with the prototype members.

### 14. End every result with one next step
- **Who:** Apple pairs a declining trend with coaching such as "Walk an extra quarter of a mile a day" ([Apple](https://support.apple.com/en-us/HT210343)). InBody's Weight Control section sets fat and muscle targets and "will never recommend losing muscle mass" ([InBody](https://au.inbody.com/result-sheet-interpretation/)). Oura names its lowest band "Pay Attention" ([Oura](https://support.ouraring.com/hc/en-us/articles/360025589793)).
- **Why:** A number without an action invites worry; an action invites the next visit.
- **LevelUP:** One template action per pattern: protein and strength work for muscle loss, single-leg work for imbalance, "consider talking to a doctor" only for repeated high ECW ratio. Each links to "كلّم مدربك" on WhatsApp, the lead the gym pays for. Amber "خلي بالك", never red.

## Avoid
- **Raw tables as the main view.** Many table readers rated near-normal and extreme results alike (Zikmund-Fisher 2017).
- **Red on someone's body.** It turns near-normal values into alarms.
- **Stacking skeletal muscle with fat.** They don't add up to weight.
- **Verdicts, scores or celebrations across machines.** Device differences can exceed real change.
- **Celebrating noise, or weight loss alone.** The next normal wobble then looks like failure.
- **Smoothed curves, evenly spaced dates, auto-zoomed y-axes.** They invent or exaggerate change.
- **Mixed digit systems and hand-built "+2.1 kg" strings.** Bidi moves signs and units.
- **Presenting LevelUP thresholds (0.3 kg, 8%) as InBody facts.** I found no such published cut-offs.

## Gaps
- WHOOP's and Withings' help pages blocked automated reading (WHOOP left out; Withings' Body Profile from search results). Fit3D, Evolt Active, ScanProgress and MyBody Scans: store or marketing text only, no screens. MyBody Scans keeps the original sheet image ([Product Hunt](https://www.producthunt.com/products/mybody-scans)), which supports the plan's "شوف الورقة الأصلية".
- Unverified: Apple Health's chart direction in Arabic, how many tests InBody's history section shows, an official Egyptian kilogram abbreviation.
