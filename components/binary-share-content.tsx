"use client";

import { useEffect, useReducer } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canPreview } from "@/lib/file-utils";

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

interface BinaryResourceState {
  objectUrl: string | null;
  error: string | null;
}

type BinaryResourceAction =
  | { type: "loaded"; objectUrl: string }
  | { type: "failed" };

function binaryResourceReducer(
  _: BinaryResourceState,
  action: BinaryResourceAction
): BinaryResourceState {
  if (action.type === "loaded") return { objectUrl: action.objectUrl, error: null };
  return { objectUrl: null, error: "Could not decode this file." };
}

/**
 * Renders a base64 share as its original bytes. The object URL belongs to this
 * component instance and is revoked whenever the content changes or it unmounts.
 */
export function BinaryShareContent({ content, filename, mimeType }: BinaryShareContentProps) {
  const [{ objectUrl, error }, dispatch] = useReducer(binaryResourceReducer, {
    objectUrl: null,
    error: null,
  });
  const type = mimeType?.toLowerCase() ?? "";
  const displayName = filename?.trim() || "shared file";
  const downloadName = filename?.trim() || "download";

  useEffect(() => {
    let url: string | null = null;

    try {
      const bytes = decodeBase64(content);
      url = URL.createObjectURL(new Blob([bytes], { type: type || "application/octet-stream" }));
      dispatch({ type: "loaded", objectUrl: url });
    } catch {
      dispatch({ type: "failed" });
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [content, type]);

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">{error}</p>
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
      <div className="flex h-[80vh] items-center justify-center rounded-lg border border-border bg-muted/20 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={objectUrl} alt={displayName} className="max-h-full max-w-full object-contain" />
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
