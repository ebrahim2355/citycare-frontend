import { ApiError } from "@/lib/api/errors";
import type { ApiResponse, Paginated, QueryParams } from "@/types";

export interface Fetcher {
  get: <T>(path: string, params?: QueryParams) => Promise<T>;
  list: <T>(path: string, params?: QueryParams) => Promise<Paginated<T>>;
}

export const buildQuery = (params?: QueryParams) => {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();

  return query ? `?${query}` : "";
};

export const readEnvelope = <T>(status: number, body: unknown): ApiResponse<T> => {
  const envelope = body as Partial<ApiResponse<T>> | null;

  if (!envelope || typeof envelope.success !== "boolean") {
    throw new ApiError("Unexpected response from the server", status || 502, [
      { message: "The CityCare API sent a response that could not be read. Please try again." },
    ]);
  }

  if (!envelope.success || status >= 400) {
    throw new ApiError(envelope.message || "Request failed", status, envelope.errors ?? []);
  }

  return envelope as ApiResponse<T>;
};

export const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const body = await response.json().catch(() => null);

  return readEnvelope<T>(response.status, body);
};

export const toPaginated = <T>(envelope: ApiResponse<T[]>): Paginated<T> => {
  const items = envelope.data ?? [];

  return {
    items,
    meta: envelope.meta ?? { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  };
};
