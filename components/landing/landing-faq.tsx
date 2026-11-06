import Link from "next/link";
import { reveal } from "@/components/landing/reveal";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";

const QUESTIONS: Array<{ q: string; a: React.ReactNode[] }> = [
  { q: "Which files can I share?", a: ["Markdown (.md) and HTML files become rendered pages. Plain text, PDFs, Office documents, images, audio, video and archives can be shared too, as files to open or download."] },
  { q: "How big can a file be?", a: ["Up to 50 MB per file. Free accounts hold 1 GB in total, Pro 5 GB."] },
  { q: "How does burn after reading work?", a: ["The first time someone opens the link, the page is shown and the share is marked as burned. Anyone who opens it after that is told it is gone."] },
  {
    q: "What does encryption protect?",
    a: [
      "Your browser encrypts the file with AES-256-GCM before it uploads. The key travels in the link after the #, a part of the address browsers never send to a server, so we store only ciphertext.",
      "Lose the link and the file cannot be recovered, by you or by us.",
    ],
  },
  {
    q: "Can I use it from a terminal or an agent?",
    a: [<>Yes. Install it with <code>{CLI_INSTALL_COMMAND}</code>, set a personal (shk_) or team (sht_) API key, then upload or pipe text. The same package runs as an MCP server for agents.</>],
  },
  {
    q: "Can I delete a link before it expires?",
    a: [<>Yes. Open it in your dashboard and choose Delete, or call <code>DELETE /api/v1/documents/&lt;id&gt;</code> with your API key. The link stops working at once.</>],
  },
];

/** "Questions": native <details> disclosures, so they open without script. */
export function LandingFaq() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq">
        <div data-reveal>
          <h2 className="h-section" id="faq-title">Questions</h2>
          <p className="lead mt-3">
            Something else? The <Link href="/developers">developer guide</Link> covers the CLI, MCP and keys.
          </p>
        </div>
        <div className="faq-list" data-reveal style={reveal(1)}>
          {QUESTIONS.map((item) => (
            <details key={item.q} className="qa">
              <summary>{item.q}</summary>
              {item.a.map((answer, i) => (
                <p key={i} className="answer">{answer}</p>
              ))}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
