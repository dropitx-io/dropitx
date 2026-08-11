import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.generated";

/**
 * Refreshes the Supabase auth session and writes rotated tokens back to
 * cookies. Middleware is the only place in the App Router that can persist
 * refreshed tokens (server components cannot write cookies), so skipping
 * this causes refresh-token reuse and random logouts.
 *
 * Returns the response carrying any refreshed auth cookies — callers must
 * return this response (headers may be added, cookies must be kept).
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Share the session cookie across the apex domain and `www` — without
      // this it's host-only, so a Vercel apex/www redirect after login drops
      // the session on the other host.
      cookieOptions: { domain: ".dropitx.site" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set on the request so downstream server code sees fresh tokens,
          // and on the response so the browser receives them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and this auth call —
  // doing so can cause hard-to-debug session loss.
  // getClaims validates the JWT locally (JWKS) and refreshes the session
  // when the access token is expired or near expiry.
  await supabase.auth.getClaims();

  return supabaseResponse;
};
