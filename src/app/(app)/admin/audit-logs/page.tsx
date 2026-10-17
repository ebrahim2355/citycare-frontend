import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { AdminAuditLogs } from "@/components/dashboard/admin/admin-audit-logs";
import { auditFilterSchema, parseFilters } from "@/lib/filters";
import { getQueryClient } from "@/lib/query/client";
import { adminQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

export const metadata: Metadata = { title: "Audit log" };

export default async function AdminAuditLogsPage({ searchParams }: PageProps<"/admin/audit-logs">) {
  const filters = parseFilters(auditFilterSchema, await searchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(adminQueries.auditLogs(filters, serverFetcher));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminAuditLogs />
    </HydrationBoundary>
  );
}
