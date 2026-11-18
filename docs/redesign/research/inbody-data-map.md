# InBody data map

Discovery requirements for the redesign (18 Nov 2026), from `levelup-frontend/docs/inbody/inbody-data-example.json` (made-up values, unconfirmed key names), Plan v2 §09–16 and today's app.

**Roles:** Hero, Key (key change), Tap (detail on tap), Staff, Hide, Meta (label). **Where:** H Home, R Scan report, T Timeline, C Compare, Ch Charts, B Body balance, N New-result reveal, S Share card. **†** needs "fitness information, not diagnosis" wording. **Real change:** the smallest change between two same-device scans worth calling real (§2).

## 1. Flagship scan (InBody 770/970)

| Field | Role | Where | Visual | Plain words (EN / AR) | Real change |
|---|---|---|---|---|---|
| `device_model`, `test_info.timestamp` | Meta | R T C | Machine, place and date label | – | New model → "different machine" rule |
| `examinee_id`, `gender`, `age_years`, `height_cm` | Staff | – | Identity check vs profile | – | – |
| `skeletal_muscle_mass_kg` | Hero | H R T C Ch N S | Count-up delta; value vs range; trend | The muscle you train and move with.<br>العضل اللي بتتمرّن وبتتحرك بيه. | ≈0.9 kg |
| `body_fat_mass_kg` | Hero | H R T C Ch N S | Delta; value vs range; trend | How many kilos of fat you carry.<br>عندك كام كيلو دهون. | ≈1.5 kg |
| `measured_weight_kg` | Key | H R C Ch (never S) | Weight split into fat and lean; trend | Everything you weigh. Read it with muscle and fat.<br>وزنك كله. اقراه مع العضل والدهون. | ≈1.9 kg |
| `percent_body_fat` | Key | R C Ch | Value vs range (men 10–20, women 18–28); trend | The share of your weight that is fat.<br>الدهون نسبتها كام من وزنك. | ≈1.9 points |
| `fat_free_mass_kg` | Key | C Ch | Lean part of the split | Everything that isn't fat: muscle, water, organs, bone.<br>كل حاجة في جسمك غير الدهون: عضل ومية وأعضاء وعضم. | ≈1.8 kg |
| `total_body_water_l` | Tap | R C | Value vs range | All the water in your body. Food, drink and training move it.<br>كل المية اللي في جسمك. الأكل والشرب والتمرين بيغيّروها. | ≈1.5 L |
| `intracellular_water_l`, `extracellular_water_l` | Staff | – | Feed the ECW ratio | – | ≈0.6 L each |
| `ecw_ratio` † | Tap; drives the water rule | R C | Value on the 0.360–0.390 band | How your body water splits inside and outside your cells.<br>المية جوه خلاياك وبرّاها متوزعة إزاي. | ≈0.006 |
| `protein_kg` | Tap | R | Value vs range | Protein in your body, mostly in muscle.<br>البروتين اللي في جسمك، أغلبه في العضل. | ≈0.6 kg (with minerals) |
| `mineral_kg` | Tap | R | Value only | Minerals, mostly in your bones.<br>المعادن، أغلبها في عضمك. | No delta shown |
| `bone_mineral_content_kg`, `soft_lean_mass_kg` | Hide | – | – | – | – |
| `bmi_kg_m2` | Tap | R | Value vs 18.5–25 | Weight for your height. It can't tell muscle from fat.<br>وزنك بالنسبة لطولك. مش بيفرّق بين العضل والدهون. | ≈0.6 |
| `visceral_fat_level` † | Key | R C N; H via plan item | Value vs a line at 10 | Fat deep in your belly, around your organs. Under 10 is the goal.<br>دهون جوه البطن حوالين الأعضاء. الهدف تحت 10. | 2 levels |
| `visceral_fat_area_cm2` | Staff; rules use it | – | – | – | ≈8 cm² |
| `waist_hip_ratio` † | Hide | – | – | – | No data (estimated) |
| `basal_metabolic_rate_kcal` | Tap | R | Number | Calories your body burns in a day at rest.<br>السعرات اللي جسمك بيحرقها في اليوم وإنت مرتاح. | ≈40 kcal (follows lean mass) |
| `inbody_score` | Staff (checks FitScore) | FitScore: H R N | Ring score | One score for your muscle and fat, for your height.<br>سكور واحد لعضلك ودهونك بالنسبة لطولك. | ≈3 points |
| `body_cell_mass_kg` † | Staff | – | – | – | – |
| `segmental_lean_mass_kg` † | Key for imbalance, else Tap | B C; R teaser | Body figure, % per part, left/right chip | Everything that isn't fat, in each arm, leg and your trunk.<br>كل حاجة غير الدهون في كل دراع ورجل وفي الجذع. | ≈0.3 kg arm, 0.6 leg, 0.9 trunk |
| Segmental fat (not in this file) | Tap | B | Same figure, fat view | Where your fat sits.<br>الدهون متوزعة فين في جسمك. | ≈0.4 kg arm, 0.6 leg, 0.9 trunk |
| `phase_angle_50khz_deg.whole_body` † | Tap | R Ch | Trend vs own past | A sign of how healthy your cells are. Compare it with your past scans.<br>علامة على صحة خلاياك. قارنها بقياساتك اللي فاتت. | ≈0.4° |
| Segment phase angles † | Staff | – | – | – | Arms ≈0.3°, legs ≈0.75°, trunk 1.7° (unreliable) |
| `multi_frequency_impedance_matrix_ohms` | Hide; raw on server | – | Contact-quality checks | – | – |

Rules for every field:

- Never show the device's status strings ("Subcutaneous (< 10)"); the app names zones itself.
- Device ranges when present, else `src/body/standards.ts`; one source per scan.
- † copy never names a condition. ECW ratio above 0.390 on two scans in a row: "consider talking to a doctor" (InBody ties it to medical evaluation [3]). Imbalance can be injury swelling [4], so never guess a cause.

## 2. Where the thresholds come from

- Masses, water, ECW ratio, visceral area: MDC95 = 1.96 × √2 × √(day SD² + test SD²), from Looney et al.'s InBody 770 data (14 fasted adults, 10 tests over about 3 weeks) [1]. Their limb rows combine both limbs, so per-limb use is conservative.
- Phase angle: Matsumoto et al., InBody S10, tests an hour apart: whole body 0.36°, arms 0.31–0.32°, legs 0.71–0.79°, trunk 1.74° [2].
- Derived: BMR (21.6 × the FFM threshold), FitScore (a 1.5 kg fat-to-lean shift moves it 3 points), visceral level (1 level ≈ 10 cm² [5]).
- Protein, minerals and waist-hip ratio alone have no reliability data: estimates.
- Both studies were lab-controlled; gyms will be noisier. Treat these as floors and tune them with pilot data (e.g., back-to-back scans on 20 members).
- Today's thresholds (`insight.ts`, `advice.ts`: 0.2 kg muscle, 0.3 kg fat; Plan v2: 0.3–0.5 kg) sit inside this noise. Rule: a change is real when it clears the threshold between two same-device scans, or when 3+ scans move one way and the total clears it. Otherwise say "about the same", in a neutral color.

## 3. Other device sections

- **BSM 370 stadiometer**: support early, as staff input. Measured height feeds standards, BMI, FFMI and the identity check.
- **Dial H30 home scale**: later, as a low-trust home source (weight, fat %, muscle, visceral level): trends only, no verdicts against gym scans.
- **BWA 2.0**: later, for clinics, staff only. Never show its diagnostic labels ("Fluid Overload / Hypervolemia", "Confirmed Sarcopenic").
- **BPBIO 750, FRA 510S, BAND 3**: skip. Blood pressure and fall risk are clinical; steps and stress are activity tracking, out of scope.
- **USB CSV**: the main route, with no ranges, segment %, segment phase angles or device model. Ranges come from `standards.ts`, the device from staff at upload.

## 4. Derived metrics, checked on the example

| Metric | Formula | Example |
|---|---|---|
| Fat-free mass | weight − fat = TBW + protein + minerals | 62.98 ✓ |
| Soft lean mass | TBW + protein | 58.8 ✓ (FFM − bone mineral would be 59.56) |
| Body cell mass | ICW + protein [4] | 41.3 ✓ |
| FFMI, FMI | FFM ÷ h², fat ÷ h² | 19.8, 4.7 kg/m² |
| SMI (staff only) | (arms + legs lean) ÷ h² [4] | 26.12 ÷ 3.186 = 8.2 kg/m². SMM ÷ h² (11.2) is not SMI |
| Lean vs muscle change | ΔFFM beside ΔSMM; non-muscle lean = ΔFFM − ΔSMM | Muscle is 57% of FFM here, so ΔSMM ≥ ΔFFM is suspect (estimate). Lean up with ECW ratio up ≥0.006 is water [4] |
| Left/right balance | \|R − L\| ÷ mean(R, L) × 100 | Arms 1.2%, legs 0.4% |
| BMR check | 370 + 21.6 × FFM [3][6] | 1730 |
| FitScore | 80 + (lean − standard lean) − max(0, fat − standard fat) | 79 |

## 5. Is the example consistent?

- ✓ TBW + protein + minerals + fat = 77.90 kg = weight. ICW + ECW = TBW. FFM, SLM and BCM add up.
- ✓ BMI (24.45), fat % (19.15) and ECW ratio (0.377) recompute exactly. Level 6 fits 64.2 cm².
- ✓ The CSV row matches the JSON in all 34 columns.
- ✗ BMR: the InBody 770 uses the Cunningham equation [3], and its sample sheet (142.0 lb FFM, 1761 kcal) fits 370 + 21.6 × FFM. That gives 1730 here, not 1745.
- ✗ InBody Score: the app's method gives 79, not 83.
- ✗ Ranges: the water, protein, mineral and FFM bands fit a ~180 cm man, not 178.5 cm; the fat band (10.8–17.2 kg) isn't InBody's 80–160% (8.4–16.8).
- ✗ Time: the JSON says 10:15:30Z; the CSV says 10:15:30 with no zone. A Cairo machine prints local time, so one is 2–3 hours off: read CSV times in the venue's zone.
- ? `percentage_ideal`: InBody's % bar compares lean mass with current weight; the kg bar compares it with the ideal for height [4]. `SegmentReading.pct` assumes height. Confirm on a real export.
- Segments sum to 54.5 kg, below SLM (58.8): expected, since the head isn't a segment [4]. Never show a segment total.

## 6. Gaps and a richer scan DTO

Today's `AssessmentDto` and the planned Prisma `Assessment` (backend not scaffolded yet) lack device ranges; ICW, ECW, ECW ratio, FFM, phase angle and visceral area; device, place, source, trust and conditions (so "different machine" can't work); and the scan's own height. `segments` needs lean and fat together, so this lean-only file sends `null`. Every metric is required, so typed or home-scale scans would need made-up values.

```ts
// Additions only, all optional: today's screens, mocks and tests compile unchanged.
export interface AssessmentDto {
  // ...today's fields, unchanged...
  origin?: ScanOrigin;
  /** Bands the device printed; missing keys fall back to src/body/standards.ts. */
  ranges?: Partial<Record<RangedKey, { low: number; high: number }>>;
  extra?: ScanExtras;
  /** Lean and fat on their own; today's `segments` needs both. */
  segmentalLean?: Record<BodySegment, SegmentReading> | null;
  segmentalFat?: Record<BodySegment, SegmentReading> | null;
}

export type RangedKey = 'weightKg' | 'skeletalMuscleKg' | 'bodyFatKg' | 'bodyFatPct'
  | 'fatFreeMassKg' | 'totalBodyWaterKg' | 'proteinKg' | 'mineralsKg' | 'ecwRatio';

export interface ScanOrigin {
  source: 'csv' | 'excel' | 'typed' | 'manual' | 'photo';
  /** manual = member-typed: kept out of stats and leads. */
  trust: 'verified' | 'typed' | 'manual';
  device: { id: number; brand: string; model: string } | null;
  place: { orgId: number; name: string; branch: string | null } | null;
  /** From the pre-scan checklist; null = not asked. */
  conditions: { fasted: boolean | null; trainedBefore: boolean | null };
  sheetImageUrl: string | null; // signed, expiring
}

export interface ScanExtras {
  heightCm: number | null; // as typed on the machine
  fatFreeMassKg: number | null;
  softLeanMassKg: number | null;
  intracellularWaterL: number | null;
  extracellularWaterL: number | null;
  ecwRatio: number | null;
  visceralFatAreaCm2: number | null;
  phaseAngleDeg: number | null; // whole body, 50 kHz
  segmentPhaseAngleDeg: Record<BodySegment, number> | null;
  deviceScore: number | null; // printed InBody Score, to check FitScore
}
```

- Server-only, never in member DTOs: examinee ID, raw impedance, unknown columns, test hash.
- Step 2, breaking (two linked PRs): legacy metrics become `number | null`, and `segments` gives way to `segmentalLean` and `segmentalFat`. Most reads already guard with `Number.isFinite`.
- Backend: put these in the Task 2 schema (nullable floats, `ranges Json?`, `Device`, source and trust enums, `testHash @unique`, `raw Json?`). First settle Plan v2's orgs and branches against the core plan's single-gym rule.

## 7. Plan v2 §16 patterns against the data

| Pattern | Fields | Verdict |
|---|---|---|
| Recomposition (muscle +0.3, fat −0.3, fat % ±0.5) | SMM, fat, fat % | Supported, but 0.3 kg is noise: use ≈0.9 and 1.5 kg, or a 3-scan trend |
| Healthy fat loss, Muscle gain | Fat, SMM | Supported; "stable" means under the threshold |
| Muscle loss >0.5 kg → PT lead | SMM, ECW ratio | 0.5 kg is noise: lead at ≥0.9 kg or two drops in a row, with no water shift |
| Imbalance >~8% → PT lead | Segmental lean | Supported (example: 1.2%, 0.4%). 8% of an arm (0.28 kg) is at the noise floor: require two scans. It's lean mass, not strength: say "less lean mass", not "weaker" |
| Water noise | TBW, ECW ratio | Needs the ECW ratio in the DTO: ratio moves ≥0.006 or TBW ≥1.5 L while muscle stays under threshold |
| Within noise (<~0.5 kg) | All | Use the per-field thresholds |
| Different machine | Device | Not in the CSV or DTO: staff pick it at upload. Same unit: full compare; other model: trends only; other brand: no verdict |
| Re-scan due, Gone quiet | Date | Supported (InBody suggests every 2–4 weeks [3]) |
| "Come fasted, before training" | Conditions | No export has them: ask in the pre-scan checklist |
| Reveal "Score 78 → 80" | FitScore | 2 points is under the ≈3-point noise: show the score, not the change |

The friend's demo pair (+1.1 kg muscle with +1.1 kg lean) is unlikely on an InBody sheet, where muscle is about 57% of lean mass: check the real sheets before the prototype.

## Sources

1. Looney DP, Schafer EA, Chapman CL, et al. Reliability, biological variability, and accuracy of multi-frequency bioelectrical impedance analysis for measuring body composition components. *Front Nutr* 2024;11:1491931. https://www.frontiersin.org/articles/10.3389/fnut.2024.1491931/full
2. Matsumoto C, Ishizaka M, Igawa T. Assessing limb-specific reliability in body composition: a study on minimal detectable change using bioimpedance analysis. *J Phys Ther Sci* 2025;37(4):181–185. https://pmc.ncbi.nlm.nih.gov/articles/PMC11957742/
3. InBody Canada. *InBody 770 Training Manual* (2020). https://inbodycanada.ca/wp-content/uploads/2020/04/InBody-770-Training-Manual.pdf
4. InBody. *The Professional's Guide to the InBody Result Sheet*. https://cdn.shopify.com/s/files/1/0611/7153/1933/files/The_Professional_Guide_to_the_InBody_Result_Sheet.pdf
5. InBody Australia. *Result Sheet Interpretation*. https://au.inbody.com/result-sheet-interpretation/
6. Cunningham JJ. Body composition as a determinant of energy expenditure: a synthetic review and a proposed general prediction equation. *Am J Clin Nutr* 1991;54(6):963–969. https://doi.org/10.1093/ajcn/54.6.963
