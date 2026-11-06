"use client";

import Link from "next/link";
import { reveal } from "@/components/landing/reveal";
import { useRovingTabs } from "@/components/landing/use-roving-tabs";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import { CLI_REPO_URL } from "@/components/site/site-links";

/** "Share from your terminal, or let an agent do it": copy and a two-tab terminal (Terminal, mcp.json). */
export function LandingCli({ host }: { host: string }) {
  const { selected, tabProps } = useRovingTabs(2);
  return (
    <section className="sec" id="developers" aria-labelledby="dev-title">
      <div className="wrap dev">
        <div className="dev-copy" data-reveal>
          <h2 className="h-section" id="dev-title">Share from your terminal, or let an agent do it</h2>
          <p className="lead mt-4">Install the CLI once, set a personal shk_ or team sht_ key, and every upload prints a link.</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/developers" data-testid="landing-dev-guide">Read the developer guide</Link>
            <a className="btn btn-secondary" href={CLI_REPO_URL} target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
        </div>
        <div className="dev-term editor-dark" data-reveal style={reveal(1)}>
          <div className="tabbar" role="tablist" aria-label="Examples">
            <button className="tab" id="dev-tab-0" aria-controls="dev-panel-0" {...tabProps(0)}>Terminal</button>
            <button className="tab" id="dev-tab-1" aria-controls="dev-panel-1" {...tabProps(1)}>mcp.json</button>
          </div>
          <div role="tabpanel" id="dev-panel-0" aria-labelledby="dev-tab-0" tabIndex={0} hidden={selected !== 0}>
            <pre><code>
              <span className="c">$</span> {CLI_INSTALL_COMMAND}{"\n"}
              <span className="c">added 1 package in 3s</span>{"\n"}
              <span className="c">$</span> dropitx upload notes.md <span className="e">--expires 7d</span>{"\n"}
              <span className="c">Uploaded notes.md (6.2 KB)</span>{"\n"}
              <span className="s">https://{host}/s/notes-k3f9</span>{"\n"}
              <span className="c">$</span> cat log.txt | dropitx text{"\n"}
              <span className="s">https://{host}/s/log-82mq</span>{"\n"}
              <span className="c">$</span> dropitx qr notes-k3f9{"\n"}
              <span className="c">QR code printed above, scan to open.</span>
            </code></pre>
          </div>
          <div role="tabpanel" id="dev-panel-1" aria-labelledby="dev-tab-1" tabIndex={0} hidden={selected !== 1}>
            <pre><code>
              {"{\n  "}<span className="n">&quot;mcpServers&quot;</span>{": {\n    "}<span className="n">&quot;dropitx&quot;</span>{": {\n      "}
              <span className="n">&quot;command&quot;</span>{": "}<span className="s">&quot;npx&quot;</span>{",\n      "}
              <span className="n">&quot;args&quot;</span>{": ["}<span className="s">&quot;-y&quot;</span>{", "}<span className="s">&quot;dropitx&quot;</span>{", "}<span className="s">&quot;mcp&quot;</span>{"]\n    }\n  }\n}"}
            </code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}
