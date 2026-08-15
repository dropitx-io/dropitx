"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { authFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface BookmarkToggleProps {
  shareId: string;
  slug: string;
}

export function BookmarkToggle({ shareId, slug }: BookmarkToggleProps) {
  const { user, loading: authLoading } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const toggling = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, shareId]);

  const toggle = useCallback(async () => {
    if (toggling.current) return;
    if (!user) {
      router.push(`/auth/login?next=/s/${slug}`);
      return;
    }

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
  }, [isFavorited, shareId, slug, user, router]);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      disabled={loading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`size-4 transition-colors duration-200 ${isFavorited ? "text-destructive fill-destructive" : ""}`}
      />
    </Button>
  );
}
