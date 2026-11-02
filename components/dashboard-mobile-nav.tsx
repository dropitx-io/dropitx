"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { InviteNotificationBell } from "@/components/invite-notification-bell";
import { SidebarContent } from "@/components/app-shell/sidebar-content";
import { TopBarSearch } from "@/components/app-shell/top-bar-search";
import type { ShellUser } from "@/components/app-shell/load-shell-props";

function routeTitle(pathname: string): string {
  if (pathname.startsWith("/editor")) return "Editor";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/favorites")) return "Favorites";
  if (pathname.startsWith("/dashboard/teams")) return "Teams";
  if (pathname.startsWith("/dashboard/profile")) return "Profile";
  return "Links";
}

interface DashboardMobileNavProps {
  user: ShellUser;
  teams: { slug: string; name: string }[];
  storageUsedBytes: number | null;
}

/** Below md the L-frame folds into a 48px bar; its menu button opens the sidebar as a full-screen sheet. */
export function DashboardMobileNav({ user, teams, storageUsedBytes }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    openRef.current?.focus();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 bg-frame pl-1 pr-2 md:hidden">
        <button
          ref={openRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-controls="phone-menu"
          aria-expanded={open}
          className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-active hover:text-foreground"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>
        <span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-foreground">
          <BrandMark className="text-primary" />
          <span className="truncate">{routeTitle(pathname)}</span>
        </span>
        <InviteNotificationBell />
      </header>

      {open && (
        <aside
          id="phone-menu"
          aria-label="Main navigation"
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-frame px-4 pb-4 md:hidden"
        >
          <SidebarContent
            user={user}
            teams={teams}
            storageUsedBytes={storageUsedBytes}
            onNavigate={close}
            brandAction={
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-active hover:text-foreground"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            }
            top={
              <div className="mb-2 mt-1">
                <TopBarSearch />
              </div>
            }
          />
        </aside>
      )}
    </>
  );
}
