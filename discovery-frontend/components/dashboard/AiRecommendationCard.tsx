import { Card, CardHeader } from "@/components/ui/Card";
import { ImpactBadge } from "@/components/ui/Badge";
import { Sparkles, FileText } from "lucide-react";
import type { AiRecommendation } from "@/types";

export function AiRecommendationCard({ data }: { data: AiRecommendation }) {
  return (
    <Card>
      <CardHeader
        title="AI Recommendation"
        icon={
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-brand-100">
            <Sparkles size={13} className="text-brand-600" />
          </div>
        }
      />

      <div className="rounded-xl border border-warning-50 bg-warning-50/60 p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[14px] font-semibold text-ink-900">{data?.title}</p>
          <ImpactBadge impact={data?.impact} />
        </div>
        <p className="text-[13px] leading-snug text-ink-600">{data?.summary}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-warning-100/70 pt-3">
          <div>
            <p className="text-[11px] text-ink-500">Confidence</p>
            <p className="text-[14px] font-semibold text-ink-900">{data?.confidence}%</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-500">Users Affected</p>
            <p className="text-[14px] font-semibold text-ink-900">{data?.usersAffectedPct}%</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-500">Evidence</p>
            <p className="text-[14px] font-semibold text-ink-900">{data?.evidenceCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[12.5px] font-semibold text-ink-700">Top Evidence</p>
        <ul className="flex flex-col gap-2">
          {data?.topEvidence?.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 text-[13px]">
              <FileText size={14} className="shrink-0 text-brand-500" />
              <span className="font-medium text-ink-700">{ev.sourceLabel}</span>
              <span className="truncate text-ink-500">&ldquo;{ev.quote}&rdquo;</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-4 text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700">
        View full evidence →
      </button>
    </Card>
  );
}
