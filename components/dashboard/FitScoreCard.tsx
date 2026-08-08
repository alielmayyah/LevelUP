import { Heart, Lock } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { getFitScoreTier } from "@/lib/fitscore";

interface FitScoreCardProps {
  score: number;
  deltaFromYesterday: number;
}

export function FitScoreCard({ score, deltaFromYesterday }: FitScoreCardProps) {
  const tier = getFitScoreTier(score);
  const improved = deltaFromYesterday >= 0;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
        <Heart size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-xs text-white/50">
          <span aria-hidden>❤️</span>
          <span>FitScore</span>
          <Lock size={10} className="text-white/30" aria-label="Private" />
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber value={score} className="text-2xl font-bold text-white" />
          <span className={`text-xs font-medium ${improved ? "text-success" : "text-danger"}`}>
            {improved ? "↑" : "↓"} {Math.abs(deltaFromYesterday)} pts from yesterday
          </span>
        </div>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tier.pillClassName} ${tier.textClassName}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${tier.dotClassName}`} />
        {tier.label}
      </span>
    </div>
  );
}
