"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import { authFetch } from "@/lib/api-client";
import { formatFileSize, canPreview } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

export interface UploadResult {
  slug: string;
  url: string;
  filename: string;
  deleteToken: string;
}

interface UploadDropzoneProps {
  onUploadSuccess: (result: UploadResult) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export function UploadDropzone({ onUploadSuccess }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadSingleFile = useCallback(
    async (file: File) => {
      setState("uploading");
      setErrorMessage("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await authFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setState("error");
          setErrorMessage(data.error || "Upload failed.");
          return;
        }

        setState("success");
        trackEvent(AnalyticsEvent.DOCUMENT_UPLOADED, {
          type: file.name.split(".").pop() || "unknown",
          size_kb: Math.round(file.size / 1024),
        });
        onUploadSuccess(data as UploadResult);
      } catch {
        setState("error");
        setErrorMessage("Network error. Please try again.");
      }
    },
    [onUploadSuccess],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(null);

      if (canPreview(file.name, file.type)) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      void uploadSingleFile(file);
    },
    [uploadSingleFile],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => {
      setDragActive(false);
      setState("error");
      setErrorMessage("File too large. Maximum size is 500MB.");
    },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: state === "uploading",
    noClick: state === "uploading",
  });

  const resetState = () => {
    setState("idle");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const stateText = () => {
    switch (state) {
      case "uploading":
        return `Uploading ${selectedFile?.name ?? ""}...`;
      case "success":
        return `Uploaded: ${selectedFile?.name ?? "complete!"}`;
      case "error":
        return errorMessage;
      default:
        return dragActive ? "Drop your file here" : "Drag & drop any file, or click to browse";
    }
  };

  const cardClasses = [
    "cursor-pointer transition-all duration-200 rounded-[34px] border-2",
    state === "idle" && !dragActive
      ? "border-dashed border-border bg-card hover:border-primary/50 hover:bg-primary/[0.04] clay-raised"
      : "",
    dragActive
      ? "border-solid border-primary bg-primary/[0.04]"
      : "",
    state === "error"
      ? "border-destructive/50 bg-destructive/[0.03]"
      : "",
    state === "success"
      ? "border-success/50 bg-success/5"
      : "",
    state === "uploading"
      ? "border-primary/30 animate-border-pulse cursor-wait"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={cardClasses}>
        <div className="flex items-center gap-5 p-6 max-[640px]:flex-col max-[640px]:items-start">
          {/* Icon tile */}
          <div className="grid size-13 shrink-0 place-items-center rounded-[22px] bg-primary/16 text-primary clay-raised">
            {state === "uploading" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : state === "success" ? (
              <CheckCircle2 className="size-6 text-success" />
            ) : state === "error" ? (
              <XCircle className="size-6 text-destructive" />
            ) : (
              <Upload className={cn("size-6 transition-transform", dragActive && "scale-110")} />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            {selectedFile && state === "idle" ? (
              <>
                <p className="font-display text-[17px] font-bold tracking-[-0.01em]">{selectedFile.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} · {selectedFile.type || "unknown type"}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-[17px] font-bold tracking-[-0.01em]">
                  {state === "error" ? "Upload failed" : "Drop a file to share instantly"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stateText()}
                </p>
                <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                  50 MB max · .md · .markdown · .html
                </p>
              </>
            )}
          </div>

          {/* Action button */}
          {state === "idle" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px max-[640px]:w-full max-[640px]:justify-center"
            >
              Choose file
            </button>
          )}
          {(state === "success" || state === "error") && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetState(); }}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px max-[640px]:w-full max-[640px]:justify-center"
            >
              {state === "success" ? "Upload another" : "Try again"}
            </button>
          )}
        </div>

        {/* Image preview */}
        {previewUrl && state !== "uploading" && (
          <div className="px-6 pb-4">
            <div className="relative size-20 overflow-hidden rounded-[14px] border border-border">
              <img src={previewUrl} alt="Preview" className="size-full object-cover" />
            </div>
          </div>
        )}

        <input {...getInputProps()} />
      </div>
    </div>
  );
}
