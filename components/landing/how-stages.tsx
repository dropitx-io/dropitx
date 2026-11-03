import type { ReactNode } from "react";

/** One product screen per how-it-works stop, drawn from the share flow. */
function Fragment({ bar, label, children }: { bar: string; label: string; children: ReactNode }) {
  return (
    <>
      <div className="ui-bar">
        <span>{bar}</span>
        <span>{label}</span>
      </div>
      <div className="ui-pad">{children}</div>
    </>
  );
}

function Row({ k, v, quiet = false }: { k: string; v: ReactNode; quiet?: boolean }) {
  return (
    <div className="ui-row">
      <span className={quiet ? "ui-label" : undefined}>{k}</span>
      <span className="ui-value">{v}</span>
    </div>
  );
}

const VIEWS = [20, 79, 100, 49, 44, 34, 25];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REFERRERS: [string, number][] = [
  ["slack.com", 96],
  ["github.com", 61],
  ["Direct", 41],
  ["t.co", 16],
];

export function stageFragments(host: string): ReactNode[] {
  return [
    <Fragment key="drop" bar="New share" label="Drop">
      <div className="drop-zone">Drop a .md or .html file here, or choose one</div>
      <div className="flex justify-between gap-3 pt-3.5 pb-1.5">
        <span>q3-incident-review.md</span>
        <span className="ui-label">18.4 KB</span>
      </div>
      <div className="mt-2 h-1.5 bg-foreground" />
      <div className="mt-3">
        <Row quiet k="Renders as" v="Markdown page" />
        <Row quiet k="Title" v="Q3 incident review" />
      </div>
    </Fragment>,
    <Fragment key="protect" bar="Protect q3-incident-review.md" label="Options">
      <Row k="Password" v="set, 12 characters" />
      <Row k="Expires" v="Fri 6 Nov 2026, 18:00" />
      <Row k="Burn after reading" v={<span className="mini-switch block" data-on="false" />} />
      <Row k="Encrypt in this browser" v={<span className="mini-switch block" data-on="true" />} />
      <Row quiet k="Key stays in the link after #" v="AES-256-GCM" />
    </Fragment>,
    <Fragment key="share" bar="Your link is ready" label="Share">
      <p className="link-big">{host}/s/q3-incident-review#key=Jf4qW0</p>
      <div className="mt-4 mb-3 flex items-center gap-3">
        <span className="ui-btn">Copied</span>
        <span className="ui-label">Paste it anywhere</span>
      </div>
      <Row quiet k="Password" v="On" />
      <Row quiet k="Expires" v="in 4 days" />
      <Row quiet k="QR code" v="dropitx qr q3-incident-review" />
    </Fragment>,
    <Fragment key="numbers" bar="q3-incident-review" label="Last 7 days">
      <p>
        <span className="ui-big">214</span> <span className="ui-label">views, most on Wednesday</span>
      </p>
      <div className="mt-4 flex h-28 items-end gap-2" aria-hidden="true">
        {VIEWS.map((h, i) => (
          <span key={DAYS[i]} className="min-h-1 flex-1 bg-foreground" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-[13px] text-muted-foreground" aria-hidden="true">
        {DAYS.map((d) => (
          <span key={d} className="flex-1 text-center">{d}</span>
        ))}
      </div>
      <div className="mt-3">
        {REFERRERS.map(([site, n]) => (
          <Row key={site} k={site} v={n} />
        ))}
      </div>
    </Fragment>,
  ];
}
