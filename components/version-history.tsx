"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import { apiErrorDetail, authFetch } from "@/lib/api-client";

interface Version {
  version_num: number;
  created_at: string;
}

interface VersionHistoryProps {
  slug: string;
}

function formatVersionDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function VersionHistory({ slug }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [restoring, setRestoring] = useState<number | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await authFetch(`/api/shares/${slug}/versions`);
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to load versions"));
      const data = (await res.json()) as { versions: Version[] };
      setVersions(data.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical fetch-on-mount; setStates only run after await inside fetchVersions
    fetchVersions();
  }, [fetchVersions]);

  const previewVersion = async (version: Version) => {
    setSelectedVersion(version);
    setPreviewLoading(true);
    setPreviewContent(null);

    try {
      const res = await authFetch(
        `/api/shares/${slug}/versions/${version.version_num}`
      );
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to load version"));
      const data = (await res.json()) as { content_text: string | null };
      setPreviewContent(data.content_text || "(No text content for this version)");
    } catch {
      setPreviewContent("Failed to load version content.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const restoreVersion = async (versionNum: number) => {
    if (!confirm(`Restore to version ${versionNum}? This will create a new version with the old content.`)) {
      return;
    }

    setRestoring(versionNum);
    try {
      const res = await authFetch(`/api/shares/${slug}/versions/${versionNum}/restore`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(await apiErrorDetail(res, "Restore failed"));

      toast.success(`Restored to version ${versionNum}`);
      // Refresh version list
      await fetchVersions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading versions.</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No earlier versions yet. Each update keeps one.</p>;
  }

  const currentNum = versions[0]?.version_num;

  return (
    <>
      <p className="mb-2 text-xs tabular-nums text-muted-foreground">
        {versions.length} {versions.length === 1 ? "version" : "versions"}
      </p>
      <ul>
        {versions.map((version) => (
          <li key={version.version_num} className="flex items-center gap-2 border-t border-rule py-2.5 first:border-border">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tabular-nums">
                Version {version.version_num}
                {version.version_num === currentNum && <span className="ml-1.5 font-normal text-muted-foreground">current</span>}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">{formatVersionDate(version.created_at)}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => previewVersion(version)} aria-label={`Preview version ${version.version_num}`} title="Preview">
              <Eye className="size-4" strokeWidth={1.5} />
            </Button>
            {version.version_num !== currentNum && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => restoreVersion(version.version_num)}
                disabled={restoring !== null}
                aria-label={`Restore version ${version.version_num}`}
                title="Restore"
              >
                <RotateCcw className="size-4" strokeWidth={1.5} />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {/* Preview dialog */}
      <Dialog
        open={!!selectedVersion}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVersion(null);
            setPreviewContent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_num}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion && formatVersionDate(selectedVersion.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-raised p-4">
            {previewLoading ? (
              <p className="text-sm text-muted-foreground">Loading this version.</p>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px]">
                {previewContent}
              </pre>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {selectedVersion &&
              selectedVersion.version_num !== versions[0]?.version_num && (
                <Button
                  variant="outline"
                  onClick={() => {
                    restoreVersion(selectedVersion.version_num);
                    setSelectedVersion(null);
                  }}
                  disabled={restoring !== null}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.5} />
                  Restore this version
                </Button>
              )}
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedVersion(null);
                setPreviewContent(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
