"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlarmClock,
  ArrowRight,
  CircleDollarSign,
  FolderOpen,
  Inbox,
  RefreshCw,
  Star,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { LazyDepartmentBars, LazyStatusDonut, LazyTrendArea } from "@/components/charts/lazy";
import { AutoAssignButton } from "@/components/dashboard/admin/auto-assign-button";
import { bannerOutlineButton, WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { ErrorState } from "@/components/shared/error-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { PriorityBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIORITY_META } from "@/lib/complaint-meta";
import { PRIORITIES } from "@/lib/filters";
import { formatDateTime, formatHours, formatMoney, formatNumber } from "@/lib/format";
import { adminQueries, complaintQueries, statsQueries } from "@/lib/query/options";
import { UNASSIGNED_QUEUE } from "@/lib/queues";
import { cn } from "@/lib/utils";

function UnassignedQueue() {
  const list = useQuery(complaintQueries.list(UNASSIGNED_QUEUE));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waiting for a staff member</CardTitle>
        <CardDescription>Oldest first. Auto assign picks the least busy available person in the department.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/complaints?status=SUBMITTED&unassigned=true&sortBy=createdAt&sortOrder=asc">
              See all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {list.isPending && <Skeleton className="h-40 rounded-xl" />}
        {list.error && <ErrorState error={list.error} onRetry={() => list.refetch()} />}
        {list.data?.items.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Every report has an owner.</p>
        )}
        <ul className="divide-y">
          {list.data?.items.slice(0, 5).map((complaint) => (
            <li key={complaint.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/admin/complaints/${complaint.id}`} className="group min-w-0">
                <p className="truncate font-medium group-hover:text-primary group-hover:underline">{complaint.title}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{complaint.department.name}</span>
                  <span>{complaint.area}</span>
                  <RelativeTime value={complaint.createdAt} />
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                <AutoAssignButton id={complaint.id} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function WorkloadPreview() {
  const workload = useQuery(adminQueries.workload());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff workload</CardTitle>
        <CardDescription>Busiest first</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/staff">
              All staff
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {workload.isPending && <Skeleton className="h-40 rounded-xl" />}
        {[...(workload.data ?? [])]
          .sort((a, b) => b.activeAssignments - a.activeAssignments)
          .slice(0, 5)
          .map((staff) => (
            <div key={staff.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <UserAvatar name={staff.name} size={26} />
                  <span className="truncate font-medium">{staff.name}</span>
                  {!staff.acceptsAssignments && (
                    <span className="rounded-md border border-amber-300/80 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">Paused</span>
                  )}
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {staff.activeAssignments}/{staff.capacity}
                </span>
              </div>
              <Progress
                value={(staff.activeAssignments / staff.capacity) * 100}
                className={cn("h-1.5", staff.activeAssignments >= staff.capacity && "[&>div]:bg-destructive")}
                aria-label={`${staff.name} workload`}
              />
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export function AdminOverview() {
  const stats = useQuery(statsQueries.admin());
  const data = stats.data;

  return (
    <div className="space-y-8">
      <WelcomeBanner
        title="City overview"
        description={data ? `Live numbers, refreshed ${formatDateTime(data.generatedAt)}.` : "Live numbers from every department."}
        actions={
          <Button variant="outline" size="lg" className={bannerOutlineButton} onClick={() => stats.refetch()} disabled={stats.isFetching}>
            <RefreshCw data-icon="inline-start" className={cn(stats.isFetching && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {stats.error && !data ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} retrying={stats.isFetching} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {data ? (
            <>
              <StatCard
                label="Open reports"
                value={formatNumber(data.complaints.open)}
                icon={FolderOpen}
                tone="sky"
                hint={`${formatNumber(data.complaints.createdLast7Days)} new in the last 7 days`}
                href="/admin/complaints?status=IN_PROGRESS"
              />
              <StatCard
                label="Waiting for a staff member"
                value={formatNumber(data.complaints.unassigned)}
                icon={UserX}
                tone="violet"
                hint="Submitted with nobody assigned"
                href="/admin/complaints?status=SUBMITTED&unassigned=true"
              />
              <StatCard
                label="Overdue"
                value={formatNumber(data.complaints.overdue)}
                icon={AlarmClock}
                tone={data.complaints.overdue ? "red" : "emerald"}
                hint="Open past their target time"
                href="/admin/complaints?overdue=true"
              />
              <StatCard
                label="Service revenue"
                value={formatMoney(data.payments.revenue)}
                icon={CircleDollarSign}
                tone="emerald"
                hint={`${formatNumber(data.payments.completed)} paid · ${formatMoney(data.payments.refundedAmount)} refunded`}
                href="/admin/payments"
              />
              <StatCard
                label="Average rating"
                value={data.feedback.averageRating ? `${data.feedback.averageRating.toFixed(2)} ★` : "—"}
                icon={Star}
                tone="amber"
                hint={`${formatNumber(data.feedback.total)} citizen ratings`}
              />
              <StatCard
                label="People"
                value={formatNumber(data.users.total)}
                icon={Users}
                tone="teal"
                hint={`${data.users.citizens} citizens · ${data.users.staff} staff · ${data.users.admins} admins`}
                href="/admin/users"
              />
              <StatCard
                label="New messages"
                value={formatNumber(data.messages.new)}
                icon={Inbox}
                tone={data.messages.new ? "amber" : "teal"}
                hint="From the contact form"
                href="/admin/messages?status=NEW"
              />
              <StatCard
                label="All reports"
                value={formatNumber(data.complaints.total)}
                icon={FolderOpen}
                tone="teal"
                hint={`${data.users.blocked} blocked accounts`}
                href="/admin/complaints"
              />
            </>
          ) : (
            Array.from({ length: 8 }, (_, index) => <StatCardSkeleton key={index} />)
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Reports over the last 30 days</CardTitle>
            <CardDescription>New reports against resolved ones, per day</CardDescription>
          </CardHeader>
          <CardContent>{data ? <LazyTrendArea data={data.trend} /> : <Skeleton className="h-72 rounded-xl" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
            <CardDescription>All {data ? formatNumber(data.complaints.total) : ""} reports</CardDescription>
          </CardHeader>
          <CardContent>{data ? <LazyStatusDonut counts={data.complaints.byStatus} /> : <Skeleton className="h-56 rounded-xl" />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Open, overdue and resolved reports per department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data ? <LazyDepartmentBars data={data.departments} /> : <Skeleton className="h-72 rounded-xl" />}
            {data && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-lg text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                      <th className="py-2 font-semibold">Department</th>
                      <th className="py-2 text-right font-semibold">Open</th>
                      <th className="py-2 text-right font-semibold">Overdue</th>
                      <th className="py-2 text-right font-semibold">Avg fix time</th>
                      <th className="py-2 text-right font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departments.map((department) => (
                      <tr key={department.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">
                          <Link href={`/admin/complaints?departmentId=${department.id}`} className="hover:text-primary hover:underline">
                            {department.name}
                          </Link>
                        </td>
                        <td className="py-2 text-right tabular-nums">{department.open}</td>
                        <td className={cn("py-2 text-right tabular-nums", department.overdue > 0 && "font-semibold text-destructive")}>
                          {department.overdue}
                        </td>
                        <td className="py-2 text-right tabular-nums">{formatHours(department.averageResolutionHours)}</td>
                        <td className="py-2 text-right tabular-nums">{department.averageRating ? `${department.averageRating} ★` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open reports by priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data
                ? [...PRIORITIES].reverse().map((priority) => {
                    const count = data.complaints.openByPriority[priority];
                    const max = Math.max(1, ...Object.values(data.complaints.openByPriority));

                    return (
                      <Link
                        key={priority}
                        href={`/admin/complaints?priority=${priority}`}
                        className="grid grid-cols-[72px_1fr_32px] items-center gap-3 rounded-lg text-sm hover:bg-muted/50"
                      >
                        <span className="font-medium">{PRIORITY_META[priority].label}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-muted">
                          <span
                            className={cn("block h-full rounded-full", PRIORITY_META[priority].bar)}
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </span>
                        <span className="text-right tabular-nums">{count}</span>
                      </Link>
                    );
                  })
                : <Skeleton className="h-28 rounded-xl" />}
            </CardContent>
          </Card>
          <WorkloadPreview />
        </div>
      </div>

      <UnassignedQueue />
    </div>
  );
}
