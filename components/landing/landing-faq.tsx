import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import { body, displayS, head, textLink } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

const inlineCode = "text-[0.86em] whitespace-nowrap";

const QUESTIONS: { q: string; a: ReactNode[] }[] = [
  {
    q: "Which files can I share?",
    a: [
      "Markdown (.md) and HTML files become rendered pages. Plain text, PDFs, Office documents, images, audio, video and archives can be shared too, as files to open or download.",
    ],
  },
  { q: "How big can a file be?", a: ["Up to 50 MB per file. Free accounts hold 1 GB in total, Pro 5 GB."] },
  {
    q: "How does burn after reading work?",
    a: [
      "The first time someone opens the link, the page is shown and the share is marked as burned. Anyone who opens it after that is told it is gone.",
    ],
  },
  {
    q: "What does encryption protect?",
    a: [
      "Your browser encrypts the file with AES-256-GCM before it uploads. The key travels in the link after the #, a part of the address browsers never send to a server, so we store only ciphertext.",
      "Lose the link and the file cannot be recovered, by you or by us.",
    ],
  },
  {
    q: "Can I use it from a terminal or an agent?",
    a: [
      <>
        Yes. Install the CLI with <code className={inlineCode}>{CLI_INSTALL_COMMAND}</code>, set a personal (shk_) or
        team (sht_) API key, then upload or pipe text. The same package runs as an MCP server for agents.{" "}
        <Link href="/developers" className={textLink}>
          See the developer guide.
        </Link>
      </>,
    ],
  },
  {
    q: "Can I delete a link before it expires?",
    a: [
      <>
        Yes. Open it in your dashboard and choose Delete, or call{" "}
        <code className={inlineCode}>DELETE /api/v1/documents/&lt;slug&gt;</code> with your API key. The link stops
        working at once.
      </>,
    ],
  },
];

/** A wide heading, then the questions set in from the left. */
export function LandingFaq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mt-(--section-gap) px-(--m)">
      <h2 id="faq-title" data-reveal className={displayS}>
        Questions, answered.
      </h2>
      <div className="grid grid-cols-12 gap-x-(--gutter) max-[760px]:grid-cols-4">
        <div className="col-span-8 col-start-5 mt-20 grid gap-9 max-[760px]:col-span-full max-[760px]:col-start-1 max-[760px]:mt-10 max-[760px]:gap-7">
          {QUESTIONS.map(({ q, a }) => (
            <details
              key={q}
              data-reveal
              className="group -mx-[min(24px,var(--m))] px-[min(24px,var(--m))] transition-colors duration-200 open:bg-surface open:py-6"
            >
              <summary
                className={cn(
                  head,
                  "flex min-h-11 cursor-pointer list-none items-baseline justify-between gap-6 hover:underline hover:decoration-[0.05em] hover:underline-offset-[0.18em] group-open:hover:no-underline [&::-webkit-details-marker]:hidden",
                )}
              >
                {q}
                <ChevronDown
                  aria-hidden="true"
                  className="size-[0.6em] flex-none translate-y-[0.05em] transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              {a.map((p, i) => (
                <p key={i} className={cn(body, "max-w-[48ch]", i === 0 ? "mt-3.5" : "mt-2.5")}>
                  {p}
                </p>
              ))}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
