"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CircleCheck, Star, Timer } from "lucide-react";
import { LazyRatingBars, LazyStatusDonut, LazyWeeklyBars } from "@/components/charts/lazy";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours, formatNumber } from "@/lib/format";
import { statsQueries } from "@/lib/query/options";

export function StaffPerformance() {
  const stats = useQuery(statsQueries.staff());
  const data = stats.data;

  if (stats.error && !data) {
    return <ErrorState error={stats.error} onRetry={() => stats.refetch()} retrying={stats.isFetching} />;
  }

  const ratedTotal = data?.ratingBreakdown.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const weeklyTotal = data?.resolvedByWeek.reduce((sum, item) => sum + item.resolved, 0) ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Performance" description="How your work looks to the citizens and the city. Updated with every job you close." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data ? (
          <>
            <StatCard label="Jobs resolved" value={formatNumber(data.resolved)} icon={CircleCheck} tone="emerald" hint="Resolved and closed" />
            <StatCard
              label="Average time to fix"
              value={formatHours(data.averageResolutionHours)}
              icon={Timer}
              tone="sky"
              hint="From assignment to resolved"
            />
            <StatCard
              label="On time"
              value={data.onTimeRate === null ? "—" : `${data.onTimeRate}%`}
              icon={CalendarCheck}
              tone={data.onTimeRate !== null && data.onTimeRate < 70 ? "amber" : "teal"}
              hint="Resolved before the deadline"
            />
            <StatCard
              label="Average rating"
              value={data.feedback.averageRating ? `${data.feedback.averageRating.toFixed(2)} ★` : "—"}
              icon={Star}
              tone="amber"
              hint={`${formatNumber(data.feedback.total)} citizen ratings`}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Jobs resolved per week</CardTitle>
            <CardDescription>The last 8 weeks, {formatNumber(weeklyTotal)} in total</CardDescription>
          </CardHeader>
          <CardContent>{data ? <LazyWeeklyBars data={data.resolvedByWeek} /> : <Skeleton className="h-64 rounded-xl" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Citizen ratings</CardTitle>
            <CardDescription>{formatNumber(ratedTotal)} ratings on your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {data && ratedTotal > 0 && <LazyRatingBars data={data.ratingBreakdown} />}
            {data && ratedTotal === 0 && <EmptyState icon={Star} title="No ratings yet" description="Citizens rate a job after you resolve it." />}
            {!data && <Skeleton className="h-56 rounded-xl" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All your jobs by status</CardTitle>
          <CardDescription>Including the ones that were rejected or moved to another team</CardDescription>
        </CardHeader>
        <CardContent>{data ? <LazyStatusDonut counts={data.byStatus} centerLabel="jobs" /> : <Skeleton className="h-56 rounded-xl" />}</CardContent>
      </Card>
    </div>
  );
}
