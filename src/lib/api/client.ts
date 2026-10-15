import { ApiError } from "@/lib/api/errors";
import { buildQuery, type Fetcher, parseResponse, toPaginated } from "@/lib/api/http";
import type { ApiResponse, QueryParams } from "@/types";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  params?: QueryParams;
}

const offlineError = () =>
  new ApiError("You seem to be offline", 0, [{ message: "Could not reach CityCare. Check your connection and try again." }]);

export const request = async <T>(url: string, { method = "GET", body, params }: RequestOptions = {}): Promise<ApiResponse<T>> => {
  let response: Response;

  try {
    response = await fetch(`${url}${buildQuery(params)}`, {
      method,
      credentials: "same-origin",
      ...(body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw offlineError();
  }

  return parseResponse<T>(response);
};

const backend = (path: string) => `/api/backend${path}`;

export const clientFetcher: Fetcher = {
  get: async <T>(path: string, params?: QueryParams) => (await request<T>(backend(path), { params })).data,
  list: async <T>(path: string, params?: QueryParams) => toPaginated(await request<T[]>(backend(path), { params })),
};

export const api = {
  get: <T>(path: string, params?: QueryParams) => request<T>(backend(path), { params }),
  post: <T>(path: string, body: unknown = {}) => request<T>(backend(path), { method: "POST", body }),
  patch: <T>(path: string, body: unknown = {}) => request<T>(backend(path), { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(backend(path), { method: "DELETE" }),
};

export const authApi = {
  post: <T>(action: string, body: unknown = {}) => request<T>(`/api/auth/${action}`, { method: "POST", body }),
};

export const uploadFiles = <T>(path: string, form: FormData, onProgress?: (percent: number) => void) => {
  return new Promise<ApiResponse<T>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", backend(path));
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const body = xhr.response ?? JSON.parse(xhr.responseText || "null");
        const envelope = body as ApiResponse<T> | null;

        if (!envelope || !envelope.success || xhr.status >= 400) {
          reject(new ApiError(envelope?.message || "Upload failed", xhr.status, envelope?.errors ?? []));
          return;
        }

        resolve(envelope);
      } catch {
        reject(new ApiError("Upload failed", xhr.status, [{ message: "The server sent a response that could not be read." }]));
      }
    };
    xhr.onerror = () => reject(offlineError());
    xhr.send(form);
  });
};
