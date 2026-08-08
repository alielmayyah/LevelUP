import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

interface LeaderboardCardProps {
  rank: number;
  topPercent: number;
  membersBehind: number;
  membersAhead: number;
  placesGainedThisWeek: number;
}

export function LeaderboardCard({
  rank,
  topPercent,
  membersBehind,
  membersAhead,
  placesGainedThisWeek,
}: LeaderboardCardProps) {
  // Prefer the more actionable message: being close to the next rank is a
  // stronger nudge than general weekly momentum.
  const momentum =
    membersAhead <= 5
      ? `Only ${membersAhead} member${membersAhead === 1 ? "" : "s"} ahead`
      : placesGainedThisWeek > 0
        ? `↑ ${placesGainedThisWeek} places this week`
        : null;

  return (
    <Link
      href="/community"
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 transition active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
        <Trophy size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          #{rank} in your gym this month
        </p>
        <p className="text-xs text-white/50">
          Top {topPercent}% · {membersBehind} members behind you
        </p>
        {momentum && (
          <p className="mt-0.5 text-xs font-medium text-success">{momentum}</p>
        )}
      </div>
      <ChevronRight size={18} className="text-white/30" />
    </Link>
  );
}
