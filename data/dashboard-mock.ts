/**
 * Placeholder data for the home dashboard until the NestJS/Prisma API
 * (assessments, XP ledger, leaderboards) is wired up. Shape mirrors what
 * those endpoints are expected to return.
 */

export const currentMember = {
  name: "Ali",
  streakDays: 12,
};

export const levelProgress = {
  level: 18,
  tier: "Gold",
  xp: 6420,
  xpToNextLevel: 580,
  percentToNextLevel: 78,
};

export const gymLeaderboard = {
  rank: 23,
  topPercent: 15,
  membersBehind: 127,
  membersAhead: 3,
  placesGainedThisWeek: 4,
};

// FitScore: current body composition (0-100), can rise or fall. Distinct
// from LevelUP Score (levelProgress) which only ever accumulates.
export const fitScore = {
  score: 82,
  deltaFromYesterday: 4,
};

// Transformation-goal progress is derived from the mission itself
// (progressKg / targetKg) rather than tracked as a separate number, so the
// dashboard never shows the same percentage twice under two different names.
export const currentMission = {
  title: "Lose 10 kg",
  status: "Active",
  progressKg: 7.4,
  targetKg: 10,
  rewardXp: 500,
  estimatedCompletion: "Sep 2026",
  coachMessage: "You're doing great — keep this pace up.",
};

export const monthStats = {
  bodyFat: { changePercent: -2.3 },
  muscleMass: { changeKg: 0.6 },
  xpEarned: 1450,
};

// Kept for the future Progress page's weekly breakdown chart; the home
// dashboard's "Monthly Wins" grid only surfaces the flat count below.
export const workouts = {
  count: 12,
  deltaFromLastMonth: 3,
  weeks: [
    { label: "W1", value: 55 },
    { label: "W2", value: 70 },
    { label: "W3", value: 100 },
    { label: "W4", value: 32 },
  ],
};

export const dailyChallenge = {
  title: "Drink 2L Water",
  rewardXp: 50,
};
