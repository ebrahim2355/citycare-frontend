import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { CitizenPayments } from "@/components/dashboard/citizen/citizen-payments";
import { paymentFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { paymentQueries, statsQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Payments" };

export default async function CitizenPaymentsPage({ searchParams }: PageProps<"/dashboard/payments">) {
  const filters = parseFilters(paymentFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(paymentQueries.list(filters, serverFetcher)),
    queryClient.prefetchQuery(statsQueries.citizen(serverFetcher)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CitizenPayments />
    </HydrationBoundary>
  );
}
