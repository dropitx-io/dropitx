# Phase 01 Deferred Items

Out-of-scope discoveries logged during execution. Not fixed in the current plan;
surfaced for a later plan or phase.

## RPC drift between frontend and live Supabase DB (discovered in Plan 01-03)

**Found during:** Plan 03, Task 1 (threading `Database` generic through supabase clients).

**Severity:** Blocks feature-completeness of team/token features, NOT build hygiene.
`next.config.ts` still has `ignoreBuildErrors: true` (Plan 04 scope), so `next build`
does not fail on these TS errors. They surface only under `npx tsc --noEmit`.

**Root cause:** Plan 01 typed the `Promise<any>` RPC returns in `lib/team-rpc.ts` and
`lib/token-security.ts` with **assumed** interfaces (tagged `[ASSUMED]`) because the
`Database` generic was not yet threaded. Plan 03 threaded the generic using types
generated from the live project (`mywrpluomfpzguvkrvki`). The real DB exposes a
**different** set of RPC function names than the frontend calls — so the assumed
interfaces and several RPC names are now compile errors.

**Evidence — RPC names called by the frontend but absent from generated types:**

| File | Called RPC | Nearest DB function | Status |
|------|-----------|---------------------|--------|
| team-rpc.ts | `create_team` | (none — `teams` table insert?) | missing |
| team-rpc.ts | `create_team_invite_with_rate_check` | `create_team_invite` | renamed |
| team-rpc.ts | `transfer_team_ownership` | (none) | missing |
| team-rpc.ts | `update_member_role` | `change_member_role` | renamed |
| team-rpc.ts | `add_team_member` | (none) | missing |
| team-rpc.ts | `bulk_invite_transaction` | (none) | missing |
| team-rpc.ts | `revoke_team_invite` | `decline_team_invite` (?) | renamed |
| team-rpc.ts | `check_invite_rate_limit` | `check_rate_limit` | renamed |
| team-rpc.ts | `check_global_invite_rate_limit` | (none) | missing |
| team-rpc.ts | `get_rate_limiting_stats` | (none) | missing |
| team-rpc.ts | `cleanup_rate_limiting_data` | `clean_expired_invites` (?) | renamed |
| token-security.ts | `validate_and_lock_invite_token` | (none) | missing |
| token-security.ts | `get_token_security_stats` | (none) | missing |
| token-security.ts | `cleanup_expired_tokens` | (none) | missing |
| token-security.ts | `reset_locked_tokens` | (none) | missing |

**Matches (frontend name == DB name):** `accept_team_invite`, `remove_team_member`.

**Column drift (token-security.ts):** the code reads `locked_at`, `locked_reason`,
`expires_at`, `accepted_at` off the `team_invites` row, but the generated type reports
`SelectQueryError<"column 'locked_at' does not exist on 'team_invites'.">` — the live
`team_invites` table does not carry those columns.

**Impact:** 30 `error TS` lines across `lib/team-rpc.ts` (13) and `lib/token-security.ts`
(17) after Plan 03. Plus 3 errors in `app/` dashboard consumers (Plan 04 scope).

**Why not fixed here:**
- Plan 03 Task 1 acceptance criteria scope only `utils/supabase/*.ts` (clean).
- The plan explicitly defers consumer-side type mismatches to Plan 04 (dashboard) —
  team-rpc.ts / token-security.ts are the same class of consumer-side mismatch.
- The correct fix requires a product/architecture decision: deploy the missing RPCs to
  the live DB, or rewrite the frontend to call the RPCs the DB actually exposes. That is
  out of scope for Build Hygiene and likely belongs to the feature-completion phase
  (Phase 4) which already coordinates cross-repo with `dropitx-api/`.

**Recommended next step:** before Plan 04 re-enables `ignoreBuildErrors`, either (a)
reconcile the RPC names with `dropitx-api/` and the deployed migrations, or (b) widen
the boundary casts to `as unknown as Interface` as an interim to unblock the build gate
while the drift is resolved in a feature phase.
