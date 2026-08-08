interface Bar {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  bars: Bar[];
  maxHeight?: number;
  dimIndex?: number;
}

export function MiniBarChart({ bars, maxHeight = 40, dimIndex }: MiniBarChartProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="flex items-end gap-2">
      {bars.map((bar, i) => (
        <div key={bar.label} className="flex flex-col items-center gap-1.5">
          <div
            className={`w-3 rounded-full ${i === dimIndex ? "bg-primary/40" : "bg-primary"}`}
            style={{ height: `${Math.max((bar.value / max) * maxHeight, 6)}px` }}
          />
          <span className="text-[10px] text-white/40">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}
