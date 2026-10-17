import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminPayments } from "@/components/dashboard/admin/admin-payments";
import { paymentFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { paymentQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const filters = parseFilters(paymentFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(paymentQueries.list(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPayments />
    </HydrationBoundary>
  );
}
