import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { agentIconMap } from "@/components/icon-maps";
import { Zap, Clock3 } from "lucide-react";
import type { AgentRecord } from "@/types";
import { cn } from "@/lib/cn";

const statusTone: Record<AgentRecord["status"], "green" | "gray" | "red" | "blue"> = {
  active: "green",
  idle: "gray",
  running: "blue",
  error: "red",
};

function timeAgoFromISO(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export function AgentCard({ agent }: { agent: AgentRecord }) {
  const Icon = agentIconMap[agent.icon];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <Icon size={19} className="text-brand-600" />
          </div>
          <div>
            <p className="text-[14.5px] font-semibold text-ink-900">{agent.name}</p>
            <p className="text-[12.5px] text-ink-500">{agent.role}</p>
          </div>
        </div>
        <Badge tone={statusTone[agent.status]}>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              agent.status === "active" && "bg-success-500",
              agent.status === "running" && "bg-info-500",
              agent.status === "idle" && "bg-ink-400",
              agent.status === "error" && "bg-danger-500"
            )}
          />
          {agent.status === "active" ? "Active" : agent.status === "running" ? "Running" : agent.status === "idle" ? "Idle" : "Error"}
        </Badge>
      </div>

      <p className="text-[13px] leading-snug text-ink-600">{agent.description}</p>

      <div className="grid grid-cols-2 gap-3 rounded-xl bg-ink-50/70 p-3.5">
        <div>
          <p className="text-[11px] text-ink-500">Last run</p>
          <p className="text-[13px] font-semibold text-ink-800">{timeAgoFromISO(agent.lastRunAt)}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-500">Output</p>
          <p className="text-[13px] font-semibold text-ink-800">{agent.itemsProcessedLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={13} className="text-success-500" />
          <div>
            <p className="text-[11px] text-ink-500">Success rate</p>
            <p className="text-[13px] font-semibold text-ink-800">{agent.successRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock3 size={13} className="text-brand-500" />
          <div>
            <p className="text-[11px] text-ink-500">Avg run time</p>
            <p className="text-[13px] font-semibold text-ink-800">{agent.avgRunTimeSeconds}s</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
