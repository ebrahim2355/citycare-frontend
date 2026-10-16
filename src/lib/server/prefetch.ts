import "server-only";
import { notFound } from "next/navigation";
import { isApiError } from "@/lib/api/errors";
import { getQueryClient } from "@/lib/query/client";
import { complaintQueries } from "@/lib/query/options";
import { serverFetcher } from "@/lib/server/fetcher";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const prefetchComplaint = async (id: string) => {
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(complaintQueries.detail(id, serverFetcher));
  } catch (error) {
    if (isApiError(error) && [400, 403, 404].includes(error.status)) {
      notFound();
    }

    throw error;
  }

  return queryClient;
};
