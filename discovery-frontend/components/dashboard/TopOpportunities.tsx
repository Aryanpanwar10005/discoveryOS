import { Card, CardHeader } from "@/components/ui/Card";
import { ImpactBadge } from "@/components/ui/Badge";
import { opportunityIconMap } from "@/components/icon-maps";
import type { Opportunity } from "@/types";

export function TopOpportunities({ items }: { items: Opportunity[] }) {
  return (
    <Card>
      <CardHeader
        title="Top Opportunities"
        action={
          <button className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700">
            View all
          </button>
        }
      />
      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const iconEntry = opportunityIconMap[item.icon];
          const Icon = iconEntry?.icon;
          return (
            <li key={item.id} className="flex items-center gap-3">
              {Icon && (
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconEntry.bg}`}>
                  <Icon size={15} className={iconEntry.fg} />
                </div>
              )}
              <span className="flex-1 text-[13.5px] font-medium text-ink-800">{item.title}</span>
              <div className="flex items-center gap-6 text-right">
                <div className="w-16">
                  <p className="text-[11px] text-ink-400">Impact</p>
                  <ImpactBadge impact={item.impact} />
                </div>
                <div className="w-14">
                  <p className="text-[11px] text-ink-400">Confidence</p>
                  <p className="text-[13px] font-semibold text-ink-800">{item.confidence}%</p>
                </div>
                <div className="w-14">
                  <p className="text-[11px] text-ink-400">Evidence</p>
                  <p className="text-[13px] font-semibold text-ink-800">{item.evidenceCount}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
