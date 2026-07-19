"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { UploadModalEnhanced } from "@/components/ui/UploadModalEnhanced";
import { getUploadHistory, type UploadHistoryItem } from "@/lib/uploads";
import { FadeIn } from "@/components/ui/FadeIn";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const fileTypeIcons: Record<string, { icon: typeof FileText; color: string; chip: string; label: string }> = {
  "application/pdf": { icon: FileText, color: "text-danger-600", chip: "bg-danger-50", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-brand-600",
    chip: "bg-brand-100",
    label: "DOCX",
  },
  "text/plain": { icon: FileText, color: "text-ink-600", chip: "bg-ink-100", label: "TXT" },
  "text/csv": { icon: FileText, color: "text-success-600", chip: "bg-success-50", label: "CSV" },
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; dot: string; label: string; bg: string }> = {
  uploaded: { icon: CheckCircle2, color: "text-success-600", dot: "bg-success-500", label: "Uploaded", bg: "bg-success-50" },
  uploading: { icon: Clock, color: "text-brand-600", dot: "bg-brand-500", label: "Uploading", bg: "bg-brand-100" },
  failed: { icon: AlertCircle, color: "text-danger-600", dot: "bg-danger-500", label: "Failed", bg: "bg-danger-50" },
};

export default function UploadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistory() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUploadHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load upload history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUploadComplete = () => {
    fetchHistory();
  };

  const getFileIcon = (filetype: string) => {
    return fileTypeIcons[filetype] || { icon: FileText, color: "text-ink-400", chip: "bg-ink-100", label: "File" };
  };

  const getStatusIcon = (status: string) => {
    return statusConfig[status] || statusConfig.uploaded;
  };

  const uploadedCount = history.filter((h) => h.status === "uploaded").length;
  const uploadingCount = history.filter((h) => h.status === "uploading").length;
  const failedCount = history.filter((h) => h.status === "failed").length;

  return (
    <>
      <Topbar breadcrumb="Upload History" onAction={() => setIsModalOpen(true)} />
      <UploadModalEnhanced open={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadComplete={handleUploadComplete} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          {/* Header */}
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-ink-900">Upload History</h1>
                <p className="mt-1 text-[13.5px] text-ink-500">
                  View and manage all your uploaded research documents
                </p>
              </div>

              {!loading && !error && history.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1.5 text-[12.5px] font-medium text-success-600">
                    <CheckCircle2 size={13} />
                    {uploadedCount} uploaded
                  </span>
                  {uploadingCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-[12.5px] font-medium text-brand-700">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-600" />
                      {uploadingCount} processing
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1.5 text-[12.5px] font-medium text-danger-600">
                      <AlertCircle size={13} />
                      {failedCount} failed
                    </span>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <Card className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="mt-2 h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </Card>
                </FadeIn>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <FadeIn>
              <Card className="flex flex-col items-center gap-3 border-danger-100 bg-danger-50/40 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-100">
                  <AlertCircle size={22} className="text-danger-600" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink-900">{error}</p>
                  <p className="mt-1 text-[13px] text-ink-500">Something went wrong while loading your history.</p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[13.5px] font-medium text-white shadow-[0_4px_10px_rgba(90,70,224,0.25)] transition-all hover:bg-brand-500 active:scale-[0.97]"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </Card>
            </FadeIn>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <FadeIn>
              <Card className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <div className="mb-3 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-brand-100">
                  <Inbox size={28} className="text-brand-500" />
                </div>
                <h3 className="text-[15.5px] font-semibold text-ink-900">No uploads yet</h3>
                <p className="mt-1 text-[13px] text-ink-500">Start by uploading your first research document</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 py-2.5 text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgba(90,70,224,0.3),0_4px_10px_rgba(90,70,224,0.25)] transition-all hover:from-brand-500 hover:to-brand-600 active:scale-[0.97]"
                >
                  <UploadCloud size={16} />
                  Upload Research
                </button>
              </Card>
            </FadeIn>
          )}

          {/* Upload History List */}
          {!loading && !error && history.length > 0 && (
            <div className="flex flex-col gap-3">
              {history.map((item, i) => {
                const fileIcon = getFileIcon(item.filetype);
                const FileIcon = fileIcon.icon;
                const status = getStatusIcon(item.status);
                const StatusIcon = status.icon;
                const isUploading = item.status === "uploading";
                const isFailed = item.status === "failed";

                return (
                  <FadeIn key={item.id} delay={Math.min(i, 8) * 45}>
                    <Card
                      className={cn(
                        "group flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between",
                        isUploading && "border-brand-100 bg-brand-50/30",
                        isFailed && "border-danger-100"
                      )}
                    >
                      {/* Document */}
                      <div className="flex flex-1 items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                            fileIcon.chip
                          )}
                        >
                          <FileIcon size={19} className={fileIcon.color} />
                          {isUploading && (
                            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-ink-900">{item.filename}</p>
                          {item.previewText && (
                            <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{item.previewText}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        {/* Type */}
                        <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-[11.5px] font-medium text-ink-700">
                          {fileIcon.label}
                        </span>

                        {/* Status */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
                            status.bg,
                            status.color
                          )}
                        >
                          {isUploading ? (
                            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-600" />
                          ) : (
                            <StatusIcon size={13} className={cn(item.status === "uploaded" && "animate-pop-in")} />
                          )}
                          {status.label}
                        </span>

                        {/* Date */}
                        <span className="min-w-[120px] text-[12.5px] text-ink-500">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            title="Download"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-700 active:scale-90"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-danger-50 hover:text-danger-600 active:scale-90"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}