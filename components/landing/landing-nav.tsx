import Link from "next/link";
import { Wordmark } from "@/components/brand-mark";
import { landingButton } from "@/components/landing/landing-styles";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Developers", href: "/developers" },
  { label: "Questions", href: "#faq" },
];

const navLink =
  "py-2.5 text-(length:--step-small) underline-offset-[0.25em] hover:underline";

export function LandingNav() {
  return (
    <header className="flex h-[72px] items-center gap-[clamp(16px,2.4vw,36px)] px-(--m)">
      <Wordmark className="mr-auto py-2 text-[22px] tracking-[-0.02em]" />
      <ul className="hidden gap-[clamp(16px,2.2vw,32px)] min-[861px]:flex">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={navLink}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-5">
        <Link href="/auth/login" className={navLink}>
          Sign in
        </Link>
        <Link href="/auth/login?mode=signup" className={landingButton("quiet", true)}>
          Sign up
        </Link>
      </div>
    </header>
  );
}
