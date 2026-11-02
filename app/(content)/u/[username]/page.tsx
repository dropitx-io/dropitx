import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { body, displayS, gutter, head, page as pageRoot, small, textLink } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
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
    <div className={pageRoot}>
      <PublicNav />
      <main id="main" className={cn(gutter, "flex-1 pb-[clamp(56px,7vw,112px)] pt-[clamp(40px,6vw,88px)]")}>
        <header className="flex items-end gap-[clamp(16px,2.4vw,32px)]">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="size-[clamp(72px,9vw,128px)] shrink-0 object-cover" />
          ) : (
            <div aria-hidden="true" className="flex size-[clamp(72px,9vw,128px)] shrink-0 items-center justify-center bg-field font-serif text-[clamp(36px,4.5vw,64px)] font-light text-field-foreground">
              {name[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className={cn(displayS, "break-words text-[clamp(40px,6vw,96px)]")}>{name}</h1>
            <p className={cn(body, "mt-2 text-muted-foreground")}>@{profile.username}</p>
          </div>
        </header>
        {profile.bio && <p className={cn(body, "mt-8 max-w-[34em]")}>{profile.bio}</p>}

        <dl className="mt-9 flex flex-wrap gap-x-[clamp(28px,4vw,64px)] gap-y-4">
          {[
            { label: "Shares", value: profile.share_count ?? 0 },
            { label: "Views", value: profile.total_views ?? 0 },
            { label: "Stars", value: profile.total_stars ?? 0 },
          ].map((m) => (
            <div key={m.label}>
              <dt className={cn(small, "text-muted-foreground")}>{m.label}</dt>
              <dd className={cn(body, "tabular-nums")}>{m.value.toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="public-shares" className="mt-[clamp(64px,8vw,120px)] grid max-w-[46em] gap-8">
          <h2 id="public-shares" className={head}>
            Public shares
          </h2>
          {shares.length === 0 ? (
            <p className={cn(body, "text-muted-foreground")}>
              {page > 1 ? "No more shares." : "No public shares yet."}
            </p>
          ) : (
            <ul className="grid gap-[clamp(28px,3.5vw,44px)]">
              {shares.map((share) => (
                <li key={share.slug}>
                  <Link href={`/s/${share.slug}`} className="group block">
                    <span className={cn(head, "break-words underline-offset-[0.18em] group-hover:underline")}>
                      {share.title || share.filename}
                    </span>
                    <span className={cn(small, "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground")}>
                      <span>{formatDate(share.created_at)}</span>
                      <span>
                        {share.view_count ?? 0} {share.view_count === 1 ? "view" : "views"}
                      </span>
                      <span>
                        {share.star_count ?? 0} {share.star_count === 1 ? "star" : "stars"}
                      </span>
                      {share.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {(page > 1 || hasMore) && (
            <nav aria-label="Pagination" className={cn(body, "flex items-center justify-between")}>
              {page > 1 ? (
                <Link href={page === 2 ? base : `${base}?page=${page - 1}`} className={textLink}>
                  Newer
                </Link>
              ) : (
                <span />
              )}
              {hasMore && (
                <Link href={`${base}?page=${page + 1}`} className={textLink}>
                  Older
                </Link>
              )}
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
