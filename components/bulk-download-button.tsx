"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorDetail, getApiUrl, getAuthHeaders } from "@/lib/api-client";

interface BulkDownloadButtonProps {
  groupSlug: string;
  fileCount: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BulkDownloadButton({
  groupSlug,
  fileCount,
  variant = "default",
  size = "default",
}: BulkDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleBulkDownload = async () => {
    setDownloading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const url = getApiUrl(`/api/download/group/${groupSlug}`);

      const response = await fetch(url, {
        headers: authHeaders,
      });

      if (!response.ok) throw new Error(await apiErrorDetail(response, "Download failed"));

      // Trigger browser download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `dropitx-${groupSlug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success("Download started!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBulkDownload}
      disabled={downloading}
      className="gap-1.5"
    >
      {downloading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {downloading
        ? "Preparing..."
        : `Download All (${fileCount} file${fileCount !== 1 ? "s" : ""})`}
    </Button>
  );
}
