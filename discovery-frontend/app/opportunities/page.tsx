import { Topbar } from "@/components/layout/Topbar";
import { OpportunitiesBoard } from "@/components/opportunities/OpportunitiesBoard";
import { getOpportunities } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const data = await getOpportunities();

  return (
    <>
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
