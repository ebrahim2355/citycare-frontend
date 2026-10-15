import type { Role } from "./user";

export type AuditEntity = "USER" | "DEPARTMENT" | "CATEGORY" | "COMPLAINT" | "PAYMENT" | "MESSAGE";

export interface AuditLog {
  id: string;
  action: string;
  entityType: AuditEntity;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role } | null;
}

export type ContactTopic = "GENERAL" | "COMPLAINT_HELP" | "PAYMENT" | "ACCOUNT" | "FEEDBACK";

export type ContactStatus = "NEW" | "REPLIED" | "CLOSED";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: ContactTopic;
  subject: string;
  message: string;
  status: ContactStatus;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  repliedBy: { id: string; name: string } | null;
}

export interface ReplyResult {
  message: ContactMessage;
  emailSent: boolean;
}
