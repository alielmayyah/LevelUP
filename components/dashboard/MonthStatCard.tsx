import type { ReactNode } from "react";

interface MonthStatCardProps {
  icon: ReactNode;
  iconWrapperClassName: string;
  trendIcon?: ReactNode;
  trendWrapperClassName?: string;
  value: string;
  label: string;
  changeLabel: string;
  changeClassName: string;
}

export function MonthStatCard({
  icon,
  iconWrapperClassName,
  trendIcon,
  trendWrapperClassName,
  value,
  label,
  changeLabel,
  changeClassName,
}: MonthStatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/3 p-4">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${iconWrapperClassName}`}
        >
          {icon}
        </div>
        {trendIcon && (
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${trendWrapperClassName ?? ""}`}
          >
            {trendIcon}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/50">{label}</p>
      </div>
      <p className={`text-xs font-medium ${changeClassName}`}>{changeLabel}</p>
    </div>
  );
}
