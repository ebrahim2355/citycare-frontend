import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M16 6.5c-4.4 0-8 3.4-8 7.7 0 5.6 6.6 11 7.3 11.6a1.1 1.1 0 0 0 1.4 0c.7-.6 7.3-6 7.3-11.6 0-4.3-3.6-7.7-8-7.7Z"
        className="fill-primary-foreground"
      />
      <path
        d="m12.6 14.3 2.3 2.3 4.6-4.6"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary"
      />
    </svg>
  );
}

export function Logo({ href = "/", className, compact = false }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-lg font-semibold tracking-tight", className)}>
      <LogoMark />
      {!compact && (
        <span className="text-lg">
          City<span className="text-primary">Care</span>
        </span>
      )}
      <span className="sr-only">CityCare home</span>
    </Link>
  );
}
