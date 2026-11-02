import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

/** An empty block that keeps its frame: a dashed edge, a grey icon, a title and one sentence. */
export function EmptyStateCard({ icon: Icon, title, description, className }: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-1 rounded-lg border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground",
        className
      )}
    >
      <Icon className="mb-1 size-5" strokeWidth={1.5} aria-hidden />
      <p className="font-medium text-card-foreground">{title}</p>
      {description && <p className="max-w-sm">{description}</p>}
    </div>
  )
}
