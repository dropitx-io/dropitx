"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  BarChart3,
  Heart,
  Users,
  User,
  Search,
  Plus,
  Menu,
  Settings,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/file-utils";
import { InviteNotificationBell } from "@/components/invite-notification-bell";

interface Team {
  slug: string;
  name: string;
}

interface DashboardShellProps {
  user: { displayName: string; email: string; initials: string };
  teams: Team[];
  /** Total bytes across the caller's shares; null when the API could not report it. */
  storageUsedBytes: number | null;
  children: React.ReactNode;
}

const WORKSPACE_NAV = [
  { href: "/dashboard", label: "Shares", icon: FileText, exact: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
];

const ACCOUNT_NAV = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardShell({ user, teams, storageUsedBytes, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Derive page title + eyebrow from route
  const routeLabel = (() => {
    if (pathname === "/dashboard") return { eyebrow: "Workspace", title: "Shares" };
    if (pathname.startsWith("/dashboard/analytics"))
      return { eyebrow: "Insights", title: "Analytics" };
    if (pathname.startsWith("/dashboard/favorites"))
      return { eyebrow: "Saved", title: "Favorites" };
    if (pathname.startsWith("/dashboard/teams/new"))
      return { eyebrow: "Workspace", title: "New Team" };
    if (pathname.startsWith("/dashboard/teams/"))
      return { eyebrow: "Workspace", title: "Teams" };
    if (pathname.startsWith("/dashboard/teams"))
      return { eyebrow: "Workspace", title: "Teams" };
    if (pathname.startsWith("/dashboard/profile"))
      return { eyebrow: "Account", title: "Profile" };
    return { eyebrow: "Workspace", title: "Dashboard" };
  })();

  const SidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-3.5 py-3 pb-4">
        <span className="grid size-10 place-items-center rounded-[14px] bg-primary text-primary-foreground clay-raised">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <span className="text-xl font-extrabold tracking-[-0.02em]">
          Drop<span className="text-primary">ItX</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Primary">
        <p className="px-3.5 pb-1.5 pt-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Workspace
        </p>
        {WORKSPACE_NAV.map((n) => {
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3.5 rounded-[22px] px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200",
                active
                  ? "bg-background text-primary font-semibold clay-raised"
                  : "text-fg-soft hover:bg-background hover:text-foreground"
              )}
            >
              <n.icon className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground")} />
              {n.label}
            </Link>
          );
        })}

        {teams.length > 0 && (
          <>
            <p className="px-3.5 pb-1.5 pt-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Teams
            </p>
            {teams.map((t) => {
              const active = pathname === `/dashboard/teams/${t.slug}`;
              return (
                <Link
                  key={t.slug}
                  href={`/dashboard/teams/${t.slug}`}
                  className={cn(
                    "flex items-center gap-3.5 rounded-[22px] px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200",
                    active
                      ? "bg-background text-primary font-semibold clay-raised"
                      : "text-fg-soft hover:bg-background hover:text-foreground"
                  )}
                >
                  <Users className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{t.name}</span>
                </Link>
              );
            })}
          </>
        )}

        <p className="px-3.5 pb-1.5 pt-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Account
        </p>
        {ACCOUNT_NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3.5 rounded-[22px] px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200",
                active
                  ? "bg-background text-primary font-semibold clay-raised"
                  : "text-fg-soft hover:bg-background hover:text-foreground"
              )}
            >
              <n.icon className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — storage used + profile */}
      <div className="mt-3 rounded-[22px] bg-background p-4">
        {storageUsedBytes !== null && (
          <div className="mb-4 flex items-baseline justify-between font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
            <span>STORAGE USED</span>
            <b className="font-bold text-foreground">{formatFileSize(storageUsedBytes)}</b>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="grid size-[38px] place-items-center rounded-full bg-background font-mono text-xs font-semibold text-primary clay-raised">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{user.displayName}</p>
            <p className="truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="grid size-[38px] place-items-center rounded-[14px] text-muted-foreground transition-colors hover:bg-background hover:text-primary"
            aria-label="Account settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[264px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen flex-col gap-3 bg-sidebar p-4 md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[264px] flex-col gap-3 bg-sidebar p-4">
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 bg-background/88 px-10 py-5 backdrop-blur-[10px] max-[640px]:px-4 max-[640px]:py-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="grid size-[38px] place-items-center rounded-[14px] text-muted-foreground hover:bg-background hover:text-primary md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-meta">
              {routeLabel.eyebrow}
            </span>
            <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.025em]">
              {routeLabel.title}
            </h1>
          </div>

          {/* Search */}
          <div className="relative ml-auto hidden w-[268px] max-[900px]:w-[200px] max-[640px]:hidden">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search shares…"
              aria-label="Search shares"
              className="h-[42px] w-full rounded-full border-none bg-background pl-[38px] pr-3.5 text-sm shadow-[inset_2px_2px_6px_rgba(128,92,70,0.12),inset_-2px_-2px_6px_rgba(255,255,255,0.7)] outline-none placeholder:text-muted-foreground focus:shadow-[var(--focus-ring)]"
            />
          </div>

          <Link
            href="/dashboard#upload"
            className="inline-flex h-[38px] items-center gap-2 rounded-full bg-background px-4 text-[13px] font-semibold clay-raised transition-transform hover:-translate-y-px max-[640px]:hidden"
          >
            <Upload className="size-3.5" />
            Upload
          </Link>
          <Link
            href="/editor"
            className="inline-flex h-[38px] items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
          >
            <Plus className="size-3.5" strokeWidth={2.4} />
            New share
          </Link>

          {/* Pending team invitations (GET /api/dashboard/invitations) */}
          <InviteNotificationBell />
        </header>

        <div className="w-full max-w-[1180px] flex-1 px-10 pb-14 pt-5 max-[640px]:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
