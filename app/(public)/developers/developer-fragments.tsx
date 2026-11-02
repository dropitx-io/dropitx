import { cn } from "@/lib/utils";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";

/*
  Interface fragments for the developers page: crops of the terminal, an agent
  session and a rendered share. Each root carries data-ui. Terminal lines follow
  the CLI's own output (dropitx-cli/dropitx/cli.py, print_upload_result).
*/

const frame = "bg-card text-[15px] leading-[1.5] text-foreground";
const bar = "flex items-center justify-between gap-3 bg-surface px-4 py-3 text-[13px]";
const termBar =
  "flex items-center justify-between gap-3 bg-[color-mix(in_oklch,var(--field)_82%,var(--field-foreground))] px-4 py-3 text-[13px] text-field-foreground/80";

/** The terminal crop that sits inside the hero sentence. */
export function HeroTerminalSlot() {
  return (
    <span
      data-ui
      role="img"
      aria-label="A terminal running dropitx upload"
      className="shutter @container relative inline-block h-[0.47em] w-[2.1em] shrink-0 overflow-hidden bg-field align-baseline max-[760px]:my-[0.14em] max-[760px]:aspect-[3/2] max-[760px]:h-auto max-[760px]:w-full"
    >
      <span aria-hidden="true" className="absolute inset-0 p-[6cqi] font-normal leading-[1.5] tracking-normal text-field-foreground">
        <code className="block whitespace-nowrap font-mono text-[5.6cqi]">$ dropitx upload notes.md</code>
        <code className="block whitespace-nowrap font-mono text-[5.6cqi] text-field-foreground/75">URL  https://dropitx.site/s/notes-k3f9</code>
        <code className="block whitespace-nowrap font-mono text-[5.6cqi]">$ cat log.txt | dropitx upload</code>
        <code className="block whitespace-nowrap font-mono text-[5.6cqi] text-field-foreground/75">URL  https://dropitx.site/s/log-82mq</code>
      </span>
    </span>
  );
}

/** A first session: install, save a key, upload with an expiry. */
export function InstallTerminal({ className }: { className?: string }) {
  return (
    <figure data-ui aria-label="A first session with the dropitx CLI" className={cn("bg-field text-field-foreground", className)}>
      <div className={termBar}>
        <span>~/projects/handbook</span>
        <span>zsh</span>
      </div>
      <pre className="whitespace-pre-wrap break-words px-6 pb-[26px] pt-[22px] font-mono text-[14px] leading-[1.7]"><code>{`$ ${CLI_INSTALL_COMMAND}
$ dropitx config set-key shk_your_key_here
`}<span className="text-field-foreground/75">API key saved successfully</span>{`
$ dropitx upload onboarding.md --expires 7d
`}<span className="text-field-foreground/75">{`Upload Successful
  URL       https://dropitx.site/s/onboarding-r2tw
  Slug      onboarding-r2tw
  Filename  onboarding.md`}</span>{`
$ dropitx upload offer-letter.html --password --burn
`}<span className="text-field-foreground/75">{`Password: ••••••••••
Upload Successful
  URL       https://dropitx.site/s/offer-letter-p8vd
  Burn      Yes
  Password  Protected`}</span></code></pre>
    </figure>
  );
}

/** An agent using the MCP server's tools. */
export function AgentSession({ className }: { className?: string }) {
  const me = "max-w-[88%] justify-self-end bg-foreground px-4 py-3.5 text-background";
  const agent = "max-w-[88%] bg-surface px-4 py-3.5";
  const tool = "bg-[color-mix(in_oklch,var(--surface),var(--card)_50%)] px-3.5 py-2.5 text-[13px] text-muted-foreground";
  return (
    <figure data-ui aria-label="An agent sharing a plan through the DropItX MCP server" className={cn(frame, className)}>
      <div className={bar}>
        <span>Agent session</span>
        <span>dropitx connected</span>
      </div>
      <div className="grid gap-3.5 px-6 py-5">
        <p className={me}>Share docs/plan.md with the team as a page.</p>
        <p className={tool}><code className="break-words font-mono">publish_page(filename=&quot;plan.md&quot;)</code></p>
        <p className={agent}>Published it at dropitx.site/s/plan-7xq2. Pages expire after 30 days unless you set another expiry.</p>
        <p className={me}>Which pages have I shared so far?</p>
        <p className={tool}><code className="break-words font-mono">list_pages(limit=20)</code></p>
        <p className={agent}>Three: plan.md, release-notes.md and q3-incident-review.md.</p>
      </div>
    </figure>
  );
}

/** The two key prefixes and what each acts for. */
export function KeyPrefixes({ className }: { className?: string }) {
  const rows = [
    { prefix: "shk_", kind: "Personal", acts: "Acts for you. Uploads land in your own links." },
    { prefix: "sht_", kind: "Team", acts: "Acts for a team space. Uploads land where the team sees them." },
  ];
  return (
    <figure data-ui aria-label="The two kinds of DropItX API key" className={cn(frame, className)}>
      <div className={bar}>
        <span>API keys</span>
        <span>Shown once, stored as a SHA-256 hash</span>
      </div>
      <div className="grid gap-5 px-6 py-5">
        {rows.map((r) => (
          <div key={r.prefix} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 bg-surface px-4 py-3.5">
            <code className="font-mono text-[14px]">{r.prefix}••••••••</code>
            <span className="text-right font-medium">{r.kind}</span>
            <span className="col-span-2 text-muted-foreground">{r.acts}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** What a reader opens: a Markdown upload rendered as a page. */
export function ReaderCrop({ className }: { className?: string }) {
  return (
    <figure data-ui aria-label="onboarding.md rendered as a DropItX page" className={cn(frame, "h-[clamp(360px,34vw,480px)] overflow-hidden", className)}>
      <div className={bar}>
        <span className="truncate">dropitx.site/s/onboarding-r2tw</span>
        <span>7 days left</span>
      </div>
      <div className="mx-auto max-w-[680px] px-6 py-12 text-[18px] leading-[1.6]">
        <p className="mb-3 text-[clamp(30px,3vw,44px)] leading-[1.1] tracking-[-0.02em]">Onboarding for new editors</p>
        <p className="mb-3.5 text-[13px] text-muted-foreground">onboarding.md, 11.8 KB</p>
        <p className="mb-2.5">Welcome to the handbook team. This page covers your first week: where drafts live, how reviews work, and who to ask when something is unclear.</p>
        <p className="mb-2 mt-5 text-[21px] font-medium leading-[1.25]">Your first day</p>
        <ul className="mb-3 list-disc pl-5">
          <li>Pick up your laptop from Ana on the second floor before 10:00.</li>
          <li>Join the #handbook channel and introduce yourself in one line.</li>
          <li>Read the style guide; the section on headings takes ten minutes.</li>
        </ul>
      </div>
    </figure>
  );
}
