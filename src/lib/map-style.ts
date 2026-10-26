import type { ComplaintStatus } from "@/types";

export const STATUS_COLOR: Record<ComplaintStatus, string> = {
  PENDING_PAYMENT: "#f59e0b",
  SUBMITTED: "#64748b",
  ASSIGNED: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#10b981",
  CLOSED: "#0d9488",
  REJECTED: "#ef4444",
  CANCELLED: "#a1a1aa",
};

export const OVERDUE_RING = "#dc2626";

export const markerRadius = (supportCount = 0) => 7 + Math.min(supportCount, 12) * 0.5;

export const MAP_LEGEND: { label: string; color: string }[] = [
  { label: "Waiting for a crew", color: STATUS_COLOR.SUBMITTED },
  { label: "Assigned", color: STATUS_COLOR.ASSIGNED },
  { label: "In progress", color: STATUS_COLOR.IN_PROGRESS },
  { label: "Fixed", color: STATUS_COLOR.RESOLVED },
];
