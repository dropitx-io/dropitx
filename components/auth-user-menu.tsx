"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, LogOut } from "lucide-react";

export function AuthUserMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  const initial = (
    profile?.display_name ||
    user.displayName ||
    user.email ||
    "U"
  )[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md p-0.5 transition-colors duration-200"
      >
        {profile?.avatar_url || user.photoURL ? (
          <img
            src={(profile?.avatar_url || user.photoURL) as string}
            alt=""
            className="size-8 rounded-md border border-border"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card z-[41] py-1">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors duration-200"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors duration-200"
          >
            <User className="size-4" />
            Profile
          </Link>
          <button
            onClick={async () => {
              await signOut();
              setOpen(false);
              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left text-destructive transition-colors duration-200"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
