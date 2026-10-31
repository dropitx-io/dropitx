"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Copy,
  Check,
  File,
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import { ExpirationSelect } from "@/components/expiration-select";

interface QueuedFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

/** `POST /api/upload/multi` response: one share holding all the files. */
interface UploadResult {
  slug: string;
  url: string;
  files: Array<{ filename: string }>;
  file_count: number;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function MultiFileUpload() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("");
  const [expiresIn, setExpiresIn] = useState("30d");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: QueuedFile[] = acceptedFiles.map((file) => ({
        file,
        id: generateId(),
        progress: 0,
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setResult(null);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: uploading,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((qf) => formData.append("files", qf.file));

      if (maxDownloads) formData.append("max_downloads", maxDownloads);
      formData.append("expires_in", expiresIn);

      // Update all to uploading
      setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" as const, progress: 0 })));

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) => prev.map((f) => ({ ...f, progress: pct })));
        }
      };

      const response = await new Promise<UploadResult>((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.detail || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", getApiUrl("/api/upload/multi"));
        // Add auth header
        getAuthHeaders().then((h: Record<string, string>) => {
          Object.entries(h).forEach(([k, v]) => xhr.setRequestHeader(k, v));
          xhr.send(formData);
        });
      });

      setFiles((prev) => prev.map((f) => ({ ...f, status: "done" as const, progress: 100 })));
      setResult(response);
      toast.success(`${files.length} file(s) uploaded!`);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Upload failed" }
            : f
        )
      );
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "cursor-pointer transition-colors duration-200",
          isDragActive
            ? "border-solid border-2 border-primary bg-primary/[0.03]"
            : "border-dashed border-2 border-border hover:border-primary/50",
          uploading && "cursor-wait opacity-60"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          {isDragActive ? (
            <FileUp className="size-10 text-primary scale-110 transition-transform" />
          ) : (
            <Upload className="size-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground text-center">
            {isDragActive
              ? "Drop files here"
              : "Drag & drop files here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground/70">Max 500MB per file</p>
          <input {...getInputProps()} />
        </CardContent>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </h3>
              {!uploading && (
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((qf) => {
                const IconComponent = getFileIcon(qf.file.name, qf.file.type);
                return (
                  <div
                    key={qf.id}
                    className="flex items-center gap-3 rounded-lg border p-2.5"
                  >
                    <IconComponent className="size-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{qf.file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(qf.file.size)}
                        </span>
                        {qf.status === "uploading" && (
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${qf.progress}%` }}
                            />
                          </div>
                        )}
                        {qf.status === "done" && (
                          <CheckCircle2 className="size-3.5 text-success" />
                        )}
                        {qf.status === "error" && (
                          <XCircle className="size-3.5 text-destructive" />
                        )}
                      </div>
                    </div>
                    {qf.status === "pending" && !uploading && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(qf.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Max downloads
                </label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  min="1"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                  disabled={uploading}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Expires in
                </label>
                <ExpirationSelect value={expiresIn} onChange={setExpiresIn} disabled={uploading} compact />
              </div>
            </div>

            {/* Upload button */}
            <Button
              className="w-full"
              onClick={uploadAll}
              disabled={uploading || files.length === 0 || files.every((f) => f.status === "done")}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload All ({files.length} file{files.length !== 1 ? "s" : ""})
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              <span className="text-sm font-medium">Upload complete!</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted px-3 py-1.5 text-sm font-mono truncate">
                {result.url}
              </code>
              <Button size="icon-sm" variant="outline" onClick={copyUrl}>
                {copied ? (
                  <Check className="size-3 text-success" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFiles([]);
                setResult(null);
              }}
            >
              Upload more files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
