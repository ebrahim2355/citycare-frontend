import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const tones = {
  teal: "bg-teal-50 text-teal-700 ring-teal-200/80 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-200/80 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  red: "bg-red-50 text-red-700 ring-red-200/80 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/80 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  tone?: keyof typeof tones;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, tone = "teal", href, className }: StatCardProps) {
  const content = (
    <Card className={cn("relative h-full gap-0 p-4 sm:p-5", href && "card-hover group-hover/stat:border-primary/30", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-snug font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", tones[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-[1.7rem] leading-none font-semibold tracking-tight tabular-nums lining-nums sm:text-3xl">{value}</p>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
      {href && (
        <ArrowUpRight
          className="absolute right-4 bottom-4 size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover/stat:translate-x-0 group-hover/stat:translate-y-0 group-hover/stat:opacity-100"
          aria-hidden
        />
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="group/stat rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-0 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-2.5 h-3 w-32" />
    </Card>
  );
}
