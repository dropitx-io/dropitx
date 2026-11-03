import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { displayS, landingButton, reveal, small } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";
import "@/components/landing/landing.css";

const LINKS = [
  { label: "Developers", href: "/developers" },
  { label: "Search", href: "/search" },
  { label: "Sign in", href: "/auth/login" },
];

const CLI_REPO = "https://github.com/phuongddx/dropitx-cli";

/** The marketing footer: an invitation over the name, cropped by the page edge. */
export function LandingFooter() {
  const host = new URL(SITE_URL).host;
  return (
    <footer className="landing type-page relative mt-(--section-gap) overflow-hidden bg-field pt-[clamp(72px,9vw,128px)] text-field-foreground [&_:focus-visible]:outline-field-foreground">
      <div className="grid grid-cols-12 items-start gap-x-(--gutter) px-(--m) max-[760px]:grid-cols-4">
        <div className="col-span-7 max-[760px]:col-span-full">
          <h2 data-reveal className={displayS}>
            Share the next draft.
          </h2>
          <Link
            href="/auth/login?mode=signup"
            data-reveal
            style={reveal(1)}
            className={cn(landingButton("inverse"), "mt-9 max-[760px]:w-full")}
          >
            Create a free account
          </Link>
        </div>
        <ul
          data-reveal
          style={reveal(2)}
          className="col-span-3 col-start-10 grid gap-2.5 text-(length:--step-body) max-[760px]:col-span-full max-[760px]:col-start-1 max-[760px]:mt-10 max-[760px]:flex max-[760px]:flex-wrap max-[760px]:gap-x-[22px] max-[760px]:gap-y-2 max-[760px]:text-base"
        >
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="underline-offset-[0.22em] hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={CLI_REPO} target="_blank" rel="noreferrer" className="underline-offset-[0.22em] hover:underline">
              GitHub
            </a>
          </li>
        </ul>
      </div>
      <div
        className={cn(
          small,
          "mt-[clamp(96px,12vw,180px)] flex justify-between gap-4 px-(--m) text-(--field-soft)",
        )}
      >
        <span>DropItX, {new Date().getFullYear()}</span>
        <span>{host}</span>
      </div>
      <p className="foot-name" aria-hidden="true">
        DropItX
      </p>
    </footer>
  );
}
