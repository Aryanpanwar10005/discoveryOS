import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { insightTypeIconMap } from "@/components/icon-maps";
import type { RecentInsight } from "@/types";

export function RecentInsights({ items }: { items: RecentInsight[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Recent Insights" />
      <ul className="flex flex-1 flex-col gap-4">
        {items.map((item) => {
          const iconEntry = insightTypeIconMap[item.type];
          const Icon = iconEntry?.icon;
          return (
            <li key={item.id} className="flex gap-3">
              {Icon && (
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconEntry.bg}`}>
                  <Icon size={14} className={iconEntry.fg} />
                </div>
              )}
              <div>
                <p className="text-[13.5px] font-semibold text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{item.description}</p>
                <p className="mt-1 text-[12px] text-ink-400">
                  {item.sourceLabel} · {item.timeAgo}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <Link
        href="/insights"
        className="mt-4 flex items-center gap-1 text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
      >
        View all insights →
      </Link>
    </Card>
  );
}
