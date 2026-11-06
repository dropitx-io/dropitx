"use client";

import { useState } from "react";
import { reveal } from "@/components/landing/reveal";

type OptionKey = "pass" | "exp" | "burn" | "enc";

const OPTIONS: Array<{ key: OptionKey; name: string; desc: string; badge: string; line: string }> = [
  { key: "pass", name: "Password", desc: "Readers see a prompt; the page renders only after the right password.", badge: "Password", line: "Your reader types the password before anything renders." },
  { key: "exp", name: "Expiry date", desc: "The link stops working at the time you pick. From the CLI: 1h, 7d or 1w.", badge: "Expires Fri 13 Nov", line: "The link stops working on Friday 13 November at 18:00." },
  { key: "burn", name: "Burn after reading", desc: "One person sees the page; everyone after them is told it has been burned.", badge: "Burns after one read", line: "The first person to open it is the only one who sees it." },
  { key: "enc", name: "Encrypt in the browser", desc: "AES-256-GCM before upload, with the key kept in the link after the #.", badge: "Encrypted", line: "Encrypted in your browser; the key after # never reaches our server." },
];

/**
 * "Decide who reads it, and for how long": four switches (role="switch",
 * aria-checked) drive a live preview of what the reader gets. Two start on.
 */
export function LandingProtect({ host }: { host: string }) {
  const [on, setOn] = useState<Record<OptionKey, boolean>>({ pass: true, exp: false, burn: false, enc: true });
  const active = OPTIONS.filter((o) => on[o.key]);

  return (
    <section className="sec tone-warm" id="protect" aria-labelledby="protect-title">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 className="h-section" id="protect-title">Decide who reads it, and for how long</h2>
          <p className="lead">Turn the switches and watch the link change. Two are on, the way most people share an internal review.</p>
        </div>
        <div className="controls">
          <ul className="card opt-list" data-reveal>
            {OPTIONS.map((o) => (
              <li key={o.key} className="opt">
                <span className="opt-name" id={`opt-${o.key}`}>{o.name}</span>
                <span className="opt-desc">{o.desc}</span>
                <button
                  className="switch"
                  type="button"
                  role="switch"
                  aria-checked={on[o.key]}
                  aria-labelledby={`opt-${o.key}`}
                  data-testid={`landing-protect-${o.key}`}
                  onClick={() => setOn((s) => ({ ...s, [o.key]: !s[o.key] }))}
                />
              </li>
            ))}
          </ul>
          <div className="result" data-reveal style={reveal(1)}>
            <div className="paper card-featured">
              <div className="urlbar"><span className="url"><b>What your reader gets</b></span><span>Live</span></div>
              <div className="result-body" aria-live="polite">
                <p className="result-link">
                  {host}/s/q3-incident-review{on.enc && <span className="key">#k=Jf4qW0</span>}
                </p>
                <div className="result-badges">
                  {active.map((o) => (
                    <span key={o.key} className={o.key === "enc" ? "badge badge-dot badge-success" : "badge"}>{o.badge}</span>
                  ))}
                </div>
                <ul className="result-lines">
                  {active.length ? (
                    active.map((o) => <li key={o.key}>{o.line}</li>)
                  ) : (
                    <li className="result-empty">Anyone with the link can read it, for as long as it exists.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
