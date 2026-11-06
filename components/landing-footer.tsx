import Link from "next/link";
import { Wordmark } from "@/components/brand-mark";
import { FOOTER_GROUPS, visibleLinks } from "@/components/site/site-links";
import { showPricing } from "@/lib/feature-flags";
import { SITE_URL } from "@/lib/site-url";

/** The design's `site-foot`: the logotype and a note, then the Product, Developers and Account groups. */
export function LandingFooter() {
  const host = new URL(SITE_URL).host;
  const withPricing = showPricing();
  return (
    <footer className="site-foot" data-testid="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Wordmark />
            <p className="foot-note">Markdown and HTML files as pages behind short links.</p>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.id} aria-labelledby={group.id}>
              <h2 id={group.id}>{group.title}</h2>
              <ul>
                {visibleLinks(group.links, withPricing).map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="foot-legal row-between">
          <span>&copy; {new Date().getFullYear()} DropItX</span>
          <span>{host}</span>
        </div>
      </div>
    </footer>
  );
}

/** The shared footer under its design name. */
export { LandingFooter as SiteFooter };
