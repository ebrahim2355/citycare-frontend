import {
  AlarmClock,
  ArrowLeftRight,
  CreditCard,
  HeartHandshake,
  Inbox,
  type LucideIcon,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Star,
  Undo2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { ROLE_HOME } from "@/lib/roles";
import type { AppNotification, NotificationType, Role } from "@/types";

export const NOTIFICATION_STYLE: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  COMPLAINT_SUBMITTED: { icon: Inbox, tone: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  COMPLAINT_ASSIGNED: { icon: UserCheck, tone: "bg-primary/12 text-primary" },
  COMPLAINT_UNASSIGNED: { icon: UserMinus, tone: "bg-muted text-muted-foreground" },
  COMPLAINT_STATUS_CHANGED: { icon: RefreshCw, tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  COMPLAINT_REOPENED: { icon: RotateCcw, tone: "bg-amber-500/14 text-amber-800 dark:text-amber-200" },
  COMPLAINT_TRANSFERRED: { icon: ArrowLeftRight, tone: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300" },
  COMMENT_ADDED: { icon: MessageSquare, tone: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  FEEDBACK_RECEIVED: { icon: Star, tone: "bg-amber-500/14 text-amber-800 dark:text-amber-200" },
  PAYMENT_RECEIVED: { icon: CreditCard, tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  PAYMENT_REFUNDED: { icon: Undo2, tone: "bg-amber-500/14 text-amber-800 dark:text-amber-200" },
  SLA_BREACHED: { icon: AlarmClock, tone: "bg-red-500/12 text-red-700 dark:text-red-300" },
  REPORT_SUPPORTED: { icon: HeartHandshake, tone: "bg-primary/12 text-primary" },
};

const COMPLAINT_PATHS: Record<Role, string> = {
  CITIZEN: "/dashboard/complaints",
  STAFF: "/staff/tasks",
  ADMIN: "/admin/complaints",
};

export const complaintHref = (role: Role, complaintId: string) => `${COMPLAINT_PATHS[role]}/${complaintId}`;

export const notificationHref = (role: Role, notification: Pick<AppNotification, "type" | "complaint">) => {
  if (!notification.complaint || (role === "STAFF" && notification.type === "COMPLAINT_UNASSIGNED")) {
    return null;
  }

  return complaintHref(role, notification.complaint.id);
};

export const notificationsHref = (role: Role) => `${ROLE_HOME[role]}/notifications`;

export const badgeCount = (count: number) => (count > 9 ? "9+" : String(count));
