import { Topbar } from "@/components/layout/Topbar";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentPipeline } from "@/components/dashboard/AgentPipeline";
import { getAgents } from "@/lib/api";
import { Settings2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AiAgentsPage() {
  const data = await getAgents();

  return (
    <>
      <Topbar breadcrumb="AI Agents" actionLabel="Configure Agents" actionIcon={<Settings2 size={16} />} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-bold text-ink-900">AI Agents</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              {data.total} agents work together to turn raw research into ranked opportunities
            </p>
          </div>

          <AgentPipeline steps={data.pipeline} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
