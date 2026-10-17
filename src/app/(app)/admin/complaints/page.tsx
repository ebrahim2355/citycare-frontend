import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminComplaints } from "@/components/dashboard/admin/admin-complaints";
import { complaintFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { complaintQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Complaints" };

export default async function AdminComplaintsPage({ searchParams }: PageProps<"/admin/complaints">) {
  const filters = parseFilters(complaintFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(complaintQueries.list(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminComplaints />
    </HydrationBoundary>
  );
}
