import { Gem, MessageCircle, Target } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface CurrentMissionCardProps {
  title: string;
  status: string;
  progressKg: number;
  targetKg: number;
  rewardXp: number;
  estimatedCompletion: string;
  coachMessage?: string;
}

export function CurrentMissionCard({
  title,
  status,
  progressKg,
  targetKg,
  rewardXp,
  estimatedCompletion,
  coachMessage,
}: CurrentMissionCardProps) {
  const percent = Math.min((progressKg / targetKg) * 100, 100);

  return (
    <div className="rounded-3xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Target size={14} />
          Current Mission
        </div>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
          {status}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold text-white">{title}</p>

      <div className="mt-4 flex items-baseline gap-2">
        <AnimatedNumber value={percent} suffix="%" className="text-3xl font-bold text-white" />
        <span className="text-xs text-white/50">
          {progressKg} kg / {targetKg} kg completed
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-white/40">Est. completion {estimatedCompletion}</p>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5 text-sm text-white/60">
          <Gem size={14} className="text-primary" />
          Mission Reward
        </div>
        <span className="text-sm font-bold text-primary">+{rewardXp} XP</span>
      </div>

      {coachMessage && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
          <MessageCircle size={14} className="mt-0.5 shrink-0 text-white/40" />
          <p className="text-xs italic text-white/60">&ldquo;{coachMessage}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
