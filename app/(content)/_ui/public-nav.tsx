import Link from "next/link";
import { Wordmark } from "@/components/brand-mark";
import { NavAccount } from "@/components/site/nav-account";
import { NAV_LINKS, visibleLinks } from "@/components/site/site-links";
import { showPricing } from "@/lib/feature-flags";

interface PublicNavProps {
  /** The href of the page this nav sits on, marked as the current page. */
  current?: string;
  /** Show the account links (off on the auth pages themselves). */
  withAuth?: boolean;
  /** Show the section links (off where the page is a single task, like an invite). */
  withLinks?: boolean;
  /** Where the skip link jumps; defaults to the page's <main id="main">. */
  skipTo?: string;
}

/**
 * The design's `site-nav`: a sticky 64px bar with the logotype, the section
 * links, and the account links (or the dashboard when signed in). Below 860px
 * the section links move into a disclosure menu that needs no script.
 */
export function PublicNav({ current, withAuth = true, withLinks = true, skipTo = "#main" }: PublicNavProps) {
  const links = visibleLinks(NAV_LINKS, showPricing());
  return (
    <header className="site-nav" data-testid="site-nav">
      <a className="skip" href={skipTo}>
        Skip to content
      </a>
      <div className="wrap">
        <Wordmark />
        {withLinks && (
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={current === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {withAuth && (
          <div className="nav-end">
            <NavAccount />
          </div>
        )}
        {withLinks && (
          <details className="nav-menu">
            <summary data-testid="site-nav-menu-button">Menu</summary>
            <ul className="nav-menu-panel">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={current === l.href ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </header>
  );
}
