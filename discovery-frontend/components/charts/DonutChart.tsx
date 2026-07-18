import type { SegmentSlice } from "@/types";

const colorMap: Record<SegmentSlice["color"], string> = {
  purple: "#6D5DFB",
  blue: "#4C8BF5",
  green: "#22B573",
  orange: "#F0A93C",
  gray: "#C7CAD3",
};

interface DonutChartProps {
  slices: SegmentSlice[];
  total: number;
  size?: number;
}

export function DonutChart({ slices, total, size = 168 }: DonutChartProps) {
  const strokeWidth = size * 0.16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F2F6" strokeWidth={strokeWidth} />
        {slices.map((slice) => {
          const dash = (slice.pct / 100) * circumference;
          const gap = circumference - dash;
          const dashoffset = -((offsetAcc / 100) * circumference);
          offsetAcc += slice.pct;
          return (
            <circle
              key={slice.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorMap[slice.color]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-ink-900">{total.toLocaleString()}</span>
        <span className="text-[11px] text-ink-500">Total Insights</span>
      </div>
    </div>
  );
}

export function SegmentLegend({ slices }: { slices: SegmentSlice[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {slices.map((slice) => (
        <li key={slice.id} className="flex items-center justify-between gap-6 text-[13px]">
          <span className="flex items-center gap-2 text-ink-700">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorMap[slice.color] }} />
            {slice.label}
          </span>
          <span className="font-semibold text-ink-900">{slice.pct}%</span>
        </li>
      ))}
    </ul>
  );
}
