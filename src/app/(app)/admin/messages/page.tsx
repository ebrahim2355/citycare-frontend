import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminMessages } from "@/components/dashboard/admin/admin-messages";
import { messageFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { adminQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const filters = parseFilters(messageFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(adminQueries.messages(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminMessages />
    </HydrationBoundary>
  );
}
