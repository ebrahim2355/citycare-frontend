import type { ComplaintStatus, Priority } from "./complaint";

export type StatusCounts = Record<ComplaintStatus, number>;

export interface PublicStats {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
  averageResolutionHours: number | null;
  departmentCount: number;
  serviceCount: number;
  topCategories: { categoryId: string; name: string; complaints: number }[];
  topAreas: { area: string; complaints: number }[];
  recentlyResolved: {
    id: string;
    title: string;
    area: string;
    category: string;
    department: string;
    resolvedAt: string;
    resolutionHours: number | null;
  }[];
}

export interface DepartmentStats {
  id: string;
  name: string;
  open: number;
  resolved: number;
  overdue: number;
  averageResolutionHours: number | null;
  averageRating: number | null;
}

export interface AdminStats {
  users: { total: number; citizens: number; staff: number; admins: number; blocked: number };
  complaints: {
    total: number;
    byStatus: StatusCounts;
    openByPriority: Record<Priority, number>;
    open: number;
    unassigned: number;
    overdue: number;
    escalated: number;
    createdLast7Days: number;
  };
  payments: { completed: number; pending: number; refunded: number; revenue: number; refundedAmount: number };
  feedback: { total: number; averageRating: number | null };
  messages: { new: number };
  departments: DepartmentStats[];
  trend: { date: string; created: number; resolved: number }[];
  generatedAt: string;
}

export interface CitizenStats {
  role: "CITIZEN";
  totalComplaints: number;
  byStatus: StatusCounts;
  open: number;
  awaitingPayment: number;
  awaitingFeedback: number;
  resolved: number;
  payments: { completed: number; totalPaid: number };
}

export interface StaffStats {
  role: "STAFF";
  activeAssignments: number;
  capacity: number;
  acceptsAssignments: boolean;
  byStatus: StatusCounts;
  waitingToStart: number;
  inProgress: number;
  overdue: number;
  resolved: number;
  feedback: { total: number; averageRating: number | null };
  averageResolutionHours: number | null;
  onTimeRate: number | null;
  resolvedByWeek: { week: string; resolved: number }[];
  ratingBreakdown: { rating: number; count: number }[];
}
