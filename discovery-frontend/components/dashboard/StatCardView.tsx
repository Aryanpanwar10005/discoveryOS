import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/charts/Sparkline";
import { statIconMap } from "@/components/icon-maps";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { StatCard as StatCardType } from "@/types";

export function StatCardView({ stat }: { stat: StatCardType }) {
  const iconEntry = statIconMap[stat.icon];
  const Icon = iconEntry?.icon;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconEntry.bg}`}>
            <Icon size={16} className={iconEntry.fg} />
          </div>
        )}
        <span className="text-[13px] font-medium text-ink-600">{stat.label}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[26px] font-bold leading-none tracking-tight text-ink-900">
            {stat.value.toLocaleString()}
            {stat.id === "confidence" ? "%" : ""}
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-500">{stat.helperText}</p>
        </div>
        {stat.sparkline && stat.sparkline.length > 0 && (
          <Sparkline data={stat.sparkline} className="shrink-0" />
        )}
      </div>

      {stat.delta && (
        <span
          className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
            stat.deltaTrend === "down" ? "bg-danger-50 text-danger-600" : "bg-success-50 text-success-600"
          }`}
        >
          {stat.deltaTrend === "down" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {stat.delta}
        </span>
      )}
    </Card>
  );
}
