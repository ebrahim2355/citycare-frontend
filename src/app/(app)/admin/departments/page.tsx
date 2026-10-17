import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminDepartments } from "@/components/dashboard/admin/admin-departments";
import { getQueryClient } from "@/lib/query/client";
import { catalogQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Departments" };

export default async function AdminDepartmentsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(catalogQueries.departments(serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDepartments />
    </HydrationBoundary>
  );
}
