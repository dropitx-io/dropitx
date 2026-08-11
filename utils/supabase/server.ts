import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.generated";

/** Anon-key client — respects RLS, used for user-facing reads. */
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Share the session cookie across the apex domain and `www` — without
      // this it's host-only, so a Vercel apex/www redirect after login drops
      // the session on the other host.
      cookieOptions: { domain: ".dropitx.site" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from Server Component — ignore if middleware refreshes sessions
          }
        },
      },
    },
  );
};

/** Service-role client — bypasses RLS, used for server-side writes (storage, inserts). */
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createServiceRoleClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);
};
