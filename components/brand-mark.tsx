import Link from "next/link";
import { cn } from "@/lib/utils";

/** The DropItX mark: an ink tile with an accent bar, drawn in CSS (see .brand-mark in site.css). */
export function BrandMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("brand-mark", className)} />;
}

/** The logotype: the mark followed by the name in the display face. */
export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  /** Kept for existing callers; the mark is always shown now. */
  withMark?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("logotype", className)}>
      <BrandMark />
      DropItX
    </Link>
  );
}
