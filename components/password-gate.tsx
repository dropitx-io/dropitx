"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnceOnlyNotice } from "@/components/reveal-share-content";
import { ShareContentArea } from "@/components/share-content-area";
import { unlockShare } from "@/lib/share-unlock";
import type { GroupShare } from "@/types/share";

interface PasswordGateProps {
  slug: string;
  isMarkdown: boolean;
  groupFiles: GroupShare[];
  isAuthenticated: boolean;
  /** The share deletes itself on its first read, which the unlock performs. */
  selfDeleting: boolean;
}

interface Unlocked {
  content: string;
  password: string;
}

/**
 * Stands in for a protected share's content area. A correct password renders the
 * share's normal content area in its place. The unlocked content and password live
 * only in this component's state: nothing is written to storage, cookies or the
 * URL, so a refresh asks for the password again.
 */
export function PasswordGate({ slug, isMarkdown, groupFiles, isAuthenticated, selfDeleting }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
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

    const result = await unlockShare(slug, password);
    switch (result.status) {
      case "ok":
        if (result.content) {
          setUnlocked({ content: result.content, password });
          setPassword("");
        } else {
          // A one-time or burn share another visitor already opened unlocks to nothing.
          setError("This share is no longer available.");
        }
        break;
      case "wrong":
        setError("Incorrect password");
        break;
      case "limited":
        setError(result.message);
        break;
      case "gone":
        setError("This share is no longer available.");
        break;
      default:
        setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (unlocked) {
    return (
      <ShareContentArea
        slug={slug}
        isMarkdown={isMarkdown}
        content={unlocked.content}
        groupFiles={groupFiles}
        isAuthenticated={isAuthenticated}
        password={unlocked.password}
      />
    );
  }

  return (
    <div className="flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm border border-border rounded-lg p-8">
        <div className="flex flex-col items-center gap-5">
          <p className="font-mono text-2xl font-semibold tracking-tight">
            {">"} unlock
          </p>

          {selfDeleting && (
            <div className="flex flex-col items-center gap-1 text-center">
              <OnceOnlyNotice />
            </div>
          )}

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

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

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
