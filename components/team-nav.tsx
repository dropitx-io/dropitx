"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamNavItem {
  slug: string;
  name: string;
}

const ROW =
  "flex h-8 items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-active hover:text-card-foreground";

/** Sidebar team section: one row per team and a row to create one. */
export function TeamNav({ teams }: { teams: TeamNavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-0.5">
      {teams.map((t) => {
        const isActive = pathname === `/dashboard/teams/${t.slug}`;
        return (
          <Link
            key={t.slug}
            href={`/dashboard/teams/${t.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(ROW, isActive && "bg-active font-medium text-card-foreground")}
          >
            <Users className="size-4" strokeWidth={1.5} />
            <span className="truncate">{t.name}</span>
          </Link>
        );
      })}
      <Link href="/dashboard/teams/new" className={ROW}>
        <Plus className="size-4" strokeWidth={1.5} />
        Create team
      </Link>
    </div>
  );
}

/** Mobile team nav: a single link to the teams list, marked while any team page is open. */
export function TeamNavMobile() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/dashboard/teams");

  return (
    <Link
      href="/dashboard/teams"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-xs transition-colors duration-150",
        isActive ? "text-card-foreground" : "text-muted-foreground hover:text-card-foreground",
      )}
    >
      <Users className="size-4" strokeWidth={1.5} />
      Teams
    </Link>
  );
}

/** Tabs across one team's pages; Settings shows only for the owner, who is the only one allowed to change it. */
export function TeamTabs({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const pathname = usePathname();
  const base = `/dashboard/teams/${slug}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/members`, label: "Members" },
    ...(isOwner ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  return (
    <nav aria-label="Team" className="mb-6 flex gap-6 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const current = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative shrink-0 py-2.5 text-sm transition-colors duration-150",
              current
                ? "font-medium text-card-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-card-foreground"
                : "text-muted-foreground hover:text-card-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
