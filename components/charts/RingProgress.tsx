interface RingProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  progressClassName?: string;
}

export function RingProgress({
  percent,
  size = 84,
  strokeWidth = 8,
  trackClassName = "stroke-white/10",
  progressClassName = "stroke-emerald-400",
}: RingProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        className={trackClassName}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={progressClassName}
      />
    </svg>
  );
}
