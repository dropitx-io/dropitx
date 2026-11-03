"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Download, Loader2 } from "lucide-react";
import { squareButton } from "@/app/(content)/_ui/public-styles";
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
      <div className="flex h-[80vh] items-center justify-center bg-pill-negative">
        <p role="alert" className="text-[17px] text-pill-negative-foreground">Could not decode this file.</p>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div role="status" className="flex h-[80vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Preparing the file</span>
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
      <div className="relative h-[80vh] w-full overflow-hidden bg-surface p-2">
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
        className="h-[80vh] w-full bg-card"
      />
    );
  }

  if (previewable && isPdf) {
    return (
      <iframe
        src={objectUrl}
        title={displayName}
        className="h-[80vh] w-full bg-card"
      />
    );
  }

  if (previewable && isVideo) {
    return (
      <video
        controls
        src={objectUrl}
        className="h-[80vh] w-full bg-black"
      />
    );
  }

  if (previewable && isAudio) {
    return <audio controls src={objectUrl} className="w-full" />;
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-5 bg-surface p-6 text-center">
      <p className="max-w-full truncate text-[clamp(18px,1.05rem+0.3vw,21px)] font-medium text-foreground">{displayName}</p>
      <a href={objectUrl} download={downloadName} className={squareButton("quiet")}>
        <Download className="size-4" aria-hidden="true" />
        Download
      </a>
    </div>
  );
}
