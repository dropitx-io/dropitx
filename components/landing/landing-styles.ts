import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "quiet" | "inverse";

const VARIANTS: Record<Variant, string> = {
  solid:
    "border-primary bg-primary text-primary-foreground hover:border-(--accent-hover) hover:bg-(--accent-hover)",
  quiet: "border-foreground bg-transparent text-foreground hover:bg-surface",
  inverse:
    "border-field-foreground bg-field-foreground text-field hover:border-surface hover:bg-surface",
};

/** Square landing buttons: 52px tall (44px small), a 2px edge in their own fill. */
export function landingButton(variant: Variant = "solid", small = false) {
  return cn(
    "press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-2 font-medium leading-none tracking-[0.01em]",
    small ? "min-h-11 px-[18px] text-(length:--step-small)" : "min-h-[52px] px-7 text-(length:--step-body)",
    VARIANTS[variant],
  );
}

/** Underlined text link whose underline darkens on hover. */
export const textLink =
  "underline decoration-[color-mix(in_oklch,currentColor_45%,transparent)] decoration-[0.07em] underline-offset-[0.22em] transition-colors hover:decoration-current";

/** Section statements, one step under the hero's `.display`. */
export const displayS =
  "font-serif font-light tracking-[-0.045em] leading-[0.95] text-(length:--step-display-s)";

/** Body copy and the 36px head step. */
export const body = "text-(length:--step-body) leading-[1.6]";
export const head = "text-(length:--step-head) leading-[1.15] tracking-[-0.015em]";
export const small = "text-(length:--step-small) leading-[1.5] tracking-[0.01em]";

/** Stagger index for `[data-reveal]` entrances. */
export const reveal = (i: number) => ({ "--reveal-i": i }) as CSSProperties;
