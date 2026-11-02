import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** A rule above the section; off for the first section on a page. */
  rule?: boolean;
  className?: string;
}

/** A settings section: a label column beside its panel, sections split by a rule. One column below 860px. */
export function SettingsRow({ title, description, children, rule = true, className }: SettingsRowProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "grid gap-3 py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-4 md:py-8",
        rule ? "border-t border-rule" : "pt-2 md:pt-2",
        className,
      )}
    >
      <div>
        <h2 className="text-base leading-[22px] font-semibold text-card-foreground">{title}</h2>
        <p className="mt-1 max-w-[40ch] text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 rounded-lg border border-border bg-sheet p-5">{children}</div>
    </section>
  );
}

/** A label, its control and a hint or error under it. */
export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: ReactNode; error?: string | null; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-card-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Text input styled for the sheet: 38px, control-grey border. */
export const INPUT =
  "h-[38px] w-full min-w-0 rounded-md border border-input bg-sheet px-3 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted-foreground aria-invalid:border-destructive";
