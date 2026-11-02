import { cn } from "@/lib/utils";

/** A flat grey bar standing in for text of the same size: no shimmer, no pulse. */
export function Bar({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block h-3 rounded-sm bg-raised align-middle", className)} />;
}

const NAME_WIDTHS = ["w-44", "w-36", "w-32", "w-28", "w-40", "w-36"];

/** The Links screen at its final layout while it loads: title, finding, tabs, toolbar, six rows. */
export function LinksSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading links">
      <Bar className="h-7 w-24" />
      <Bar className="mt-2 block h-3.5 w-80 max-w-full" />
      <div className="mb-6 mt-5 flex gap-6 border-b border-border py-3">
        <Bar className="w-10" />
        <Bar className="w-20" />
        <Bar className="w-14" />
      </div>
      <div className="mb-2 flex items-center gap-3">
        <Bar className="h-8 w-[300px] max-w-full rounded-md" />
        <span className="flex-1" />
        <Bar className="h-8 w-28 rounded-md max-sm:hidden" />
      </div>
      <div className="mt-9">
        {NAME_WIDTHS.map((width, i) => (
          <div key={i} className="flex h-[69px] items-center gap-3 border-t border-rule first:border-border">
            <Bar className="size-4" />
            <div className="min-w-0 flex-1">
              <Bar className={cn("block h-3.5", width)} />
              <Bar className="mt-1.5 block w-48 max-w-full" />
            </div>
            <Bar className="w-8" />
            <Bar className="w-14 max-sm:hidden" />
            <Bar className="w-12 max-sm:hidden" />
            <Bar className="h-[22px] w-[72px] rounded-full max-sm:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The whole framed shell while the signed-in layout loads its data. */
export function ShellSkeleton() {
  return (
    <div className="min-h-svh bg-frame md:grid md:grid-cols-[228px_minmax(0,1fr)] md:grid-rows-[48px_minmax(0,1fr)]">
      <div className="hidden flex-col gap-2 px-5 md:row-span-2 md:flex">
        <Bar className="mt-4 h-5 w-24" />
        <div className="mt-6 grid gap-4">
          {["w-16", "w-20", "w-14", "w-20", "w-16"].map((w, i) => (
            <Bar key={i} className={w} />
          ))}
        </div>
      </div>
      <div className="hidden md:block" />
      <div className="flex h-12 items-center px-4 md:hidden">
        <Bar className="h-5 w-24" />
      </div>
      <div className="min-w-0 border-t border-border bg-sheet px-4 pb-8 pt-5 md:mb-2 md:mr-2 md:rounded-2xl md:border md:p-6">
        <LinksSkeleton />
      </div>
    </div>
  );
}
