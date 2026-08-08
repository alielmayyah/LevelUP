// Generates /data/*.json — a static snapshot standing in for a future
// PostgreSQL database. Re-run with `npm run generate:mock-data` after
// editing this file; it always recomputes every cross-reference (XP sums,
// level thresholds, achievement unlock dates, streak boundaries) from the
// same source values below, so the output can never drift out of sync.
//
// "Today" is fixed at generation time — gym-visits.json's most recent 12
// days are attended to match member.streak. Re-running the script later
// without bumping TODAY will leave that streak stale relative to the
// real calendar; that's an inherent limitation of a static JSON snapshot.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
mkdirSync(DATA_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Date helpers (UTC-based so output is identical regardless of host TZ)
// ---------------------------------------------------------------------------

const TODAY = Date.UTC(2026, 6, 7); // 2026-07-07

function addDays(utcMs, days) {
  return utcMs + days * 86_400_000;
}

function isoDate(utcMs) {
  const d = new Date(utcMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoDateTime(utcMs, hour, minute) {
  const d = new Date(utcMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}:00`;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function weekdayOf(utcMs) {
  return WEEKDAYS[new Date(utcMs).getUTCDay()];
}

// ---------------------------------------------------------------------------
// Small seeded PRNG so re-running the script produces identical filler data
// (leaderboard filler members, checkIn times, note text) — only the parts
// with no correctness constraint use this; every number that another file
// depends on is set explicitly below.
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260707);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pickOne = (arr) => arr[randInt(0, arr.length - 1)];

// ---------------------------------------------------------------------------
// Level curve: cumulative XP required for level n = 20 * n * (n - 1).
// Level 18 -> 6120 XP, Level 19 -> 6840 XP. A member with 6420 XP is
// level 18 with 420 XP to go — this formula is the single source of truth
// for every "level should match XP" requirement below.
// ---------------------------------------------------------------------------

function xpForLevel(n) {
  return 20 * n * (n - 1);
}

function levelForXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

const MEMBER_XP = 6420;
const MEMBER_LEVEL = levelForXp(MEMBER_XP);
const XP_TO_NEXT_LEVEL = xpForLevel(MEMBER_LEVEL + 1) - MEMBER_XP;
const PERCENT_TO_NEXT_LEVEL = Math.round(
  ((MEMBER_XP - xpForLevel(MEMBER_LEVEL)) /
    (xpForLevel(MEMBER_LEVEL + 1) - xpForLevel(MEMBER_LEVEL))) *
    100
);

// ---------------------------------------------------------------------------
// 1. Assessments — 12 monthly checkpoints, Aug 2025 -> Jul 2026. Every
// metric is hand-authored (not a pure formula) so the transformation reads
// as a real person's data, but stays monotonic in the healthy direction.
// The Jan 2026 point (index 5) doubles as the "Lose 10kg" goal's start
// weight (88.4kg) so goals.json's 74% progress is arithmetically exact:
// (88.4 - 81.0) / 10 = 0.74.
// ---------------------------------------------------------------------------

const ASSESSMENT_DATES = [
  "2025-08-03",
  "2025-09-04",
  "2025-10-05",
  "2025-11-02",
  "2025-12-06",
  "2026-01-05",
  "2026-02-08",
  "2026-03-07",
  "2026-04-05",
  "2026-05-09",
  "2026-06-06",
  "2026-07-04",
];

const WEIGHT = [92.4, 91.5, 90.6, 89.8, 89.0, 88.4, 87.1, 85.9, 84.6, 83.4, 82.1, 81.0];
const BODY_FAT_PCT = [27.5, 26.8, 26.0, 25.3, 24.5, 23.8, 22.9, 21.8, 20.9, 19.8, 18.7, 17.5];
const MUSCLE_MASS = [31.0, 31.4, 31.8, 32.3, 32.7, 33.1, 33.5, 34.0, 34.4, 34.8, 35.2, 35.6];
const FIT_SCORE = [58, 60, 62, 65, 67, 69, 71, 73, 75, 78, 80, 82];
const VISCERAL_FAT = [13, 12, 12, 11, 10, 10, 9, 9, 8, 8, 7, 7];
const BODY_WATER = [51.0, 51.6, 52.2, 52.9, 53.5, 54.1, 54.8, 55.4, 56.0, 56.7, 57.3, 58.0];
const PROTEIN = [17.5, 17.6, 17.8, 17.9, 18.1, 18.2, 18.4, 18.6, 18.7, 18.9, 19.0, 19.2];
const MINERALS = [3.2, 3.22, 3.25, 3.28, 3.3, 3.33, 3.36, 3.38, 3.41, 3.44, 3.47, 3.5];
const BMR = [1620, 1635, 1650, 1668, 1683, 1698, 1712, 1728, 1742, 1758, 1770, 1785];
const HEIGHT_M = 1.78;

const NOTES = [
  "Great starting point — let's build consistency first.",
  "Solid first month, attendance is paying off already.",
  "Muscle mass trending up nicely, keep protein intake steady.",
  "Fat loss on track. Sleep quality mentioned as a focus area.",
  "Plateaued slightly over the holidays — expected, back on track.",
  "Strong restart in January, visceral fat down a full point.",
  "Best month yet for strength gains alongside the fat loss.",
  "BMR climbing as lean mass increases — metabolism is adapting well.",
  "Consistent, steady progress. No changes needed to the plan.",
  "Noticeable definition improvements, member reports feeling stronger.",
  "Approaching goal weight — discussed maintenance plan for after.",
  "Excellent 12-month transformation. FitScore now in the 'Excellent' tier.",
];

const assessments = ASSESSMENT_DATES.map((date, i) => ({
  id: `asmt_${String(i + 1).padStart(3, "0")}`,
  date,
  weight: WEIGHT[i],
  skeletalMuscleMass: MUSCLE_MASS[i],
  bodyFatMass: Math.round(WEIGHT[i] * (BODY_FAT_PCT[i] / 100) * 100) / 100,
  bodyFatPercentage: BODY_FAT_PCT[i],
  bmi: Math.round((WEIGHT[i] / (HEIGHT_M * HEIGHT_M)) * 100) / 100,
  fitScore: FIT_SCORE[i],
  visceralFat: VISCERAL_FAT[i],
  bodyWater: BODY_WATER[i],
  protein: PROTEIN[i],
  minerals: MINERALS[i],
  basalMetabolicRate: BMR[i],
  notes: NOTES[i],
}));

// ---------------------------------------------------------------------------
// 2. Gym visits — 365 days ending today. Last 12 days are forced true (the
// current streak); the 13th-most-recent day is forced false so the streak
// is exactly 12, not longer. Everything before that is random at ~80%
// attendance (~5.6 visits/week).
// ---------------------------------------------------------------------------

const YEAR_START = addDays(TODAY, -364);
const gymVisits = [];

for (let i = 0; i < 365; i++) {
  const dateMs = addDays(YEAR_START, i);
  const daysAgo = Math.round((TODAY - dateMs) / 86_400_000);

  let attended;
  if (daysAgo <= 11) attended = true; // current 12-day streak
  else if (daysAgo === 12) attended = false; // caps the streak at exactly 12
  else attended = rand() < 0.8; // ~5.6 visits/week historically

  let checkInTime = null;
  let checkOutTime = null;
  let workoutDuration = 0;

  if (attended) {
    const hour = pickOne([6, 7, 8, 12, 17, 18, 19, 20]);
    const minute = pickOne([0, 10, 15, 20, 30, 40, 45]);
    workoutDuration = randInt(40, 95);
    const startMs = Date.UTC(
      new Date(dateMs).getUTCFullYear(),
      new Date(dateMs).getUTCMonth(),
      new Date(dateMs).getUTCDate(),
      hour,
      minute
    );
    const endMs = startMs + workoutDuration * 60_000;
    checkInTime = isoDateTime(startMs, hour, minute);
    const endDate = new Date(endMs);
    checkOutTime = isoDateTime(endMs, endDate.getUTCHours(), endDate.getUTCMinutes());
  }

  gymVisits.push({
    id: `visit_${String(i + 1).padStart(4, "0")}`,
    date: isoDate(dateMs),
    checkInTime,
    checkOutTime,
    workoutDuration,
    weekday: weekdayOf(dateMs),
    attended,
  });
}

const attendedVisits = gymVisits.filter((v) => v.attended);
const workoutWarriorDate = attendedVisits[99]?.date ?? attendedVisits.at(-1).date; // 100th attended day

// Find the first 7-day-consecutive attended run for "Consistency Champion".
let consistencyChampionDate = null;
{
  let run = 0;
  for (const visit of gymVisits) {
    run = visit.attended ? run + 1 : 0;
    if (run === 7) {
      consistencyChampionDate = visit.date;
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Goals
// ---------------------------------------------------------------------------

const currentGoal = {
  id: "goal_003",
  title: "Lose 10kg",
  category: "weight-loss",
  targetValue: 10,
  unit: "kg",
  progressValue: 7.4,
  progressPercent: 74,
  startDate: "2026-01-05",
  deadline: "2026-09-30",
  rewardXp: 500,
  status: "Active",
};

const completedGoals = [
  {
    id: "goal_001",
    title: "Reach 25% Body Fat",
    category: "body-composition",
    targetValue: 25,
    unit: "%",
    progressValue: 25,
    progressPercent: 100,
    startDate: "2025-08-05",
    deadline: "2025-12-01",
    completedDate: "2025-11-10",
    rewardXp: 500,
    status: "Completed",
  },
  {
    id: "goal_002",
    title: "Attend 100 Gym Sessions",
    category: "consistency",
    targetValue: 100,
    unit: "sessions",
    progressValue: 100,
    progressPercent: 100,
    startDate: isoDate(YEAR_START),
    deadline: isoDate(addDays(Date.parse(workoutWarriorDate), 30)),
    completedDate: workoutWarriorDate, // same 100th-visit milestone as the Workout Warrior achievement
    rewardXp: 350,
    status: "Completed",
  },
];

const futureGoals = [
  {
    id: "goal_004",
    title: "Reach 15% Body Fat",
    category: "body-composition",
    targetValue: 15,
    unit: "%",
    progressValue: 0,
    progressPercent: 0,
    startDate: "2026-09-15",
    deadline: "2027-01-15",
    rewardXp: 600,
    status: "Upcoming",
  },
];

// ---------------------------------------------------------------------------
// 4. XP history — every event that must sum to MEMBER_XP (6420) across
// exactly 200 entries. "Structural" events are tied to real dates from the
// data above; the remainder is small "Workout" XP spread across attended
// gym days, balanced to make the totals land exactly on target.
// ---------------------------------------------------------------------------

const xpEvents = [];

function addEvent(date, activity, xpEarned, description) {
  xpEvents.push({ date, activity, xpEarned, description });
}

// Assessment (12): first one bigger, rest smaller.
addEvent(assessments[0].date, "Assessment", 100, "First body composition assessment");
for (let i = 1; i < assessments.length; i++) {
  addEvent(assessments[i].date, "Assessment", 40, "Completed monthly assessment");
}

// Goal Completed (2): matches completedGoals exactly.
for (const goal of completedGoals) {
  addEvent(goal.completedDate, "Goal Completed", goal.rewardXp, `Completed goal: ${goal.title}`);
}

// Gym Streak (31): 20 weekly + 11 monthly consistency bonuses, spread out.
for (let i = 0; i < 20; i++) {
  const dateMs = addDays(YEAR_START, Math.round((i + 0.5) * (365 / 20)));
  addEvent(isoDate(dateMs), "Gym Streak", 25, "7-day gym streak bonus");
}
for (let i = 0; i < 11; i++) {
  const dateMs = addDays(YEAR_START, Math.round((i + 0.5) * (365 / 12)));
  addEvent(isoDate(dateMs), "Gym Streak", 60, "Monthly consistency bonus");
}

// Muscle Gain (4) — roughly where muscle mass crossed each integer kg.
const muscleGainDates = ["2025-10-10", "2026-01-10", "2026-03-12", "2026-06-11"];
for (const date of muscleGainDates) {
  addEvent(date, "Muscle Gain", 100, "Gained 1kg of muscle");
}

// Fat Loss (8) — a few days after each of 8 assessments showing fat loss.
const fatLossAssessmentIdx = [1, 2, 3, 4, 5, 6, 7, 8];
for (const idx of fatLossAssessmentIdx) {
  const date = isoDate(addDays(Date.parse(assessments[idx].date), 3));
  addEvent(date, "Fat Loss", 80, "Lost 1kg of body fat");
}

// Challenge (7): 6 participation + 1 winner bonus.
const challengeParticipationDates = [
  "2025-09-15",
  "2025-11-20",
  "2026-01-25",
  "2026-03-15",
  "2026-05-05",
  "2026-06-20",
];
for (const date of challengeParticipationDates) {
  addEvent(date, "Challenge", 50, "Participated in a gym challenge");
}
addEvent("2026-02-15", "Challenge", 200, "Won challenge: Attend Gym 20 Times");

// Leaderboard Reward (2) + Monthly Champion (1).
addEvent("2026-02-28", "Leaderboard Reward", 100, "Top-5 finish on the monthly leaderboard");
addEvent("2026-05-31", "Leaderboard Reward", 100, "Top-5 finish on the monthly leaderboard");
addEvent("2026-04-30", "Monthly Champion", 250, "#1 in your gym for the month");

// Workout: fill the remaining count/budget from attended gym days.
const structuralTotal = xpEvents.reduce((sum, e) => sum + e.xpEarned, 0);
const TARGET_TOTAL = MEMBER_XP;
const TARGET_COUNT = 200;
const workoutCount = TARGET_COUNT - xpEvents.length;
const workoutBudget = TARGET_TOTAL - structuralTotal;

const usedDates = new Set(xpEvents.map((e) => e.date));
const workoutDatePool = attendedVisits
  .map((v) => v.date)
  .filter((d) => !usedDates.has(d));
// Sample `workoutCount` dates spread evenly across the pool (with light
// jitter) rather than clustering, then sort chronologically.
const workoutDates = [];
for (let i = 0; i < workoutCount; i++) {
  const idx = Math.min(
    workoutDatePool.length - 1,
    Math.floor((i / workoutCount) * workoutDatePool.length + randInt(0, 2))
  );
  workoutDates.push(workoutDatePool[idx]);
}
workoutDates.sort();

// Random base values in [10, 25], then nudge until the sum matches exactly.
const workoutValues = workoutDates.map(() => randInt(10, 25));
let diff = workoutBudget - workoutValues.reduce((a, b) => a + b, 0);
let guard = 0;
while (diff !== 0 && guard < 100_000) {
  const i = randInt(0, workoutValues.length - 1);
  if (diff > 0 && workoutValues[i] < 40) {
    workoutValues[i]++;
    diff--;
  } else if (diff < 0 && workoutValues[i] > 5) {
    workoutValues[i]--;
    diff++;
  }
  guard++;
}
workoutDates.forEach((date, i) => {
  addEvent(date, "Workout", workoutValues[i], "Logged a workout session");
});

// Chronological order + running cumulative total (used by achievements.json).
xpEvents.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
let cumulative = 0;
const xpHistory = xpEvents.map((e, i) => {
  cumulative += e.xpEarned;
  return { id: `xp_${String(i + 1).padStart(4, "0")}`, ...e, cumulativeXp: cumulative };
});

function firstDateAtOrAbove(threshold) {
  return xpHistory.find((e) => e.cumulativeXp >= threshold)?.date;
}

// ---------------------------------------------------------------------------
// 5. Achievements — every unlock date is derived from the data above.
// ---------------------------------------------------------------------------

const achievements = [
  {
    id: "ach_01",
    title: "First Assessment",
    description: "Completed your first body composition assessment",
    unlocked: true,
    unlockedDate: assessments[0].date,
    xpReward: 100,
    icon: "clipboard-check",
  },
  {
    id: "ach_02",
    title: "First Goal",
    description: "Created your first goal",
    unlocked: true,
    unlockedDate: completedGoals[0].startDate,
    xpReward: 50,
    icon: "flag",
  },
  {
    id: "ach_03",
    title: "5 Assessments",
    description: "Completed 5 body composition assessments",
    unlocked: true,
    unlockedDate: assessments[4].date,
    xpReward: 150,
    icon: "clipboard-list",
  },
  {
    id: "ach_04",
    title: "10 Assessments",
    description: "Completed 10 body composition assessments",
    unlocked: true,
    unlockedDate: assessments[9].date,
    xpReward: 250,
    icon: "clipboard-list",
  },
  {
    id: "ach_05",
    title: "1000 XP",
    description: "Earned 1,000 total XP",
    unlocked: true,
    unlockedDate: firstDateAtOrAbove(1000),
    xpReward: 100,
    icon: "zap",
  },
  {
    id: "ach_06",
    title: "5000 XP",
    description: "Earned 5,000 total XP",
    unlocked: true,
    unlockedDate: firstDateAtOrAbove(5000),
    xpReward: 200,
    icon: "zap",
  },
  {
    id: "ach_07",
    title: "Gold Badge",
    description: "Reached Gold tier",
    unlocked: true,
    unlockedDate: firstDateAtOrAbove(xpForLevel(15)),
    xpReward: 300,
    icon: "award",
  },
  {
    id: "ach_08",
    title: "Consistency Champion",
    description: "Attended the gym 7 days in a row",
    unlocked: true,
    unlockedDate: consistencyChampionDate,
    xpReward: 200,
    icon: "flame",
  },
  {
    id: "ach_09",
    title: "Goal Crusher",
    description: "Completed your first goal",
    unlocked: true,
    unlockedDate: completedGoals[0].completedDate,
    xpReward: 250,
    icon: "trophy",
  },
  {
    id: "ach_10",
    title: "Workout Warrior",
    description: "Logged 100 gym visits",
    unlocked: true,
    unlockedDate: workoutWarriorDate,
    xpReward: 300,
    icon: "dumbbell",
  },
];

// ---------------------------------------------------------------------------
// 6. Trophies
// ---------------------------------------------------------------------------

const trophies = [
  {
    id: "trophy_01",
    title: "Bronze",
    description: "Completed your first month of tracking",
    date: isoDate(addDays(YEAR_START, 30)),
    rarity: "bronze",
    icon: "medal",
  },
  {
    id: "trophy_02",
    title: "Silver",
    description: "Reached Level 10",
    date: firstDateAtOrAbove(xpForLevel(10)),
    rarity: "silver",
    icon: "medal",
  },
  {
    id: "trophy_03",
    title: "Gold",
    description: "Reached Level 15 and earned Gold tier",
    date: firstDateAtOrAbove(xpForLevel(15)),
    rarity: "gold",
    icon: "medal",
  },
  {
    id: "trophy_04",
    title: "Monthly Champion",
    description: "#1 in your gym for the month",
    date: "2026-04-30",
    rarity: "gold",
    icon: "crown",
  },
  {
    id: "trophy_05",
    title: "Top 10",
    description: "Finished a month ranked in your gym's Top 10",
    date: "2026-02-28",
    rarity: "silver",
    icon: "trending-up",
  },
  {
    id: "trophy_06",
    title: "Top 3",
    description: "Finished a month ranked in your gym's Top 3",
    date: "2026-05-31",
    rarity: "gold",
    icon: "trending-up",
  },
  {
    id: "trophy_07",
    title: "Most Consistent",
    description: "Highest attendance rate in your gym for the month",
    date: consistencyChampionDate,
    rarity: "silver",
    icon: "flame",
  },
  {
    id: "trophy_08",
    title: "Most Improved",
    description: "Greatest body composition improvement in your gym for the month",
    date: "2026-03-01",
    rarity: "gold",
    icon: "trending-up",
  },
];

// ---------------------------------------------------------------------------
// 7. Challenges
// ---------------------------------------------------------------------------

const challenges = [
  {
    id: "chal_01",
    title: "Lose 2kg Body Fat",
    description: "Reduce body fat mass by 2kg this month",
    xpReward: 200,
    participants: 34,
    status: "active",
    progress: 60,
  },
  {
    id: "chal_02",
    title: "Attend Gym 20 Times",
    description: "Check in to the gym 20 times this month",
    xpReward: 150,
    participants: 52,
    status: "completed",
    progress: 100,
  },
  {
    id: "chal_03",
    title: "Gain 1kg Muscle",
    description: "Increase skeletal muscle mass by 1kg",
    xpReward: 180,
    participants: 28,
    status: "active",
    progress: 45,
  },
  {
    id: "chal_04",
    title: "Workout 5 Days",
    description: "Complete a workout on 5 different days this week",
    xpReward: 75,
    participants: 61,
    status: "completed",
    progress: 100,
  },
  {
    id: "chal_05",
    title: "Drink 2L Water",
    description: "Log 2 liters of water intake today",
    xpReward: 50,
    participants: 89,
    status: "active",
    progress: 0,
  },
];

// ---------------------------------------------------------------------------
// 8. Leaderboard — 50 members, current member fixed at rank 23 so
// "Top 15%" and "127 members behind" (127 = 150 - 23) stay consistent with
// member.json's totalMembers.
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "Omar", "Layla", "Karim", "Yasmin", "Tarek", "Nour", "Hassan", "Dina",
  "Sami", "Rana", "Fadi", "Maya", "Ziad", "Salma", "Amir", "Huda",
  "Bilal", "Farah", "Nadia", "Rami", "Lina", "Adam", "Reem", "Youssef",
];
const LAST_NAMES = [
  "Haddad", "Khoury", "Saab", "Farah", "Aziz", "Nasser", "Sabbagh", "Rahal",
  "Mansour", "Fares", "Kanaan", "Barakat", "Chami", "Daher", "Ghosn", "Jaber",
];

function randomName(usedNames) {
  let name;
  do {
    name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function badgeForXp(xp) {
  if (xp >= 12000) return "Platinum";
  if (xp >= 6000) return "Gold";
  if (xp >= 2500) return "Silver";
  return "Bronze";
}

const usedNames = new Set(["Ali Hassan"]);
const higherEntries = Array.from({ length: 22 }, (_, i) => {
  const xp = Math.round(17800 - i * 520 + randInt(-60, 60));
  return { xp: Math.max(xp, 6500) };
}).sort((a, b) => b.xp - a.xp);

const lowerEntries = Array.from({ length: 27 }, (_, i) => {
  const xp = Math.round(6300 - i * 220 + randInt(-40, 40));
  return { xp: Math.max(xp, 320) };
}).sort((a, b) => b.xp - a.xp);

const memberEntry = {
  name: "Ali Hassan",
  xp: MEMBER_XP,
  level: MEMBER_LEVEL,
  badge: "Gold",
  fitScore: 82,
  gymVisits: attendedVisits.length,
  streak: 12,
  isCurrentUser: true,
};

const leaderboardXpOrder = [
  ...higherEntries.map((e) => e.xp),
  MEMBER_XP,
  ...lowerEntries.map((e) => e.xp),
];

const leaderboard = leaderboardXpOrder.map((xp, i) => {
  if (xp === MEMBER_XP && i === 22) {
    return { rank: i + 1, ...memberEntry };
  }
  const level = levelForXp(xp);
  return {
    rank: i + 1,
    name: randomName(usedNames),
    xp,
    level,
    badge: badgeForXp(xp),
    fitScore: randInt(45, 95),
    gymVisits: randInt(40, 280),
    streak: randInt(0, 30),
    isCurrentUser: false,
  };
});

// ---------------------------------------------------------------------------
// 9. Member
// ---------------------------------------------------------------------------

const TOTAL_MEMBERS = 150;

const member = {
  id: "mem_00123",
  gymId: "gym_0007",
  firstName: "Ali",
  lastName: "Hassan",
  fullName: "Ali Hassan",
  gender: "male",
  age: 29,
  height: 178,
  currentWeight: WEIGHT.at(-1),
  joinDate: isoDate(YEAR_START), // gym-visits.json's history starts here too
  membershipType: "Premium",
  profilePicture: "/avatars/ali-hassan.png",
  level: MEMBER_LEVEL,
  xp: MEMBER_XP,
  xpToNextLevel: XP_TO_NEXT_LEVEL,
  streak: 12,
  fitScore: FIT_SCORE.at(-1),
  badge: "Gold",
  gymRank: 23,
  totalMembers: TOTAL_MEMBERS,
  gymName: "PulseFit Downtown",
  coach: "Sarah Nassar",
  theme: "purple",
  darkMode: true,
};

// ---------------------------------------------------------------------------
// 10. Notifications
// ---------------------------------------------------------------------------

const notifications = [
  {
    id: "notif_01",
    date: isoDate(addDays(TODAY, -1)),
    type: "level_up",
    title: "Level Up!",
    message: "You reached Level 18. 420 XP to go until Level 19.",
    read: false,
  },
  {
    id: "notif_02",
    date: isoDate(addDays(TODAY, -2)),
    type: "goal_progress",
    title: "Goal Progress",
    message: "You're 74% toward your \"Lose 10kg\" goal — keep it up!",
    read: false,
  },
  {
    id: "notif_03",
    date: isoDate(addDays(TODAY, -3)),
    type: "challenge_starting",
    title: "Challenge Starting Tomorrow",
    message: "\"Drink 2L Water\" challenge starts tomorrow. +50 XP for finishing.",
    read: true,
  },
  {
    id: "notif_04",
    date: isoDate(addDays(TODAY, -4)),
    type: "leaderboard_updated",
    title: "Leaderboard Updated",
    message: "You moved up to #23 in your gym this month.",
    read: true,
  },
  {
    id: "notif_05",
    date: isoDate(addDays(TODAY, -6)),
    type: "coach_comment",
    title: "Coach Comment",
    message: "\"You're doing great — keep this pace up.\" - Coach Sarah",
    read: true,
  },
  {
    id: "notif_06",
    date: isoDate(addDays(TODAY, -8)),
    type: "achievement_unlocked",
    title: "Achievement Unlocked",
    message: "You unlocked \"Workout Warrior\" for logging 100 gym visits.",
    read: true,
  },
  {
    id: "notif_07",
    date: isoDate(addDays(TODAY, -15)),
    type: "new_assessment_available",
    title: "New Assessment Available",
    message: "It's been almost a month since your last assessment — book your next one.",
    read: true,
  },
  {
    id: "notif_08",
    date: isoDate(addDays(TODAY, -20)),
    type: "achievement_unlocked",
    title: "Achievement Unlocked",
    message: "You unlocked \"Consistency Champion\" for a 7-day gym streak.",
    read: true,
  },
  {
    id: "notif_09",
    date: isoDate(addDays(TODAY, -34)),
    type: "goal_progress",
    title: "Goal Progress",
    message: "You've lost 6kg of your 10kg goal — over halfway there!",
    read: true,
  },
  {
    id: "notif_10",
    date: isoDate(addDays(TODAY, -40)),
    type: "leaderboard_updated",
    title: "Leaderboard Updated",
    message: "You finished last month ranked in the gym's Top 10.",
    read: true,
  },
];

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

function write(filename, data) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote ${filename}`);
}

write("member.json", member);
write("assessments.json", assessments);
write("gym-visits.json", gymVisits);
write("goals.json", { currentGoal, completedGoals, futureGoals });
write("achievements.json", achievements);
write("leaderboard.json", leaderboard);
write(
  "xp-history.json",
  // cumulativeXp was only a build-time aid (used above for achievement
  // unlock dates); the output file keeps just the four requested fields.
  xpHistory.map((e) => ({
    id: e.id,
    date: e.date,
    activity: e.activity,
    xpEarned: e.xpEarned,
    description: e.description,
  }))
);
write("notifications.json", notifications);
write("trophies.json", trophies);
write("challenges.json", challenges);

// ---------------------------------------------------------------------------
// Self-check: fail loudly instead of writing data that doesn't add up.
// ---------------------------------------------------------------------------

const xpSum = xpHistory.reduce((sum, e) => sum + e.xpEarned, 0);
console.log("\n--- consistency check ---");
console.log(`xp-history events: ${xpHistory.length} (expected 200)`);
console.log(`xp-history sum: ${xpSum} (expected ${MEMBER_XP})`);
console.log(`member level: ${MEMBER_LEVEL}, xpToNextLevel: ${XP_TO_NEXT_LEVEL}, percent: ${PERCENT_TO_NEXT_LEVEL}%`);
console.log(`leaderboard rank 23: ${leaderboard[22].name}, xp ${leaderboard[22].xp}`);
console.log(`attended gym days: ${attendedVisits.length} / 365`);

if (xpHistory.length !== 200) throw new Error("xp-history.json must have exactly 200 events");
if (xpSum !== MEMBER_XP) throw new Error(`xp-history sum ${xpSum} !== member.xp ${MEMBER_XP}`);
if (leaderboard[22].xp !== MEMBER_XP) throw new Error("member is not at rank 23 in leaderboard.json");
if (leaderboard.length !== 50) throw new Error("leaderboard.json must have exactly 50 entries");
