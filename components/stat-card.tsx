import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  className?: string
}

export function StatCard({ icon: Icon, value, label, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-[var(--radius-card)] border border-border/60 bg-card px-5 py-4 transition-[color,background-color,border-color,opacity,transform] duration-300 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="tabular-nums text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  )
}
