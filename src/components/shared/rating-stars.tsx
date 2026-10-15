import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          style={{ width: size, height: size }}
          className={cn(star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}
