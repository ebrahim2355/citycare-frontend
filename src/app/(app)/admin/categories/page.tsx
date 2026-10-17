import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminCategories } from "@/components/dashboard/admin/admin-categories";
import { categoryFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { catalogQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Categories and fees" };

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const filters = parseFilters(categoryFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(catalogQueries.categories({ ...filters, includeInactive: true }, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminCategories />
    </HydrationBoundary>
  );
}
