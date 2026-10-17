import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted before:absolute before:inset-0 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent dark:before:via-white/[0.06]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
