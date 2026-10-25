import type { CategoryType } from "./catalog";
import type { Person, Role } from "./user";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ComplaintStatus =
  | "PENDING_PAYMENT"
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED";

export type ComplaintPaymentStatus = "NOT_REQUIRED" | "UNPAID" | "PAID" | "REFUNDED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

interface NamedRef {
  id: string;
  name: string;
}

export interface ComplaintListItem {
  id: string;
  trackingCode: string;
  title: string;
  type: CategoryType;
  priority: Priority;
  status: ComplaintStatus;
  area: string;
  fee: string;
  paymentStatus: ComplaintPaymentStatus;
  dueAt: string | null;
  submittedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  escalatedAt: string | null;
  isPublic: boolean;
  supportCount: number;
  isOverdue: boolean;
  category: NamedRef;
  department: NamedRef;
  citizen: NamedRef;
  assignedStaff: NamedRef | null;
}

export interface Attachment {
  id: string;
  kind: "EVIDENCE" | "RESOLUTION";
  url: string;
  format: string | null;
  bytes: number | null;
  createdAt: string;
  uploadedBy: { id: string; name: string; role: Role } | null;
}

export interface ComplaintUpdate {
  id: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  note: string | null;
  createdAt: string;
  actor: { id: string; name: string; role: Role } | null;
}

export interface ComplaintPayment {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface ComplaintDetail {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  type: CategoryType;
  priority: Priority;
  status: ComplaintStatus;
  address: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  fee: string;
  paymentStatus: ComplaintPaymentStatus;
  submittedAt: string | null;
  assignedAt: string | null;
  dueAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolutionNote: string | null;
  rejectionReason: string | null;
  reopenCount: number;
  escalatedAt: string | null;
  isPublic: boolean;
  supportCount: number;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  category: { id: string; name: string; slaHours: number };
  department: NamedRef;
  citizen: Person;
  assignedStaff: Person | null;
  feedback: { id: string; rating: number; comment: string | null; createdAt: string } | null;
  attachments: Attachment[];
  payments: ComplaintPayment[];
  updates: ComplaintUpdate[];
}

export interface TrackedComplaint {
  id: string | null;
  trackingCode: string;
  title: string;
  type: CategoryType;
  priority: Priority;
  status: ComplaintStatus;
  area: string;
  submittedAt: string | null;
  dueAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  isOverdue: boolean;
  isPublic: boolean;
  latitude: number | null;
  longitude: number | null;
  supportCount: number;
  category: { name: string };
  department: { name: string };
  updates: { fromStatus: ComplaintStatus | null; toStatus: ComplaintStatus; createdAt: string }[];
}

export interface PublicReport {
  id: string;
  trackingCode: string;
  title: string;
  status: ComplaintStatus;
  priority: Priority;
  area: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  resolvedAt: string | null;
  isOverdue: boolean;
  supportCount: number;
  category: NamedRef;
  department: NamedRef;
}

export interface NearbyReport extends PublicReport {
  distanceMeters: number;
  isMine: boolean;
  supportedByMe: boolean;
}

export interface MapComplaint {
  id: string;
  trackingCode: string;
  title: string;
  type: CategoryType;
  status: ComplaintStatus;
  priority: Priority;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  dueAt: string | null;
  escalatedAt: string | null;
  createdAt: string;
  isOverdue: boolean;
  supportCount: number;
  category: NamedRef;
  department: NamedRef;
  assignedStaff: NamedRef | null;
}

export interface SupportResult {
  supportCount: number;
  supported: boolean;
}

export interface ComplaintComment {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; name: string; role: Role; avatarUrl: string | null } | null;
}
