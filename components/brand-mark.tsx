import Link from "next/link";
import { cn } from "@/lib/utils";

/** The DropItX mark: a drop falling into a tray, drawn in currentColor. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-5 shrink-0", className)}>
      <path
        d="M3.5 13.5v4.25A2.25 2.25 0 0 0 5.75 20h12.5a2.25 2.25 0 0 0 2.25-2.25V13.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 2.75s-3.6 4.1-3.6 6.85a3.6 3.6 0 0 0 7.2 0C15.6 6.85 12 2.75 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** The wordmark in the brand face, optionally preceded by the mark. */
export function Wordmark({
  href = "/",
  withMark = false,
  className,
}: {
  href?: string;
  withMark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-serif text-lg font-medium tracking-[-0.01em]", className)}
    >
      {withMark && <BrandMark />}
      DropItX
    </Link>
  );
}
