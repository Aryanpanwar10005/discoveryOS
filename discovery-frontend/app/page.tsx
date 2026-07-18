"use client"
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
import { UploadModal } from "@/components/ui/UploadModal";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getOverview();
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Topbar breadcrumb="Loading..." onAction={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <p className="text-ink-500">Loading dashboard...</p>
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
            <p className="text-danger-700">Failed to load dashboard data</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar breadcrumb={`${data.project.name} – Product Discovery`} onAction={() => setIsModalOpen(true)} />
      <UploadModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold text-ink-900">
                Good morning, {data.user.name} 👋
              </h1>
              <p className="mt-1 text-[13.5px] text-ink-500">
                Here&apos;s what our AI found from your customer research
              </p>
            </div>
            <SprintSelector label={data.sprintLabel} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.stats.map((stat:any) => (
              <StatCardView key={stat.id} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
            <TopPainPoints items={data.topPainPoints} />
            <PainPointMatrixCard data={data.painPointMatrix} />
            <RecentInsights items={data.recentInsights} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
            <TopOpportunities items={data.topOpportunities} />
            <InsightsBySegment data={data.insightsBySegment} />
            <AiRecommendationCard data={data.aiRecommendation} />
          </div>

          <AgentPipeline steps={data.agentPipeline} />
        </div>
      </main>
    </>
  );
}
