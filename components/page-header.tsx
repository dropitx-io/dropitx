import { cn } from "@/lib/utils"

interface PageHeaderProps {
  /** A short grey crumb above the title, in sentence case. */
  eyebrow?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

/** A screen's title row: a 24px noun title, an optional finding line, actions on the right. */
export function PageHeader({ eyebrow, title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}
