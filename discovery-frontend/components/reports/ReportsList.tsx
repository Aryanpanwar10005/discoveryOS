"use client";

import { useState } from "react";
import { FileText, File, Globe, Download, Eye, Loader2, AlertTriangle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import type { ReportRecord, ReportStatus } from "@/types";

const formatIcon: Record<ReportRecord["format"], typeof FileText> = {
  pdf: FileText,
  docx: File,
  web: Globe,
};

const statusMeta: Record<ReportStatus, { tone: "green" | "orange" | "red" | "blue"; label: string; icon: typeof Loader2 }> = {
  ready: { tone: "green", label: "Ready", icon: FileText },
  generating: { tone: "blue", label: "Generating", icon: Loader2 },
  failed: { tone: "red", label: "Failed", icon: AlertTriangle },
  scheduled: { tone: "orange", label: "Scheduled", icon: Clock },
};

const tabs: { key: ReportStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "generating", label: "Generating" },
  { key: "scheduled", label: "Scheduled" },
  { key: "failed", label: "Failed" },
];

export function ReportsList({ reports }: { reports: ReportRecord[] }) {
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("all");

  const filtered = activeTab === "all" ? reports : reports.filter((r) => r.status === activeTab);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              activeTab === tab.key
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No reports here yet" description="Reports matching this status will show up here once generated." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((report) => {
            const FormatIcon = formatIcon[report.format];
            const meta = statusMeta[report.status];
            const StatusIcon = meta.icon;
            return (
              <Card key={report.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                    <FormatIcon size={18} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-semibold text-ink-900">{report.title}</p>
                      <Badge tone={meta.tone}>
                        <StatusIcon size={11} className={report.status === "generating" ? "animate-spin" : ""} />
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-2xl text-[13px] leading-snug text-ink-600">{report.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
                      <span>{report.author}</span>
                      <span>·</span>
                      <span>{new Date(report.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      {report.pages > 0 && (
                        <>
                          <span>·</span>
                          <span>{report.pages} pages</span>
                        </>
                      )}
                      <div className="flex gap-1.5">
                        {report.tags.map((tag) => (
                          <Badge key={tag} tone="gray">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                  <Button variant="outline" size="sm" icon={<Eye size={14} />} disabled={report.status !== "ready"}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<Download size={14} />} disabled={report.status !== "ready"}>
                    Export
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
