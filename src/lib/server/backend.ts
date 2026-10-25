import type { ApiResponse } from "@/types";

export const API_URL = (process.env.API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";
const TIMEOUT_MS = 20000;

export interface ClientInfo {
  ip?: string | null;
  userAgent?: string | null;
}

interface BackendOptions {
  method?: string;
  json?: unknown;
  body?: BodyInit | null;
  contentType?: string | null;
  token?: string | null;
  search?: string;
  client?: ClientInfo;
  requestId?: string;
}

export interface BackendResult<T = unknown> {
  status: number;
  body: ApiResponse<T>;
  headers: Headers;
  requestId: string;
}

export const getClientInfo = (headers: Headers): ClientInfo => ({
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip"),
  userAgent: headers.get("user-agent"),
});

const unreachable = (requestId: string, status: number, message: string, detail: string): BackendResult<null> => ({
  status,
  body: { success: false, message, data: null, errors: [{ message: detail }] },
  headers: new Headers(),
  requestId,
});

export const callBackend = async <T = unknown>(path: string, options: BackendOptions = {}): Promise<BackendResult<T>> => {
  const { method = "GET", json, body, contentType, token, search = "", client, requestId = crypto.randomUUID() } = options;
  const headers = new Headers({ Accept: "application/json", "X-Request-Id": requestId });

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  } else if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (INTERNAL_API_KEY && client?.ip) {
    headers.set("X-Internal-Key", INTERNAL_API_KEY);
    headers.set("X-Client-IP", client.ip);

    if (client.userAgent) {
      headers.set("X-Client-User-Agent", client.userAgent.slice(0, 250));
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}${search}`, {
      method,
      headers,
      body: json !== undefined ? JSON.stringify(json) : body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
    } as RequestInit);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";

    return unreachable(
      requestId,
      timedOut ? 504 : 503,
      timedOut ? "The CityCare API took too long to answer" : "The CityCare API is not reachable",
      "Please try again in a moment."
    ) as BackendResult<T>;
  }

  const parsed = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!parsed || typeof parsed.success !== "boolean") {
    return unreachable(requestId, 502, "Unexpected response from the CityCare API", "Please try again in a moment.") as BackendResult<T>;
  }

  return { status: response.status, body: parsed, headers: response.headers, requestId: response.headers.get("x-request-id") ?? requestId };
};
