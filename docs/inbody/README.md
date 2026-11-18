# InBody data example

[`inbody-data-example.json`](inbody-data-example.json) is a sample of what InBody devices report: a full body composition result (InBody 770 / 970), plus body water (BWA 2.0), blood pressure (BPBIO 750), height (BSM 370), balance (FRA 510S), a home scale and band (Dial H30, BAND 3), and the flat CSV a device exports over USB. The values are made up for reference. They are not a real person's results.

Use it as a reference when building scan import (staff ingest in the API, core plan Task 6) or adding a new scan metric.

## How the body composition result maps to the app

The app stores one scan as `AssessmentDto` (`src/api/types.ts`). From `flagship_clinical_body_composition`:

| `AssessmentDto` field | InBody field | CSV column |
|---|---|---|
| `takenAt` | `test_info.timestamp` | `Date` + `Time` |
| `weightKg` | `test_info.measured_weight_kg` | `Weight` |
| `skeletalMuscleKg` | `skeletal_muscle_mass_kg.value` | `SMM` |
| `bodyFatKg` | `body_fat_mass_kg.value` | `BFM` |
| `bodyFatPct` | `percent_body_fat.value` | `PBF` |
| `bmi` | `bmi_kg_m2.value` | `BMI` |
| `visceralFatLevel` | `visceral_fat_level.value` | `VFL` |
| `totalBodyWaterKg` | `total_body_water_l.value` (1 L of body water is about 1 kg) | `TBW` |
| `proteinKg` | `protein_kg.value` | `Protein` |
| `mineralsKg` | `mineral_kg.value` | `Mineral` |
| `bmrKcal` | `basal_metabolic_rate_kcal` | `BMR` |
| `fitScore` | Worked out by the API with the InBody Score method, not copied from `inbody_score` | `InBody_Score` (for checking only) |
| `segments.lean.<part>` | `segmental_lean_mass_kg.<part>`: `mass` to `kg`, `percentage_ideal` to `pct` | `RA_Lean` … `LL_Lean` (kg only) |

Body parts: `right_arm` is `rightArm`, `left_arm` is `leftArm`, `trunk` is `trunk`, `right_leg` is `rightLeg`, `left_leg` is `leftLeg`. The example has no segmental fat, so `segments.fat` would need a device report that includes it; otherwise `segments` stays `null`.

Height and sex come from the member's profile, not the scan. Everything else in the file (water split, phase angle, impedance, blood pressure, balance, wearables) isn't used by the app yet.
