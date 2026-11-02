import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar } from "@/components/app-shell/shell-skeleton";

interface PaneProps {
  title: string;
  /** Grey detail beside the title: cursor position, word count. */
  meta?: React.ReactNode;
  /** Controls at the right end of the head. */
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** One framed pane of the editor's split: a 40px head over a body that takes what is left. */
export function Pane({ title, meta, actions, className, bodyClassName, children }: PaneProps) {
  return (
    <section aria-label={title} className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-sheet", className)}>
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-rule px-4">
        <h2 className="shrink-0 text-sm font-medium">{title}</h2>
        {meta && <span className="truncate text-xs tabular-nums text-muted-foreground">{meta}</span>}
        <span className="flex-1" />
        {actions}
      </div>
      <div className={cn("relative min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}

/** The editor at its final layout while the editor or a document loads: flat bars, no pulse. */
export function EditorSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex min-h-0 flex-1 flex-col">
      <Bar className="h-7 w-56" />
      <Bar className="mb-4 mt-2 block h-3.5 w-40" />
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={cn("rounded-lg border border-border p-4", i === 1 && "max-md:hidden")}>
            <Bar className="w-20" />
            <div className="mt-6 grid gap-3">
              {["w-3/4", "w-full", "w-5/6", "w-2/3", "w-full", "w-1/2"].map((w, j) => (
                <Bar key={j} className={cn("block", w)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A document the editor will not open, said inside the editor's own frame. */
export function EditorBlocked({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">Editor</h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">{title}</p>
      <div role="alert" className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border px-3.5 py-3 text-sm">
        <Icon className="size-4 shrink-0 text-destructive" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">{message}</span>
        <a href="/editor" className="inline-flex h-8 items-center rounded-md border border-input px-3 font-medium hover:bg-active">
          Start a new document
        </a>
      </div>
    </div>
  );
}
