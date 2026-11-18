/*
 * API data types. Components and fixtures import DTO types from this file only.
 *
 * Sprint 1: hand-written from the core plan (Tasks 5, 7, 9).
 * Sprint 2: each type becomes a re-export of the generated OpenAPI schema,
 * e.g. `export type DashboardDto = components['schemas']['DashboardDto']`,
 * so components never change.
 *
 * Dates are ISO 8601 strings in UTC.
 */

/* ---------- Auth (core plan Task 5) ---------- */

export interface LoginRequest {
  fitId: string;
}

export interface LoginResponse {
  accessToken: string;
  member: { id: number; firstName: string };
}

/* ---------- Dashboard (core plan Task 7) ---------- */

export interface FitScoreSummary {
  score: number;
}

export interface MissionSummary {
  goalId: number;
  title: string;
  percent: number;
  doneKg: number;
  remainingKg: number;
  estimatedCompletion: string | null;
}

/* "Your plan": what to do next, from the latest scan (rules in src/body/advice.ts). */

/** act: fix this first. watch: keep an eye on it. keep: going well, carry on. */
export type AdviceLevel = 'act' | 'watch' | 'keep';

export type AdviceKey =
  | 'visceralHigh'
  | 'fatHigh'
  | 'muscleLow'
  | 'fatRising'
  | 'muscleDropping'
  | 'fatLow'
  | 'waterLow'
  | 'muscleStrong'
  | 'fatHealthy';

export type AdviceMetric = 'visceral' | 'fat' | 'muscle' | 'water';

/** One plan item. The app writes its copy from `key` (`plan.item.<key>`) and fills in `params`. */
export interface Advice {
  key: AdviceKey;
  level: AdviceLevel;
  metric: AdviceMetric;
  /** Numbers for the copy (formatted by the screen): body fat %, kg, limits. */
  params: Record<string, number>;
}

export interface DashboardDto {
  member: {
    /** Opaque member id; seeds the starter character when none is saved. */
    memberId: number;
    firstName: string;
    sex?: Sex;
    /** The member's saved character, so Home shows their picture without a second request. */
    avatar: AvatarConfigDto | null;
  };
  fitScore: FitScoreSummary | null;
  /**
   * The plan from the latest scan (and the one before it), most important
   * first, so Home can show the next step without fetching scans. Empty with no scan.
   */
  plan: Advice[];
  mission: MissionSummary | null;
  unreadNotifications: number;
}

/* ---------- Progress, goals, profile, notifications (core plan Task 9) ---------- */

export interface ProgressPoint {
  takenAt: string;
  weightKg: number;
  skeletalMuscleKg: number;
  bodyFatPct: number;
}

/** Assessments in ascending date order. */
export interface ProgressDto {
  assessments: ProgressPoint[];
}

export interface AssessmentDto {
  id: number;
  takenAt: string;
  weightKg: number;
  skeletalMuscleKg: number;
  bodyFatKg: number;
  bodyFatPct: number;
  bmi: number;
  visceralFatLevel: number;
  totalBodyWaterKg: number;
  proteinKg: number;
  mineralsKg: number;
  bmrKcal: number;
  fitScore: number;
  /** Lean and fat mass by body part, as the scanner reports them; null when the scanner doesn't measure segments. */
  segments: SegmentalAnalysis | null;

  /*
   * Redesign additions (docs/redesign/PLAN.md, "Data contract"). All optional,
   * so older payloads and fixtures stay valid. A later breaking step retires
   * `segments` in favor of the two fields below.
   */

  /** Where the scan came from: source, trust, machine, place, test conditions. */
  origin?: ScanOrigin;
  /** Normal bands the machine printed. A missing key falls back to src/body/standards.ts. */
  ranges?: Partial<Record<RangedKey, NormalRange>>;
  /** Extra readings for the report's "more numbers" sheet and the API's rules. */
  extra?: ScanExtras;
  /** Lean mass by body part on its own; null when the machine doesn't report it. */
  segmentalLean?: Record<BodySegment, SegmentReading> | null;
  /** Fat mass by body part on its own; null when the machine doesn't report it. */
  segmentalFat?: Record<BodySegment, SegmentReading> | null;
}

/** Metrics a machine prints a normal band for. */
export type RangedKey =
  | 'weightKg'
  | 'skeletalMuscleKg'
  | 'bodyFatKg'
  | 'bodyFatPct'
  | 'fatFreeMassKg'
  | 'totalBodyWaterKg'
  | 'proteinKg'
  | 'mineralsKg'
  | 'ecwRatio';

export interface NormalRange {
  low: number;
  high: number;
}

/** csv/excel: the machine's export. typed: staff copied the sheet. manual: the member typed it. photo: read from a photo of the sheet. */
export type ScanSource = 'csv' | 'excel' | 'typed' | 'manual' | 'photo';

/** manual scans are kept out of stats, levels and trainer leads. */
export type ScanTrust = 'verified' | 'typed' | 'manual';

export interface ScanDevice {
  id: number;
  /** e.g. "InBody". Scans on different brands are never compared. */
  brand: string;
  /** e.g. "770". A different machine gets direction only: no verdict, level or celebration. */
  model: string;
}

export interface ScanPlace {
  orgId: number;
  /** The gym's name, e.g. "Iron Box". */
  name: string;
  branch: string | null;
}

export interface ScanOrigin {
  source: ScanSource;
  trust: ScanTrust;
  device: ScanDevice | null;
  place: ScanPlace | null;
  /** From the pre-scan checklist; null means it wasn't asked. */
  conditions: { fasted: boolean | null; trainedBefore: boolean | null };
  /** Signed, expiring link to a photo of the printed sheet. */
  sheetImageUrl: string | null;
}

export interface ScanExtras {
  /** As typed on the machine for this scan (the profile may differ). */
  heightCm: number | null;
  fatFreeMassKg: number | null;
  softLeanMassKg: number | null;
  intracellularWaterL: number | null;
  extracellularWaterL: number | null;
  /** Extracellular water ÷ total body water. Fitness information, not diagnosis. */
  ecwRatio: number | null;
  visceralFatAreaCm2: number | null;
  /** Whole body, 50 kHz. */
  phaseAngleDeg: number | null;
  segmentPhaseAngleDeg: Record<BodySegment, number> | null;
  /** The InBody Score the machine printed; shown as a detail only when present. */
  deviceScore: number | null;
}

/** Body parts an InBody scan reports separately. Left and right are the member's own sides. */
export type BodySegment = 'leftArm' | 'rightArm' | 'trunk' | 'leftLeg' | 'rightLeg';

export const BODY_SEGMENTS: readonly BodySegment[] = ['leftArm', 'rightArm', 'trunk', 'leftLeg', 'rightLeg'];

export interface SegmentReading {
  kg: number;
  /** Percent of the standard for this body part at the member's height. */
  pct: number;
}

export interface SegmentalAnalysis {
  lean: Record<BodySegment, SegmentReading>;
  fat: Record<BodySegment, SegmentReading>;
}

export type GoalMetric = 'BODY_FAT_KG' | 'MUSCLE_KG' | 'WEIGHT_KG';

export interface GoalView {
  id: number;
  title: string;
  metric: GoalMetric;
  startValue: number;
  targetValue: number;
  percent: number;
  completedAt: string | null;
}

/** POST /me/goals: the member sets their own goal, with no due date; it starts from their latest scan. */
export interface CreateGoalRequest {
  metric: GoalMetric;
  targetValue: number;
}

export interface GoalsDto {
  active: GoalView[];
  completed: GoalView[];
}

export type Sex = 'MALE' | 'FEMALE';

export interface ProfileDto {
  /** Opaque member id; seeds the starter portrait. */
  memberId: number;
  firstName: string;
  lastName: string;
  fitId: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  /** The member's saved character; null until they save one (the app then shows a starter). */
  avatar: AvatarConfigDto | null;
}

/* ---------- Character ---------- */

/** Persisted color slots, including two legacy slots kept for schema compatibility. */
export type AvatarPart = 'skin' | 'hair' | 'top' | 'bottom' | 'shoes';

export interface AvatarPortraitDto {
  look: 'curls' | 'fade' | 'swept' | 'bob' | 'bun' | 'hijab';
  outfit: 'tee' | 'hoodie' | 'jacket';
  eyes: 'brown' | 'hazel' | 'green' | 'blue' | 'grey';
  /** Outfit palette ID remembered independently of hair and clothing colors. */
  hijabColor?: string;
}

/**
 * A saved character: catalog preset IDs only, never raw colors or markup.
 * Body of PUT /me/avatar (full replacement), which returns the saved config.
 * Schema 1 (the drawn characters) may still be stored; the app reads it as the
 * default look and keeps any color that still exists.
 */
export interface AvatarConfigDto {
  schemaVersion: 2;
  colors: Record<AvatarPart, string>;
  /** Omitted by older saves and clients, which use the default front portrait. */
  portrait?: AvatarPortraitDto;
}

/** Language-neutral text: an i18n key plus interpolation params. */
export interface I18nText {
  key: string;
  params?: Record<string, string | number>;
}

export type NotificationType = 'SCAN_RESULT' | 'MISSION_COMPLETE';

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: I18nText;
  body: I18nText;
  createdAt: string;
  readAt: string | null;
}
