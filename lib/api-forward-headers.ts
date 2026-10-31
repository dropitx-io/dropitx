/**
 * Headers every server-side call to the API carries. Pure (no `next/headers`),
 * so the edge OG route can use it too.
 *
 * `cf-connecting-ip` is what the API keys its per-IP rate limits on; without it
 * every server-rendered request shares the origin's bucket. No bearer means no
 * `authorization` header at all, so an anonymous request stays anonymous.
 */
export function forwardHeaders(
  ip: string | null,
  bearer: string | null,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (ip) out["cf-connecting-ip"] = ip;
  if (bearer) out["authorization"] = `Bearer ${bearer}`;
  return out;
}
