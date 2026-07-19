"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      const data = await res.json();
      setText(data.text);
      
      // Show success toast
      showToast({
        variant: "success",
        title: "Upload successful",
        description: `${file.name} has been uploaded and processed`,
      });
      
      // Close modal after a brief delay
      setTimeout(() => {
        setText("");
        onClose();
      }, 1000);
      
      // Call completion callback after successful upload
      if (onUploadComplete) {
        onUploadComplete();
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Research"
      description="Upload documents, notes, or reports to extract insights"
      maxWidthClassName="max-w-md"
    >
      <div className="flex flex-col gap-4 p-5">
        {/* File upload area */}
        <label className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-ink-200 p-8 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-ink-400 hover:bg-ink-50 cursor-pointer"}`}>
          <Upload size={24} className="text-ink-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-ink-900">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-ink-500">PDF, DOCX, TXT, CSV (up to 10MB)</p>
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
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700"></div>
            Uploading...
          </div>
        )}

        {/* Extracted text preview */}
        {text && (
          <div>
            <p className="text-xs font-medium text-ink-500 mb-2">Extracted Content Preview:</p>
            <pre className="max-h-40 overflow-auto rounded-lg bg-ink-50 p-3 text-xs text-ink-700 font-mono">
              {text.substring(0, 500)}
              {text.length > 500 && "..."}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
