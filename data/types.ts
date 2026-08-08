/**
 * Shapes for /data/*.json — a static snapshot standing in for the future
 * PostgreSQL tables (see data/README.md for the file -> table mapping).
 * Import the JSON directly and cast, e.g.:
 *
 *   import memberJson from "@/data/member.json";
 *   const member = memberJson as Member;
 */

export interface Member {
  id: string;
  gymId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "male" | "female" | "other";
  age: number;
  height: number; // cm
  currentWeight: number; // kg
  joinDate: string; // ISO date
  membershipType: string;
  profilePicture: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  fitScore: number;
  badge: string;
  gymRank: number;
  totalMembers: number;
  gymName: string;
  coach: string;
  theme: string;
  darkMode: boolean;
}

export interface Assessment {
  id: string;
  date: string;
  weight: number;
  skeletalMuscleMass: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  bmi: number;
  fitScore: number;
  visceralFat: number;
  bodyWater: number;
  protein: number;
  minerals: number;
  basalMetabolicRate: number;
  notes: string;
}

export interface GymVisit {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workoutDuration: number; // minutes, 0 on rest days
  weekday: string;
  attended: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  unit: string;
  progressValue: number;
  progressPercent: number;
  startDate: string;
  deadline: string;
  completedDate?: string;
  rewardXp: number;
  status: "Active" | "Completed" | "Upcoming";
}

export interface GoalsFile {
  currentGoal: Goal;
  completedGoals: Goal[];
  futureGoals: Goal[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  xpReward: number;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  badge: string;
  fitScore: number;
  gymVisits: number;
  streak: number;
  isCurrentUser: boolean;
}

export type XpActivity =
  | "Assessment"
  | "Goal Completed"
  | "Gym Streak"
  | "Challenge"
  | "Muscle Gain"
  | "Fat Loss"
  | "Leaderboard Reward"
  | "Monthly Champion"
  | "Workout";

export interface XpEvent {
  id: string;
  date: string;
  activity: XpActivity;
  xpEarned: number;
  description: string;
}

export interface Notification {
  id: string;
  date: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  date: string;
  rarity: "bronze" | "silver" | "gold";
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  participants: number;
  status: "active" | "completed" | "upcoming";
  progress: number;
}
