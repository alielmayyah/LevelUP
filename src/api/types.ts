/*
 * API data types. Components and fixtures import DTO types from this file only.
 *
 * Sprint 1: hand-written from the core plan (Tasks 5, 7, 8, 9).
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

export type FitScoreTier = 'Elite' | 'Strong' | 'On Track' | 'Building' | 'Needs Improvement';

export interface FitScoreSummary {
  score: number;
  tier: FitScoreTier;
  /** Points since the previous scan; null with fewer than 2 scans. */
  changeSinceLastScan: number | null;
}

export interface MissionSummary {
  goalId: number;
  title: string;
  percent: number;
  doneKg: number;
  remainingKg: number;
  estimatedCompletion: string | null;
  coachNote: string | null;
  /** Null for goals the member set without a due date. */
  deadline: string | null;
}

export interface MonthlyWins {
  bodyFatChangePct: number | null;
  muscleGainedKg: number | null;
  /** BMI change this month; null without a scan this month. */
  bmiChange: number | null;
  /** BMI on the latest scan, so the app can tell whether down or up is good news. */
  bmi: number | null;
}

export interface LeaderboardStanding {
  rank: number;
  totalMembers: number;
  topPercent: number;
  membersBehind: number;
  /** null at rank 1. */
  pointsToNextRank: number | null;
}

export interface LeaderboardSummary {
  optedIn: boolean;
  /** null when not opted in or with no scan yet. */
  standing: LeaderboardStanding | null;
}

export interface DashboardDto {
  member: {
    /** Opaque member id; seeds the starter character when none is saved. */
    memberId: number;
    firstName: string;
    sex?: Sex;
    showFitScore: boolean;
    /** The member's saved character, so Home shows their picture without a second request. */
    avatar: AvatarConfigDto | null;
  };
  fitScore: FitScoreSummary | null;
  mission: MissionSummary | null;
  monthlyWins: MonthlyWins;
  leaderboard: LeaderboardSummary;
  unreadNotifications: number;
}

/* ---------- Leaderboard (core plan Task 8) ---------- */

/**
 * score: highest FitScore. muscle: most skeletal muscle (kg). bodyFat: lowest
 * body fat (%). All three use each member's latest scan.
 */
export type LeaderboardBoard = 'score' | 'muscle' | 'bodyFat';

export const LEADERBOARD_BOARDS: readonly LeaderboardBoard[] = ['score', 'muscle', 'bodyFat'];

export interface LeaderboardRow {
  rank: number;
  memberId: number;
  /** "FirstName L." */
  name: string;
  value: number;
  isMe: boolean;
  /**
   * The member's saved character. Sent only on the member's own row until a
   * separate avatar-sharing setting exists; null otherwise, and the app draws
   * the starter for `memberId`.
   */
  avatar: AvatarConfigDto | null;
}

export interface LeaderboardDto {
  board: LeaderboardBoard;
  /** Members are ranked within their own division (account sex), since men's and women's body composition differ. */
  division: Sex;
  optedIn: boolean;
  rows: LeaderboardRow[];
}

/* ---------- Progress, goals, profile, notifications (core plan Task 9) ---------- */

export interface ProgressPoint {
  takenAt: string;
  weightKg: number;
  skeletalMuscleKg: number;
  bodyFatPct: number;
  fitScore: number;
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
  /** Null for goals the member set without a due date. */
  deadline: string | null;
  coachNote: string | null;
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
  /** Opaque member id; seeds the starter character, so it matches the leaderboard. */
  memberId: number;
  firstName: string;
  lastName: string;
  fitId: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  membershipPlan: string;
  membershipStart: string;
  membershipEnd: string;
  coach: { name: string } | null;
  showFitScore: boolean;
  fitScoreOnLeaderboard: boolean;
  /** The member's saved character; null until they save one (the app then shows a starter). */
  avatar: AvatarConfigDto | null;
}

/* ---------- Character (character customization plan) ---------- */

/** Parts of the standard character that take a color preset. */
export type AvatarPart = 'skin' | 'hair' | 'eyes' | 'tank' | 'shorts' | 'shoes';
export type AvatarRig = 'standard' | 'women';

export interface AvatarStyles {
  hair:
    | 'curls'
    | 'fade'
    | 'side-part'
    | 'locs'
    | 'top-knot'
    | 'buzz-cut'
    | 'waves'
    | 'shaved'
    | 'spikes'
    | 'braids'
    | 'high-ponytail'
    | 'braided-ponytail'
    | 'low-bun'
    | 'puff'
    | 'tapered-curls'
    | 'double-braids'
    | 'high-bun'
    | 'sport-hijab'
    | 'wrap-hijab'
    | 'longline-hijab';
  body:
    | 'balanced'
    | 'lean'
    | 'broad'
    | 'compact'
    | 'tall'
    | 'stocky'
    | 'athletic'
    | 'relaxed'
    | 'long-limbed'
    | 'power-build';
  top:
    | 'tank'
    | 'tee'
    | 'hoodie'
    | 'track-jacket'
    | 'sweatshirt'
    | 'varsity'
    | 'mesh-tee'
    | 'compression-top'
    | 'quarter-zip'
    | 'sleeveless-hoodie'
    | 'longline-tank'
    | 'racerback-bra'
    | 'fitted-zip'
    | 'hood-up'
    | 'zip-hoodie'
    | 'raglan-top'
    | 'longline-training-top';
  shoes:
    | 'trainers'
    | 'high-tops'
    | 'runners'
    | 'slip-ons'
    | 'boots'
    | 'canvas'
    | 'lifters'
    | 'cross-trainers'
    | 'barefoot'
    | 'flat-lifters'
    | 'cushioned-runners';
  pants?:
    | 'shorts'
    | 'joggers'
    | 'cargo'
    | 'track-pants'
    | 'jeans'
    | 'bike-shorts'
    | 'liner-shorts'
    | 'training-tights'
    | 'split-shorts'
    | 'warmup-pants'
    | 'high-rise-leggings'
    | 'capris'
    | 'tapered-joggers'
    | 'panel-tights'
    | 'loose-training-shorts';
  beard?:
    | 'clean-shaven'
    | 'stubble'
    | 'mustache'
    | 'goatee'
    | 'short-beard'
    | 'full-beard'
    | 'chin-strap'
    | 'fade-beard'
    | 'chin-tuft'
    | 'boxed-beard'
    | 'circle-beard';
  socks?:
    | 'no-socks'
    | 'ankle-socks'
    | 'crew-socks'
    | 'striped-socks'
    | 'knee-highs'
    | 'grip-socks'
    | 'cushioned-socks'
    | 'tab-socks'
    | 'compression-socks';
  face?: 'smile' | 'focused' | 'grin';
  glasses?: 'no-glasses' | 'round-glasses' | 'rectangular-glasses' | 'sport-glasses';
}

/**
 * A saved character: catalog preset IDs only, never raw colors or markup.
 * Body of PUT /me/avatar (full replacement), which returns the saved config.
 */
export interface AvatarConfigDto {
  schemaVersion: 1;
  rig: AvatarRig;
  colors: Record<AvatarPart, string> & {
    beard?: string;
    socks?: string;
    hijab?: string;
    /** Accepted when reading older saves. The mouth shade is derived from skin tone. */
    smile?: 'dark-plum' | 'brown' | 'warm-brown';
  };
  /** Optional for characters saved before styles were available. */
  styles?: AvatarStyles;
  /** The hairstyle to restore when a member removes their hijab. */
  hairUnderHijab?: AvatarStyles['hair'];
}

export interface SettingsDto {
  showFitScore: boolean;
  fitScoreOnLeaderboard: boolean;
}

/** Body of PATCH /me/settings. At least one field is required. */
export type SettingsPatch = Partial<SettingsDto>;

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
