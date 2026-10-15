import { NextResponse, type NextRequest } from "next/server";
import { getAreaRole, isGuestOnlyPath, ROLE_HOME } from "@/lib/roles";
import { getClientInfo } from "@/lib/server/backend";
import {
  ACCESS_COOKIE,
  clearAuthCookies,
  expiresSoon,
  REFRESH_COOKIE,
  refreshTokens,
  type SessionClaims,
  setAuthCookies,
  type TokenPair,
  verifyAccessToken,
} from "@/lib/server/tokens";

const resolveSession = async (request: NextRequest) => {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let session: SessionClaims | null = await verifyAccessToken(accessToken);
  let rotated: TokenPair | null = null;
  let dropCookies = false;

  if ((!session || expiresSoon(session)) && refreshToken) {
    const outcome = await refreshTokens(refreshToken, getClientInfo(request.headers));

    if (outcome.status === "ok") {
      rotated = outcome.tokens;
      session = await verifyAccessToken(rotated.accessToken);
    } else if (outcome.status === "invalid") {
      session = null;
      dropCookies = true;
    }
  } else if (!session && accessToken) {
    dropCookies = true;
  }

  return { session, rotated, dropCookies };
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/auth/") && pathname !== "/api/auth/session") {
    return NextResponse.next();
  }

  const { session, rotated, dropCookies } = await resolveSession(request);
  const isApi = pathname.startsWith("/api/");
  const areaRole = isApi ? null : getAreaRole(pathname);
  let response: NextResponse;

  if (areaRole && !session) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    response = NextResponse.redirect(loginUrl);
  } else if (session && !isApi && ((areaRole && areaRole !== session.role) || isGuestOnlyPath(pathname))) {
    response = NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  } else if (rotated) {
    request.cookies.set(ACCESS_COOKIE, rotated.accessToken);
    request.cookies.set(REFRESH_COOKIE, rotated.refreshToken);
    response = NextResponse.next({ request: { headers: request.headers } });
  } else {
    if (dropCookies) {
      request.cookies.delete(ACCESS_COOKIE);
      request.cookies.delete(REFRESH_COOKIE);
    }

    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (rotated) {
    setAuthCookies(response.cookies, rotated);
  } else if (dropCookies) {
    clearAuthCookies(response.cookies);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt)$).*)"],
};
