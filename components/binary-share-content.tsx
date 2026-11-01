"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { canPreview } from "@/lib/file-utils";

const EMPTY_BYTES = new Uint8Array();

interface BinaryShareContentProps {
  content: string;
  filename?: string | null;
  mimeType?: string | null;
}

function decodeBase64(content: string): Uint8Array<ArrayBuffer> {
  const binary = window.atob(content);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function BinaryShareContent({ content, filename, mimeType }: BinaryShareContentProps) {
  const type = mimeType?.toLowerCase() ?? "";
  const displayName = filename?.trim() || "shared file";
  const downloadName = filename?.trim() || "download";
  const bytes = useMemo(() => {
    try {
      return decodeBase64(content);
    } catch {
      return null;
    }
  }, [content]);
  const failed = bytes === null;
  const { objectUrl } = useBlobUrl(bytes ?? EMPTY_BYTES, type || "application/octet-stream");

  if (failed) {
    return (
      <div className="flex h-[80vh] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">Could not decode this file.</p>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSvg = type === "image/svg+xml";
  const isImage = type.startsWith("image/") && !isSvg;
  const isPdf = type === "application/pdf";
  const isVideo = type.startsWith("video/");
  const isAudio = type.startsWith("audio/");
  const previewable = canPreview(displayName, type) || isVideo || isAudio;

  if (previewable && isImage) {
    return (
      <div className="relative h-[80vh] w-full overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
        <Image
          src={objectUrl}
          alt={displayName}
          fill
          unoptimized
          sizes="100%"
          className="object-contain p-2"
        />
      </div>
    );
  }

  if (previewable && isSvg) {
    return (
      <iframe
        src={objectUrl}
        sandbox=""
        title={displayName}
        className="h-[80vh] w-full rounded-lg border border-border bg-background"
      />
    );
  }

  if (previewable && isPdf) {
    return (
      <iframe
        src={objectUrl}
        title={displayName}
        className="h-[80vh] w-full rounded-lg border border-border bg-background"
      />
    );
  }

  if (previewable && isVideo) {
    return (
      <video
        controls
        src={objectUrl}
        className="h-[80vh] w-full rounded-lg border border-border bg-black"
      />
    );
  }

  if (previewable && isAudio) {
    return <audio controls src={objectUrl} className="w-full rounded-lg border border-border" />;
  }

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/20 p-6 text-center">
      <p className="max-w-full truncate text-sm font-medium text-foreground">{displayName}</p>
      <Button
        nativeButton={false}
        render={<a href={objectUrl} download={downloadName} />}
        variant="outline"
        className="gap-1.5"
      >
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}
