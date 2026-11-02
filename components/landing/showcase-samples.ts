import type { Block } from "@/components/landing/markdown-line";

export type Sample = { label: string; line: string; file: string; body: Block[] };

/** Example documents for the typed-line preview. Bodies use the same inline Markdown as the line. */
export const SAMPLES: Sample[] = [
  {
    label: "Release notes",
    line: "# Release notes v1.4",
    file: "release-notes.md",
    body: [
      { type: "p", text: "Shipped on Monday 2 November 2026." },
      {
        type: "ul",
        items: [
          "The reader view follows your system's dark mode.",
          "CSV export is faster on tables over 10,000 rows.",
          "Fixed: sign-in no longer loops on Safari 18.",
        ],
      },
      { type: "p", text: "Thanks to everyone who sent a report with steps to reproduce." },
    ],
  },
  {
    label: "Incident review",
    line: "# Q3 incident review",
    file: "q3-incident-review.md",
    body: [
      {
        type: "p",
        text: "Checkout failed for 38 minutes on 14 August after a certificate expired on the payments proxy.",
      },
      { type: "h3", text: "What we changed" },
      {
        type: "ul",
        items: [
          "Certificates renew 30 days early and page on failure.",
          "The proxy now has a health check on every deploy.",
        ],
      },
    ],
  },
  {
    label: "Reading list",
    line: "## Reading list for Friday",
    file: "reading-list.md",
    body: [
      {
        type: "ul",
        items: [
          "*Thinking in Systems*, Donella Meadows",
          "*Designing Data-Intensive Applications*, Martin Kleppmann",
          "*The Pragmatic Programmer*, David Thomas and Andrew Hunt",
        ],
      },
      { type: "p", text: "Chapter 3 of Kleppmann first; we will talk about it at 16:00." },
    ],
  },
];
