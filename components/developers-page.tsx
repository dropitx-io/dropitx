import { LandingFooter } from "@/components/landing-footer";
import { CopyInstallButton } from "@/components/copy-install-button";
import { CLI_INSTALL_COMMAND, CLI_NPX_COMMAND, MCP_CLIENT_CONFIG } from "@/lib/cli-install";
import {
  Upload,
  FileText,
  Settings,
  QrCode,
  Terminal,
  Package,
  Code2,
} from "lucide-react";

const COMMANDS = [
  {
    icon: Upload,
    name: "upload",
    command: "$ dropitx upload notes.md",
    body: "Upload any Markdown or HTML file, get a shareable link back instantly.",
  },
  {
    icon: FileText,
    name: "text",
    command: "$ cat log.txt | dropitx text",
    body: "Share a snippet directly, or pipe from stdin — no file needed.",
  },
  {
    icon: Settings,
    name: "config",
    command: "$ dropitx config set-key shk_...",
    body: "Set your API key and defaults once. Keys start with shk_ (personal) or sht_ (team).",
  },
  {
    icon: QrCode,
    name: "qr",
    command: "$ dropitx qr <slug>",
    body: "Print a scannable QR code for any share.",
  },
];

export function DevelopersPage() {
  return (
    <>
      {/* Hero */}
      <header className="mx-auto max-w-[1120px] px-8 pb-14 pt-18 text-center max-[640px]:px-4">
        <span className="mb-5.5 inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-meta clay-raised">
          <span className="size-[7px] rounded-full bg-success" />
          Command-line sharing
        </span>
        <h1 className="font-display text-[clamp(32px,5vw,52px)] font-black leading-[1.05] tracking-[-0.03em]">
          DropItX from the command line.
        </h1>
        <p className="mx-auto mt-4 max-w-[52ch] text-[17px] leading-[1.55] text-muted-foreground">
          Upload, share, and manage links without leaving your terminal — works standalone or piped from stdin.
        </p>
        <div className="mt-6.5 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-[13px] clay-raised">
            $ {CLI_INSTALL_COMMAND}
          </span>
          <CopyInstallButton />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Or run it without installing:{" "}
          <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[13px]">{CLI_NPX_COMMAND}</code>
        </p>
      </header>

      {/* Commands grid */}
      <section className="mx-auto max-w-[1120px] px-8 pb-16 max-[640px]:px-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {COMMANDS.map((c) => (
            <div key={c.name} className="rounded-[22px] bg-card p-6.5 clay-raised">
              <div className="mb-4 grid size-[46px] place-items-center rounded-[14px] bg-primary/16 text-primary clay-raised">
                <c.icon className="size-[22px]" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.01em]">
                dropitx {c.name}
              </h3>
              <p className="mt-2.5 rounded-[11px] bg-background px-3 py-2 font-mono text-[13px]">
                {c.command}
              </p>
              <p className="mt-2.5 text-sm leading-[1.55] text-muted-foreground">{c.body}</p>
            </div>
          ))}

          {/* skill install — walkthrough demo, same card footprint as the other 4 */}
          <div className="rounded-[22px] bg-card p-6.5 clay-raised">
            <div className="mb-4 flex items-center justify-between">
              <div className="grid size-[46px] place-items-center rounded-[14px] bg-primary/16 text-primary clay-raised">
                <Terminal className="size-[22px]" />
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/16 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.05em] text-primary">
                Demo
              </span>
            </div>
            <h3 className="font-display text-lg font-bold tracking-[-0.01em]">
              dropitx skill install
            </h3>
            <div
              className="mt-2.5 flex flex-col gap-1 rounded-[11px] bg-background px-3 py-2 font-mono text-[12px] leading-[1.6]"
              aria-hidden="true"
            >
              <p className="text-muted-foreground">&gt; &quot;share this plan&quot;</p>
              <p>$ dropitx skill install</p>
              <p className="text-muted-foreground">agent runs: dropitx upload plan.md --expires 30d</p>
              <p className="text-primary">→ dropitx.site/s/plan-k3mx</p>
            </div>
            <p className="mt-2.5 text-sm leading-[1.55] text-muted-foreground">
              Installs a Claude Code skill so agents can share plans and reports as links for you.
            </p>
          </div>
        </div>
      </section>

      {/* MCP server */}
      <section className="mx-auto max-w-[1120px] px-8 pb-16 max-[640px]:px-4">
        <div className="rounded-[22px] bg-card p-6.5 clay-raised">
          <h2 className="font-display text-lg font-bold tracking-[-0.01em]">Use it from an MCP client</h2>
          <p className="mt-2.5 text-sm leading-[1.55] text-muted-foreground">
            Add this to your MCP client config (Claude Desktop, Cursor, and others) so agents can share links through DropItX.
          </p>
          <pre className="mt-3.5 overflow-x-auto rounded-[11px] bg-background px-4 py-3 font-mono text-[13px] leading-[1.6]">
            <code>{MCP_CLIENT_CONFIG}</code>
          </pre>
        </div>
      </section>

      {/* Page footer: npm + GitHub, then the shared landing footer */}
      <section className="mx-auto max-w-[1120px] px-8 pb-16 max-[640px]:px-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.npmjs.com/package/dropitx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-card px-4.5 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px"
          >
            <Package className="size-4" />
            npm
          </a>
          <a
            href="https://github.com/phuongddx/dropitx-cli"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-card px-4.5 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px"
          >
            <Code2 className="size-4" />
            GitHub
          </a>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
