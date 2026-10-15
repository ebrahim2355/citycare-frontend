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
    className: "bg-amber-500/12 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  },
  SUBMITTED: {
    label: "Submitted",
    icon: CircleDashed,
    description: "Waiting for the city team to assign it.",
    className: "bg-sky-500/12 text-sky-700 ring-sky-500/25 dark:text-sky-300",
  },
  ASSIGNED: {
    label: "Assigned",
    icon: UserCheck,
    description: "A staff member has it and will start soon.",
    className: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/25 dark:text-indigo-300",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: Hammer,
    description: "Work is going on at the location.",
    className: "bg-orange-500/12 text-orange-700 ring-orange-500/25 dark:text-orange-300",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CircleCheck,
    description: "The staff marked it as fixed. Waiting for your feedback.",
    className: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCheck,
    description: "Fixed and closed.",
    className: "bg-teal-600/12 text-teal-800 ring-teal-600/25 dark:text-teal-300",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    description: "The city team could not take it.",
    className: "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    description: "Cancelled by the citizen.",
    className: "bg-zinc-500/12 text-zinc-700 ring-zinc-500/25 dark:text-zinc-300",
  },
};

export const PRIORITY_META: Record<Priority, Meta & { rank: number }> = {
  LOW: { label: "Low", rank: 1, className: "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300" },
  MEDIUM: { label: "Medium", rank: 2, className: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300" },
  HIGH: { label: "High", rank: 3, className: "bg-orange-500/12 text-orange-700 ring-orange-500/25 dark:text-orange-300" },
  URGENT: { label: "Urgent", rank: 4, className: "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, Meta> = {
  PENDING: { label: "Pending", className: "bg-amber-500/12 text-amber-700 ring-amber-500/25 dark:text-amber-300" },
  COMPLETED: { label: "Paid", className: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300" },
  FAILED: { label: "Failed", className: "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-zinc-500/12 text-zinc-700 ring-zinc-500/25 dark:text-zinc-300" },
  REFUNDED: { label: "Refunded", className: "bg-violet-500/12 text-violet-700 ring-violet-500/25 dark:text-violet-300" },
};

export const FEE_STATUS_META: Record<ComplaintPaymentStatus, Meta> = {
  NOT_REQUIRED: { label: "Free", className: "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300" },
  UNPAID: { label: "Unpaid", className: "bg-amber-500/12 text-amber-700 ring-amber-500/25 dark:text-amber-300" },
  PAID: { label: "Paid", className: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300" },
  REFUNDED: { label: "Refunded", className: "bg-violet-500/12 text-violet-700 ring-violet-500/25 dark:text-violet-300" },
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

