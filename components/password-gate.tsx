"use client";

import { useEffect, useRef, useState } from "react";
import { notice } from "@/app/(content)/_ui/public-styles";
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
    if (loading) return;
    if (!password) {
      setError("Enter the password you were given.");
      inputRef.current?.focus();
      return;
    }

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
        setError("That password is not right. Check it with whoever shared the page.");
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
    <section aria-labelledby="gate-title" className="gate card-featured" data-testid="share-gate">
      {/* noValidate + onSubmit: the password goes only to the unlock request body, never into a URL. */}
      <form onSubmit={handleSubmit} noValidate className="card-pad paper rounded-[inherit]">
        <div className="gate-lock" aria-hidden="true" />
        <h2 id="gate-title" className="h-title">This page is locked</h2>
        <p className="lead">
          Whoever shared <strong>{filename ?? "this page"}</strong> set a password. Ask them for it, then enter it here.
        </p>

        {selfDeleting && (
          <div className={cn(notice.warning, "grid gap-1")}>
            <OnceOnlyNotice />
          </div>
        )}

        <div className="field">
          <label htmlFor="share-password">Password</label>
          <input
            ref={inputRef}
            id="share-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby="share-password-error"
            data-testid="share-gate-password"
          />
          <p id="share-password-error" role="alert" className="field-error">{error ?? ""}</p>
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-dark btn-lg btn-block" data-testid="share-gate-submit">
          {loading ? "Opening the page" : "Open the page"}
        </button>

        <p className="auth-note">
          The password is checked before the page renders. Nothing of the document is sent until it matches. Have an
          account with access? <a href={`/auth/login?next=/s/${slug}`}>Sign in to view</a>
        </p>
      </form>
    </section>
  );
}
