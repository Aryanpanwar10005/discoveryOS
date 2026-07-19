"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Upload, CheckCircle2, AlertCircle, BarChart3, Lightbulb } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SemanticAnalysisResult {
  success: boolean;
  extracted?: {
    dashboard: {
      total_insights: number;
      insights_by_type: Record<string, number>;
      avg_confidence: number;
      sentiment_breakdown: Record<string, number>;
    };
    insights: Array<{
      id: string;
      type: string;
      title: string;
      confidence: number;
      sentiment: string;
    }>;
    themes: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    opportunities: Array<{
      id: string;
      rank: number;
      title: string;
      impact: string;
      confidence: number;
    }>;
  };
  insights_count: number;
  processing_time: number;
}

interface UploadModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (result: SemanticAnalysisResult) => void;
}

type ModalTab = "upload" | "results";

export function UploadModalEnhanced({
  open,
  onClose,
  onUploadComplete,
}: UploadModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SemanticAnalysisResult | null>(null);
  const { showToast } = useToast();

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data: SemanticAnalysisResult = await res.json();

      if (!data.success) {
        throw new Error(data.extracted ? "Analysis failed" : "Upload failed");
      }

      setResult(data);
      setActiveTab("results");

      // Show success toast
      showToast({
        variant: "success",
        title: "Upload and analysis successful",
        description: `Extracted ${data.insights_count} insights in ${data.processing_time.toFixed(1)}s`,
      });

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);

      // Show error toast
      showToast({
        variant: "error",
        title: "Upload failed",
        description: errorMsg,
      });
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setActiveTab("upload");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Research"
      description="Upload documents to extract insights"
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-4 p-5">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-ink-100">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "upload"
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            Upload
          </button>
          {result && (
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "results"
                  ? "border-b-2 border-brand-500 text-brand-600"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              Results
            </button>
          )}
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="flex flex-col gap-4">
            {/* File upload area */}
            <label
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-ink-200 p-8 transition-colors ${
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-ink-400 hover:bg-ink-50 cursor-pointer"
              }`}
            >
              <Upload size={24} className="text-ink-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-ink-900">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  PDF, DOCX, TXT, CSV (up to 10MB)
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.docx,.txt,.csv"
              />
            </label>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 flex gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Loading state */}
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700"></div>
                Processing your document...
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && result?.extracted && (
          <div className="flex flex-col gap-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-brand-50 p-3">
                <p className="text-xs text-brand-600 font-medium">Total Insights</p>
                <p className="text-2xl font-bold text-brand-700 mt-1">
                  {result.extracted.dashboard.total_insights}
                </p>
              </div>

              <div className="rounded-lg bg-success-50 p-3">
                <p className="text-xs text-success-600 font-medium">Avg Confidence</p>
                <p className="text-2xl font-bold text-success-700 mt-1">
                  {(result.extracted.dashboard.avg_confidence * 100).toFixed(0)}%
                </p>
              </div>

              <div className="rounded-lg bg-warning-50 p-3">
                <p className="text-xs text-warning-600 font-medium">Processing Time</p>
                <p className="text-2xl font-bold text-warning-700 mt-1">
                  {result.processing_time.toFixed(1)}s
                </p>
              </div>
            </div>

            {/* Insights by Type */}
            <div>
              <p className="text-sm font-semibold text-ink-900 mb-2">Insights by Type</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.extracted.dashboard.insights_by_type).map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-ink-700 capitalize">
                        {type}
                      </span>
                      <span className="text-sm font-bold text-brand-600">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Themes */}
            {result.extracted.themes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-2 flex gap-2 items-center">
                  <BarChart3 size={16} />
                  Themes Found
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.extracted.themes.map((theme) => (
                    <div
                      key={theme.id}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      {theme.name}
                      <span className="ml-1 text-brand-600">({theme.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Opportunities */}
            {result.extracted.opportunities.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-2 flex gap-2 items-center">
                  <Lightbulb size={16} />
                  Top Opportunities
                </p>
                <div className="flex flex-col gap-2">
                  {result.extracted.opportunities.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="rounded-lg border border-brand-200 bg-brand-50 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-brand-900">
                            #{opp.rank} {opp.title}
                          </p>
                          <div className="mt-1 flex gap-2">
                            <span className="text-xs font-medium text-brand-600">
                              Impact: {opp.impact}
                            </span>
                            <span className="text-xs font-medium text-brand-600">
                              Confidence: {opp.confidence}%
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 size={16} className="text-success-500 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-ink-100">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 rounded-lg bg-ink-100 text-ink-900 text-sm font-medium hover:bg-ink-200 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
