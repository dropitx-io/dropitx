import type { ReactNode } from "react";

interface TitleRowProps {
  title: ReactNode;
  /** One line computed from the data on screen. */
  finding?: ReactNode;
  /** Small trail above the title, e.g. a breadcrumb. */
  crumb?: ReactNode;
  /** Content under the title, before the finding. */
  meta?: ReactNode;
  actions?: ReactNode;
}

/** A page's title row inside the sheet: a 24px noun, an optional finding line, actions on the right. */
export function TitleRow({ title, finding, crumb, meta, actions }: TitleRowProps) {
  return (
    <div className="mb-5">
      {crumb && <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">{crumb}</nav>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl leading-[30px] font-semibold text-card-foreground">{title}</h1>
          {meta}
          {finding && <p className="mt-1 text-sm text-muted-foreground [&_b]:font-medium [&_b]:text-card-foreground">{finding}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
