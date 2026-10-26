import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/notifications-page";
import { notificationFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { notificationQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Notifications" };

export default async function CitizenNotificationsPage({ searchParams }: PageProps<"/dashboard/notifications">) {
  const filters = parseFilters(notificationFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(notificationQueries.list(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsPage role="CITIZEN" />
    </HydrationBoundary>
  );
}
