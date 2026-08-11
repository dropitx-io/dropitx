---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-08-11T01:41:25.548Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 1 | deviation | lib/team-rpc.ts | 125 | Frontend calls 15 RPC names absent from live DB (create_team, transfer_team_ownership, update_member_role, add_team_member, get_token_security_stats, etc.) — surfaced by HYG-04 Database generic; 30 tsc errors across team-rpc.ts + token-security.ts; requires cross-repo reconciliation with dropitx-api/ | open |  | 2026-08-11T01:41:25.424Z |  |
| 2 | 1 | unmet-truth | lib/token-security.ts | 97 | team_invites row reads locked_at/locked_reason/expires_at/accepted_at columns that do not exist in the live DB schema (SelectQueryError in generated types) | open |  | 2026-08-11T01:41:25.548Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "1",
    "file": "lib/team-rpc.ts",
    "line": 125,
    "description": "Frontend calls 15 RPC names absent from live DB (create_team, transfer_team_ownership, update_member_role, add_team_member, get_token_security_stats, etc.) — surfaced by HYG-04 Database generic; 30 tsc errors across team-rpc.ts + token-security.ts; requires cross-repo reconciliation with dropitx-api/",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-11T01:41:25.424Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "unmet-truth",
    "phase": "1",
    "file": "lib/token-security.ts",
    "line": 97,
    "description": "team_invites row reads locked_at/locked_reason/expires_at/accepted_at columns that do not exist in the live DB schema (SelectQueryError in generated types)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-11T01:41:25.548Z",
    "resolved_at": null
  }
]
````
