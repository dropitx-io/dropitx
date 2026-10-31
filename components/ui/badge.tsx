import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-normal whitespace-nowrap transition-colors duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-primary/15 text-foreground [a]:hover:bg-primary/8",
        ghost:
          "hover:bg-primary/8 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* File type badges */
        html: "border-primary/15 text-muted-foreground",
        markdown: "border-primary/15 bg-primary/12 text-primary",
        /* Status badges */
        success:
          "bg-success/10 text-success dark:bg-success/20",
        warn:
          "bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning",
        danger:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
        /* Role badges */
        owner: "bg-primary text-primary-foreground",
        editor: "border-primary/15 text-foreground",
        viewer: "bg-secondary text-secondary-foreground",
        admin: "border-primary/15 bg-primary/12 text-primary",
        member: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
