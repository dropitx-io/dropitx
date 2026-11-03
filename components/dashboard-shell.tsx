import { InviteBellSlot } from "@/components/app-shell/invite-bell-slot";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";
import { SidebarContent } from "@/components/app-shell/sidebar-content";
import { TopBarSearch } from "@/components/app-shell/top-bar-search";
import type { ShellUser } from "@/components/app-shell/load-shell-props";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  user: ShellUser;
  teams: { slug: string; name: string }[];
  /** Total bytes across the caller's shares; null when the API could not report it. */
  storageUsedBytes: number | null;
  /** Classes for the sheet, e.g. the editor's fixed-height column. */
  sheetClassName?: string;
  children: React.ReactNode;
}

/**
 * The framed sheet: one tinted L-frame holds the 228px sidebar and the 48px top bar with no rule
 * between them; the page is a sheet inset 8px from the right and bottom edges, 1px edge, no shadow.
 * Each page renders its own h1 inside the sheet.
 */
export function DashboardShell({ user, teams, storageUsedBytes, sheetClassName, children }: DashboardShellProps) {
  return (
    <div className="min-h-svh bg-frame text-foreground md:grid md:grid-cols-[228px_minmax(0,1fr)] md:grid-rows-[48px_minmax(0,1fr)]">
      <aside
        aria-label="Main navigation"
        className="sticky top-0 hidden h-svh flex-col overflow-y-auto px-3 pb-3 md:row-span-2 md:flex"
      >
        <SidebarContent user={user} teams={teams} storageUsedBytes={storageUsedBytes} />
      </aside>

      <header className="hidden grid-cols-[1fr_minmax(0,548px)_1fr] items-center gap-4 pr-6 md:grid">
        <div className="col-start-2">
          <TopBarSearch shortcut />
        </div>
        <div className="col-start-3 justify-self-end">
          <InviteBellSlot viewport="desktop" />
        </div>
      </header>

      <DashboardMobileNav user={user} teams={teams} storageUsedBytes={storageUsedBytes} />

      <main
        className={cn(
          "relative min-w-0 border-t border-border bg-sheet px-4 pb-8 pt-5 text-card-foreground md:mb-2 md:mr-2 md:rounded-2xl md:border md:p-6",
          sheetClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
