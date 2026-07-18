import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { InsightsExplorer } from "@/components/insights/InsightsExplorer";
import { insightTypeIconMap } from "@/components/icon-maps";
import { getInsights } from "@/lib/api";
import type { InsightType } from "@/types";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const data = await getInsights();

  const counts = data.insights.reduce<Record<InsightType, number>>(
    (acc, insight) => {
      acc[insight.type] = (acc[insight.type] ?? 0) + 1;
      return acc;
    },
    { pain_point: 0, feature_request: 0, praise: 0, question: 0 }
  );

  return (
    <>
      <Topbar breadcrumb="Insights" actionLabel="Upload Research" />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-bold text-ink-900">Insights</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              {data.total.toLocaleString()} insights extracted from your research, sorted by recency
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(Object.keys(counts) as InsightType[]).map((type) => {
              const iconEntry = insightTypeIconMap[type];
              const Icon = iconEntry.icon;
              return (
                <Card key={type} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconEntry.bg}`}>
                    <Icon size={17} className={iconEntry.fg} />
                  </div>
                  <div>
                    <p className="text-[19px] font-bold leading-none text-ink-900">{counts[type]}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500">{iconEntry.label}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <InsightsExplorer insights={data.insights} />
        </div>
      </main>
    </>
  );
}
