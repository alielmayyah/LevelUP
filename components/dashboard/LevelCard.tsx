import { Award, Trophy } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface LevelCardProps {
  level: number;
  tier: string;
  xp: number;
  xpToNextLevel: number;
  percentToNextLevel: number;
}

const HEXAGON_CLIP =
  "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]";

function xpCopy(percent: number, xpToNextLevel: number, nextLevel: number): string {
  if (percent >= 90) return `Almost there! Only ${xpToNextLevel} XP to Level ${nextLevel}`;
  if (percent >= 70) return `🔥 Only ${xpToNextLevel} XP until Level ${nextLevel}`;
  return `${xpToNextLevel} XP to reach Level ${nextLevel}`;
}

export function LevelCard({
  level,
  tier,
  xp,
  xpToNextLevel,
  percentToNextLevel,
}: LevelCardProps) {
  const percent = Math.min(Math.max(percentToNextLevel, 0), 100);

  return (
    <div className="rounded-3xl border border-primary/25 bg-linear-to-br from-primary/20 via-accent/8 to-transparent p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <span aria-hidden>🚀</span> LevelUP Score
          </p>
          <p className="mt-0.5 text-xs font-medium text-white/60">Level {level}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`lu-badge-glow flex h-11 w-11 items-center justify-center bg-linear-to-b from-amber-300 to-amber-600 text-amber-950 ${HEXAGON_CLIP}`}
          >
            <Award size={20} />
          </div>
          <span className="text-[11px] font-semibold text-warning">{tier}</span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <AnimatedNumber value={xp} className="text-4xl font-bold text-white" />
        <span className="text-sm font-semibold text-primary">XP</span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
        <span>{xpCopy(percent, xpToNextLevel, level + 1)}</span>
        <span className="font-semibold text-accent">{percentToNextLevel}%</span>
      </div>

      <p className="mt-3 flex items-center gap-1 text-[11px] text-white/40">
        <Trophy size={10} />
        Counts toward the gym leaderboard
      </p>
    </div>
  );
}
