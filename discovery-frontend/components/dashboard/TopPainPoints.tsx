import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { PainPoint } from "@/types";

export function TopPainPoints({ items }: { items: PainPoint[] }) {
  return (
    <Card>
      <CardHeader
        title="Top Pain Points"
        action={
          <button className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700">
            View all
          </button>
        }
      />
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
              <span className="text-ink-700">{item.label}</span>
              <span className="shrink-0 text-ink-500">{item.mentions} mentions</span>
            </div>
            <ProgressBar value={item.mentions} max={item.maxMentions} tone="brand" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
