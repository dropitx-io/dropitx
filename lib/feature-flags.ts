/**
 * Build-time feature switches. Each reads a `NEXT_PUBLIC_*` variable, so the
 * value is inlined at build time and the same answer reaches server and client.
 */

type Env = Record<string, string | undefined>;

/**
 * Whether the landing page shows its Pricing section (and the nav/footer show
 * Pricing links). Only the exact string "true" turns it on; unset, "TRUE", "1"
 * and "false" all keep pricing hidden.
 *
 * `env` defaults to `process.env`; the variable is read by its literal name so
 * Next.js can inline it.
 */
export function showPricing(env: Env = { NEXT_PUBLIC_SHOW_PRICING: process.env.NEXT_PUBLIC_SHOW_PRICING }): boolean {
  return env.NEXT_PUBLIC_SHOW_PRICING === "true";
}
