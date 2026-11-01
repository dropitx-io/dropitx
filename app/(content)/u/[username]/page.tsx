import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye, FileText, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProfile, getPublicProfileShares } from "@/lib/public-profile-data";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Not Found" };
  const name = profile.display_name || profile.username;
  return {
    title: `${name} (@${profile.username}) — DropItX`,
    description: profile.bio || `Public shares by ${name} on DropItX.`,
  };
}

function parsePage(raw: string | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const page = parsePage((await searchParams).page);
  const { shares, has_more: hasMore } = await getPublicProfileShares(profile.username, page);

  const name = profile.display_name || profile.username;
  const base = `/u/${profile.username}`;

  return (
    <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-6 p-4 md:p-6 animate-fade-in">
      <header className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="size-20 rounded-md" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-md bg-primary text-2xl font-bold text-primary-foreground">
            {name[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">{name}</h1>
          <p className="font-mono text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
      </header>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span>{profile.share_count ?? 0} shares</span>
        <span>{profile.total_views ?? 0} views</span>
        <span>{profile.total_stars ?? 0} stars</span>
      </div>

      <section aria-labelledby="public-shares" className="flex flex-col gap-3">
        <h2 id="public-shares" className="text-lg font-semibold">
          Public shares
        </h2>
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {page > 1 ? "No more shares." : "No public shares yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shares.map((share) => (
              <li key={share.slug}>
                <Link href={`/s/${share.slug}`} className="block rounded-lg transition-colors hover:bg-accent/40">
                  <Card>
                    <CardHeader className="gap-1">
                      <CardTitle className="flex items-center gap-2 truncate">
                        <FileText className="size-4 shrink-0 text-primary" />
                        <span className="truncate">{share.title || share.filename}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatDate(share.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {share.view_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3" />
                        {share.star_count ?? 0}
                      </span>
                      {share.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(page > 1 || hasMore) && (
          <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={page === 2 ? base : `${base}?page=${page - 1}`} className="text-primary hover:underline">
                Newer
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link href={`${base}?page=${page + 1}`} className="text-primary hover:underline">
                Older
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
