import { AlarmClock } from "lucide-react";
import { FEE_STATUS_META, PAYMENT_STATUS_META, PRIORITY_META, STATUS_META } from "@/lib/complaint-meta";
import { cn } from "@/lib/utils";
import type { ComplaintPaymentStatus, ComplaintStatus, PaymentStatus, Priority } from "@/types";

const pill = "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium whitespace-nowrap";

function Dot({ className }: { className: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", className)} aria-hidden />;
}

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const meta = STATUS_META[status];

  return (
    <span className={cn(pill, meta.className, className)}>
      <Dot className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function PriorityBars({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];

  return (
    <span className={cn("inline-flex h-3 items-end gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={cn("w-0.75 rounded-[1px]", level <= meta.rank ? meta.bar : "bg-border")}
          style={{ height: `${level * 25}%` }}
        />
      ))}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];

  return (
    <span
      className={cn(
        pill,
        "bg-card text-foreground",
        priority === "URGENT" && "border-red-300/80 text-red-700 dark:border-red-400/30 dark:text-red-300",
        className
      )}
    >
      <PriorityBars priority={priority} />
      {meta.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_STATUS_META[status];

  return (
    <span className={cn(pill, meta.className, className)}>
      <Dot className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function FeeStatusBadge({ status, className }: { status: ComplaintPaymentStatus; className?: string }) {
  const meta = FEE_STATUS_META[status];

  return (
    <span className={cn(pill, meta.className, className)}>
      <Dot className={meta.dot} />
      {meta.label}
    </span>
  );
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(pill, "border-red-300/80 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200", className)}
    >
      <AlarmClock className="size-3.5" aria-hidden />
      Overdue
    </span>
  );
}
