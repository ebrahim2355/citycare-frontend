import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const tones = {
  teal: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  red: "bg-red-500/12 text-red-700 dark:text-red-300",
  violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
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
    <Card className={cn("gap-3 p-5 transition-shadow", href && "hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
}
