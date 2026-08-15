import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import { Heart, Star, Copy } from "lucide-react";
import type { Share } from "@/types/share";
import type { ShareWithPasswordFlag } from "@/app/(dashboard)/dashboard/page";

interface FavoriteRow {
  share_id: string;
  created_at: string;
  shares: Share | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: favorites } = await admin
    .from("favorites")
    .select("share_id, created_at, shares(*)")
    .eq("user_id", user.uid)
    .order("created_at", { ascending: false });

  const favList = (favorites ?? []) as unknown as FavoriteRow[];
  const shares: (ShareWithPasswordFlag & { favorited_at: string })[] = favList
    .map((f) => f.shares)
    .filter((s): s is Share => !!s)
    .map(({ password_hash, ...rest }, i) => ({
      ...rest,
      has_password: !!password_hash,
      favorited_at: favList[i].created_at,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-tight">Favorites</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Shares you&apos;ve bookmarked for quick access.
        </p>
      </div>

      {shares.length === 0 ? (
        <div className="grid place-items-center rounded-[34px] border-2 border-dashed border-border bg-card py-16 text-center clay-raised">
          <span className="mb-4 grid size-12 place-items-center rounded-[22px] bg-primary/9 text-primary clay-raised">
            <Heart className="size-5" />
          </span>
          <p className="font-display text-lg font-bold">No favorites yet</p>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Bookmark shares to pin them here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shares.map((share) => (
            <div
              key={share.id}
              className="flex flex-col rounded-[22px] bg-card p-5 clay-raised"
            >
              <div className="mb-3 grid h-24 place-items-center rounded-[14px] border border-dashed border-border bg-background">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">[ thumb ]</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-[14.5px] font-semibold">
                  {share.title || share.filename}
                </p>
                <Star className="size-3.5 fill-primary text-primary" />
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-surface-warm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-fg-soft">
                  {share.mime_type.split("/")[1]?.toUpperCase() || "FILE"}
                </span>
                <span className="font-mono">{share.view_count.toLocaleString()} views</span>
              </div>
              <div className="mt-3.5 flex items-center gap-1.5 border-t border-border-soft pt-3">
                <Link
                  href={`/s/${share.slug}`}
                  className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold clay-raised transition-transform hover:-translate-y-px"
                >
                  Open
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs font-semibold clay-raised transition-transform hover:-translate-y-px"
                >
                  <Copy className="size-3" /> Copy
                </button>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  Added {formatDate(share.favorited_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

