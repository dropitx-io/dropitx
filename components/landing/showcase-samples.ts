/** Example documents for the landing studio, as the chips load them. */
export type Sample = { label: string; file: string; text: string };

export const SAMPLES: Sample[] = [
  {
    label: "Release notes",
    file: "release-notes.md",
    text: [
      "# Release notes v1.4",
      "",
      "Shipped on Monday 2 November 2026.",
      "",
      "## What changed",
      "- The reader view is easier on the eyes in long documents.",
      "- CSV export is faster on tables over 10,000 rows.",
      "- Fixed: sign-in no longer loops on Safari 18.",
      "",
      "> Thanks to everyone who sent a report with steps to reproduce.",
    ].join("\n"),
  },
  {
    label: "Incident review",
    file: "q3-incident-review.md",
    text: [
      "# Q3 incident review",
      "",
      "Checkout failed for **38 minutes** on 14 August after a certificate expired on the payments proxy.",
      "",
      "## What we changed",
      "- Certificates renew 30 days early.",
      "- A failed renewal pages the team.",
      "- The proxy runs a health check on every deploy.",
      "",
      "> Nobody did anything wrong here. The renewal job had been failing quietly since June.",
    ].join("\n"),
  },
  {
    label: "Reading list",
    file: "reading-list.md",
    text: [
      "## Reading list for Friday",
      "",
      "1. *Thinking in Systems*, Donella Meadows",
      "2. *Designing Data-Intensive Applications*, Martin Kleppmann",
      "3. *The Pragmatic Programmer*, David Thomas and Andrew Hunt",
      "",
      "Start with chapter 3 of Kleppmann; we talk about it at `16:00`.",
    ].join("\n"),
  },
];
