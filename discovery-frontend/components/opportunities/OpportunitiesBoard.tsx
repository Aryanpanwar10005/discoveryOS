"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, ImpactBadge } from "@/components/ui/Badge";
import { opportunityIconMap } from "@/components/icon-maps";
import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types";

type SortKey = "rank" | "confidence" | "evidenceCount";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "rank", label: "Priority Rank" },
  { key: "confidence", label: "Confidence" },
  { key: "evidenceCount", label: "Evidence" },
];

const statusTone: Record<string, "purple" | "orange" | "blue" | "green"> = {
  new: "blue",
  in_review: "orange",
  planned: "purple",
  shipped: "green",
};

const statusLabel: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  planned: "Planned",
  shipped: "Shipped",
};

export function OpportunitiesBoard({ opportunities }: { opportunities: Opportunity[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");

  const sorted = useMemo(() => {
    const copy = [...opportunities];
    if (sortKey === "rank") return copy.sort((a, b) => a.rank - b.rank);
    return copy.sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
  }, [opportunities, sortKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-500">{opportunities.length} opportunities ranked by the Prioritization Agent</p>
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1">
          <ArrowUpDown size={14} className="ml-1.5 text-ink-400" />
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                sortKey === opt.key ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((item) => {
          const iconEntry = opportunityIconMap[item.icon];
          const Icon = iconEntry.icon;
          return (
            <Card key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[13px] font-bold text-white">
                  {item.rank}
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconEntry.bg}`}>
                  <Icon size={17} className={iconEntry.fg} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14.5px] font-semibold text-ink-900">{item.title}</p>
                    {item.status && <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>}
                  </div>
                  {item.description && (
                    <p className="mt-1 max-w-2xl text-[13px] leading-snug text-ink-600">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 border-t border-ink-100 pt-3 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0">
                <div>
                  <p className="text-[11px] text-ink-400">Impact</p>
                  <ImpactBadge impact={item.impact} />
                </div>
                <div>
                  <p className="text-[11px] text-ink-400">Confidence</p>
                  <p className="text-[14px] font-semibold text-ink-900">{item.confidence}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-400">Evidence</p>
                  <p className="text-[14px] font-semibold text-ink-900">{item.evidenceCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-400">Users Affected</p>
                  <p className="text-[14px] font-semibold text-ink-900">{item.usersAffectedPct ?? "—"}%</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
