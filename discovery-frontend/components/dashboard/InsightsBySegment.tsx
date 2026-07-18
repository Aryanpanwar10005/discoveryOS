import { Card, CardHeader } from "@/components/ui/Card";
import { DonutChart, SegmentLegend } from "@/components/charts/DonutChart";
import type { OverviewResponse } from "@/types";

export function InsightsBySegment({ data }: { data: OverviewResponse["insightsBySegment"] }) {
  return (
    <Card>
      <CardHeader title="Insights by Segment" />
      <div className="flex items-center justify-center gap-6">
        <DonutChart slices={data.slices} total={data.total} />
        <SegmentLegend slices={data.slices} />
      </div>
    </Card>
  );
}
