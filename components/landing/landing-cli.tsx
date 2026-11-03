import Link from "next/link";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import { body, displayS, reveal, textLink } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

/** The terminal path: the real install command from lib/cli-install, then the CLI's own verbs. */
export function LandingCli({ host }: { host: string }) {
  return (
    <section id="cli" className="mt-(--section-gap) grid grid-cols-12 items-center gap-x-(--gutter) px-(--m) max-[760px]:grid-cols-4">
      <div className="col-span-5 grid content-start gap-[22px] max-[760px]:col-span-full">
        <h2 data-reveal className={displayS}>Or skip the browser.</h2>
        <p data-reveal style={reveal(1)} className={cn(body, "max-w-[34em]")}>
          The <code className="text-[0.86em] whitespace-nowrap">dropitx</code> CLI uploads a file or piped text and
          prints the link. Agents get the same tool through an MCP server.
        </p>
        <p data-reveal style={reveal(2)} className={body}>
          <Link href="/developers" className={textLink}>
            Read the developer guide
          </Link>
        </p>
      </div>
      <figure
        data-ui
        data-reveal
        style={reveal(2)}
        aria-label="A terminal session using the dropitx CLI"
        className="ui term col-span-6 col-start-7 m-0 max-[760px]:col-span-full max-[760px]:col-start-1 max-[760px]:mt-8"
      >
        <div className="ui-bar">
          <span>~/notes</span>
          <span>zsh</span>
        </div>
        <pre className="m-0 px-6 pt-[22px] pb-[26px] font-mono text-sm leading-[1.7] break-words whitespace-pre-wrap">
          <code>
            {`$ ${CLI_INSTALL_COMMAND}\n`}
            <span className="out">added 1 package in 3s</span>
            {"\n$ dropitx upload notes.md\n"}
            <span className="out">Uploaded notes.md (6.2 KB)</span>
            {"\n"}
            <span className="out">https://{host}/s/notes-k3f9</span>
            {"\n$ cat log.txt | dropitx text\n"}
            <span className="out">https://{host}/s/log-82mq</span>
            {"\n$ dropitx qr notes-k3f9\n"}
            <span className="out">QR code printed above, scan to open.</span>
          </code>
        </pre>
      </figure>
    </section>
  );
}
