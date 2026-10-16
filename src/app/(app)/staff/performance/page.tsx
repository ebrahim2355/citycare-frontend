import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { StaffPerformance } from "@/components/dashboard/staff/staff-performance";
import { getQueryClient } from "@/lib/query/client";
import { statsQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Performance" };

export default async function StaffPerformancePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(statsQueries.staff(serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffPerformance />
    </HydrationBoundary>
  );
}
