/**
 * Untyped Supabase boundaries for RPC/table drift (Phase 01 interim).
 *
 * types/database.generated.ts reflects the LIVE Supabase project, but several
 * RPC names and columns used by lib/team-rpc.ts and lib/token-security.ts do
 * not exist there — they were authored against migrations that were never
 * deployed (see .planning/phases/01-build-hygiene/deferred-items.md for the
 * full drift table). Until that drift is reconciled with dropitx-api/, those
 * call sites route through this module so the rest of the codebase keeps full
 * compile-time checking. Reconcile the drift in a feature phase and delete
 * this module.
 */
import { createAdminClient } from "@/utils/supabase/server";

export type AdminClient = ReturnType<typeof createAdminClient>;

export interface UntypedCallResult {
  data: unknown;
  error: { message: string } | null;
}

interface UntypedRpcClient {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<UntypedCallResult>;
}

/** Call an RPC whose name is absent from the generated Database types. */
export function untypedRpc(
  client: AdminClient,
  fn: string,
  args?: Record<string, unknown>
): PromiseLike<UntypedCallResult> {
  return (client as unknown as UntypedRpcClient).rpc(fn, args);
}

interface UntypedFilterBuilder extends PromiseLike<UntypedCallResult> {
  eq(column: string, value: unknown): UntypedFilterBuilder;
  single(): PromiseLike<UntypedCallResult>;
}

interface UntypedFromClient {
  from(table: string): {
    select(query?: string): UntypedFilterBuilder;
    insert(values: Record<string, unknown>): PromiseLike<UntypedCallResult>;
  };
}

/** Query a table (or columns) absent from the generated Database types. */
export function untypedFrom(client: AdminClient, table: string) {
  return (client as unknown as UntypedFromClient).from(table);
}
