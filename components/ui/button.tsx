import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Buttons follow the redesign's kit: 8px radius, the display face, a dark solid
  primary (btn-dark), a warm ringed default (btn-primary as `outline`), a quiet
  ghost, and an accent fill whose white label sits on --accent-ink for contrast.
*/
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding font-sans text-sm font-normal tracking-[0.01em] whitespace-normal transition-[color,background-color,border-color,opacity,transform] duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:shadow-[var(--focus-ring)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--fg),var(--bg)_18%)]",
        accent:
          "bg-brand-ink text-white hover:bg-[color-mix(in_oklab,var(--accent-ink),black_10%)]",
        outline:
          "bg-surface-warm text-foreground shadow-[var(--elev-ring)] hover:text-[color-mix(in_oklab,var(--danger),var(--fg)_30%)] aria-expanded:bg-surface aria-expanded:text-foreground",
        secondary:
          "bg-[var(--border-soft)] text-secondary-foreground hover:text-[color-mix(in_oklab,var(--danger),var(--fg)_30%)] aria-expanded:bg-surface aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-[var(--border-soft)] hover:text-foreground aria-expanded:bg-surface aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:outline-destructive",
        link: "text-foreground underline decoration-[var(--meta)] underline-offset-4 hover:decoration-current",
        pill:
          "rounded-full bg-surface text-fg-2 hover:text-[color-mix(in_oklab,var(--danger),var(--fg)_30%)]",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[13px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-1.5 px-5 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
