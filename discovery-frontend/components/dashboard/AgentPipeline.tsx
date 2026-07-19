import { Card, CardHeader } from "@/components/ui/Card";
import { CheckCircle2, Loader2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PipelineStep } from "@/types";

const statusConfig: Record<PipelineStep["status"], { icon: typeof CheckCircle2; className: string; label: string }> = {
  completed: { icon: CheckCircle2, className: "text-success-500", label: "Completed" },
  in_progress: { icon: Loader2, className: "text-brand-500 animate-spin", label: "In progress" },
  pending: { icon: Circle, className: "text-ink-300", label: "Pending" },
  failed: { icon: XCircle, className: "text-danger-500", label: "Failed" },
};

export function AgentPipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <Card>
      <CardHeader title="AI Agent Pipeline" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
        {steps?.map((step, idx) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          return (
            <div key={step.id} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-xl border p-3.5",
                  step.status === "completed" ? "border-success-50 bg-success-50/40" : "border-ink-100 bg-ink-50/40"
                )}
              >
                <Icon size={18} className={config.className} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-900">
                    {step.order}. {step.name}
                  </p>
                  <p className="truncate text-[12px] text-ink-500">{config.label}</p>
                  <p className="truncate text-[11.5px] text-ink-400">{step.detail}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden h-px w-4 shrink-0 bg-ink-200 sm:block" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
