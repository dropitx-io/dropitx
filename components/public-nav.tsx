"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const NAV = [
  { label: "Product", href: "#features" },
  { label: "Explore", href: "/search" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
];

function PublicNavAuth() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  }, [router, signOut]);

  if (user) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <LayoutDashboard className="mr-1.5 size-4" />
          Dashboard
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <LogOut className="mr-1.5 size-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <Link
        href="/auth/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Log in
      </Link>
      <Link
        href="/auth/login"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Sign up
      </Link>
    </div>
  );
}

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border-[1.5px] border-foreground">
            <span className="size-2 rounded-[2px] bg-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Drop<span className="text-primary">ItX</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <PublicNavAuth />
      </div>
    </header>
  );
}
