import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

interface BrandLoaderProps {
  title: string;
  description?: string;
  fullScreen?: boolean;
  delayed?: boolean;
  className?: string;
}

export function BrandLoader({ title, description, fullScreen = false, delayed = false, className }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex animate-fade-in flex-col items-center justify-center gap-6 px-6 text-center",
        fullScreen && "fixed inset-0 z-90 bg-background",
        delayed && "[animation-delay:160ms]",
        className
      )}
    >
      {fullScreen && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]"
        />
      )}
      <div className="relative size-20">
        <svg viewBox="0 0 80 80" aria-hidden className="absolute inset-0 animate-spin-slow">
          <circle cx="40" cy="40" r="37" fill="none" strokeWidth="2" className="stroke-border" />
          <circle cx="40" cy="40" r="37" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="58 175" className="stroke-primary" />
        </svg>
        <LogoMark animated className="absolute inset-0 m-auto size-11" />
      </div>
      <div className="relative space-y-1.5">
        <p className="font-display text-xl font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div aria-hidden className="relative h-1 w-44 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-progress rounded-full bg-primary" />
      </div>
    </div>
  );
}
