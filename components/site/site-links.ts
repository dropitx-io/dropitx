/**
 * Link data for the shared site navigation and footer. Every internal href
 * points at a route that exists under app/ (or an anchor on the landing page),
 * which components/site/site-links.test.mjs checks.
 */

export type SiteLink = {
  label: string;
  href: string;
  /** Shown only while the pricing switch is on (lib/feature-flags.ts). */
  pricing?: boolean;
  /** Leaves the site (opens the CLI repository). */
  external?: boolean;
};

export type FooterGroup = { id: string; title: string; links: SiteLink[] };

export const CLI_REPO_URL = "https://github.com/phuongddx/dropitx-cli";

export const SIGN_IN_HREF = "/auth/login";
export const SIGN_UP_HREF = "/auth/login?mode=signup";
export const DASHBOARD_HREF = "/dashboard";

/** The top bar's section links, in the design's order. */
export const NAV_LINKS: SiteLink[] = [
  { label: "How it works", href: "/#how" },
  { label: "Protection", href: "/#protect" },
  { label: "Pricing", href: "/#pricing", pricing: true },
  { label: "Developers", href: "/developers" },
];

/** The footer's three link groups: Product, Developers and Account. */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    id: "foot-product",
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Protection", href: "/#protect" },
      { label: "Pricing", href: "/#pricing", pricing: true },
      { label: "Questions", href: "/#faq" },
      { label: "Editor", href: "/editor" },
    ],
  },
  {
    id: "foot-dev",
    title: "Developers",
    links: [
      { label: "CLI guide", href: "/developers#install" },
      { label: "MCP server", href: "/developers#mcp" },
      { label: "API keys", href: "/developers#keys" },
      { label: "GitHub", href: CLI_REPO_URL, external: true },
    ],
  },
  {
    id: "foot-account",
    title: "Account",
    links: [
      { label: "Sign in", href: SIGN_IN_HREF },
      { label: "Create an account", href: SIGN_UP_HREF },
      { label: "Dashboard", href: DASHBOARD_HREF },
      { label: "Profile and API keys", href: "/dashboard/profile" },
      { label: "Search shared pages", href: "/search" },
    ],
  },
];

/** Drops the Pricing entries unless the pricing switch is on. */
export function visibleLinks(links: SiteLink[], withPricing: boolean): SiteLink[] {
  return links.filter((link) => withPricing || !link.pricing);
}
