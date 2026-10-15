import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { clientFetcher, request } from "@/lib/api/client";
import type { Fetcher } from "@/lib/api/http";
import type {
  AuditFilters,
  CategoryFilters,
  ComplaintFilters,
  MessageFilters,
  PaymentFilters,
  UserFilters,
  WorkloadFilters,
} from "@/lib/filters";
import type {
  AdminStats,
  AuditLog,
  Category,
  CitizenStats,
  ComplaintDetail,
  ComplaintListItem,
  ContactMessage,
  Department,
  Payment,
  PublicStats,
  StaffStats,
  StaffWorkload,
  TrackedComplaint,
  User,
} from "@/types";

export const PAGE_SIZE = 10;

export const queryKeys = {
  session: ["session"] as const,
  complaints: ["complaints"] as const,
  complaintList: (filters: ComplaintFilters) => ["complaints", "list", filters] as const,
  complaint: (id: string) => ["complaints", "detail", id] as const,
  tracking: (code: string) => ["tracking", code] as const,
  payments: ["payments"] as const,
  paymentList: (filters: PaymentFilters) => ["payments", "list", filters] as const,
  stats: ["stats"] as const,
  myStats: ["stats", "me"] as const,
  adminStats: ["stats", "admin"] as const,
  publicStats: ["stats", "public"] as const,
  departments: ["departments"] as const,
  categories: (filters: CategoryFilters & { includeInactive?: boolean }) => ["categories", filters] as const,
  users: ["users"] as const,
  userList: (filters: UserFilters) => ["users", "list", filters] as const,
  workload: (filters: WorkloadFilters) => ["users", "workload", filters] as const,
  auditLogs: (filters: AuditFilters) => ["audit-logs", filters] as const,
  messages: ["messages"] as const,
  messageList: (filters: MessageFilters) => ["messages", "list", filters] as const,
};

export const sessionQuery = () =>
  queryOptions({
    queryKey: queryKeys.session,
    queryFn: async () => (await request<User | null>("/api/auth/session")).data,
    staleTime: 5 * 60 * 1000,
  });

export const complaintQueries = {
  list: (filters: ComplaintFilters, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.complaintList(filters),
      queryFn: () => fetcher.list<ComplaintListItem>("/complaints", { ...filters, limit: PAGE_SIZE }),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.complaint(id),
      queryFn: () => fetcher.get<ComplaintDetail>(`/complaints/${id}`),
    }),
  track: (code: string, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.tracking(code),
      queryFn: () => fetcher.get<TrackedComplaint>(`/complaints/track/${encodeURIComponent(code)}`),
      retry: false,
    }),
};

export const paymentQueries = {
  list: (filters: PaymentFilters, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.paymentList(filters),
      queryFn: () => fetcher.list<Payment>("/payments", { ...filters, limit: PAGE_SIZE }),
      placeholderData: keepPreviousData,
    }),
};

export const statsQueries = {
  citizen: (fetcher: Fetcher = clientFetcher) =>
    queryOptions({ queryKey: queryKeys.myStats, queryFn: () => fetcher.get<CitizenStats>("/stats/me") }),
  staff: (fetcher: Fetcher = clientFetcher) =>
    queryOptions({ queryKey: queryKeys.myStats, queryFn: () => fetcher.get<StaffStats>("/stats/me") }),
  admin: (fetcher: Fetcher = clientFetcher) =>
    queryOptions({ queryKey: queryKeys.adminStats, queryFn: () => fetcher.get<AdminStats>("/admin/dashboard-stats") }),
  public: (fetcher: Fetcher = clientFetcher) =>
    queryOptions({ queryKey: queryKeys.publicStats, queryFn: () => fetcher.get<PublicStats>("/stats/public") }),
};

export const catalogQueries = {
  departments: (fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.departments,
      queryFn: () => fetcher.get<Department[]>("/departments"),
      staleTime: 5 * 60 * 1000,
    }),
  categories: (filters: CategoryFilters & { includeInactive?: boolean } = {}, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.categories(filters),
      queryFn: () =>
        fetcher.get<Category[]>("/categories", { ...filters, includeInactive: filters.includeInactive ? "true" : undefined }),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    }),
};

export const adminQueries = {
  users: (filters: UserFilters, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.userList(filters),
      queryFn: () => fetcher.list<User>("/admin/users", { ...filters, limit: PAGE_SIZE }),
      placeholderData: keepPreviousData,
    }),
  workload: (filters: WorkloadFilters = {}, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.workload(filters),
      queryFn: () => fetcher.get<StaffWorkload[]>("/admin/staff-workload", filters),
    }),
  auditLogs: (filters: AuditFilters, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.auditLogs(filters),
      queryFn: () =>
        fetcher.list<AuditLog>("/admin/audit-logs", {
          ...filters,
          from: filters.from ? `${filters.from}T00:00:00.000Z` : undefined,
          to: filters.to ? `${filters.to}T23:59:59.999Z` : undefined,
          limit: 15,
        }),
      placeholderData: keepPreviousData,
    }),
  messages: (filters: MessageFilters, fetcher: Fetcher = clientFetcher) =>
    queryOptions({
      queryKey: queryKeys.messageList(filters),
      queryFn: () => fetcher.list<ContactMessage>("/admin/messages", { ...filters, limit: PAGE_SIZE }),
      placeholderData: keepPreviousData,
    }),
};
