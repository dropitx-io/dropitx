"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDismiss } from "@/components/app-shell/use-dismiss";
import type { ShellUser } from "@/components/app-shell/load-shell-props";

const itemClass =
  "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm text-card-foreground transition-colors duration-150 hover:bg-raised max-md:h-11";

/** The signed-in person at the foot of the sidebar; opens a menu with Profile and Sign out. */
export function AuthUserMenu({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 bottom-full z-30 mb-1 rounded-lg border border-border bg-popover p-1"
        >
          <Link
            href="/dashboard/profile"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            <UserRound className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            Profile
          </Link>
          <button type="button" role="menuitem" className={itemClass} onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            {signingOut ? "Signing out" : "Sign out"}
          </button>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors duration-150 hover:bg-active aria-expanded:bg-active"
      >
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-active text-xs font-semibold text-foreground"
        >
          {user.initials}
        </span>
        <span className="min-w-0 flex-1 leading-4">
          <span className="block truncate text-[13px] font-medium text-foreground">{user.displayName}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
