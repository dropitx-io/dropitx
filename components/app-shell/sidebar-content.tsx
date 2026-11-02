"use client";

import { Wordmark } from "@/components/brand-mark";
import { AuthUserMenu } from "@/components/auth-user-menu";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { formatFileSize } from "@/lib/file-utils";
import type { ShellUser } from "@/components/app-shell/load-shell-props";

interface SidebarContentProps {
  user: ShellUser;
  teams: { slug: string; name: string }[];
  storageUsedBytes: number | null;
  /** Rendered beside the wordmark: the phone sheet puts its close button here. */
  brandAction?: React.ReactNode;
  /** Rendered above the nav: the phone sheet puts its search here. */
  top?: React.ReactNode;
  onNavigate?: () => void;
}

/** The sidebar's body, shared by the desktop L-frame and the phone menu sheet. */
export function SidebarContent({ user, teams, storageUsedBytes, brandAction, top, onNavigate }: SidebarContentProps) {
  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between px-2">
        <Wordmark withMark href="/dashboard" className="[&_svg]:text-primary" />
        {brandAction}
      </div>
      {top}
      <div className="mt-1">
        <DashboardSidebarNav teams={teams} onNavigate={onNavigate} />
      </div>
      <div className="mt-auto grid gap-2 pt-3">
        {storageUsedBytes !== null && (
          <p className="flex items-baseline justify-between px-2 text-xs text-muted-foreground">
            <span>Storage used</span>
            <span className="tabular-nums text-foreground">{formatFileSize(storageUsedBytes)}</span>
          </p>
        )}
        <AuthUserMenu user={user} onNavigate={onNavigate} />
      </div>
    </>
  );
}
