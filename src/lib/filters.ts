import { z } from "zod";

type SearchInput = URLSearchParams | Record<string, string | string[] | undefined>;

const optionalEnum = <const T extends readonly [string, ...string[]]>(values: T) => z.enum(values).optional().catch(undefined);

const page = z.coerce.number().int().min(1).max(10000).optional().catch(undefined);

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined);

const id = z.uuid().optional().catch(undefined);

const flag = z.enum(["true"]).optional().catch(undefined);

const date = z.iso.date().optional().catch(undefined);

const sortOrder = optionalEnum(["asc", "desc"]);

export const COMPLAINT_STATUSES = [
  "PENDING_PAYMENT",
  "SUBMITTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const complaintFilterSchema = z.object({
  page,
  searchTerm: text(100),
  status: optionalEnum(COMPLAINT_STATUSES),
  priority: optionalEnum(PRIORITIES),
  type: optionalEnum(["COMPLAINT", "SERVICE"]),
  paymentStatus: optionalEnum(["NOT_REQUIRED", "UNPAID", "PAID", "REFUNDED"]),
  departmentId: id,
  categoryId: id,
  unassigned: flag,
  overdue: flag,
  sortBy: optionalEnum(["createdAt", "updatedAt", "dueAt", "priority", "status"]),
  sortOrder,
});

export const paymentFilterSchema = z.object({
  page,
  status: optionalEnum(["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"]),
  sortOrder,
});

export const userFilterSchema = z.object({
  page,
  searchTerm: text(100),
  role: optionalEnum(["CITIZEN", "STAFF", "ADMIN"]),
  status: optionalEnum(["ACTIVE", "BLOCKED"]),
  departmentId: id,
  sortBy: optionalEnum(["createdAt", "name", "email"]),
  sortOrder,
});

export const auditFilterSchema = z.object({
  page,
  action: text(60),
  entityType: optionalEnum(["USER", "DEPARTMENT", "CATEGORY", "COMPLAINT", "PAYMENT", "MESSAGE"]),
  from: date,
  to: date,
  sortOrder,
});

export const messageFilterSchema = z.object({
  page,
  searchTerm: text(100),
  status: optionalEnum(["NEW", "REPLIED", "CLOSED"]),
  topic: optionalEnum(["GENERAL", "COMPLAINT_HELP", "PAYMENT", "ACCOUNT", "FEEDBACK"]),
});

export const categoryFilterSchema = z.object({
  searchTerm: text(80),
  type: optionalEnum(["COMPLAINT", "SERVICE"]),
  departmentId: id,
});

export const workloadFilterSchema = z.object({
  departmentId: id,
});

export type ComplaintFilters = z.infer<typeof complaintFilterSchema>;
export type PaymentFilters = z.infer<typeof paymentFilterSchema>;
export type UserFilters = z.infer<typeof userFilterSchema>;
export type AuditFilters = z.infer<typeof auditFilterSchema>;
export type MessageFilters = z.infer<typeof messageFilterSchema>;
export type CategoryFilters = z.infer<typeof categoryFilterSchema>;
export type WorkloadFilters = z.infer<typeof workloadFilterSchema>;

const toRecord = (input: SearchInput) => {
  if (input instanceof URLSearchParams) {
    return Object.fromEntries(input.entries());
  }

  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
};

export const parseFilters = <S extends z.ZodType<Record<string, unknown>>>(schema: S, input: SearchInput): z.infer<S> => {
  const parsed = schema.parse(toRecord(input));

  return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== undefined)) as z.infer<S>;
};

export const countActiveFilters = (filters: Record<string, unknown>, ignore: string[] = ["page", "sortBy", "sortOrder"]) => {
  return Object.entries(filters).filter(([key, value]) => !ignore.includes(key) && value !== undefined && value !== "").length;
};
