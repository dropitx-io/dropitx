import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  className?: string
}

/** A bare KPI: a grey label (with its icon, grey, untinted) over a tabular number. No box. */
export function StatCard({ icon: Icon, value, label, className }: StatCardProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 truncate text-2xl font-medium tabular-nums tracking-[-0.01em] text-card-foreground">
        {typeof value === "number" ? value.toLocaleString("en") : value}
      </p>
    </div>
  )
}
