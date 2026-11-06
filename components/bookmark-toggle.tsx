"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { authFetch } from "@/lib/api-client";
import { squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface BookmarkToggleProps {
  shareId: string;
  slug: string;
}

export function BookmarkToggle({ shareId, slug }: BookmarkToggleProps) {
  const { user, loading: authLoading } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  // Fetch-pending state; true until the initial favorites check settles.
  const [fetchLoading, setFetchLoading] = useState(true);
  // Derived: loading while auth resolves, or while a signed-in user's
  // favorites check is in flight. No user after auth → interactive.
  const loading = authLoading || (user ? fetchLoading : false);
  const toggling = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    let cancelled = false;
    authFetch(`/api/v1/favorites/${shareId}`)
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json().catch(() => null)) as { favorited?: boolean } | null;
          if (!cancelled) setIsFavorited(Boolean(data?.favorited));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, shareId]);

  const toggle = useCallback(async () => {
    if (toggling.current) return;
    if (!user) return;

    toggling.current = true;
    const prev = isFavorited;
    setIsFavorited(!prev);

    try {
      const res = await authFetch(`/api/v1/favorites/${shareId}`, {
        method: prev ? "DELETE" : "POST",
      });
      if (!res.ok) setIsFavorited(prev);
    } catch {
      setIsFavorited(prev);
    } finally {
      toggling.current = false;
    }
  }, [isFavorited, shareId, user]);

  // An anonymous visitor cannot favorite: offer sign-in instead of a button that does nothing.
  if (!authLoading && !user) {
    return (
      <Link
        href={`/auth/login?next=/s/${slug}`}
        className={squareButton("quiet", "small")}
        title="Sign in to add to favorites"
        aria-label="Sign in to add to favorites"
      >
        <Heart className="size-4" aria-hidden="true" />
        <span className="btn-label">Favorite</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={isFavorited}
      aria-label="Favorite"
      className={squareButton("quiet", "small")}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-4 transition-colors duration-200", isFavorited && "fill-current")}
      />
      <span className="btn-label">{isFavorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
