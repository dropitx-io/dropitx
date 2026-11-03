"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareLink } from "@/components/share-link";
import { useUploadDropzone, type UploadResult } from "@/components/upload-dropzone";
import { SITE_URL } from "@/lib/site-url";

interface DashboardUploadProps {
  /** One sentence about the caller's links, computed from real data; null when there is none. */
  finding: string | null;
  /** True when the caller has no link anywhere yet: the list gives way to the first-run drop target. */
  empty: boolean;
  children: React.ReactNode;
}

const host = SITE_URL.replace(/^https?:\/\//, "");

/**
 * The Links screen's title row and its drop target: the whole area takes a dropped file, and the
 * dashed frame shows only while a file is over it. Upload opens the file picker.
 */
export function DashboardUpload({ finding, empty, children }: DashboardUploadProps) {
  const router = useRouter();
  const [result, setResult] = useState<UploadResult | null>(null);
  const onUploadSuccess = useCallback(
    (uploaded: UploadResult) => {
      setResult(uploaded);
      router.refresh();
    },
    [router],
  );
  const { getRootProps, getInputProps, open, isDragActive, state, errorMessage, fileName, reset } =
    useUploadDropzone(onUploadSuccess);

  return (
    <div {...getRootProps({ className: "relative outline-none" })}>
      <input {...getInputProps()} />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">Links</h1>
          {finding && <p className="mt-1 text-sm text-muted-foreground">{finding}</p>}
        </div>
        <Button size="sm" onClick={open} disabled={state === "uploading"} className="shrink-0 max-md:h-9">
          Upload
        </Button>
      </div>

      {state === "uploading" && (
        <p role="status" className="mb-4 text-sm text-muted-foreground">
          Uploading <span className="font-medium text-card-foreground">{fileName}</span>
        </p>
      )}
      {state === "error" && (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
          <CircleAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
          <span className="min-w-0 flex-1">
            {fileName ? `${fileName} was not published. ` : ""}
            {errorMessage}
          </span>
          <Button size="sm" variant="outline" onClick={open}>
            Choose another file
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            Dismiss
          </Button>
        </div>
      )}
      {result && (
        <div className="mb-6">
          <ShareLink key={result.slug} result={result} />
        </div>
      )}

      {empty ? (
        <div className="grid min-h-[calc(100svh-220px)] content-center justify-items-center gap-1 rounded-lg border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          <Inbox className="mb-1 size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="text-base font-medium text-card-foreground">Publish your first page</p>
          <p className="max-w-md">
            Drop a Markdown or HTML file anywhere on this page, or{" "}
            <button type="button" onClick={open} className="font-medium text-card-foreground underline-offset-3 hover:underline">
              choose a file
            </button>
            . Each one gets a short link at {host}/s/.
          </p>
        </div>
      ) : (
        children
      )}

      {isDragActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 z-20 grid place-items-center rounded-xl border-[1.5px] border-dashed border-primary bg-sheet/95 text-center"
        >
          <div>
            <p className="text-lg font-semibold text-card-foreground">Drop to publish</p>
            <p className="text-sm text-muted-foreground">One file, up to 500 MB. You get a short link right away.</p>
          </div>
        </div>
      )}
    </div>
  );
}
