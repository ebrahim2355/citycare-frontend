export type NotificationType =
  | "COMPLAINT_SUBMITTED"
  | "COMPLAINT_ASSIGNED"
  | "COMPLAINT_UNASSIGNED"
  | "COMPLAINT_STATUS_CHANGED"
  | "COMPLAINT_REOPENED"
  | "COMPLAINT_TRANSFERRED"
  | "COMMENT_ADDED"
  | "FEEDBACK_RECEIVED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_REFUNDED"
  | "SLA_BREACHED"
  | "REPORT_SUPPORTED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  complaint: { id: string; trackingCode: string } | null;
}

export interface UnreadCount {
  count: number;
}
