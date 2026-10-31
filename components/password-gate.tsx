"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import { getApiUrl } from "@/lib/api-client";

interface PasswordGateProps {
  slug: string;
  title: string;
  isMarkdown: boolean;
}

/**
 * "Try again in 3 minutes" from a Retry-After header. The API sends the value as
 * either a number of seconds or an absolute Unix timestamp, so both are accepted.
 */
function describeWait(retryAfter: string | null): string {
  const value = Number(retryAfter);
  if (!retryAfter || !Number.isFinite(value) || value <= 0) return "Too many attempts. Try again later.";
  const seconds = value > 1e9 ? value - Date.now() / 1000 : value;
  if (seconds <= 0) return "Too many attempts. Try again later.";
  if (seconds < 60) return `Too many attempts. Try again in ${Math.ceil(seconds)} seconds.`;
  const minutes = Math.ceil(seconds / 60);
  return `Too many attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
}

export function PasswordGate({ slug, title, isMarkdown }: PasswordGateProps) {
  // The unlocked content lives only in this component's state: nothing is written
  // to storage, cookies or the URL, so a refresh asks for the password again.
  const [content, setContent] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl(`/api/shares/${slug}/unlock`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = (await res.json()) as { content?: string };
        setPassword("");
        setContent(data.content ?? "");
        return;
      }

      if (res.status === 429) {
        setError(describeWait(res.headers.get("Retry-After")));
      } else if (res.status === 401) {
        setError("Incorrect password");
      } else if (res.status === 404 || res.status === 410) {
        setError("This share is no longer available.");
      } else {
        setError("Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (content !== null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1200px] mx-auto w-full animate-fade-in">
        <Card>
          <CardContent className={isMarkdown ? "p-4 md:p-6" : "p-2"}>
            {isMarkdown ? (
              <MarkdownViewerWrapper content={content} />
            ) : (
              <HtmlViewer htmlContent={content} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm border border-border rounded-lg p-8">
        <div className="flex flex-col items-center gap-5">
          <p className="font-mono text-2xl font-semibold tracking-tight">
            {">"} unlock
          </p>

          <p className="text-sm text-muted-foreground truncate max-w-[240px] text-center">
            {title}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <Input
              ref={inputRef}
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="h-10 rounded-md"
            />
            <Button type="submit" disabled={loading || !password} className="w-full rounded-md">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Unlocking…
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>

          {error && (
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 w-full">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href={`/auth/login?next=/s/${slug}`}
            className="text-sm text-primary hover:underline"
          >
            Sign in to view
          </a>
        </div>
      </div>
    </div>
  );
}
