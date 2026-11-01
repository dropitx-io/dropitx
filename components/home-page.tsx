import Link from "next/link";
import { LandingFooter } from "@/components/landing-footer";
import { cn } from "@/lib/utils";
import { CLI_INSTALL_COMMAND } from "@/lib/cli-install";
import {
  Zap,
  Lock,
  BarChart3,
  ArrowRight,
  Upload,
  ShieldCheck,
  Eye,
  Check,
} from "lucide-react";

const STEPS = [
  {
    num: "1",
    title: "Drop or write",
    body: "Upload a Markdown/HTML file, or compose one in the built-in editor.",
  },
  {
    num: "2",
    title: "Set the rules",
    body: "Add a password, an expiry, or burn-after-reading — optional, one toggle each.",
  },
  {
    num: "3",
    title: "Share & track",
    body: "Copy the link. Watch views, referrers, and reads roll into your dashboard.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant links",
    body: "Drag a file, get a shareable URL before you blink. No folders, no exports — just a link that renders perfectly.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Password gates, expiry dates, and burn-after-reading. Share sensitive drafts without leaving them exposed.",
  },
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Views over time, referrers, and top performers — know which links land and which need a nudge.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    desc: "For quick, occasional shares.",
    features: ["Up to 10 active links", "1 GB storage", "Basic view counts"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    desc: "For creators sharing every day.",
    features: ["Unlimited links", "5 GB storage", "Full analytics + referrers", "Passwords, expiry, burn"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    desc: "For teams sharing together.",
    features: ["Everything in Pro", "Shared team spaces", "Roles & invites"],
    cta: "Start a team",
    featured: false,
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-background/86 backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-[1120px] items-center gap-5 px-8 py-4 max-[640px]:px-4">
          <Link href="/" className="flex items-center gap-3 font-extrabold tracking-[-0.02em]">
            <span className="grid size-[34px] place-items-center rounded-[14px] bg-primary text-primary-foreground clay-raised">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </span>
            Drop<span className="text-primary">ItX</span>
          </Link>
          <div className="ml-3.5 hidden gap-1.5 min-[860px]:flex">
            <Link href="#features" className="rounded-full px-3.5 py-2 text-sm font-semibold text-fg-soft transition-colors hover:bg-card hover:text-foreground">Features</Link>
            <Link href="#how" className="rounded-full px-3.5 py-2 text-sm font-semibold text-fg-soft transition-colors hover:bg-card hover:text-foreground">How it works</Link>
            <Link href="#pricing" className="rounded-full px-3.5 py-2 text-sm font-semibold text-fg-soft transition-colors hover:bg-card hover:text-foreground">Pricing</Link>
            <Link href="/editor" className="rounded-full px-3.5 py-2 text-sm font-semibold text-fg-soft transition-colors hover:bg-card hover:text-foreground">Editor</Link>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center rounded-full bg-card px-4.5 text-sm font-semibold clay-raised transition-transform hover:-translate-y-px"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-primary px-4.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto grid max-w-[1120px] grid-cols-[1.05fr_0.95fr] gap-12 px-8 py-18 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[640px]:px-4">
        <div className="max-[860px]:text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-meta clay-raised mb-5.5">
            <span className="size-[7px] rounded-full bg-success" />
            Markdown &amp; HTML sharing
          </span>
          <h1 className="font-display text-[clamp(40px,6vw,68px)] font-black leading-[1.02] tracking-[-0.035em]">
            Drop files.<br />
            <span className="text-primary">Share instantly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-[19px] leading-[1.55] text-muted-foreground max-[860px]:mx-auto">
            Turn any Markdown or HTML file into a beautiful, trackable public link in one drag. Passwords, expiry, burn-after-reading — all built in.
          </p>
          <div className="mt-7.5 flex flex-wrap gap-3 max-[860px]:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-primary px-6.5 text-[15px] font-bold text-primary-foreground transition-transform hover:-translate-y-px"
            >
              Start sharing free
              <ArrowRight className="size-[17px]" />
            </Link>
            <Link
              href="/editor"
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-card px-6.5 text-[15px] font-bold clay-raised transition-transform hover:-translate-y-px"
            >
              Open editor
            </Link>
          </div>
          <div className="mt-6.5 flex gap-5.5 font-mono text-xs tracking-[0.02em] text-muted-foreground max-[860px]:justify-center">
            <span><b className="font-bold text-foreground">50 MB</b> max per file</span>
            <span><b className="font-bold text-foreground">12,847</b> links live</span>
            <span><b className="font-bold text-foreground">No card</b> to start</span>
          </div>
        </div>

        {/* Hero drop card */}
        <div className="rounded-[34px] bg-card p-6.5 clay-raised">
          <div className="rounded-[22px] border-2 border-dashed border-border bg-background p-8.5 text-center">
            <div className="mx-auto mb-3.5 grid size-14 place-items-center rounded-[22px] bg-primary/16 text-primary clay-raised">
              <Upload className="size-6.5" />
            </div>
            <p className="text-base font-bold">Drop a file to share</p>
            <p className="mt-1 text-[13px] text-muted-foreground">.md · .markdown · .html — up to 50 MB</p>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-background p-3 clay-raised">
            <span className="grid size-8.5 shrink-0 place-items-center rounded-[11px] bg-primary/9 text-primary">
              <Upload className="size-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">project-proposal.md</p>
              <p className="font-mono text-[11px] text-muted-foreground">45.2 KB · uploaded</p>
            </div>
            <span className="ml-auto font-mono text-[11px] font-semibold text-primary">Copy link ↗</span>
          </div>
        </div>
      </header>

      {/* Features / proof */}
      <section id="features" className="mx-auto max-w-[1120px] px-8 py-16 max-[640px]:px-4">
        <div className="mx-auto mb-11 max-w-[60ch] text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-meta">Why DropItX</p>
          <h2 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.03em]">
            Sharing that respects your work.
          </h2>
          <p className="mt-2.5 text-[17px] text-muted-foreground">
            Every link is fast, private by default, and tells you exactly who&apos;s reading.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5 max-[860px]:grid-cols-1">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[22px] bg-card p-6.5 clay-raised">
              <div className="mb-4 grid size-[46px] place-items-center rounded-[14px] bg-primary/16 text-primary clay-raised">
                <f.icon className="size-[22px]" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.01em]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-[1.55] text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1120px] px-8 py-16 max-[640px]:px-4">
        <div className="mx-auto mb-11 max-w-[60ch] text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-meta">Three steps</p>
          <h2 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.03em]">
            From file to link in seconds.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 max-[860px]:grid-cols-1">
          {STEPS.map((s) => (
            <div key={s.num} className="rounded-[22px] bg-card p-6 clay-raised">
              <div className="mb-3.5 grid size-7.5 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                {s.num}
              </div>
              <h4 className="text-base font-bold">{s.title}</h4>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-[1120px] px-8 py-16 max-[640px]:px-4">
        <div className="mx-auto mb-11 max-w-[60ch] text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-meta">Pricing</p>
          <h2 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.03em]">
            Start free. Grow when you do.
          </h2>
        </div>
        <div className="grid grid-cols-3 items-start gap-5 max-[860px]:grid-cols-1">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={cn(
                "flex flex-col gap-1.5 rounded-[34px] bg-card p-7.5 px-6.5 clay-raised",
                p.featured && "outline-2 outline-offset-[-2px] outline-primary"
              )}
            >
              {p.featured && (
                <span className="mb-1 inline-flex w-fit items-center rounded-full bg-primary/16 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.05em] text-primary">
                  Most popular
                </span>
              )}
              <p className="font-mono text-[11px] uppercase tracking-[0.07em] text-meta">{p.name}</p>
              <div className="font-display text-[44px] font-black leading-none tracking-[-0.03em]">
                {p.price}<small className="ml-1 text-[15px] font-semibold text-muted-foreground">/mo</small>
              </div>
              <p className="mb-4 mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mb-5.5 flex flex-col gap-2.75">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-fg-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.4} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-bold transition-transform hover:-translate-y-px",
                  p.featured
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground clay-raised"
                )}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* For developers */}
      <section className="mx-auto max-w-[1120px] px-8 py-16 max-[640px]:px-4">
        <div className="grid grid-cols-[1.05fr_0.95fr] items-center gap-12 max-[860px]:grid-cols-1 max-[860px]:gap-8">
          <div className="max-[860px]:text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-meta">For developers</p>
            <h2 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.03em]">
              DropItX has a CLI.
            </h2>
            <p className="mt-2.5 max-w-[44ch] text-[17px] leading-[1.55] text-muted-foreground max-[860px]:mx-auto">
              Upload, share, and manage links straight from the terminal — works standalone or piped from stdin.
            </p>
            <div className="mt-5.5 flex flex-wrap items-center gap-3 max-[860px]:justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 font-mono text-[13px] clay-raised">
                $ {CLI_INSTALL_COMMAND}
              </span>
            </div>
            <div className="mt-6.5 max-[860px]:flex max-[860px]:justify-center">
              <Link
                href="/developers"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-transform hover:-translate-y-px"
              >
                See developer docs
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Terminal mock */}
          <div className="rounded-[22px] bg-card p-6.5 clay-raised">
            <div className="mb-4 flex items-center gap-2" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-destructive/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
            </div>
            <div className="flex flex-col gap-2 font-mono text-[13px] leading-[1.6]" aria-hidden="true">
              <p>$ dropitx upload notes.md</p>
              <p className="text-muted-foreground">uploading 45.2 KB…</p>
              <p className="text-primary">→ dropitx.site/s/notes-9fh2</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1120px] px-8 py-9 max-[640px]:px-4">
        <div className="rounded-[34px] bg-primary px-10 py-14 text-center text-primary-foreground clay-raised">
          <h2 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold tracking-[-0.03em]">
            Your next link is one drop away.
          </h2>
          <p className="mt-3 text-[17px] opacity-90">Free to start. No credit card. Cancel anytime.</p>
          <Link
            href="/dashboard"
            className="mt-6.5 inline-flex h-12 items-center rounded-full bg-card px-6.5 text-[15px] font-bold text-primary transition-transform hover:-translate-y-px"
          >
            Drop your first file →
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
