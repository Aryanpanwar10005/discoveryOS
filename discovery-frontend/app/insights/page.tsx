"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { InsightsExplorer } from "@/components/insights/InsightsExplorer";
import { insightTypeIconMap } from "@/components/icon-maps";
import { getInsights } from "@/lib/api";
import type { InsightType } from "@/types";
import { useState, useEffect } from "react";
import { UploadModalEnhanced } from "@/components/ui/UploadModalEnhanced";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { FadeIn } from "@/components/ui/FadeIn";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const result = await getInsights();
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Topbar breadcrumb="Insights" onAction={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-72" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} className="h-[76px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Topbar breadcrumb="Insights" onAction={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <FadeIn>
              <Card className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50">
                  <AlertTriangle size={22} className="text-danger-500" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink-900">Failed to load insights</p>
                  <p className="mt-1 text-[13px] text-ink-500">We couldn&apos;t reach your research data just now.</p>
                </div>
                <button
                  onClick={fetchData}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[13.5px] font-medium text-white shadow-[0_4px_10px_rgba(90,70,224,0.25)] transition-all hover:bg-brand-500 active:scale-[0.97]"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </Card>
            </FadeIn>
          </div>
        </main>
      </>
    );
  }

  const counts = (data.insights as { type: InsightType }[]).reduce<Record<InsightType, number>>(
    (acc, insight) => {
      acc[insight.type] = (acc[insight.type] ?? 0) + 1;
      return acc;
    },
    { pain_point: 0, feature_request: 0, praise: 0, question: 0 }
  );

  return (
    <>
      <Topbar breadcrumb="Insights" onAction={() => setIsModalOpen(true)} />
      <UploadModalEnhanced open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <FadeIn>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-ink-900">Insights</h1>
              <p className="mt-1 text-[13.5px] text-ink-500">
                <span className="font-semibold text-brand-600">{data.total.toLocaleString()}</span> insights extracted
                from your research, sorted by recency
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(Object.keys(counts) as InsightType[]).map((type, i) => {
              const iconEntry = insightTypeIconMap[type];
              const Icon = iconEntry.icon;
              return (
                <FadeIn key={type} delay={i * 60}>
                  <Card className="group flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconEntry.bg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon size={17} className={iconEntry.fg} />
                    </div>
                    <div>
                      <p className="text-[19px] font-bold leading-none text-ink-900">{counts[type]}</p>
                      <p className="mt-0.5 text-[12px] text-ink-500">{iconEntry.label}</p>
                    </div>
                  </Card>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={140}>
            <InsightsExplorer insights={data.insights} />
          </FadeIn>
        </div>
      </main>
    </>
  );
}