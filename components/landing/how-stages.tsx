/** The four stages of "From file to readers": the step list text and each step's illustration. */

export type Stage = { name: string; title: string; text: React.ReactNode; color: string; panel: React.ReactNode };

const BARS = [20, 79, 100, 49, 44, 34, 25];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Kv({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="kv">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Panel({ label, tag, children }: { label: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="paper">
      <div className="urlbar"><span className="url"><b>{label}</b></span><span>{tag}</span></div>
      <div className="stage-body">{children}</div>
    </div>
  );
}

/** Illustrative figures only: nothing here reads real data. */
export function stages(host: string): Stage[] {
  return [
    {
      name: "Drop",
      title: "Give it a file or some text",
      text: "Markdown and HTML become a rendered page. Anything else up to 50 MB is shared as a file.",
      color: "var(--tl-1)",
      panel: (
        <Panel label="New share" tag="Drop">
          <div className="dropzone"><strong>q3-incident-review.md</strong>18.4 KB, uploaded</div>
          <div className="progress" aria-hidden="true"><span /></div>
          <Kv rows={[["Renders as", "Markdown page"], ["Title", "Q3 incident review"], ["Space used", "18.4 KB of 1 GB"]]} />
        </Panel>
      ),
    },
    {
      name: "Protect",
      title: "Decide who gets to read it",
      text: "Add a password, an expiry date, burn after reading or encryption in your browser. Each is one switch.",
      color: "var(--tl-2)",
      panel: (
        <Panel label="Protect q3-incident-review.md" tag="Options">
          <Kv rows={[["Password", "Set, 12 characters"], ["Expires", "Fri 13 Nov 2026, 18:00"], ["Burn after reading", "Off"], ["Encrypt in this browser", "On, AES-256-GCM"]]} />
        </Panel>
      ),
    },
    {
      name: "Share",
      title: "Send the short link",
      text: <>Paste it in a chat, an issue or an email, or print a QR code with <code>dropitx qr</code>.</>,
      color: "var(--tl-3)",
      panel: (
        <Panel label="Your link is ready" tag="Share">
          <p className="result-link">{host}/s/q3-incident-review<span className="key">#k=Jf4qW0</span></p>
          <div className="result-badges"><span className="badge">Password</span><span className="badge">Expires Fri 13 Nov</span><span className="badge badge-dot badge-success">Encrypted</span></div>
          <Kv rows={[["Copied to clipboard", "Just now"], ["QR code", <code key="qr">dropitx qr q3-incident-review</code>]]} />
        </Panel>
      ),
    },
    {
      name: "Read the numbers",
      title: "See who opened it",
      text: "Views over time on every plan; Pro and Team add the sites your readers came from.",
      color: "var(--tl-4)",
      panel: (
        <Panel label="q3-incident-review" tag="Last 7 days">
          <p><span className="stat">214</span> <span className="ui-text fg-2">views, most on Wednesday</span></p>
          <div className="bars" aria-hidden="true">
            {BARS.map((h, i) => <span key={i} className={h === 100 ? "peak" : undefined} style={{ height: `${h}%` }} />)}
          </div>
          <div className="bars-axis" aria-hidden="true">{DAYS.map((d) => <span key={d}>{d}</span>)}</div>
          <Kv rows={[["slack.com", "96"], ["github.com", "61"], ["Direct", "41"], ["t.co", "16"]]} />
        </Panel>
      ),
    },
  ];
}
