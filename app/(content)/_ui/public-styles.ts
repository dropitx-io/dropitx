import { cn } from "@/lib/utils";

/*
  Class recipes for the public pages that sit outside the landing page:
  developers, sign-in, the share view, search, invites, profiles and the
  error screens. One serif face, five type steps, square controls, and one
  outer margin on every side.
*/

/** Page root: Newsreader, bone ground, olive ink, at least the small viewport tall. */
export const page = "type-page flex min-h-svh flex-col bg-background text-foreground";

/** The outer margin, the same on both sides at every width. */
export const gutter = "px-[clamp(16px,2.4vw,32px)]";

/** Column gap of the 12 (desktop) / 4 (phone) column grid. */
export const grid =
  "grid grid-cols-4 gap-x-[clamp(12px,1.6vw,24px)] min-[861px]:grid-cols-12";

/** Section statements and page titles one step under the landing hero. */
export const displayS =
  "font-serif font-light text-[clamp(44px,8vw,132px)] leading-[0.95] tracking-[-0.045em]";

/** The hero step. */
export const display =
  "font-serif font-light text-[clamp(72px,10.5vw,168px)] leading-[0.9] tracking-[-0.05em]";

export const head = "text-[clamp(24px,1.3rem+1.1vw,36px)] leading-[1.15] tracking-[-0.015em]";
export const body = "text-[clamp(18px,1.05rem+0.3vw,21px)] leading-[1.6]";
export const small = "text-[clamp(13px,0.79rem+0.1vw,14px)] leading-[1.5] tracking-[0.01em]";

/** Underlined text link whose underline darkens on hover. */
export const textLink =
  "underline decoration-[color-mix(in_oklch,currentColor_45%,transparent)] decoration-[0.07em] underline-offset-[0.22em] transition-colors hover:decoration-current";

type ButtonVariant = "solid" | "quiet" | "inverse";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  solid: "border-transparent bg-primary text-primary-foreground hover:bg-primary/88",
  quiet: "border-foreground bg-transparent text-foreground hover:bg-surface",
  inverse: "border-transparent bg-field-foreground text-field hover:bg-surface",
};

/** Square buttons: 52px tall (44px small) with a 2px edge. Works on <button>, <a> and <Link>. */
export function squareButton(variant: ButtonVariant = "solid", size: "default" | "small" = "default") {
  return cn(
    "press inline-flex shrink-0 items-center justify-center gap-2 rounded-none border-2 font-medium leading-none whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-55 aria-busy:cursor-progress",
    size === "small" ? "min-h-11 px-[18px] text-[14px]" : "min-h-[52px] px-7 text-[clamp(18px,1.05rem+0.3vw,21px)]",
    BUTTON_VARIANTS[variant],
  );
}

/** Text fields on public pages: square, 52px tall, a 2px edge that darkens on hover and focus. */
export const field =
  "h-auto min-h-[52px] rounded-none border-2 border-[color-mix(in_oklch,var(--foreground)_45%,var(--background))] bg-card px-4 text-[clamp(18px,1.05rem+0.3vw,21px)] md:text-[clamp(18px,1.05rem+0.3vw,21px)] hover:border-foreground focus-visible:border-foreground";

/** A filled notice block (no outline): error, success or caution. */
export const notice = {
  error: "bg-pill-negative px-5 py-4 text-pill-negative-foreground",
  success: "bg-pill-positive px-5 py-4 text-pill-positive-foreground",
  warning: "bg-pill-warning px-5 py-4 text-pill-warning-foreground",
};
