"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock, Loader } from "lucide-react";

interface UploadStatus {
  id: number;
  filename: string;
  status: "pending" | "processing" | "complete" | "failed";
  created_at: string;
  completed_at?: string;
  insights_count?: number;
  processing_time?: number;
  error?: string;
}

export function RecentUploadsStatus() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent uploads
    const fetchUploads = async () => {
      try {
        const response = await fetch("/api/uploads?limit=5&orderby=created_at&order=desc");
        const data = await response.json();
        setUploads(data.uploads || []);
      } catch (error) {
        console.error("Failed to fetch uploads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();

    // Poll every 2 seconds for status updates
    const interval = setInterval(fetchUploads, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "processing":
      case "pending":
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
      complete: { bg: "bg-green-100", text: "text-green-800", label: "Complete" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
        <div className="text-center py-8">
          <Loader className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading uploads...</p>
        </div>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">No uploads yet. Start by uploading research documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>

      <div className="space-y-3">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(upload.status)}
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{upload.filename}</p>
                <p className="text-sm text-gray-500">
                  {new Date(upload.created_at).toLocaleDateString()} at{" "}
                  {new Date(upload.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {upload.status === "complete" && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{upload.insights_count || 0}</p>
                  <p className="text-xs text-gray-500">insights</p>
                  <p className="text-xs text-gray-500">{upload.processing_time?.toFixed(1)}s</p>
                </div>
              )}

              {upload.status === "failed" && (
                <div className="text-right max-w-xs">
                  <p className="text-sm text-red-600 truncate">{upload.error || "Unknown error"}</p>
                </div>
              )}

              {(upload.status === "pending" || upload.status === "processing") && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">analyzing...</p>
                </div>
              )}

              {getStatusBadge(upload.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
