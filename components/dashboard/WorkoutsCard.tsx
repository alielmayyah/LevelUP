import { Zap } from "lucide-react";
import { MiniBarChart } from "@/components/charts/MiniBarChart";

interface WorkoutsCardProps {
  count: number;
  deltaFromLastMonth: number;
  weeks: { label: string; value: number }[];
}

export function WorkoutsCard({ count, deltaFromLastMonth, weeks }: WorkoutsCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 p-4">
      <div>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          <span className="text-2xl font-bold text-white">{count}</span>
        </div>
        <p className="mt-1 text-xs text-white/50">Workouts</p>
        <p className="mt-1 text-xs font-medium text-primary">
          ↑ {deltaFromLastMonth} from last month
        </p>
      </div>
      <MiniBarChart bars={weeks} dimIndex={weeks.length - 1} />
    </div>
  );
}
