---
phase: 01-build-hygiene
reviewed: 2026-08-16T06:47:27Z
depth: standard
files_reviewed: 39
files_reviewed_list:
  - app/(dashboard)/dashboard/layout.tsx
  - app/(dashboard)/dashboard/page.tsx
  - app/(dashboard)/dashboard/teams/[slug]/page.tsx
  - app/(dashboard)/dashboard/teams/page.tsx
  - app/(public)/auth/login/page.tsx
  - app/(public)/auth/reset-password/page.tsx
  - app/(public)/auth/update-password/page.tsx
  - app/(public)/s/[slug]/page.tsx
  - app/(public)/search/page.tsx
  - components/api-key-manager.tsx
  - components/auth/invite-accept-form.tsx
  - components/bookmark-toggle.tsx
  - components/bulk-invite-dialog.tsx
  - components/comments-section.tsx
  - components/editor-shell.tsx
  - components/encrypted-content-viewer.tsx
  - components/encryption-toggle.tsx
  - components/enhanced-invite-dialog.tsx
  - components/invite-member-dialog.tsx
  - components/multi-file-upload.tsx
  - components/search-bar.tsx
  - components/tag-manager.tsx
  - components/team/team-invite-form.tsx
  - components/ui/textarea.tsx
  - components/version-history.tsx
  - hooks/use-email-validation.ts
  - lib/api-client.ts
  - lib/errors.ts
  - lib/supabase-untyped.ts
  - lib/team-rpc.ts
  - lib/token-security.ts
  - lib/use-auto-save.ts
  - lib/use-editor-auto-save.ts
  - lib/use-scroll-sync.ts
  - next.config.ts
  - package.json
  - types/database.generated.ts
  - types/team.ts
  - utils/supabase/server.ts
findings:
  critical: 0
  warning: 10
  info: 10
  total: 20
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-16T06:47:27Z
**Depth:** standard
**Files Reviewed:** 39
**Status:** issues_found

## Summary

Adversarial review of the 39 files listed for the Build Hygiene phase (TypeScript/ESLint enforcement restoration, Database-generic typing, the documented untyped-RPC boundary, react-hooks v6 compliance, build-flag restoration).

What held up well:

- The untyped-RPC boundary (`lib/supabase-untyped.ts`) is honestly implemented: `unknown` results forced downstream, errors surfaced as `{ message } | null`, drift documented per call site, and every consumer checks `error` before casting. The phase instruction was to not flag the boundary's existence; its implementation is sound for an interim shim.
- The 10 `react-hooks/set-state-in-effect` exemptions I found (search page, api-key-manager, comments-section, version-history, editor-shell, encrypted-content-viewer, encryption-toggle, tag-manager, use-auto-save, use-editor-auto-save) all carry inline justification comments and the justifications are technically correct (fetch-on-mount with post-`await` setState, post-hydration localStorage init, client-only URL-fragment init).
- Render-phase state adjustment (search/page.tsx, search-bar.tsx, invite-member-dialog.tsx) follows React's documented pattern correctly, including the render-guard `prev` state.
- `lib/api-client.ts` is clean: Content-Type handling skips FormData, single forced 401 retry, no credential leakage.
- Login redirect validation (`isValidRedirect`) correctly blocks `//`, backslashes, and non-`/s/`|`/invite/` prefixes — no open-redirect vector found.

Key concerns: the phase's own hygiene gate script is broken (`next lint` no longer exists in Next 16 — verified by execution); a large cluster of dead invite/upload components carries latent bugs and imports the service-role Supabase client plus Node `crypto` into `"use client"` files (a hard AGENTS.md violation the moment any of them is imported); the live `EncryptionToggle` retries key generation in an infinite loop on failure; and the editor runs two conflicting autosave systems that clobber each other's drafts. The dashboard also renders fabricated analytics numbers as if they were real data.

## Narrative Findings (AI reviewer)

### Warnings

#### WR-01: `check:hygiene` script invokes removed `next lint` — always fails

**File:** `package.json:11`
**Issue:** `"check:hygiene": "tsc --noEmit && next lint"` — the `next lint` subcommand was removed in Next 16 (project pins `next: 16.2.4`). Verified by execution: `npx next lint` exits 1 with `Invalid project directory provided, no such directory: .../dropitx-fe/lint` (Next parses `lint` as a positional directory argument). The phase's central deliverable — a working hygiene gate — is broken; any CI invoking `check:hygiene` fails, and `next lint` never lints anything. Note `npm run lint` (`eslint`) is correct.
**Fix:**
```json
"check:hygiene": "tsc --noEmit && eslint ."
```

#### WR-02: EncryptionToggle retries key generation in an infinite loop on failure

**File:** `components/encryption-toggle.tsx:97-102` (live — used by `components/editor-publish-bar.tsx`)
**Issue:** The auto-generate effect runs whenever `enabled && !isPasswordMode && !ready && !generating`. On failure, `handleGenerateRandom` (line 57) only sets `passwordError` and `setGenerating(false)` — `ready` stays false, so the effect re-fires immediately after `generating` flips back to false, looping forever. Two compounding problems: (1) on any environment where WebCrypto is unavailable (e.g., plain-HTTP deployment), this is a tight infinite retry/render loop; (2) the failure UI is invisible — `passwordError` is only rendered in the password-mode branch (line 208), never in random-key mode, so the user sees a silent spin with no error.
**Fix:** Add a `failed` latch state; set it in the catch, include it in the effect guard (`if (enabled && !isPasswordMode && !ready && !generating && !failed)`), reset it in `handleToggle` when disabling, and render the error in the random-key branch (e.g., reuse `passwordError` with a fallback message and a manual "Retry" button — the branch already has a manual generate button at line 220).

#### WR-03: Two conflicting autosave systems — edit-mode sessions clobber the create-mode draft

**File:** `components/editor-shell.tsx:56-61`, `lib/use-editor-auto-save.ts:32-56`
**Issue:** `EditorShell` runs BOTH `useEditorAutoSave(content)` (global key `share-html-editor-draft`, own 2s debounce, saves unconditionally on every non-empty content change) and `useAutoSave(content, { namespace: editSlug ? "edit-" + editSlug : "editor" })`. Consequences: (1) In **edit** mode, every keystroke on an existing share is also written to the global *create-mode* draft key — the next time the user starts a new document, that share's content is silently auto-restored into it (`editor-shell.tsx:84-90`). (2) The `edit-<slug>` namespaced drafts are saved (and `savedAt` shown in the publish bar as "draft saved") but **never restored anywhere** — restore only reads the global key — so the indicator implies a recoverable edit draft that cannot be recovered. This is a data-confusion correctness issue, not just duplication.
**Fix:** Gate `useEditorAutoSave`'s save effect to create-mode only (pass `enabled: !editSlug`), or collapse both hooks into one namespaced system where edit drafts are actually restored on load. At minimum, stop the global-key write while `editSlug` is set.

#### WR-04: Dead invite component cluster imports the service-role client and Node `crypto` into `"use client"` files

**Files:** `components/auth/invite-accept-form.tsx:13-14`, `components/team/team-invite-form.tsx:12-13`, `components/enhanced-invite-dialog.tsx`, `components/bulk-invite-dialog.tsx` (importers: `lib/team-rpc.ts:9`, `lib/token-security.ts:8,12`)
**Issue:** Verified by repo-wide grep: `EnhancedInviteDialog`, `BulkInviteDialog`, `TeamInviteForm` (components/team), and `InviteAcceptForm` (components/auth — the *live* accept flow is the separate `app/(public)/invite/accept/invite-accept-form.tsx`) are referenced by nothing. This dead cluster imports `lib/team-rpc.ts` / `lib/token-security.ts`, which call `createAdminClient()` (service role) and `import crypto from "crypto"` — inside `"use client"` components. AGENTS.md: "Service role key is server-only; never expose in client bundles." Today nothing bundles (dead code is unimported), but the first person to wire up any of these components either ships the service-role client import path into the browser bundle or breaks the build on the Node `crypto` import. The dead components also carry concrete latent bugs if revived: `components/auth/invite-accept-form.tsx:70` calls `.auth.getUser()` on a service-role client — Supabase Auth is removed per `utils/supabase/server.ts:4-5`, so this always fails and line 74 redirects to login, producing a login ↔ invite-accept redirect loop; line 111 pushes `/dashboard/teams/${teamId}` (a UUID from `AcceptInviteResult.team_id`) into the slug-keyed `[slug]` route, which looks teams up by slug and will bounce the user to the teams list.
**Fix:** Delete the four dead components and `lib/team-rpc.ts` + `lib/token-security.ts` (their only importers are the dead components), or if the RPC surface is still wanted for Phase 01.1, move both libs behind server-only route handlers and mark them `server-only`. Do not keep admin-client wrappers importable from client files.

#### WR-05: token-security.ts — guaranteed crash on null user and silently dropped insert errors

**File:** `lib/token-security.ts:133`, `lib/token-security.ts:123-135`
**Issue:** Line 133: `actor_id: (await supabase.auth.getUser()).data.user!.id` — on the service-role client `auth.getUser()` has no session, so `user` is null and the `!` assertion is a guaranteed `TypeError: Cannot read properties of null`. The function has no try/catch, so the error propagates to callers of `reportSuspiciousActivity`. Separately, the `team_events` insert (lines 123-135) discards the result — the `UntypedCallResult.error` is never checked, so failed audit/security-event writes vanish silently.
**Fix:** Take the actor id as a parameter (the caller knows the uid) instead of deriving it from a session that cannot exist on a service-role client; destructure and handle the insert error (`const { error } = await ...; if (error) console.error(...)` or throw).

#### WR-06: use-email-validation flags legitimate TLDs as typos; enhanced-invite-dialog freezes the hook at its initial state

**Files:** `hooks/use-email-validation.ts:29-36`, `components/enhanced-invite-dialog.tsx:56`
**Issue:** (1) `commonTypos` includes `'.co'`, `'.cm'`, `'.om'` — all real, registrable ccTLDs (Colombia, Cameroon, Oman). Any `user@company.co` gets `"Possible typo in domain name"` pushed into `errors`, making `hasErrors` true — which consumers use to disable submit. Valid emails at these TLDs are rejected. (2) In `enhanced-invite-dialog.tsx`, the hook is misused: the dialog keeps its own `email` state and passes it as `initialValue`, never calling the hook's `setEmail`. `useState` captures only the first value, so the hook's internal `email`/`errors` are frozen at `""` / `["Email is required"]` forever — `isValid` is permanently false, the submit button (line 235: `disabled={submitting || !isValid || hasErrors}`) can never enable, and "Email is required" is permanently displayed. The component is dead code today (see WR-04) — if it were live this would be a blocker.
**Fix:** Remove `'.co'`, `'.cm'`, `'.om'` from the typo list (keep composite mistakes like `'.gmail.con'`, `'.gmial'`); in the dialog, either use the hook's own `email`/`setEmail` as the single source of truth or make the hook export a pure `validateEmail(email)` the dialog calls on demand.

#### WR-07: multi-file-upload — upload Promise can never settle (UI stuck on "Uploading…") and posts to a nonexistent route

**File:** `components/multi-file-upload.tsx:101-122` (currently dead code — no importers found)
**Issue:** Two defects in the XHR wrapper: (1) `getAuthHeaders().then((h) => { ...; xhr.send(formData); })` has no `.catch` — if header retrieval rejects, `xhr.send` never runs, neither `onload` nor `onerror` fires, and the awaited Promise never settles: `uploading` stays true forever with the button disabled. (2) `resolve(JSON.parse(xhr.responseText))` inside the async `onload` (line 104) — if a 2xx response has a non-JSON body, the throw happens inside the async handler and the Promise likewise never settles. (3) `xhr.open("POST", "/api/upload/multi")` uses a relative Next-origin path — no such App Router route exists (`app/api/` contains only og-image, auth/session-*, shares), and `next.config.ts` defines no rewrites; every other upload call (`components/upload-dropzone.tsx:105`) correctly goes through `authFetch`/`getApiUrl`. If revived as-is, every upload 404s.
**Fix:** Use `authFetch(getApiUrl("/api/upload/multi"), { method: "POST", body: formData })` (authFetch already skips Content-Type for FormData) and drop the hand-rolled XHR, or add `.catch(reject)` and wrap the JSON parse in try/catch with `reject`.

#### WR-08: team-invite-form — non-null assertions on optional RPC fields crash or render "Invalid Date"; offers owner-role invites

**File:** `components/team/team-invite-form.tsx:103,144,248,285,549` (dead code)
**Issue:** `result.rate_limit_info!` (line 103) feeds `<RateLimitDisplay>` which reads `info.hourly.remaining` — if the RPC omits `rate_limit_info` while `rate_limited` is true, this is a render-time TypeError. `new Date(info.next_available!)` (lines 144, 549) and `inviteResult.expires_at!` (line 285) produce `"Invalid Date"` when the optional field is absent; `inviteResult.token` interpolated at line 248 yields `...token=undefined`. Lines 374-389 also let the user select `owner` as the invite role — the two live invite dialogs (`invite-member-dialog.tsx:160-161`, `enhanced-invite-dialog.tsx`) deliberately offer only viewer/editor; granting owner via invite must be server-enforced or removed. The file also hardcodes Tailwind default palette classes (`bg-red-100`, `bg-blue-50`, `text-gray-500`, `text-yellow-600`…) contrary to AGENTS.md styling rules.
**Fix:** Delete the component (preferred — it is unused); otherwise guard every optional field (`info.rate_limit_info?.hourly.remaining ?? "—"`, `next_available ? new Date(next_available).toLocaleString() : "later"`), restrict roles to viewer/editor, and use semantic tokens.

#### WR-09: Dashboard presents fabricated analytics as real metrics

**File:** `app/(dashboard)/dashboard/page.tsx:79-115`
**Issue:** The stats cards mix one computed value (total views, total shares, storage) with hardcoded fabrications: `+{totalViews > 0 ? "18.2" : "0"}% this week` (line 84), `{totalShares > 0 ? "3 expiring soon" : ...}` (line 92), `"6.3" / "days"` avg lifespan and `+0.8d vs last month` (lines 104-113), and `X% of 5 GB plan` (line 99) — none of these are derived from any data. Users see growth deltas, expiring counts, and plan quotas that do not exist. This is a correctness/integrity defect in shipped UI, not placeholder styling.
**Fix:** Compute the deltas from real data (or remove the `delta` props until the backend exposes them). For the plan quota, read the actual plan limit rather than the hardcoded `5 * 1024 ** 3`.

#### WR-10: tag-manager silently swallows all non-409 failures

**File:** `components/tag-manager.tsx:57-106` (dead code)
**Issue:** `handleCreate` handles only `res.ok` and `res.status === 409`; a 400/403/500 closes nothing, shows nothing, and leaves the dialog open as if nothing happened. Same pattern in `handleUpdate` (any non-ok is ignored) and `handleDelete` (non-ok silently skips both the selection update and the list refresh). The file also uses `alert()`/`confirm()` while every sibling component uses `sonner` toasts.
**Fix:** Add an else-branch that surfaces the error (`toast.error(...)`), consistent with `api-key-manager.tsx`. If the component stays dead, delete it (see WR-04).

### Info

#### IN-01: One eslint-disable without justification comment

**File:** `components/editor-pane.tsx:67`
**Issue:** `// eslint-disable-next-line react-hooks/exhaustive-deps` on the editor-mount effect carries no justification. The phase documents 9 justified exemptions; the repo actually contains 10 justified `set-state-in-effect` exemptions plus this bare `exhaustive-deps` suppression (mount-only CodeMirror init — defensible, but undocumented, and the file was not in the reviewed list so it escaped the exemption audit).
**Fix:** Add the same style of trailing justification comment (`-- one-time CodeMirror mount; content synced via separate effect`).

#### IN-02: Login page dead state — successMessage can never become truthy

**File:** `app/(public)/auth/login/page.tsx:104,172-175,233-248`
**Issue:** `setSuccessMessage` is only ever called with `null` (`resetMessages`); no code path sets a message. The success banner (233-238) is unreachable and `{!successMessage && (...)}` always renders the form.
**Fix:** Remove `successMessage` state and the banner, or implement the post-signup "check your email" flow it was evidently meant for.

#### IN-03: Unused destructured error variables

**File:** `app/(dashboard)/dashboard/teams/[slug]/page.tsx:32-48`
**Issue:** `teamError` (line 32) and `memberError` (line 41) are destructured and never used — the redirects key off `!team` / `!membership` only. Distracting dead bindings in a file whose purpose was type-cleanliness.
**Fix:** `const { data: team } = ...` / `const { data: membership } = ...`, or log the errors before redirecting.

#### IN-04: Share page — unguarded fallback RPC and cosmetic expiry edge

**File:** `app/(public)/s/[slug]/page.tsx:194-200,100-104`
**Issue:** (1) The catch-path fallback `await adminClient.rpc("increment_view_count", ...)` is not itself guarded — if the analytics RPC failed due to a network/Postgrest issue, the fallback can throw and turn the whole share page into an error page (the surrounding comment promises analytics never blocks viewing). The view is also counted before the storage download, so a missing file still increments the counter before `notFound()`. (2) `formatExpiresIn` returns `"0 hours"` when less than one hour remains (`diffHours` floors to 0).
**Fix:** Wrap the fallback in its own try/catch defaulting to `share.view_count + 1`; consider `"less than an hour"` when `diffMs < 3600000`.

#### IN-05: Layout initials computation degrades to empty string

**File:** `app/(dashboard)/dashboard/layout.tsx:19-24`
**Issue:** `displayName.split(/\s+/).map((s) => s[0])` — for a whitespace-only or empty `name` (Firebase allows empty strings), `"".split(/\s+/)` yields `[""]` and `s[0]` is `undefined`, producing `initials === ""` and an empty avatar circle.
**Fix:** `const initials = (displayName.trim().split(/\s+/).map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase()) || "?";`

#### IN-06: Unvalidated non-null assertion on Supabase URL

**File:** `utils/supabase/server.ts:11`
**Issue:** `serviceRoleKey` is validated with a clear error, but `process.env.NEXT_PUBLIC_SUPABASE_URL!` is asserted — an unset URL reaches `createServiceRoleClient(undefined, ...)` and fails later with an opaque supabase-js error.
**Fix:** Mirror the key check: `const url = process.env.NEXT_PUBLIC_SUPABASE_URL; if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");`

#### IN-07: EncryptedContentViewer "Try Again" cannot succeed

**File:** `components/encrypted-content-viewer.tsx:137-154`
**Issue:** On random-key decrypt failure the fragment is not cleared (only success clears it, line 57), so "Try Again" re-runs `tryDecrypt` with the same stale fragment — same failure, forever. The retry button is only useful after the user manually edits the URL.
**Fix:** On error, either `clearKeyFromFragment()` and go straight to `need-password`, or clear the fragment when entering the error state so the retry prompts for a password.

#### IN-08: 4-character minimum for E2E encryption password

**File:** `components/encryption-toggle.tsx:71-74`
**Issue:** The only client-side strength constraint on the password that derives the AES key is length ≥ 4. For client-side E2E encryption there is no server rate-limit to compensate; 4 chars is trivially brute-forceable from the ciphertext.
**Fix:** Raise to a meaningful minimum (8+) and/or show a weakness hint; derivation cost is already handled by `deriveKeyFromPassword`.

#### IN-09: Duplicated helpers and inline type re-declarations at cast boundaries

**Files:** `app/(dashboard)/dashboard/page.tsx:14-18,123`, `app/(public)/s/[slug]/page.tsx:117-121`
**Issue:** `formatFileSize` is copy-pasted in both pages (lib already has `lib/file-utils.ts` exporting `formatFileSize`). The `teamShareMap` cast at dashboard/page.tsx:123 re-declares the entire `TeamShareRow` shape inline instead of referencing `types/team.ts` — two sources of truth that will drift.
**Fix:** Import `formatFileSize` from `@/lib/file-utils`; type the cast target as `Record<string, TeamShareRow>` (or better, change `DashboardShareList`'s prop type to accept `TeamShareRow[]`).

#### IN-10: EditorShell's synthetic ref object re-attaches scroll listeners every render

**File:** `components/editor-shell.tsx:105-109` with `lib/use-scroll-sync.ts:48-75`
**Issue:** `editorViewRef` is a fresh getter-object each render (`{ get current() {...} } as RefObject<...>`), so `useScrollSync`'s effect deps (`editorViewRef`) change on every render and the scroll listeners are torn down and re-added per keystroke. It works (and incidentally rescues the effect from reading a null view before the dynamic `EditorPane` mounts), but it is fragile: memoizing the ref object for performance would silently break listener attachment, and the per-render teardown is hidden coupling.
**Fix:** Have `EditorPane` own a stable `EditorView | null` ref via `useImperativeHandle`, or expose an `onReady(view)` callback so `useScrollSync` can attach once against the actual view.

---

_Reviewed: 2026-08-16T06:47:27Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
