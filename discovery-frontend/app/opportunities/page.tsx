"use client";

import { Topbar } from "@/components/layout/Topbar";
import { ProjectSwitcher } from "@/components/project-switcher";
import { OpportunitiesBoard } from "@/components/opportunities/OpportunitiesBoard";
import { getOpportunities } from "@/lib/api";
import { useCurrentProject } from "@/lib/project-context";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

export default function OpportunitiesPage() {
  const { projectId } = useCurrentProject();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const result = await getOpportunities();
        
        // 🚀 INJECT FALLBACK HERE
        // If an opportunity has no icon, default to "HelpCircle" (or any standard icon)
        if (result && result.opportunities) {
          result.opportunities = result.opportunities.map((opp: any) => ({
            ...opp,
            icon: opp.icon || "HelpCircle", // Your universal fallback string
          }));
        }

        setData(result);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [projectId]);

  if (loading || !data) {
    return (
      <>
        <Topbar breadcrumb="Opportunities" onAction={() => {}} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div>Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar breadcrumb="Opportunities" onAction={() => {}} />
      <div className="absolute top-6 right-6">
        <ProjectSwitcher />
      </div>

      <Topbar breadcrumb="Opportunities" actionLabel="New Opportunity" />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-bold text-ink-900">Opportunities</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              High-impact opportunities ranked by evidence, confidence and reach
            </p>
          </div>

          <OpportunitiesBoard opportunities={data.opportunities} />
        </div>
      </main>
    </>
  );
}
