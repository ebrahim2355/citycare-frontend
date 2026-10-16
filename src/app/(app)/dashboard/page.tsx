import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { CitizenOverview } from "@/components/dashboard/citizen/citizen-overview";
import { getQueryClient } from "@/lib/query/client";
import { complaintQueries, statsQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "My dashboard" };

export default async function CitizenDashboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(statsQueries.citizen(serverFetcher)),
    queryClient.prefetchQuery(complaintQueries.recent(serverFetcher)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CitizenOverview />
    </HydrationBoundary>
  );
}
