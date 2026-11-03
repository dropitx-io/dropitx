import Link from "next/link";
import { Wordmark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { gutter, squareButton } from "./public-styles";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Developers", href: "/developers" },
  { label: "Search", href: "/search" },
];

const navLink = "py-2.5 text-[14px] underline-offset-[0.25em] hover:underline aria-[current=page]:underline";

interface PublicNavProps {
  /** The href of the page this nav sits on, marked as the current page. */
  current?: string;
  /** Show the sign-in and sign-up links (off on the auth pages themselves). */
  withAuth?: boolean;
  /** Show the section links (off where the page is a single task, like an invite). */
  withLinks?: boolean;
}

/** The top bar of the public pages: wordmark, section links, sign in and sign up. */
export function PublicNav({ current, withAuth = true, withLinks = true }: PublicNavProps) {
  return (
    <header className={cn(gutter, "relative flex h-[72px] shrink-0 items-center gap-[clamp(16px,2.4vw,36px)]")}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:bg-foreground focus:px-4 focus:py-3 focus:text-background"
      >
        Skip to content
      </a>
      <Wordmark className="mr-auto py-2 text-[22px] tracking-[-0.02em]" />
      {withLinks && (
        <ul className="hidden gap-[clamp(16px,2.2vw,32px)] min-[861px]:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={current === l.href ? "page" : undefined} className={navLink}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {withAuth && (
        <div className="flex items-center gap-5">
          <Link href="/auth/login" className={navLink}>
            Sign in
          </Link>
          <Link href="/auth/login?mode=signup" className={squareButton("quiet", "small")}>
            Sign up
          </Link>
        </div>
      )}
    </header>
  );
}
