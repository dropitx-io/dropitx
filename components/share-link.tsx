"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SharePasswordForm } from "@/components/share-password-form";
import { Check, Copy, ExternalLink, Trash2, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { apiErrorDetail, getApiUrl } from "@/lib/api-client";
import type { UploadResult } from "@/components/upload-dropzone";

interface ShareLinkProps {
  result: UploadResult;
}

export function ShareLink({ result }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const shareUrl = result.url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById("share-url-input") as HTMLInputElement;
      input?.select();
    }
  };

  const handleDelete = async () => {
    if (!result.deleteToken) return;
    if (!window.confirm("Delete this share? The link will stop working immediately.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(getApiUrl(`/api/shares/${encodeURIComponent(result.slug)}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_token: result.deleteToken }),
      });
      if (!res.ok) {
        setDeleteError(await apiErrorDetail(res, "Failed to delete the share."));
        return;
      }
      setDeleted(true);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trash2 className="size-4 text-muted-foreground" />
            Share deleted
          </CardTitle>
          <CardDescription>{result.filename} is no longer available at its link.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Check className="size-4 text-success" />
          File shared successfully
        </CardTitle>
        <CardDescription>{result.filename}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Shareable URL */}
        <div className="flex items-center gap-2">
          <Input
            id="share-url-input"
            value={shareUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant={copied ? "default" : "outline"}
            size="icon"
            onClick={handleCopy}
            aria-label="Copy share link"
            className="shrink-0"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open share link"
          >
            <Button type="button" variant="outline" size="icon" className="shrink-0">
              <ExternalLink className="size-4" />
            </Button>
          </a>
        </div>

        {/* Inline copied feedback */}
        {copied && (
          <p className="text-xs text-success animate-fade-in">
            Link copied to clipboard
          </p>
        )}

        {/* Delete share */}
        {result.deleteToken && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 transition-colors flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              Delete token (shown once)
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="delete-token-input"
                value={result.deleteToken}
                readOnly
                aria-label="Delete token (shown once)"
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.deleteToken ?? "");
                  } catch {
                    const input = document.getElementById(
                      "delete-token-input",
                    ) as HTMLInputElement;
                    input?.select();
                  }
                }}
                aria-label="Copy delete token"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="self-start text-destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Delete share
            </Button>
          </div>
        )}
        {/* Password protection */}
        {result.deleteToken && (
          <div className="rounded-md border border-border p-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPasswordOpen((o) => !o)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-full text-left"
            >
              <Lock className="size-4 shrink-0" />
              {hasPassword ? "Password set — click to change" : "Add password protection"}
            </button>
            {passwordOpen && (
              <SharePasswordForm
                slug={result.slug}
                deleteToken={result.deleteToken}
                hasPassword={hasPassword}
                onSuccess={(hp) => {
                  setHasPassword(hp);
                  if (!hp) setPasswordOpen(false);
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
