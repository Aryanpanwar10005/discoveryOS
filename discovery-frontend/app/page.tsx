"use client";
import { Topbar } from "@/components/layout/Topbar";
import { StatCardView } from "@/components/dashboard/StatCardView";
import { TopPainPoints } from "@/components/dashboard/TopPainPoints";
import { PainPointMatrixCard } from "@/components/dashboard/PainPointMatrixCard";
import { RecentInsights } from "@/components/dashboard/RecentInsights";
import { TopOpportunities } from "@/components/dashboard/TopOpportunities";
import { InsightsBySegment } from "@/components/dashboard/InsightsBySegment";
import { AiRecommendationCard } from "@/components/dashboard/AiRecommendationCard";
import { AgentPipeline } from "@/components/dashboard/AgentPipeline";
import { SprintSelector } from "@/components/dashboard/SprintSelector";
import { getOverview } from "@/lib/api";
import { useState, useEffect } from "react";
import { UploadModalEnhanced } from "@/components/ui/UploadModalEnhanced";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { FadeIn } from "@/components/ui/FadeIn";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const result = await getOverview();
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
        <Topbar breadcrumb="Loading..." onAction={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-80" />
              </div>
              <Skeleton className="h-10 w-44 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-64" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
              <CardSkeleton className="h-56" />
              <CardSkeleton className="h-56" />
              <CardSkeleton className="h-56" />
            </div>

            <CardSkeleton className="h-24" />
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Topbar breadcrumb="Error" onAction={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <FadeIn>
              <Card className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50">
                  <AlertTriangle size={22} className="text-danger-500" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink-900">Failed to load dashboard data</p>
                  <p className="mt-1 text-[13px] text-ink-500">Something went wrong while fetching your research overview.</p>
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

  return (
    <>
      <Topbar breadcrumb={`${data.project.name} – Product Discovery`} onAction={() => setIsModalOpen(true)} />
      <UploadModalEnhanced open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <FadeIn>
            <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl">
              <div
                className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <h1 className="text-[22px] font-bold tracking-tight text-ink-900">
                  Good morning,{" "}
                  <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                    {data.user.name}
                  </span>{" "}
                  <span className="inline-block animate-float">👋</span>
                </h1>
                <p className="mt-1 text-[13.5px] text-ink-500">
                  Here&apos;s what our AI found from your customer research
                </p>
              </div>
              <div className="relative">
                <SprintSelector label={data.sprintLabel} />
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.stats.map((stat: any, i: number) => (
              <FadeIn key={stat.id} delay={i * 60} className="h-full">
                <div className="h-full transition-transform duration-200 hover:-translate-y-0.5">
                  <StatCardView stat={stat} />
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
            <FadeIn delay={80}>
              <TopPainPoints items={data.topPainPoints} />
            </FadeIn>
            <FadeIn delay={140}>
              <PainPointMatrixCard data={data.painPointMatrix} />
            </FadeIn>
            <FadeIn delay={200}>
              <RecentInsights items={data.recentInsights} />
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
            <FadeIn delay={80}>
              <TopOpportunities items={data.topOpportunities} />
            </FadeIn>
            <FadeIn delay={140}>
              <InsightsBySegment data={data.insightsBySegment} />
            </FadeIn>
            <FadeIn delay={200}>
              <AiRecommendationCard data={data.aiRecommendation} />
            </FadeIn>
          </div>

          <FadeIn delay={100}>
            <AgentPipeline steps={data.agentPipeline} />
          </FadeIn>
        </div>
      </main>
    </>
  );
}