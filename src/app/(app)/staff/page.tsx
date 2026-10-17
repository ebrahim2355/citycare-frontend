import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { StaffOverview } from "@/components/dashboard/staff/staff-overview";
import { getQueryClient } from "@/lib/query/client";
import { complaintQueries, statsQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";
import { ASSIGNED_QUEUE, IN_PROGRESS_QUEUE } from "@/lib/queues";

export const metadata: Metadata = { title: "Staff desk" };

export default async function StaffOverviewPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(statsQueries.staff(serverFetcher)),
    queryClient.prefetchQuery(complaintQueries.list(IN_PROGRESS_QUEUE, serverFetcher)),
    queryClient.prefetchQuery(complaintQueries.list(ASSIGNED_QUEUE, serverFetcher)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffOverview />
    </HydrationBoundary>
  );
}
