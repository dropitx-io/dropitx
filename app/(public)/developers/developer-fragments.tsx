import Link from "next/link";

/*
  Interface fragments for the developers page: an agent session using the MCP
  server and the API keys panel. Illustrations only; nothing reads real data.
*/

/** An agent sharing a plan through the DropItX MCP server. */
export function AgentSession({ host }: { host: string }) {
  return (
    <figure className="card agent" data-testid="developers-agent-session">
      <div className="paper">
        <div className="urlbar">
          <span className="url"><b>Agent session</b></span>
          <span className="badge badge-dot badge-success">dropitx connected</span>
        </div>
        <div className="agent-body">
          <p className="msg msg-me">Share docs/plan.md with the team and make it expire in 30 days.</p>
          <p className="msg msg-tool">dropitx upload docs/plan.md --expires 30d</p>
          <p className="msg">Shared it: {host}/s/plan-7xq2. The link stops working on Wednesday 2 December 2026.</p>
        </div>
      </div>
      <figcaption className="sr-only">An example conversation with an agent using the DropItX MCP server.</figcaption>
    </figure>
  );
}

const KEYS = [
  { key: "shk_••••••••a91c", kind: "Personal", name: "Laptop CLI, created 28 Oct 2026", used: "Used 2 hours ago" },
  { key: "shk_••••••••3e07", kind: "Personal", name: "Claude Desktop MCP, created 30 Oct 2026", used: "Used yesterday" },
  { key: "sht_••••••••77e0", kind: "Team: Docs", name: "Release pipeline, created 12 Oct 2026", used: "Used today" },
];

/** The API keys panel: masked keys with their kind, name and last use. */
export function KeysPanel() {
  return (
    <div className="card keys">
      <div className="paper">
        <div className="urlbar">
          <span className="url"><b>API keys</b></span>
          <Link className="btn btn-secondary copy-btn" href="/dashboard/profile#api-keys" data-testid="developers-new-key">New key</Link>
        </div>
        {KEYS.map((k) => (
          <div key={k.key} className="key-row">
            <code>{k.key}</code>
            <span className="badge">{k.kind}</span>
            <span className="meta">{k.name}</span>
            <span className="meta">{k.used}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
