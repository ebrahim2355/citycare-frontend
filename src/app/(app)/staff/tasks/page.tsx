import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { StaffTasks } from "@/components/dashboard/staff/staff-tasks";
import { complaintFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { complaintQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "My tasks" };

export default async function StaffTasksPage({ searchParams }: PageProps<"/staff/tasks">) {
  const filters = parseFilters(complaintFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(complaintQueries.list(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffTasks />
    </HydrationBoundary>
  );
}
