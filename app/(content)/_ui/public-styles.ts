import { cn } from "@/lib/utils";

/*
  Class recipes for the public pages outside the landing page: developers,
  sign-in, the share view, search, invites, profiles and the error screens.
  They map onto the redesign's kit in components/site/site.css (the `site`
  root, the 1200px `wrap`, `btn` buttons, `field-input` fields) so every page
  that imports them shares one look. The export names are kept stable.
*/

/** Page root: the design's ground, ink and body serif, at least the small viewport tall. */
export const page = "site";

/** The 1200px content column with the design's side gutters (24px, 16px under 900px). */
export const gutter = "wrap";

/** Column gap of the 12 (desktop) / 4 (phone) column grid. */
export const grid = "grid grid-cols-4 gap-x-6 min-[861px]:grid-cols-12";

/** Page titles: the auth/status title step in the display face. */
export const displayS =
  "font-sans font-normal text-[clamp(32px,1rem+2.4vw,48px)] leading-[1.12] tracking-[-0.025em] text-foreground";

/** The hero step (72px at its widest). */
export const display = "h-hero";

/** Section and card headings. */
export const head = "font-sans font-normal text-xl leading-[1.3] tracking-[-0.005em]";

/** Reading text at the design's body size. */
export const body = "text-[1.08rem] leading-[1.5]";

/** UI captions and labels in the display face. */
export const small = "font-sans text-sm leading-[1.5] tracking-[0.01em]";

/** Underlined text link whose underline darkens on hover. */
export const textLink =
  "underline decoration-[var(--meta)] decoration-1 underline-offset-[0.2em] transition-colors hover:decoration-current hover:text-[color-mix(in_oklab,var(--danger),var(--fg)_30%)]";

type ButtonVariant = "solid" | "quiet" | "inverse" | "accent";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // The one solid action per screen.
  solid: "btn-dark",
  // The design's default button: warm surface with a ring.
  quiet: "btn-primary",
  // Ghost button for secondary actions.
  inverse: "btn-secondary",
  // Accent fill for emphasis (white on --accent-ink).
  accent: "btn-accent",
};

/**
 * The design's buttons (8px radius, display face): `solid` is btn-dark,
 * `quiet` btn-primary, `inverse` btn-secondary, `accent` btn-accent; `default`
 * is the 48px large size, `small` the 44px one. Works on <button>, <a> and <Link>.
 * (The name is kept from the earlier square buttons so callers do not change.)
 */
export function squareButton(variant: ButtonVariant = "solid", size: "default" | "small" = "default") {
  return cn("btn shrink-0", BUTTON_VARIANTS[variant], size === "default" && "btn-lg", "disabled:pointer-events-none");
}

/** Text fields on public pages: 44px, 8px radius, a hairline that darkens on hover and focus. */
export const field = "field-input w-full";

/** A filled notice block: error, success or caution. */
export const notice = {
  error: "notice notice-error",
  success: "notice notice-success",
  warning: "notice notice-warning",
};
