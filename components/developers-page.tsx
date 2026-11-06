import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { DevelopersToc, type TocEntry } from "@/components/developers-toc";
import { CodeBlock, Cmd, Out } from "@/components/site/code-block";
import { CLI_REPO_URL } from "@/components/site/site-links";
import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { AgentSession, KeysPanel } from "@/app/(public)/developers/developer-fragments";
import { CLI_INSTALL_COMMAND, CLI_NPX_COMMAND, CLI_PACKAGE_URL, MCP_CLIENT_CONFIG } from "@/lib/cli-install";
import { showPricing } from "@/lib/feature-flags";
import { SITE_URL } from "@/lib/site-url";

const TOC: TocEntry[] = [
  { id: "install", label: "Install" },
  { id: "key", label: "Set your key" },
  { id: "commands", label: "Commands" },
  { id: "options", label: "Upload options" },
  { id: "mcp", label: "MCP server" },
  { id: "keys", label: "API keys" },
  { id: "limits", label: "Limits" },
];

const FLAGS: Array<[string, React.ReactNode]> = [
  ["-p, --password", "Asks for a password; readers must enter it before the page renders."],
  ["-e, --expires 7d", "The link stops working after a duration such as 1h, 7d or 1w."],
  ["-b, --burn", "Burn after reading: only the first person to open the link sees it."],
  ["-s, --slug my-notes", "Picks the slug yourself, 3 to 32 characters."],
  ["-q, --qr", <>Prints a QR code next to the link. <code>--qr-file</code> saves it as an image.</>],
];

const LIMITS: Array<[string, string]> = [
  ["File size", "50 MB per file, on every plan"],
  ["Storage", "1 GB on Free, 5 GB on Pro"],
  ["Active links", "10 on Free, unlimited on Pro and Team"],
  ["Rendered as pages", "Markdown (.md) and HTML; other types are shared as downloads"],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="doc-sec" id={id} aria-labelledby={`${id}-title`} data-reveal>
      <h2 className="h-sub" id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: [string, string]; rows: Array<[React.ReactNode, React.ReactNode]> }) {
  return (
    <table className="flags">
      <thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead>
      <tbody>{rows.map(([a, b], i) => <tr key={i}><td>{a}</td><td>{b}</td></tr>)}</tbody>
    </table>
  );
}

/** The developers guide: the CLI, its options, the MCP server, API keys and limits, with a table of contents. */
export function DevelopersPage() {
  const host = new URL(SITE_URL).host;
  return (
    <div className="site">
      <PublicNav current="/developers" />
      <div className="wrap docs">
        <DevelopersToc entries={TOC} />
        <main className="docs-main" id="main">
          <header>
            <h1 className="h-hero rise">Share from your terminal</h1>
            <p className="lead rise" style={{ "--i": 1 } as React.CSSProperties}>
              The <code>dropitx</code> CLI uploads a file or piped text and prints a short link. The same package runs as an MCP server, so agents can share for you.
            </p>
            <div className="hero-actions rise" style={{ "--i": 2 } as React.CSSProperties}>
              <a className="btn btn-dark btn-lg" href="#install" data-testid="developers-install-link">Install the CLI <span className="arrow" aria-hidden="true">&rarr;</span></a>
              <Link className="btn btn-primary btn-lg" href="/dashboard/profile#api-keys" data-testid="developers-key-link">Get an API key</Link>
            </div>
          </header>

          <Section id="install" title="Install">
            <p>The CLI is an npm package. Install it globally, or run it with npx when you only need it once.</p>
            <CodeBlock copy={CLI_INSTALL_COMMAND} testId="developers-copy-install">
              <Cmd>{CLI_INSTALL_COMMAND}</Cmd>
              <Out># or, without installing</Out>
              <span className="c">$</span> {CLI_NPX_COMMAND}
            </CodeBlock>
          </Section>

          <Section id="key" title="Set your key">
            <p>Create a key in your dashboard and give it to the CLI once. It is saved to your local config.</p>
            <CodeBlock copy="dropitx config set-key shk_your_key_here" testId="developers-copy-key">
              <Cmd>dropitx config set-key <span className="e">shk_your_key_here</span></Cmd>
              <Out>API key saved.</Out>
              <span className="c">$</span> dropitx config show
            </CodeBlock>
          </Section>

          <Section id="commands" title="Commands">
            <p>Four commands cover nearly everything.</p>
            <h3 className="h-title"><code>dropitx upload</code></h3>
            <p>Uploads one or more files and prints a link for each.</p>
            <CodeBlock copy="dropitx upload notes.md" testId="developers-copy-upload">
              <Cmd>dropitx upload notes.md</Cmd>
              <Out>Uploaded notes.md (6.2 KB)</Out>
              <Out tone="s" last>https://{host}/s/notes-k3f9</Out>
            </CodeBlock>
            <h3 className="h-title"><code>dropitx text</code></h3>
            <p>Sends piped or quoted text. Name it with <code>--filename note.md</code> so it renders as Markdown.</p>
            <CodeBlock copy="cat log.txt | dropitx text" testId="developers-copy-text">
              <Cmd>cat log.txt | dropitx text</Cmd>
              <Out tone="s" last>https://{host}/s/log-82mq</Out>
            </CodeBlock>
            <h3 className="h-title"><code>dropitx qr</code></h3>
            <p>Prints a QR code for a link in the terminal, or saves an image with <code>-o qr.png</code>.</p>
            <CodeBlock copy="dropitx qr notes-k3f9" testId="developers-copy-qr">
              <span className="c">$</span> dropitx qr notes-k3f9
            </CodeBlock>
            <h3 className="h-title"><code>dropitx skill install</code></h3>
            <p>Adds the drop-plan skill to Claude Code, so asking it to &quot;share this plan with the team&quot; turns a plan or report into a link. Run it again with <code>--force</code> after upgrading.</p>
          </Section>

          <Section id="options" title="Upload options">
            <p>Flags work on both <code>upload</code> and <code>text</code>, and combine freely.</p>
            <Table head={["Flag", "What it does"]} rows={FLAGS.map(([flag, what]) => [<code key={flag}>{flag}</code>, what])} />
            <CodeBlock copy="dropitx upload --password --expires 7d --burn --qr offer-letter.html" testId="developers-copy-options">
              <Cmd>dropitx upload <span className="e">--password --expires 7d --burn --qr</span> offer-letter.html</Cmd>
              <Out>Password: ••••••••••</Out>
              <Out>Uploaded offer-letter.html (4.1 KB)</Out>
              <Out tone="s">https://{host}/s/offer-letter-p8vd</Out>
              <Out last>Expires Fri 13 Nov 2026. Burns after the first read.</Out>
            </CodeBlock>
          </Section>

          <Section id="mcp" title="MCP server">
            <p>The package runs as an MCP server over stdio. Add it to Claude Desktop, Cursor or any MCP client, and the agent can share files through DropItX with the key you set.</p>
            <CodeBlock title="mcp.json" copy={MCP_CLIENT_CONFIG} testId="developers-copy-mcp">
              {MCP_CLIENT_CONFIG}
            </CodeBlock>
            <AgentSession host={host} />
          </Section>

          <Section id="keys" title="API keys">
            <p>Personal keys start with <code>shk_</code> and act for you. Team keys start with <code>sht_</code> and act for a team space, so uploads land where the team can see them.</p>
            <div className="callout"><p>We show a key once, when you create it, and keep only its SHA-256 hash. If you lose one, revoke it and create another.</p></div>
            <KeysPanel />
          </Section>

          <Section id="limits" title="Limits">
            <Table head={["Limit", "Value"]} rows={LIMITS} />
            <p>
              Questions about plans are answered in the{" "}
              {showPricing() ? <Link href="/#pricing">pricing section</Link> : <Link href="/#faq">questions on the home page</Link>}. The source is on{" "}
              <a href={CLI_REPO_URL} target="_blank" rel="noreferrer">GitHub</a> and the package on{" "}
              <a href={CLI_PACKAGE_URL} target="_blank" rel="noreferrer">npm</a>.
            </p>
          </Section>
        </main>
      </div>
      <LandingFooter />
      <RevealOnScroll />
    </div>
  );
}
