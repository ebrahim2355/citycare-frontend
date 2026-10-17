import Link from "next/link";
import { cn } from "@/lib/utils";

type Surface = "auto" | "dark";

export function LogoMark({ surface = "auto", className }: { surface?: Surface; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8"
        strokeWidth="1"
        className={surface === "dark" ? "fill-white/10 stroke-white/15" : "fill-navy stroke-transparent dark:fill-white/10 dark:stroke-white/15"}
      />
      <path d="M22.5 10.5A8.5 8.5 0 1 0 22.5 21.5" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-white" />
      <path
        d="m12.5 16.2 2.6 2.6 5.4-5.6"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-mint"
      />
    </svg>
  );
}

interface LogoProps {
  href?: string;
  className?: string;
  compact?: boolean;
  surface?: Surface;
  tagline?: boolean;
}

export function Logo({ href = "/", className, compact = false, surface = "auto", tagline = false }: LogoProps) {
  const dark = surface === "dark";

  return (
    <Link href={href} aria-label="CityCare home" className={cn("flex items-center gap-2.5 rounded-lg", className)}>
      <LogoMark surface={surface} />
      {!compact && (
        <span className="flex flex-col">
          <span className={cn("text-[17px] leading-none font-bold tracking-tight", dark ? "text-white" : "text-foreground")}>
            City<span className={dark ? "text-mint" : "text-primary"}>Care</span>
          </span>
          {tagline && (
            <span className={cn("mt-1 text-[11px] leading-none font-medium", dark ? "text-white/60" : "text-muted-foreground")}>
              City services · Dhaka
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
