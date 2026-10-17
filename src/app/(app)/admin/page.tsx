import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminOverview } from "@/components/dashboard/admin/admin-overview";
import { getQueryClient } from "@/lib/query/client";
import { adminQueries, complaintQueries, statsQueries } from "@/lib/query/options";
import { UNASSIGNED_QUEUE } from "@/lib/queues";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "City overview" };

export default async function AdminOverviewPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(statsQueries.admin(serverFetcher)),
    queryClient.prefetchQuery(complaintQueries.list(UNASSIGNED_QUEUE, serverFetcher)),
    queryClient.prefetchQuery(adminQueries.workload({}, serverFetcher)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOverview />
    </HydrationBoundary>
  );
}
