import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";

/** Service-role client — bypasses RLS. Supabase Auth is removed; all server
 *  reads/writes go through this client filtered by the Firebase uid. */
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createServiceRoleClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);
};
