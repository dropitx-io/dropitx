"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { DASHBOARD_HREF, SIGN_IN_HREF, SIGN_UP_HREF } from "@/components/site/site-links";

/**
 * The account end of the site nav. Signed-in visitors get the dashboard;
 * everyone else (and the server render, before auth state is known) gets
 * Sign in and Sign up.
 */
export function NavAccount() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return (
      <Link className="btn btn-primary" href={DASHBOARD_HREF} data-testid="site-nav-dashboard-link">
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link className="nav-signin" href={SIGN_IN_HREF} data-testid="site-nav-signin-link">
        Sign in
      </Link>
      <Link className="btn btn-primary" href={SIGN_UP_HREF} data-testid="site-nav-signup-link">
        Sign up
      </Link>
    </>
  );
}
