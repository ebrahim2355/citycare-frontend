export const AUDIT_ACTIONS = [
  "USER_CREATED",
  "USER_ROLE_CHANGED",
  "USER_STATUS_CHANGED",
  "USER_DELETED",
  "STAFF_AVAILABILITY_CHANGED",
  "PASSWORD_CHANGED",
  "PASSWORD_RESET",
  "DEPARTMENT_CREATED",
  "DEPARTMENT_UPDATED",
  "DEPARTMENT_DELETED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
  "COMPLAINT_CREATED",
  "COMPLAINT_UPDATED",
  "COMPLAINT_ASSIGNED",
  "COMPLAINT_STATUS_CHANGED",
  "COMPLAINT_TRANSFERRED",
  "COMPLAINT_CANCELLED",
  "COMPLAINT_REOPENED",
  "COMPLAINT_ESCALATED",
  "COMPLAINT_DELETED",
  "FEEDBACK_SUBMITTED",
  "ATTACHMENT_ADDED",
  "ATTACHMENT_REMOVED",
  "COMMENT_REMOVED",
  "PAYMENT_INITIATED",
  "PAYMENT_COMPLETED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "MESSAGE_REPLIED",
  "MESSAGE_STATUS_CHANGED",
  "DATA_EXPORTED",
] as const;

export const AUDIT_ENTITIES = ["USER", "DEPARTMENT", "CATEGORY", "COMPLAINT", "PAYMENT", "MESSAGE"] as const;

export const actionTone = (action: string) => {
  if (/DELETED|REMOVED|FAILED|REFUNDED/.test(action)) {
    return "bg-red-500/10 text-red-700 dark:text-red-300";
  }

  if (/CREATED|ADDED|COMPLETED|SUBMITTED/.test(action)) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (/PAYMENT/.test(action)) {
    return "bg-amber-500/12 text-amber-800 dark:text-amber-200";
  }

  return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
};

export const describeMetadata = (metadata: Record<string, unknown> | null) => {
  if (!metadata) {
    return [];
  }

  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`);
};
