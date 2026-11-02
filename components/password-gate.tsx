"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { body, field, notice, small, squareButton, textLink } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { OnceOnlyNotice } from "@/components/reveal-share-content";
import { ShareContentArea } from "@/components/share-content-area";
import { unlockShare } from "@/lib/share-unlock";
import type { GroupShare } from "@/types/share";
import type { ShareFilePayload } from "@/types/share-content";

interface PasswordGateProps {
  slug: string;
  filename?: string | null;
  mimeType?: string | null;
  groupFiles: GroupShare[];
  isAuthenticated: boolean;
  /** The share deletes itself on its first read, which the unlock performs. */
  selfDeleting: boolean;
}

interface Unlocked {
  content: ShareFilePayload;
  password: string;
}

/**
 * Stands in for a protected share's content area. A correct password renders the
 * share's normal content area in its place. The unlocked content and password live
 * only in this component's state: nothing is written to storage, cookies or the
 * URL, so a refresh asks for the password again.
 */
export function PasswordGate({
  slug,
  filename,
  mimeType,
  groupFiles,
  isAuthenticated,
  selfDeleting,
}: PasswordGateProps) {
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
          setUnlocked({ content: { content: result.content, encoding: result.encoding }, password });
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
        filename={filename}
        mimeType={mimeType}
        content={unlocked.content}
        groupFiles={groupFiles}
        isAuthenticated={isAuthenticated}
        password={unlocked.password}
      />
    );
  }

  return (
    <section aria-labelledby="gate-title" className="grid max-w-[34em] gap-6">
      <div className="grid gap-2">
        <h2 id="gate-title" className="text-[clamp(24px,1.3rem+1.1vw,36px)] leading-[1.15] tracking-[-0.015em]">
          This page is locked.
        </h2>
        <p className={body}>
          Whoever shared {filename ?? "it"} set a password. Ask them for it, then enter it here.
        </p>
      </div>

      {selfDeleting && (
        <div className={cn(body, notice.warning, "grid gap-1")}>
          <OnceOnlyNotice />
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="share-password" className={cn(body, "font-medium")}>
            Password
          </label>
          <Input
            ref={inputRef}
            id="share-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "share-password-error" : undefined}
            className={field}
          />
          {error && (
            <p id="share-password-error" role="alert" className={cn(small, "font-medium text-destructive")}>
              {error}
            </p>
          )}
        </div>
        <div>
          <button type="submit" disabled={loading || !password} aria-busy={loading} className={squareButton()}>
            {loading ? "Opening the page" : "Open the page"}
          </button>
        </div>
      </form>

      <p className={cn(small, "text-muted-foreground")}>
        The password is checked before the page renders. Have an account with access?{" "}
        <a href={`/auth/login?next=/s/${slug}`} className={textLink}>
          Sign in to view
        </a>
      </p>
    </section>
  );
}
