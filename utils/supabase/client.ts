import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";

// createBrowserClient stores the session in cookies (chunked + base64) that
// are shared across tabs and readable by the server client / middleware.
// Do not pass a custom `auth.storage` — @supabase/ssr ignores it and it
// masks the real cookie handling.
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Share the session cookie across the apex domain and `www` — without
      // this it's host-only, so a Vercel apex/www redirect after login drops
      // the session on the other host.
      cookieOptions: { domain: ".dropitx.site" },
    },
  );
