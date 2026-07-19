import type { PainPointMatrixItem } from "@/types";

const colorMap: Record<PainPointMatrixItem["color"], { fill: string; text: string }> = {
  red: { fill: "#F8B4B4", text: "#8C2E2E" },
  orange: { fill: "#F6D6A8", text: "#8C5A16" },
  blue: { fill: "#B9D4F8", text: "#2E5C8C" },
  purple: { fill: "#D6CEFF", text: "#4B3A9E" },
  green: { fill: "#BFEBD3", text: "#1F7A4D" },
};

interface BubbleMatrixProps {
  data: PainPointMatrixItem[];
}

const PADDING = 36;
const WIDTH = 560;
const HEIGHT = 300;

export function BubbleMatrix({ data }: BubbleMatrixProps) {
  const plotW = WIDTH - PADDING * 2;
  const plotH = HEIGHT - PADDING * 2;

  const toX = (freq: number) => PADDING + (freq / 100) * plotW;
  const toY = (impact: number) => PADDING + plotH - (impact / 100) * plotH;
  const toR = (size: number) => 20 + (size / 100) * 26;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Pain points by impact vs frequency">
        {/* gridlines */}
        {[0, 1, 2].map((i) => (
          <line
            key={`h-${i}`}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={PADDING + (plotH / 2) * i}
            y2={PADDING + (plotH / 2) * i}
            stroke="#EEF0F4"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <line
            key={`v-${i}`}
            y1={PADDING}
            y2={HEIGHT - PADDING}
            x1={PADDING + (plotW / 2) * i}
            x2={PADDING + (plotW / 2) * i}
            stroke="#EEF0F4"
          />
        ))}
        {/* axes */}
        <line x1={PADDING} x2={WIDTH - PADDING} y1={HEIGHT - PADDING} y2={HEIGHT - PADDING} stroke="#D8DAE3" />
        <line x1={PADDING} x2={PADDING} y1={PADDING} y2={HEIGHT - PADDING} stroke="#D8DAE3" />

        {/* y axis labels */}
        <text x={PADDING - 8} y={PADDING + 4} textAnchor="end" fontSize="11" fill="#9AA0B1">High</text>
        <text x={PADDING - 8} y={PADDING + plotH / 2 + 4} textAnchor="end" fontSize="11" fill="#9AA0B1">Medium</text>
        <text x={PADDING - 8} y={HEIGHT - PADDING + 4} textAnchor="end" fontSize="11" fill="#9AA0B1">Low</text>

        {/* x axis labels */}
        <text x={PADDING} y={HEIGHT - PADDING + 20} textAnchor="middle" fontSize="11" fill="#9AA0B1">Low</text>
        <text x={PADDING + plotW / 2} y={HEIGHT - PADDING + 20} textAnchor="middle" fontSize="11" fill="#9AA0B1">Medium</text>
        <text x={WIDTH - PADDING} y={HEIGHT - PADDING + 20} textAnchor="middle" fontSize="11" fill="#9AA0B1">High</text>

        {/* axis titles */}
        <text
          x={12}
          y={PADDING + plotH / 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight={600}
          fill="#6B7080"
          transform={`rotate(-90, 12, ${PADDING + plotH / 2})`}
        >
          Impact
        </text>
        <text x={PADDING + plotW / 2} y={HEIGHT - 4} textAnchor="middle" fontSize="11" fontWeight={600} fill="#6B7080">
          Frequency
        </text>

        {/* bubbles */}
        {data?.map((d) => {
          const cx = toX(d.frequency);
          const cy = toY(d.impact);
          const r = toR(d.size);
          const colors = colorMap[d.color];
          return (
            <g key={d.id} className="cursor-default">
              <circle cx={cx} cy={cy} r={r} fill={colors.fill} opacity={0.9} />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10.5"
                fontWeight={600}
                fill={colors.text}
              >
                {d.label.split(" ").map((word, i, arr) => (
                  <tspan key={i} x={cx} dy={i === 0 ? -((arr.length - 1) * 6) : 12}>
                    {word}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
