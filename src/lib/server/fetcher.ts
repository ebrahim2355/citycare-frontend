import "server-only";
import { cookies, headers } from "next/headers";
import { buildQuery, type Fetcher, readEnvelope, toPaginated } from "@/lib/api/http";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { ACCESS_COOKIE } from "@/lib/server/tokens";
import type { QueryParams } from "@/types";

const requestBackend = async <T>(path: string, params?: QueryParams) => {
  const [store, incoming] = await Promise.all([cookies(), headers()]);
  const result = await callBackend<T>(path, {
    search: buildQuery(params),
    token: store.get(ACCESS_COOKIE)?.value,
    client: getClientInfo(incoming),
  });

  return readEnvelope<T>(result.status, result.body, result.requestId);
};

export const serverFetcher: Fetcher = {
  get: async <T>(path: string, params?: QueryParams) => (await requestBackend<T>(path, params)).data,
  list: async <T>(path: string, params?: QueryParams) => toPaginated(await requestBackend<T[]>(path, params)),
};
