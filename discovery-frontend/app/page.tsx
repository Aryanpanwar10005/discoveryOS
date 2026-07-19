"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useUnifiedDashboard } from "@/lib/unified-dashboard-context";
import { FadeIn } from "@/components/ui/FadeIn";
import { StatCardView } from "@/components/dashboard/StatCardView";
import { TopPainPoints } from "@/components/dashboard/TopPainPoints";
import { PainPointMatrixCard } from "@/components/dashboard/PainPointMatrixCard";
import { RecentInsights } from "@/components/dashboard/RecentInsights";
import { TopOpportunities } from "@/components/dashboard/TopOpportunities";
import { InsightsBySegment } from "@/components/dashboard/InsightsBySegment";
import { AiRecommendationCard } from "@/components/dashboard/AiRecommendationCard";
import { AgentPipeline } from "@/components/dashboard/AgentPipeline";

export default function Dashboard() {
  const { data, loading, error } = useUnifiedDashboard();

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <Topbar breadcrumb="Dashboard" />
        <div className="flex-1 overflow-auto bg-ink-50 p-6">
          <div className="text-center text-ink-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col">
        <Topbar breadcrumb="Dashboard" />
        <div className="flex-1 overflow-auto bg-ink-50 p-6">
          <div className="rounded-lg bg-danger-50 p-4 text-danger-700">
            Error loading dashboard: {error ?? "No data returned"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Topbar breadcrumb="Dashboard" />
      <main className="flex-1 overflow-auto bg-ink-50">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
          <FadeIn>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-ink-900">
                {data.sprintLabel}
              </h1>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] text-ink-600">
                    Good morning,{" "}
                    <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                      {data.user.name}
                    </span>{" "}
                    <span className="inline-block animate-float">👋</span>
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.stats.map((stat, i) => (
              <FadeIn key={stat.id} delay={i * 60} className="h-full">
                <div className="h-full transition-transform duration-200 hover:-translate-y-0.5">
                  <StatCardView stat={stat} />
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
            <FadeIn delay={40}>
              <TopPainPoints items={data.topPainPoints} />
            </FadeIn>

            <FadeIn delay={50}>
              <PainPointMatrixCard items={data.painPointMatrix} />
            </FadeIn>

            <FadeIn delay={60}>
              <RecentInsights items={data.recentInsights} />
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FadeIn delay={70}>
              <TopOpportunities items={data.topOpportunities} />
            </FadeIn>

            <FadeIn delay={80}>
              <InsightsBySegment data={data.insightsBySegment} />
            </FadeIn>
          </div>

          <FadeIn delay={90}>
            <AiRecommendationCard item={data.aiRecommendation} />
          </FadeIn>

          <FadeIn delay={100}>
            <AgentPipeline items={data.agentPipeline} />
          </FadeIn>
        </div>
      </main>
    </div>
  );
}