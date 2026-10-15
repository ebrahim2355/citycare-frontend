import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { CATALOG_TAG } from "@/lib/server/public-api";
import { ACCESS_COOKIE } from "@/lib/server/tokens";

const BLOCKED_PATH = /^auth(\/|$)/;
const CATALOG_PATH = /^(departments|categories)(\/|$)/;

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
  const hasBody = method !== "GET" && method !== "HEAD" && method !== "DELETE";
  const contentType = request.headers.get("content-type");
  const isJson = !contentType || contentType.includes("application/json");

  const result = await callBackend(`/${target}`, {
    method,
    search: request.nextUrl.search,
    token: request.cookies.get(ACCESS_COOKIE)?.value,
    client: getClientInfo(request.headers),
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

  if (cacheStatus) {
    response.headers.set("X-Cache", cacheStatus);
  }

  return response;
};

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
