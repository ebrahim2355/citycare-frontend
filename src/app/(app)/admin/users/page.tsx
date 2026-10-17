import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminUsers } from "@/components/dashboard/admin/admin-users";
import { parseFilters, userFilterSchema } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { adminQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const filters = parseFilters(userFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(adminQueries.users(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsers />
    </HydrationBoundary>
  );
}
