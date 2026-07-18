"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { UploadModalEnhanced } from "@/components/ui/UploadModalEnhanced";
import { getUploadHistory, type UploadHistoryItem } from "@/lib/uploads";
import { FileText, Download, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const fileTypeIcons: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  "application/pdf": { icon: FileText, color: "text-danger-500", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, color: "text-brand-500", label: "DOCX" },
  "text/plain": { icon: FileText, color: "text-ink-500", label: "TXT" },
  "text/csv": { icon: FileText, color: "text-success-500", label: "CSV" },
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  uploaded: { icon: CheckCircle2, color: "text-success-500", label: "Uploaded" },
  uploading: { icon: Clock, color: "text-brand-500", label: "Uploading" },
  failed: { icon: AlertCircle, color: "text-danger-500", label: "Failed" },
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
    return fileTypeIcons[filetype] || { icon: FileText, color: "text-ink-400", label: "File" };
  };

  const getStatusIcon = (status: string) => {
    return statusConfig[status] || statusConfig.uploaded;
  };

  return (
    <>
      <Topbar breadcrumb="Upload History" onAction={() => setIsModalOpen(true)} />
      <UploadModalEnhanced open={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadComplete={handleUploadComplete} />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-[22px] font-bold text-ink-900">Upload History</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              View and manage all your uploaded research documents
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600"></div>
                <p className="text-sm text-ink-500">Loading upload history...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-danger-200 bg-danger-50 p-4">
              <p className="text-sm text-danger-700">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-3 text-sm font-medium text-danger-600 hover:text-danger-700 underline"
              >
                Try again
              </button>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <Card className="flex flex-col items-center justify-center py-12">
              <FileText size={48} className="text-ink-200 mb-4" />
              <h3 className="text-base font-semibold text-ink-900">No uploads yet</h3>
              <p className="mt-1 text-sm text-ink-500">Start by uploading your first research document</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Upload Research
              </button>
            </Card>
          )}

          {/* Upload History Table */}
          {!loading && !error && history.length > 0 && (
            <div className="overflow-x-auto">
              <Card>
                <div className="min-w-full divide-y divide-ink-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 bg-ink-50 px-6 py-4 text-xs font-semibold text-ink-700">
                    <div className="col-span-4 flex items-center gap-2">
                      <span>Document</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Type</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Status</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Date</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span>Actions</span>
                    </div>
                  </div>

                  {/* Table Body */}
                  {history.map((item) => {
                    const fileIcon = getFileIcon(item.filetype);
                    const FileIcon = fileIcon.icon;
                    const statusConfig = getStatusIcon(item.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-ink-50 transition-colors items-center">
                        {/* Document */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 flex-shrink-0">
                            <FileIcon size={18} className={fileIcon.color} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate">{item.filename}</p>
                            {item.previewText && (
                              <p className="mt-0.5 text-xs text-ink-500 truncate">{item.previewText}</p>
                            )}
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-2">
                          <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                            {fileIcon.label}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 flex items-center gap-2">
                          <StatusIcon size={16} className={statusConfig.color} />
                          <span className="text-sm font-medium text-ink-700">{statusConfig.label}</span>
                        </div>

                        {/* Date */}
                        <div className="col-span-2">
                          <p className="text-sm text-ink-600">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            title="Download"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-100 hover:text-danger-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
