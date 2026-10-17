"use client";

import { useQuery } from "@tanstack/react-query";
import { Braces, FilterX, History } from "lucide-react";
import Link from "next/link";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { actionTone, AUDIT_ACTIONS, AUDIT_ENTITIES, describeMetadata } from "@/lib/audit";
import { auditFilterSchema, countActiveFilters } from "@/lib/filters";
import { formatDateTime, humanize } from "@/lib/format";
import { adminQueries } from "@/lib/query/options";
import { ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types";

const entityLink = (log: AuditLog) => {
  if (!log.entityId) {
    return null;
  }

  if (log.entityType === "COMPLAINT") {
    return `/admin/complaints/${log.entityId}`;
  }

  if (log.entityType === "CATEGORY") {
    return "/admin/categories";
  }

  if (log.entityType === "DEPARTMENT") {
    return "/admin/departments";
  }

  if (log.entityType === "MESSAGE") {
    return "/admin/messages";
  }

  return null;
};

export function AdminAuditLogs() {
  const { filters, setFilters, clearFilters } = useUrlFilters(auditFilterSchema);
  const logs = useQuery(adminQueries.auditLogs(filters));
  const active = countActiveFilters(filters);

  const columns: Column<AuditLog>[] = [
    { key: "time", header: "When", className: "whitespace-nowrap", cell: (log) => <span className="text-sm">{formatDateTime(log.createdAt)}</span> },
    {
      key: "actor",
      header: "Who",
      cell: (log) =>
        log.actor ? (
          <div className="min-w-0">
            <p className="truncate font-medium">{log.actor.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[log.actor.role]}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">System</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      cell: (log) => (
        <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", actionTone(log.action))}>
          {humanize(log.action)}
        </span>
      ),
    },
    {
      key: "entity",
      header: "On",
      cell: (log) => {
        const href = entityLink(log);
        const label = humanize(log.entityType);

        return href ? (
          <Link href={href} className="text-sm font-medium text-primary hover:underline">
            {label}
          </Link>
        ) : (
          <span className="text-sm">{label}</span>
        );
      },
    },
    {
      key: "details",
      header: "Details",
      className: "min-w-56",
      cell: (log) => {
        const lines = describeMetadata(log.metadata);

        return (
          <div className="flex items-start gap-2">
            <p className="line-clamp-2 text-xs text-muted-foreground">{lines.join(" · ") || "—"}</p>
            {log.metadata && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label="Show all details">
                    <Braces />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                  {log.ipAddress && <p className="mt-2 text-xs text-muted-foreground">IP address: {log.ipAddress}</p>}
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Who did what and when. Assignments, status changes, refunds, role changes and catalog edits are all recorded."
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <FilterSelect
            value={filters.action}
            onChange={(action) => setFilters({ action })}
            placeholder="All actions"
            label="Filter by action"
            options={AUDIT_ACTIONS.map((action) => ({ value: action, label: humanize(action) }))}
            className="sm:w-56"
          />
          <FilterSelect
            value={filters.entityType}
            onChange={(entityType) => setFilters({ entityType })}
            placeholder="Everything"
            label="Filter by record type"
            options={AUDIT_ENTITIES.map((entity) => ({ value: entity, label: humanize(entity) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="audit-from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="audit-from"
              type="date"
              value={filters.from ?? ""}
              max={filters.to}
              onChange={(event) => setFilters({ from: event.target.value || undefined })}
              className="bg-card"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="audit-to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="audit-to"
              type="date"
              value={filters.to ?? ""}
              min={filters.from}
              onChange={(event) => setFilters({ to: event.target.value || undefined })}
              className="bg-card"
            />
          </div>
        </div>
        <FilterSelect
          value={filters.sortOrder}
          onChange={(sortOrder) => setFilters({ sortOrder })}
          placeholder="Newest first"
          label="Sort the log"
          options={[{ value: "asc", label: "Oldest first" }]}
        />
        {active > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="lg:ml-auto">
            <FilterX data-icon="inline-start" />
            Clear ({active})
          </Button>
        )}
      </div>
      {logs.error && !logs.data ? (
        <ErrorState error={logs.error} onRetry={() => logs.refetch()} retrying={logs.isFetching} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={logs.data?.items}
            getRowKey={(log) => log.id}
            loading={logs.isPending}
            fetching={logs.isPlaceholderData}
            caption="Audit log"
            renderMobile={(log) => (
              <div className="space-y-2 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", actionTone(log.action))}>{humanize(log.action)}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="text-sm">
                  {log.actor ? log.actor.name : "System"} · {humanize(log.entityType)}
                </p>
                {describeMetadata(log.metadata).length > 0 && (
                  <p className="text-xs break-all text-muted-foreground">{describeMetadata(log.metadata).join(" · ")}</p>
                )}
              </div>
            )}
            empty={<EmptyState icon={History} title="Nothing recorded for these filters" />}
          />
          {logs.data && <PaginationBar meta={logs.data.meta} onPageChange={(page) => setFilters({ page })} label="entries" />}
        </>
      )}
    </div>
  );
}
