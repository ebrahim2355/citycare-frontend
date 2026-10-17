import type { ComplaintFilters } from "@/lib/filters";

export const IN_PROGRESS_QUEUE: ComplaintFilters = { status: "IN_PROGRESS", sortBy: "dueAt", sortOrder: "asc" };

export const ASSIGNED_QUEUE: ComplaintFilters = { status: "ASSIGNED", sortBy: "dueAt", sortOrder: "asc" };

export const UNASSIGNED_QUEUE: ComplaintFilters = { status: "SUBMITTED", unassigned: "true", sortBy: "createdAt", sortOrder: "asc" };
