import { AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEE_STATUS_META, PAYMENT_STATUS_META, PRIORITY_META, STATUS_META } from "@/lib/complaint-meta";
import type { ComplaintPaymentStatus, ComplaintStatus, PaymentStatus, Priority } from "@/types";

const pill = "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset";

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span className={cn(pill, meta.className, className)}>
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];

  return <span className={cn(pill, meta.className, className)}>{meta.label}</span>;
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_STATUS_META[status];

  return <span className={cn(pill, meta.className, className)}>{meta.label}</span>;
}

export function FeeStatusBadge({ status, className }: { status: ComplaintPaymentStatus; className?: string }) {
  const meta = FEE_STATUS_META[status];

  return <span className={cn(pill, meta.className, className)}>{meta.label}</span>;
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span className={cn(pill, "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300", className)}>
      <AlarmClock className="size-3.5" aria-hidden />
      Overdue
    </span>
  );
}
