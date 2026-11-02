"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLine, Link2, SquarePen, Star, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  active: (pathname: string) => boolean;
}

const NAV: NavEntry[] = [
  { href: "/dashboard", label: "Links", icon: Link2, active: (p) => p === "/dashboard" },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartLine, active: (p) => p.startsWith("/dashboard/analytics") },
  { href: "/editor", label: "Editor", icon: SquarePen, active: (p) => p.startsWith("/editor") },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star, active: (p) => p.startsWith("/dashboard/favorites") },
  {
    href: "/dashboard/teams",
    label: "Teams",
    icon: Users,
    active: (p) => p === "/dashboard/teams" || p === "/dashboard/teams/new",
  },
];

const itemClass = (active: boolean) =>
  cn(
    "flex h-8 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors duration-150 max-md:h-11",
    active ? "bg-active font-medium text-foreground" : "text-muted-foreground hover:bg-active hover:text-foreground",
  );

interface DashboardSidebarNavProps {
  teams: { slug: string; name: string }[];
  /** Called after a link is followed, so the phone menu sheet can close. */
  onNavigate?: () => void;
}

/** The screens list plus one entry per team, with the current route as a neutral pill. */
export function DashboardSidebarNav({ teams, onNavigate }: DashboardSidebarNavProps) {
  const pathname = usePathname();

  return (
    <>
      <nav className="grid gap-0.5" aria-label="Screens">
        {NAV.map(({ href, label, icon: Icon, active }) => {
          const current = active(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={itemClass(current)}
            >
              <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {teams.length > 0 && (
        <>
          <p className="mx-2 mb-1.5 mt-5 text-xs text-muted-foreground">Your teams</p>
          <nav className="grid gap-0.5" aria-label="Teams">
            {teams.map((team) => {
              const href = `/dashboard/teams/${team.slug}`;
              const current = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={team.slug}
                  href={href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className={itemClass(current)}
                >
                  <Users className="size-4" strokeWidth={1.5} aria-hidden />
                  <span className="truncate">{team.name}</span>
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </>
  );
}
