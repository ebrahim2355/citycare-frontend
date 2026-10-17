import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminStaff } from "@/components/dashboard/admin/admin-staff";
import { parseFilters, workloadFilterSchema } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { adminQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Staff workload" };

export default async function AdminStaffPage({ searchParams }: PageProps<"/admin/staff">) {
  const filters = parseFilters(workloadFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(adminQueries.workload(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminStaff />
    </HydrationBoundary>
  );
}
