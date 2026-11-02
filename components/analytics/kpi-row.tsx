import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Kpi {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  /** The answer figure, set a step larger. */
  lead?: boolean;
}

/** Bare KPIs on a fixed pitch: a grey label over a figure, no boxes or icons. Two columns on a phone. */
export function KpiRow({ items, className }: { items: Kpi[]; className?: string }) {
  return (
    <dl className={cn("mb-8 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4", className)}>
      {items.map((k) => (
        <div key={k.label} className="min-w-0">
          <dt className="text-sm text-muted-foreground">{k.label}</dt>
          <dd
            className={cn(
              "mt-1 truncate font-normal text-card-foreground tabular-nums [&_small]:ml-1 [&_small]:text-sm [&_small]:text-muted-foreground",
              k.lead ? "text-2xl leading-[30px] sm:text-[30px] sm:leading-9" : "text-2xl leading-[30px]",
            )}
          >
            {k.value}
          </dd>
          {k.note && <dd className="mt-0.5 text-xs text-muted-foreground">{k.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
