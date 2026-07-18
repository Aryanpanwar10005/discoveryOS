"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Skeleton";
import { insightTypeIconMap } from "@/components/icon-maps";
import type { InsightRecord, InsightType } from "@/types";
import { cn } from "@/lib/cn";

const typeFilters: { key: InsightType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pain_point", label: "Pain Points" },
  { key: "feature_request", label: "Feature Requests" },
  { key: "praise", label: "Praise" },
  { key: "question", label: "Questions" },
];

const sentimentTone: Record<InsightRecord["sentiment"], "green" | "red" | "gray"> = {
  positive: "green",
  negative: "red",
  neutral: "gray",
};

export function InsightsExplorer({ insights }: { insights: InsightRecord[] }) {
  const [activeType, setActiveType] = useState<InsightType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return insights.filter((insight) => {
      const matchesType = activeType === "all" || insight.type === activeType;
      const matchesQuery =
        query.trim().length === 0 ||
        insight.title.toLowerCase().includes(query.toLowerCase()) ||
        insight.description.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [insights, activeType, query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {typeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveType(filter.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                activeType === filter.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search insights..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-[13.5px] text-ink-800 placeholder:text-ink-400 focus:border-brand-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No insights match your filters"
          description="Try a different search term or clear the type filter to see more results."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((insight) => {
            const iconEntry = insightTypeIconMap[insight.type];
            const Icon = iconEntry?.icon;
            return (
              <Card key={insight.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${iconEntry.bg}`}>
                        <Icon size={14} className={iconEntry.fg} />
                      </div>
                    )}
                    <Badge tone="gray">{iconEntry?.label}</Badge>
                  </div>
                  <Badge tone={sentimentTone[insight.sentiment]}>{insight.sentiment}</Badge>
                </div>

                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{insight.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-ink-600">{insight.description}</p>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-[12px] text-ink-500">
                  <span className="font-medium text-ink-700">{insight.sourceLabel}</span>
                  <span>{insight.timeAgo}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="purple">{insight.theme}</Badge>
                  <Badge tone="gray">{insight.segment}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
