"use client";

/**
 * API keys: lists the caller's personal keys and, on a team, that team's keys; creates keys
 * (the raw key is shown once) and revokes them.
 */

import { useState, useEffect, useCallback } from "react";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiErrorDetail, authFetch } from "@/lib/api-client";
import { formatDay } from "@/components/analytics/analytics-format";
import { Bar } from "@/components/analytics/loading-blocks";
import { CreateKeyDialog } from "@/components/team/create-key-dialog";
import { keysForTeam } from "@/components/team/team-format";
import { ACTIONS, LINE2, TABLE, TBODY, TD, TH, THEAD, TR, WIDE } from "@/components/team/table-classes";
import type { components } from "@/lib/api-types";

type ApiKey = components["schemas"]["ApiKeyResponse"];

export function ApiKeyManager({ team }: { team?: { id: string; name: string } }) {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const teamId = team?.id;
  const fetchKeys = useCallback(async () => {
    try {
      const res = await authFetch("/api/v1/keys");
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to load API keys"));
      const all = (await res.json()) as ApiKey[];
      setKeys(teamId ? keysForTeam(all, teamId) : all.filter((k) => !k.team_id));
      setFailed(null);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "Failed to load API keys");
    }
  }, [teamId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical fetch-on-mount; setStates only run after await inside fetchKeys
    fetchKeys();
  }, [fetchKeys]);

  async function handleRevoke(key: ApiKey) {
    if (!confirm(`Revoke "${key.name}"? Anything using ${key.key_prefix}... stops working at once. This can't be undone.`)) return;
    setRevokingId(key.id);
    try {
      const res = await authFetch(`/api/v1/keys/${key.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiErrorDetail(res, "Failed to revoke key"));
      toast.success(`Revoked ${key.name}`);
      setKeys((prev) => prev?.filter((k) => k.id !== key.id) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke key");
    } finally {
      setRevokingId(null);
    }
  }

  const teamCount = keys?.filter((k) => k.team_id).length ?? 0;
  const count = keys === null ? "" : team ? `${keys.length} active: ${teamCount} team, ${keys.length - teamCount} personal` : `${keys.length} active`;
  const scopeOf = (k: ApiKey) => (k.team_id ? "Team" : "Personal");
  const used = (k: ApiKey) => (k.last_used_at ? formatDay(k.last_used_at) : null);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
        <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
          Create key
        </Button>
      </div>

      {failed ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
          <CircleAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.5} />
          <span className="flex-1 text-card-foreground">{failed}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => { setFailed(null); fetchKeys(); }}>
            Retry
          </Button>
        </div>
      ) : keys !== null && keys.length === 0 ? (
        <p className="flex min-h-[38px] items-center rounded-lg border border-dashed border-input px-3 text-sm text-muted-foreground">
          No keys yet. Create one to publish from the CLI or an MCP client.
        </p>
      ) : (
        <table className={TABLE}>
          <thead className={THEAD}>
            <tr>
              <th scope="col" className={TH}>Name</th>
              <th scope="col" className={TH}>Key</th>
              <th scope="col" className={`${TH} text-right`}>Created</th>
              <th scope="col" className={`${TH} text-right`}>Last used</th>
              <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className={TBODY} aria-busy={keys === null}>
            {keys === null
              ? [120, 96].map((w) => (
                  <tr key={w} className={TR}>
                    <td className={TD}><Bar w={w} /></td>
                    <td className={`${TD} ${WIDE}`}><Bar w={90} /></td>
                    <td className={`${TD} ${WIDE} text-right`}><Bar w={44} /></td>
                    <td className={`${TD} ${WIDE} text-right`}><Bar w={44} /></td>
                    <td className={TD} />
                  </tr>
                ))
              : keys.map((k) => (
                  <tr key={k.id} className={TR}>
                    <td className={`${TD} font-medium text-card-foreground`}>{k.name}</td>
                    <td className={`${TD} ${WIDE}`}>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-mono text-[13px]">{k.key_prefix}...</span>
                        <span className="rounded-sm bg-raised px-1.5 text-xs text-muted-foreground">{scopeOf(k)}</span>
                      </span>
                    </td>
                    <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{formatDay(k.created_at)}</td>
                    <td className={`${TD} ${WIDE} text-right whitespace-nowrap`}>{used(k) ?? <span className="text-muted-foreground">Never</span>}</td>
                    <td className={`${TD} ${LINE2}`}>
                      <span className="font-mono">{k.key_prefix}...</span>, {scopeOf(k).toLowerCase()}, {used(k) ? `used ${used(k)}` : "never used"}
                    </td>
                    <td className={`${TD} ${ACTIONS}`}>
                      <button
                        type="button"
                        onClick={() => handleRevoke(k)}
                        disabled={revokingId === k.id}
                        aria-label={`Revoke ${k.name}`}
                        className="text-sm font-medium text-card-foreground hover:underline hover:underline-offset-[3px] disabled:text-muted-foreground max-sm:min-h-11"
                      >
                        {revokingId === k.id ? "Revoking" : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}

      <CreateKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} team={team} onCreated={fetchKeys} />
    </>
  );
}
