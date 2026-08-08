interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  className = "stroke-red-400",
}: SparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pad = 3;

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline
        points={points}
        className={className}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
