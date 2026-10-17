import {
  Ban,
  CheckCheck,
  CircleCheck,
  CircleDashed,
  CircleDollarSign,
  Hammer,
  type LucideIcon,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { ComplaintPaymentStatus, ComplaintStatus, PaymentStatus, Priority } from "@/types";

interface Meta {
  label: string;
  className: string;
  dot: string;
}

interface StatusMeta extends Meta {
  icon: LucideIcon;
  description: string;
}

export const STATUS_META: Record<ComplaintStatus, StatusMeta> = {
  PENDING_PAYMENT: {
    label: "Waiting for payment",
    icon: CircleDollarSign,
    description: "The service fee is not paid yet.",
    className: "border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  SUBMITTED: {
    label: "Submitted",
    icon: CircleDashed,
    description: "Waiting for the city team to assign it.",
    className: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-200",
    dot: "bg-slate-500 dark:bg-slate-400",
  },
  ASSIGNED: {
    label: "Assigned",
    icon: UserCheck,
    description: "A staff member has it and will start soon.",
    className: "border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200",
    dot: "bg-violet-500",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: Hammer,
    description: "Work is going on at the location.",
    className: "border-blue-300/80 bg-blue-50 text-blue-800 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CircleCheck,
    description: "The staff marked it as fixed. Waiting for your feedback.",
    className: "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCheck,
    description: "Fixed and closed.",
    className: "border-teal-300/80 bg-teal-50 text-teal-800 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-200",
    dot: "bg-teal-600 dark:bg-teal-400",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    description: "The city team could not take it.",
    className: "border-red-300/80 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200",
    dot: "bg-red-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    description: "Cancelled by the citizen.",
    className: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-400/25 dark:bg-zinc-400/10 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
};

export const PRIORITY_META: Record<Priority, { label: string; rank: number; bar: string }> = {
  LOW: { label: "Low", rank: 1, bar: "bg-slate-400" },
  MEDIUM: { label: "Medium", rank: 2, bar: "bg-blue-500" },
  HIGH: { label: "High", rank: 3, bar: "bg-orange-500" },
  URGENT: { label: "Urgent", rank: 4, bar: "bg-red-500" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, Meta> = {
  PENDING: { label: "Pending", className: "border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200", dot: "bg-amber-500" },
  COMPLETED: { label: "Paid", className: "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", className: "border-red-300/80 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200", dot: "bg-red-500" },
  CANCELLED: { label: "Cancelled", className: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-400/25 dark:bg-zinc-400/10 dark:text-zinc-300", dot: "bg-zinc-400" },
  REFUNDED: { label: "Refunded", className: "border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200", dot: "bg-violet-500" },
};

export const FEE_STATUS_META: Record<ComplaintPaymentStatus, Meta> = {
  NOT_REQUIRED: { label: "Free", className: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-200", dot: "bg-slate-500 dark:bg-slate-400" },
  UNPAID: { label: "Unpaid", className: "border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200", dot: "bg-amber-500" },
  PAID: { label: "Paid", className: "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200", dot: "bg-emerald-500" },
  REFUNDED: { label: "Refunded", className: "border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200", dot: "bg-violet-500" },
};

export const PROGRESS_STEPS: { status: ComplaintStatus; label: string }[] = [
  { status: "SUBMITTED", label: "Submitted" },
  { status: "ASSIGNED", label: "Assigned" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "RESOLVED", label: "Resolved" },
  { status: "CLOSED", label: "Closed" },
];

export const OPEN_STATUSES: ComplaintStatus[] = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];

export const EDITABLE_STATUSES: ComplaintStatus[] = ["PENDING_PAYMENT", "SUBMITTED"];

export const REMOVABLE_STATUSES: ComplaintStatus[] = ["CANCELLED", "REJECTED", "CLOSED"];

export const REOPEN_WINDOW_DAYS = 7;
export const MAX_REOPENS = 2;
export const MAX_IMAGES = 6;
export const MAX_IMAGES_PER_UPLOAD = 2;
export const MAX_IMAGE_MB = 2;

export const STATUS_CHART_COLORS: Record<ComplaintStatus, string> = {
  PENDING_PAYMENT: "oklch(0.77 0.16 70)",
  SUBMITTED: "oklch(0.68 0.14 237)",
  ASSIGNED: "oklch(0.6 0.18 275)",
  IN_PROGRESS: "oklch(0.7 0.17 50)",
  RESOLVED: "oklch(0.7 0.15 160)",
  CLOSED: "oklch(0.55 0.1 186)",
  REJECTED: "oklch(0.63 0.21 25)",
  CANCELLED: "oklch(0.65 0.01 250)",
};

export const progressIndex = (status: ComplaintStatus) => PROGRESS_STEPS.findIndex((step) => step.status === status);

