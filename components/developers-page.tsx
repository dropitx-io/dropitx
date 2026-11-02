import type { CSSProperties } from "react";
import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { CopyInstallButton } from "@/components/copy-install-button";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { body, display, displayS, grid, gutter, page, squareButton, textLink } from "@/app/(content)/_ui/public-styles";
import {
  AgentSession,
  HeroTerminalSlot,
  InstallTerminal,
  KeyPrefixes,
  ReaderCrop,
} from "@/app/(public)/developers/developer-fragments";
import { CLI_INSTALL_COMMAND, CLI_NPX_COMMAND, MCP_CLIENT_CONFIG } from "@/lib/cli-install";
import { cn } from "@/lib/utils";

const COMMANDS = [
  {
    command: "dropitx upload notes.md",
    body: "Uploads one or more files and prints a link for each. Add --password, --expires 7d, --burn or --slug my-notes.",
  },
  {
    command: "cat log.txt | dropitx upload",
    body: "With no file named, it reads standard input, so anything you can pipe becomes a page.",
  },
  {
    command: 'dropitx text --filename note.md "# Hello"',
    body: "Shares a line of text without a file. The filename decides how it renders, here as Markdown.",
  },
  {
    command: "dropitx qr https://dropitx.site/s/notes-k3f9",
    body: "Prints a QR code for a link in the terminal, or saves an image with -o qr.png.",
  },
  {
    command: "dropitx skill install",
    body: "Adds the drop-plan skill to Claude Code, so asking it to share a plan or report turns the file into a link.",
  },
];

const section = "mt-[clamp(96px,12vw,176px)]";
// <pre> takes the mono face from Tailwind's preflight; only literal code is set in it.
const codeBlock = "overflow-x-auto whitespace-pre bg-surface px-[22px] py-[18px] text-[15px] leading-[1.65]";
const splitText = "col-span-full grid content-start gap-[22px] min-[861px]:col-span-5";
const splitFig = "col-span-full mt-8 min-[861px]:col-span-6 min-[861px]:col-start-7 min-[861px]:mt-0";
const reveal = (i: number) => ({ "--reveal-i": i }) as CSSProperties;

export function DevelopersPage() {
  return (
    <div className={page}>
      <RevealOnScroll />
      <PublicNav current="/developers" />

      <main id="main" className="flex-1">
        <section className={cn(gutter, "grid min-h-[min(calc(100svh-72px),820px)] grid-rows-[1fr_auto_1fr] pb-10 max-[760px]:min-h-0 max-[760px]:grid-rows-[auto_auto] max-[760px]:gap-10 max-[760px]:pt-7")}>
          <h1 className={cn(display, "row-start-2 block max-[760px]:row-start-1 max-[760px]:text-[13vw]")}>
            <span className="flex items-baseline gap-x-[0.2em] whitespace-nowrap">Share from your</span>
            <span className="flex items-baseline gap-x-[0.2em] whitespace-nowrap max-[760px]:flex-col max-[760px]:items-stretch">
              <HeroTerminalSlot />
              <span>terminal.</span>
            </span>
          </h1>
          <div className="row-start-3 flex items-end justify-between gap-8 self-end max-[760px]:row-start-2 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-6">
            <p className={cn(body, "max-w-[27em]")}>
              Install the CLI, upload a file or pipe text, and get a link back. Agents use it over MCP.
            </p>
            <div className="flex shrink-0 items-center gap-7 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-4">
              <Link href="/auth/login?mode=signup" className={cn(body, textLink, "self-start py-2.5")}>
                Create an account
              </Link>
              <a href="#install" className={squareButton()}>
                Install the CLI
              </a>
            </div>
          </div>
        </section>

        <section id="install" className={cn(gutter, grid, section, "items-start")}>
          <div className={splitText}>
            <h2 data-reveal className={displayS}>Install it once.</h2>
            <p data-reveal style={reveal(1)} className={cn(body, "max-w-[34em]")}>
              The CLI is an npm package. Install it globally, or run it with npx when you only need it once.
            </p>
            <div data-reveal style={reveal(2)} className="grid gap-3">
              <pre className={codeBlock}><code>{`${CLI_INSTALL_COMMAND}\n# or, without installing\n${CLI_NPX_COMMAND}`}</code></pre>
              <div><CopyInstallButton /></div>
            </div>
            <p data-reveal style={reveal(3)} className={cn(body, "max-w-[34em]")}>
              Then give it your API key. Personal keys start with shk_, team keys with sht_.
            </p>
            <pre data-reveal style={reveal(4)} className={codeBlock}><code>dropitx config set-key shk_your_key_here</code></pre>
          </div>
          <InstallTerminal className={splitFig} />
        </section>

        <section id="commands" aria-labelledby="commands-title" className={cn(gutter, section)}>
          <h2 id="commands-title" data-reveal className={displayS}>A few commands do most of it.</h2>
          <div className={grid}>
            <ul className="col-span-full mt-10 grid gap-11 min-[861px]:col-span-8 min-[861px]:col-start-5 min-[861px]:mt-[72px]">
              {COMMANDS.map((c) => (
                <li key={c.command} data-reveal className="grid gap-3">
                  <pre className={cn(codeBlock, "text-[15px] min-[861px]:text-[17px]")}><code>{c.command}</code></pre>
                  <p className={cn(body, "max-w-[34em]")}>{c.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="mcp" aria-labelledby="mcp-title" className={cn(section, "bg-field py-[clamp(80px,9vw,140px)] text-field-foreground")}>
          <div className={cn(gutter, grid, "items-start")}>
            <div className={splitText}>
              <h2 id="mcp-title" data-reveal className={displayS}>Hand it to your agent.</h2>
              <p data-reveal style={reveal(1)} className={cn(body, "max-w-[34em]")}>
                The same package runs as an MCP server over stdio. Add it to Claude Desktop, Cursor or any MCP client, and the agent can publish, list and update pages with your key.
              </p>
              <pre data-reveal style={reveal(2)} className={cn(codeBlock, "bg-[color-mix(in_oklch,var(--field)_78%,var(--field-foreground))] text-field-foreground")}><code>{MCP_CLIENT_CONFIG}</code></pre>
            </div>
            <AgentSession className={splitFig} />
          </div>
        </section>

        <section id="keys" className={cn(gutter, grid, section, "items-start")}>
          <div className={cn(splitText, "min-[861px]:col-start-8 min-[861px]:row-start-1")}>
            <h2 data-reveal className={displayS}>Two kinds of key.</h2>
            <p data-reveal style={reveal(1)} className={cn(body, "max-w-[34em]")}>
              Personal keys start with shk_ and act for you. Team keys start with sht_ and act for a team space, so uploads land where the team can see them.
            </p>
            <p data-reveal style={reveal(2)} className={cn(body, "max-w-[34em]")}>
              A key is shown once, when it is created, and only its SHA-256 hash is kept. If you lose one, revoke it and make another.
            </p>
          </div>
          <KeyPrefixes className="col-span-full mt-8 min-[861px]:col-span-6 min-[861px]:col-start-1 min-[861px]:row-start-1 min-[861px]:mt-0" />
        </section>

        <section id="result" aria-labelledby="result-title" className={cn(gutter, section)}>
          <h2 id="result-title" data-reveal className={displayS}>Your reader gets a page.</h2>
          <p data-reveal style={reveal(1)} className={cn(body, "mt-[22px] max-w-[34em]")}>
            Every upload renders at dropitx.site/s/ and its slug, readable on a phone, with nothing to install.
          </p>
          <ReaderCrop className="mt-8 min-[861px]:mt-14" />
        </section>
      </main>

      <div className={section}>
        <LandingFooter />
      </div>
    </div>
  );
}
