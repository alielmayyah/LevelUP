import { TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { LevelCard } from "@/components/dashboard/LevelCard";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { FitScoreCard } from "@/components/dashboard/FitScoreCard";
import { CurrentMissionCard } from "@/components/dashboard/CurrentMissionCard";
import { MonthStatCard } from "@/components/dashboard/MonthStatCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Reveal } from "@/components/Reveal";
import { pickGreeting, pickSubtitle } from "@/lib/greeting";
import {
  fitScore,
  currentMember,
  currentMission,
  gymLeaderboard,
  levelProgress,
  monthStats,
  workouts,
} from "@/data/dashboard-mock";

export default function DashboardPage() {
  const greeting = pickGreeting(currentMember.name);
  const subtitle = pickSubtitle();

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <GreetingHeader
          greeting={greeting}
          subtitle={subtitle}
          streakDays={currentMember.streakDays}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <LevelCard {...levelProgress} />
      </Reveal>

      <Reveal delay={0.1}>
        <LeaderboardCard {...gymLeaderboard} />
      </Reveal>

      <Reveal delay={0.15} className="flex flex-col gap-3">
        <SectionHeader title="Today's Progress" href="/progress" />
        <FitScoreCard {...fitScore} />
      </Reveal>

      <Reveal delay={0.2}>
        <CurrentMissionCard {...currentMission} />
      </Reveal>

      <Reveal delay={0.3} className="flex flex-col gap-3">
        <SectionHeader title="Monthly Wins" />
        <div className="grid grid-cols-2 gap-3">
          <MonthStatCard
            icon={<span>🔥</span>}
            iconWrapperClassName="bg-warning/15"
            trendIcon={<TrendingDown size={12} />}
            trendWrapperClassName="bg-success/15 text-success"
            value={`${monthStats.bodyFat.changePercent}%`}
            label="Body Fat"
            changeLabel={`↓ ${Math.abs(monthStats.bodyFat.changePercent)}% this month`}
            changeClassName="text-success"
          />
          <MonthStatCard
            icon={<span>💪</span>}
            iconWrapperClassName="bg-success/15"
            trendIcon={<TrendingUp size={12} />}
            trendWrapperClassName="bg-success/15 text-success"
            value={`+${monthStats.muscleMass.changeKg}kg`}
            label="Muscle Mass"
            changeLabel={`↑ ${monthStats.muscleMass.changeKg} kg`}
            changeClassName="text-success"
          />
          <MonthStatCard
            icon={<span>🏋️</span>}
            iconWrapperClassName="bg-primary/15"
            trendIcon={<TrendingUp size={12} />}
            trendWrapperClassName="bg-primary/15 text-primary"
            value={`${workouts.count}`}
            label="Workouts"
            changeLabel={`↑ ${workouts.deltaFromLastMonth} from last month`}
            changeClassName="text-primary"
          />
          <MonthStatCard
            icon={<Trophy size={16} />}
            iconWrapperClassName="bg-accent/15 text-accent"
            value={`+${monthStats.xpEarned} XP`}
            label="XP Earned"
            changeLabel="This month"
            changeClassName="text-white/40"
          />
        </div>
      </Reveal>
    </div>
  );
}
