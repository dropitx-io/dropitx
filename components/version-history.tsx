"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  History,
  Loader2,
  RotateCcw,
  Eye,
  ChevronDown,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/api-client";

interface Version {
  version_num: number;
  created_at: string;
  storage_path?: string;
  content_text?: string;
  has_content: boolean;
  has_file: boolean;
}

interface VersionHistoryProps {
  slug: string;
}

function formatVersionDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load versions");
      }
      const data = await res.json();
      setVersions(data.versions || data || []);
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
      if (!res.ok) throw new Error("Failed to load version");
      const data = await res.json();
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Restore failed" }));
        throw new Error(err.error || "Restore failed");
      }

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
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return null; // Don't show section if no versions
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Version History
            <span className="text-xs font-normal text-muted-foreground">
              ({versions.length} version{versions.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.version_num}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    v{version.version_num}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Version {version.version_num}
                      {version.version_num === versions[0]?.version_num && (
                        <span className="ml-1.5 text-xs text-success font-normal">
                          (current)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="size-3" />
                    {formatVersionDate(version.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => previewVersion(version)}
                    title="Preview version"
                  >
                    <Eye className="size-4" />
                  </Button>
                  {/* Don't show restore on current version */}
                  {version.version_num !== versions[0]?.version_num && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => restoreVersion(version.version_num)}
                      disabled={restoring !== null}
                      title="Restore this version"
                    >
                      {restoring === version.version_num ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <div className="overflow-y-auto max-h-[60vh] rounded-lg border bg-muted/30 p-4">
            {previewLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <pre className="text-sm whitespace-pre-wrap break-words font-mono">
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
                  <RotateCcw className="size-3.5" />
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
