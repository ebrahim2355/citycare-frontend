import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { callBackend, getClientInfo, openBackendDownload } from "@/lib/server/backend";
import { CATALOG_TAG } from "@/lib/server/public-api";
import { ACCESS_COOKIE } from "@/lib/server/tokens";

const BLOCKED_PATH = /^auth(\/|$)/;
const CATALOG_PATH = /^(departments|categories)(\/|$)/;
const DOWNLOAD_PATH = /^admin\/exports\//;

const download = async (request: NextRequest, target: string) => {
  const requestId = crypto.randomUUID();
  const upstream = await openBackendDownload(`/${target}`, {
    search: request.nextUrl.search,
    token: request.cookies.get(ACCESS_COOKIE)?.value,
    client: getClientInfo(request.headers),
    requestId,
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { success: false, message: "The CityCare API is not reachable", data: null, errors: [{ message: "Please try again in a moment." }] },
      { status: 503, headers: { "X-Request-Id": requestId } }
    );
  }

  const type = upstream.headers.get("content-type") ?? "";
  const headers = { "Cache-Control": "no-store", "X-Request-Id": upstream.headers.get("x-request-id") ?? requestId };

  if (upstream.ok && type.startsWith("text/csv")) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...headers, "Content-Type": type, "Content-Disposition": upstream.headers.get("content-disposition") ?? "attachment" },
    });
  }

  const body = await upstream.json().catch(() => null);

  return NextResponse.json(
    body ?? { success: false, message: "Unexpected response from the CityCare API", data: null, errors: [{ message: "Please try again." }] },
    { status: upstream.ok ? 502 : upstream.status, headers }
  );
};

const forward = async (request: NextRequest, context: RouteContext<"/api/backend/[...path]">) => {
  const { path } = await context.params;
  const target = path.map(encodeURIComponent).join("/");

  if (BLOCKED_PATH.test(target)) {
    return NextResponse.json(
      { success: false, message: "Not found", data: null, errors: [{ message: "Sign in and token routes live under /api/auth" }] },
      { status: 404 }
    );
  }

  const method = request.method;

  if (method === "GET" && DOWNLOAD_PATH.test(target)) {
    return download(request, target);
  }

  const hasBody = method !== "GET" && method !== "HEAD" && method !== "DELETE";
  const contentType = request.headers.get("content-type");
  const isJson = !contentType || contentType.includes("application/json");

  const result = await callBackend(`/${target}`, {
    method,
    search: request.nextUrl.search,
    token: request.cookies.get(ACCESS_COOKIE)?.value,
    client: getClientInfo(request.headers),
    requestId: crypto.randomUUID(),
    ...(hasBody
      ? isJson
        ? { json: await request.json().catch(() => ({})) }
        : { body: await request.arrayBuffer(), contentType }
      : {}),
  });

  if (method !== "GET" && result.status < 400 && CATALOG_PATH.test(target)) {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  }

  const response = NextResponse.json(result.body, { status: result.status });
  const cacheStatus = result.headers.get("x-cache");

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Request-Id", result.requestId);

  if (cacheStatus) {
    response.headers.set("X-Cache", cacheStatus);
  }

  return response;
};

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
