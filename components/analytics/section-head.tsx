import type { ReactNode } from "react";

interface SectionHeadProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned: a count, a stamp or a link. */
  aside?: ReactNode;
  id?: string;
}

/** A block's 16px heading with an optional grey line under it. */
export function SectionHead({ title, description, aside, id }: SectionHeadProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <div className="grid min-w-0 gap-0.5">
        <h2 id={id} className="text-base leading-[22px] font-medium text-card-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {aside && <div className="shrink-0 text-xs text-muted-foreground">{aside}</div>}
    </div>
  );
}
