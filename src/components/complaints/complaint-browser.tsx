"use client";

import { useQuery } from "@tanstack/react-query";
import { AlarmClock, FilterX, Inbox, SearchX, Siren, UserX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RelativeTime } from "@/components/shared/relative-time";
import { SearchInput } from "@/components/shared/search-input";
import { EscalatedBadge, OverdueBadge, PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { OPEN_STATUSES, PRIORITY_META, STATUS_META } from "@/lib/complaint-meta";
import { complaintFilterSchema, COMPLAINT_STATUSES, countActiveFilters, PRIORITIES } from "@/lib/filters";
import { formatDateTime } from "@/lib/format";
import { catalogQueries, complaintQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { ComplaintListItem, ComplaintStatus } from "@/types";

export type BrowserVariant = "citizen" | "staff" | "admin";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "dueAt:asc", label: "Due soonest" },
  { value: "priority:desc", label: "Highest priority" },
];

const STAFF_STATUSES: ComplaintStatus[] = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

interface ComplaintBrowserProps {
  variant: BrowserVariant;
  basePath: string;
  emptyAction?: ReactNode;
  rowActions?: (complaint: ComplaintListItem) => ReactNode;
}

function DueCell({ complaint }: { complaint: ComplaintListItem }) {
  if (!OPEN_STATUSES.includes(complaint.status) || !complaint.dueAt) {
    return <span className="text-muted-foreground">{complaint.resolvedAt ? <RelativeTime value={complaint.resolvedAt} prefix="Resolved" /> : "—"}</span>;
  }

  return (
    <div className="space-y-1">
      <p className={cn("text-sm", complaint.isOverdue && "font-medium text-destructive")}>{formatDateTime(complaint.dueAt)}</p>
      {complaint.escalatedAt ? <EscalatedBadge /> : complaint.isOverdue && <OverdueBadge />}
    </div>
  );
}

export function ComplaintBrowser({ variant, basePath, emptyAction, rowActions }: ComplaintBrowserProps) {
  const { filters, setFilters, clearFilters } = useUrlFilters(complaintFilterSchema);
  const list = useQuery(complaintQueries.list(filters));
  const departments = useQuery({ ...catalogQueries.departments(), enabled: variant === "admin" });
  const activeFilters = countActiveFilters(filters);
  const sortValue = `${filters.sortBy ?? "createdAt"}:${filters.sortOrder ?? "desc"}`;
  const statuses = variant === "staff" ? STAFF_STATUSES : [...COMPLAINT_STATUSES];

  const columns: Column<ComplaintListItem>[] = [
    {
      key: "report",
      header: "Report",
      className: "min-w-56",
      cell: (complaint) => (
        <Link href={`${basePath}/${complaint.id}`} className="group block space-y-0.5">
          <span className="font-mono text-xs text-muted-foreground">{complaint.trackingCode}</span>
          <span className="line-clamp-1 font-medium group-hover:text-primary group-hover:underline">{complaint.title}</span>
          <span className="block text-xs text-muted-foreground">
            {complaint.category.name}
            {variant === "admin" ? ` · ${complaint.department.name}` : ""}
          </span>
        </Link>
      ),
    },
    { key: "area", header: "Area", cell: (complaint) => complaint.area },
    { key: "status", header: "Status", cell: (complaint) => <StatusBadge status={complaint.status} /> },
    { key: "priority", header: "Priority", cell: (complaint) => <PriorityBadge priority={complaint.priority} /> },
    ...(variant !== "citizen"
      ? [{ key: "citizen", header: "Reported by", cell: (complaint: ComplaintListItem) => complaint.citizen.name }]
      : []),
    ...(variant !== "staff"
      ? [
          {
            key: "staff",
            header: "Staff",
            cell: (complaint: ComplaintListItem) =>
              complaint.assignedStaff?.name ?? <span className="text-muted-foreground">Not assigned</span>,
          },
        ]
      : []),
    { key: "due", header: "Due", cell: (complaint) => <DueCell complaint={complaint} /> },
    ...(rowActions ? [{ key: "actions", header: <span className="sr-only">Actions</span>, className: "w-12", cell: rowActions }] : []),
  ];

  const empty = activeFilters ? (
    <EmptyState
      icon={SearchX}
      title="No reports match these filters"
      description="Try a different search or clear the filters to see everything."
      action={
        <Button variant="outline" onClick={clearFilters}>
          <FilterX data-icon="inline-start" />
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Inbox}
      title={variant === "staff" ? "No tasks assigned to you" : variant === "citizen" ? "You have not reported anything yet" : "No reports yet"}
      description={
        variant === "staff"
          ? "New jobs show up here as soon as an admin assigns them to you."
          : variant === "citizen"
            ? "Report a problem in your area and follow it here until it is fixed."
            : "Reports from citizens will appear here."
      }
      action={emptyAction}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput
          value={filters.searchTerm}
          onSearch={(searchTerm) => setFilters({ searchTerm })}
          placeholder="Search title, address or code"
          label="Search reports"
          className="lg:w-72"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <FilterSelect
            value={filters.status}
            onChange={(status) => setFilters({ status })}
            placeholder="All statuses"
            label="Filter by status"
            options={statuses.map((status) => ({ value: status, label: STATUS_META[status].label }))}
          />
          <FilterSelect
            value={filters.priority}
            onChange={(priority) => setFilters({ priority })}
            placeholder="All priorities"
            label="Filter by priority"
            options={PRIORITIES.map((priority) => ({ value: priority, label: PRIORITY_META[priority].label }))}
          />
          {variant !== "staff" && (
            <FilterSelect
              value={filters.type}
              onChange={(type) => setFilters({ type })}
              placeholder="All types"
              label="Filter by type"
              options={[
                { value: "COMPLAINT", label: "Complaints" },
                { value: "SERVICE", label: "Paid services" },
              ]}
            />
          )}
          {variant === "admin" && (
            <FilterSelect
              value={filters.departmentId}
              onChange={(departmentId) => setFilters({ departmentId })}
              placeholder="All departments"
              label="Filter by department"
              options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))}
            />
          )}
          <FilterSelect
            value={sortValue === "createdAt:desc" ? undefined : sortValue}
            onChange={(value) => {
              const [sortBy, sortOrder] = (value ?? "createdAt:desc").split(":");

              setFilters({ sortBy: value ? sortBy : undefined, sortOrder: value ? sortOrder : undefined });
            }}
            placeholder="Newest first"
            label="Sort reports"
            options={SORTS.slice(1)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {variant !== "citizen" && (
            <Toggle
              variant="outline"
              pressed={filters.overdue === "true"}
              onPressedChange={(pressed) => setFilters({ overdue: pressed ? "true" : undefined })}
              aria-label="Show only overdue reports"
              className="bg-card data-[state=on]:border-destructive/40 data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive"
            >
              <AlarmClock />
              Overdue
            </Toggle>
          )}
          {variant === "admin" && (
            <Toggle
              variant="outline"
              pressed={filters.escalated === "true"}
              onPressedChange={(pressed) => setFilters({ escalated: pressed ? "true" : undefined })}
              aria-label="Show only escalated reports"
              className="bg-card data-[state=on]:border-amber-400/50 data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-800 dark:data-[state=on]:text-amber-200"
            >
              <Siren />
              Escalated
            </Toggle>
          )}
          {variant === "admin" && (
            <Toggle
              variant="outline"
              pressed={filters.unassigned === "true"}
              onPressedChange={(pressed) => setFilters({ unassigned: pressed ? "true" : undefined })}
              aria-label="Show only unassigned reports"
              className="bg-card"
            >
              <UserX />
              Unassigned
            </Toggle>
          )}
          {activeFilters > 0 && (
            <Button variant="ghost" onClick={clearFilters}>
              <FilterX data-icon="inline-start" />
              Clear ({activeFilters})
            </Button>
          )}
        </div>
      </div>

      {list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={list.data?.items}
            getRowKey={(complaint) => complaint.id}
            loading={list.isPending}
            fetching={list.isPlaceholderData}
            empty={empty}
            caption="Reports"
            breakpoint="xl"
            renderMobile={(complaint) => (
              <ComplaintCard complaint={complaint} href={`${basePath}/${complaint.id}`} showCitizen={variant !== "citizen"} />
            )}
          />
          {list.data && <PaginationBar meta={list.data.meta} onPageChange={(page) => setFilters({ page })} label="reports" />}
        </>
      )}
    </div>
  );
}
