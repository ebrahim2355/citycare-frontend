"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleCheck, CircleDollarSign, ClipboardList, FilePlus2, Hourglass, Inbox, Star } from "lucide-react";
import Link from "next/link";
import { LazyStatusDonut } from "@/components/charts/lazy";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { formatMoney, formatNumber, pluralize } from "@/lib/format";
import { complaintQueries, statsQueries } from "@/lib/query/options";

export function CitizenOverview() {
  const { user } = useSession();
  const stats = useQuery(statsQueries.citizen());
  const recent = useQuery(complaintQueries.recent());
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Here is what is happening with your reports."
        actions={
          <Button asChild size="lg">
            <Link href="/dashboard/complaints/new">
              <FilePlus2 data-icon="inline-start" />
              New report
            </Link>
          </Button>
        }
      />

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} retrying={stats.isFetching} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.data ? (
            <>
              <StatCard
                label="Open reports"
                value={formatNumber(stats.data.open)}
                icon={Hourglass}
                tone="sky"
                hint="Submitted, assigned or in progress"
                href="/dashboard/complaints?status=IN_PROGRESS"
              />
              <StatCard
                label="Waiting for payment"
                value={formatNumber(stats.data.awaitingPayment)}
                icon={CircleDollarSign}
                tone="amber"
                hint="Pay to send them to the city"
                href="/dashboard/complaints?status=PENDING_PAYMENT"
              />
              <StatCard
                label="Waiting for your rating"
                value={formatNumber(stats.data.awaitingFeedback)}
                icon={Star}
                tone="violet"
                hint="Resolved, tell us how it went"
                href="/dashboard/complaints?status=RESOLVED"
              />
              <StatCard
                label="Fixed and closed"
                value={formatNumber(stats.data.resolved)}
                icon={CircleCheck}
                tone="emerald"
                hint={`${formatMoney(stats.data.payments.totalPaid)} paid for services`}
                href="/dashboard/complaints?status=CLOSED"
              />
            </>
          ) : (
            Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
          )}
        </div>
      )}

      {stats.data && stats.data.awaitingPayment > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <span className="font-semibold">{pluralize(stats.data.awaitingPayment, "service request")}</span> will not reach the city until
            the fee is paid.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/complaints?status=PENDING_PAYMENT">
              Pay now
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Your reports that changed most recently</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/complaints">
                  See all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.isPending &&
              Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
            {recent.error && <ErrorState error={recent.error} onRetry={() => recent.refetch()} retrying={recent.isFetching} />}
            {recent.data?.items.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="No reports yet"
                description="When you report a problem it shows up here with its status and deadline."
                action={
                  <Button asChild>
                    <Link href="/dashboard/complaints/new">Report your first problem</Link>
                  </Button>
                }
                className="border-dashed"
              />
            )}
            {recent.data?.items.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} href={`/dashboard/complaints/${complaint.id}`} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports by status</CardTitle>
            <CardDescription>
              {stats.data ? `${pluralize(stats.data.totalComplaints, "report")} in total` : "Loading your numbers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.data && stats.data.totalComplaints > 0 ? (
              <LazyStatusDonut counts={stats.data.byStatus} />
            ) : stats.data ? (
              <EmptyState icon={ClipboardList} title="Nothing to show yet" description="Your chart fills in after your first report." />
            ) : (
              <Skeleton className="h-56 rounded-xl" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
