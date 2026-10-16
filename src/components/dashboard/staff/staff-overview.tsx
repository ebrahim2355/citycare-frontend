"use client";

import { useQuery } from "@tanstack/react-query";
import { AlarmClock, ArrowRight, CircleCheck, Hammer, PauseCircle, Star, UserCheck } from "lucide-react";
import Link from "next/link";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { StartWorkButton } from "@/components/dashboard/staff/start-work-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import type { ComplaintFilters } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { complaintQueries, statsQueries } from "@/lib/query/options";
import { ASSIGNED_QUEUE, IN_PROGRESS_QUEUE } from "@/lib/staff-queues";

function Queue({ title, description, filters, emptyText }: { title: string; description: string; filters: ComplaintFilters; emptyText: string }) {
  const list = useQuery(complaintQueries.list(filters));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/staff/tasks?status=${filters.status}&sortBy=dueAt&sortOrder=asc`}>
              See all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.isPending && Array.from({ length: 2 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
        {list.error && <ErrorState error={list.error} onRetry={() => list.refetch()} />}
        {list.data?.items.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{emptyText}</p>}
        {list.data?.items.slice(0, 4).map((complaint) => (
          <div key={complaint.id} className="relative">
            <ComplaintCard complaint={complaint} href={`/staff/tasks/${complaint.id}`} showCitizen />
            {complaint.status === "ASSIGNED" && (
              <div className="absolute right-4 bottom-4">
                <StartWorkButton id={complaint.id} />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function StaffOverview() {
  const { user } = useSession();
  const stats = useQuery(statsQueries.staff());
  const data = stats.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good to see you, ${user?.name.split(" ")[0] ?? "there"}`}
        description={user?.department ? `${user.department.name} team. Your jobs sorted by deadline.` : "Your jobs sorted by deadline."}
        actions={
          <Button asChild size="lg">
            <Link href="/staff/tasks">All my tasks</Link>
          </Button>
        }
      />

      {data && !data.acceptsAssignments && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm">
            <PauseCircle className="size-4 text-amber-600" aria-hidden />
            You are not taking new jobs right now. Admins and automatic assignment will skip you.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/staff/profile">Change availability</Link>
          </Button>
        </div>
      )}

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} retrying={stats.isFetching} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data ? (
            <>
              <StatCard
                label="Active jobs"
                value={`${data.activeAssignments} / ${data.capacity}`}
                icon={Hammer}
                tone="sky"
                hint={<Progress value={(data.activeAssignments / data.capacity) * 100} className="mt-1 h-1.5" aria-label="Capacity used" />}
              />
              <StatCard
                label="Waiting to start"
                value={formatNumber(data.waitingToStart)}
                icon={UserCheck}
                tone="violet"
                href="/staff/tasks?status=ASSIGNED"
              />
              <StatCard
                label="Overdue"
                value={formatNumber(data.overdue)}
                icon={AlarmClock}
                tone={data.overdue ? "red" : "emerald"}
                hint={data.overdue ? "Past the target time" : "Nothing late"}
                href="/staff/tasks?overdue=true"
              />
              <StatCard
                label="Average rating"
                value={data.feedback.averageRating ? `${data.feedback.averageRating.toFixed(1)} ★` : "—"}
                icon={Star}
                tone="amber"
                hint={`${formatNumber(data.resolved)} jobs done · ${formatNumber(data.feedback.total)} ratings`}
                href="/staff/performance"
              />
            </>
          ) : (
            Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Queue
          title="In progress"
          description="Jobs you started, earliest deadline first"
          filters={IN_PROGRESS_QUEUE}
          emptyText="Nothing in progress. Start one of your waiting jobs."
        />
        <Queue
          title="Waiting to start"
          description="Assigned to you and not started yet"
          filters={ASSIGNED_QUEUE}
          emptyText="No new jobs. New assignments show up here."
        />
      </div>

      {data && data.activeAssignments === 0 && data.resolved > 0 && (
        <EmptyState
          icon={CircleCheck}
          title="All caught up"
          description={`You have finished ${pluralJobs(data.resolved)}. New jobs appear here when an admin assigns them.`}
        />
      )}
    </div>
  );
}

const pluralJobs = (count: number) => `${formatNumber(count)} ${count === 1 ? "job" : "jobs"}`;
