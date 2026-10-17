"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarOff, CircleCheck, Gauge, UsersRound } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { workloadFilterSchema } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { adminQueries, catalogQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { StaffWorkload } from "@/types";

const availability = (staff: StaffWorkload) => {
  if (staff.status === "BLOCKED") {
    return { label: "Blocked", className: "bg-red-500/12 text-red-700 dark:text-red-300" };
  }

  if (!staff.acceptsAssignments) {
    return { label: "On leave", className: "bg-amber-500/14 text-amber-800 dark:text-amber-200" };
  }

  if (staff.activeAssignments >= staff.capacity) {
    return { label: "Full", className: "bg-orange-500/12 text-orange-700 dark:text-orange-300" };
  }

  return { label: "Available", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" };
};

export function AdminStaff() {
  const { filters, setFilters } = useUrlFilters(workloadFilterSchema);
  const workload = useQuery(adminQueries.workload(filters));
  const departments = useQuery(catalogQueries.departments());
  const staff = workload.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff workload"
        description="Who is free, who is full and who is on leave. Auto assignment always picks the least busy available person."
        actions={
          <FilterSelect
            value={filters.departmentId}
            onChange={(departmentId) => setFilters({ departmentId })}
            placeholder="All departments"
            label="Filter staff by department"
            options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))}
            className="sm:w-56"
          />
        }
      />
      {workload.data && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Staff members" value={formatNumber(staff.length)} icon={UsersRound} />
          <StatCard label="Available now" value={formatNumber(staff.filter((item) => item.isAvailable).length)} icon={CircleCheck} tone="emerald" />
          <StatCard
            label="At full capacity"
            value={formatNumber(staff.filter((item) => item.activeAssignments >= item.capacity).length)}
            icon={Gauge}
            tone="red"
          />
          <StatCard label="On leave" value={formatNumber(staff.filter((item) => !item.acceptsAssignments).length)} icon={CalendarOff} tone="amber" />
        </div>
      )}
      {workload.error && !workload.data && <ErrorState error={workload.error} onRetry={() => workload.refetch()} retrying={workload.isFetching} />}
      {workload.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      )}
      {workload.data && staff.length === 0 && (
        <EmptyState
          icon={UsersRound}
          title="No staff in this department"
          description="Add a staff member from the users page."
          action={
            <Button asChild variant="outline">
              <Link href="/admin/users">Go to users</Link>
            </Button>
          }
        />
      )}
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", workload.isPlaceholderData && "opacity-60")}>
        {staff.map((member) => {
          const state = availability(member);
          const percent = Math.min(100, (member.activeAssignments / member.capacity) * 100);

          return (
            <Card key={member.id} className="gap-4 p-5">
              <div className="flex items-start gap-3">
                <UserAvatar name={member.name} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{member.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{member.department?.name ?? "No department"}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", state.className)}>{state.label}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active jobs</span>
                  <span className="font-medium tabular-nums">
                    {member.activeAssignments} of {member.capacity}
                  </span>
                </div>
                <Progress value={percent} className={cn("h-2", percent >= 100 && "[&>div]:bg-destructive")} aria-label={`${member.name} workload`} />
              </div>
              <Button asChild variant="ghost" size="sm" className="justify-between">
                <Link href={`/admin/complaints?assignedStaffId=${member.id}`}>
                  See their jobs
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
