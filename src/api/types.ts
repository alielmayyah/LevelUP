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
  deadline: string;
}

export interface MonthlyWins {
  bodyFatChangePct: number | null;
  muscleGainedKg: number | null;
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
  member: { firstName: string; showFitScore: boolean };
  fitScore: FitScoreSummary | null;
  mission: MissionSummary | null;
  monthlyWins: MonthlyWins;
  leaderboard: LeaderboardSummary;
  unreadNotifications: number;
}

/* ---------- Leaderboard (core plan Task 8) ---------- */

export type LeaderboardBoard = 'score' | 'progress' | 'muscle' | 'fatLoss';

export const LEADERBOARD_BOARDS: readonly LeaderboardBoard[] = ['score', 'progress', 'muscle', 'fatLoss'];

export interface LeaderboardRow {
  rank: number;
  memberId: number;
  /** "FirstName L." */
  name: string;
  value: number;
  isMe: boolean;
}

export interface LeaderboardDto {
  board: LeaderboardBoard;
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
}

export type GoalMetric = 'BODY_FAT_KG' | 'MUSCLE_KG' | 'WEIGHT_KG';

export interface GoalView {
  id: number;
  title: string;
  metric: GoalMetric;
  startValue: number;
  targetValue: number;
  deadline: string;
  coachNote: string | null;
  percent: number;
  completedAt: string | null;
}

export interface GoalsDto {
  active: GoalView[];
  completed: GoalView[];
  upcoming: GoalView[];
}

export type Sex = 'MALE' | 'FEMALE';

export interface ProfileDto {
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
