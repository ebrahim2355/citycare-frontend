import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirect } from "@/lib/roles";
import type { SessionPayload } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { setAuthCookies } from "@/lib/server/tokens";

const backToLogin = (request: NextRequest, message: string) => {
  const url = new URL("/login", request.nextUrl.origin);

  url.searchParams.set("error", message);

  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return backToLogin(request, error || "Google did not send a login code.");
  }

  const result = await callBackend<SessionPayload>("/auth/google/exchange", {
    method: "POST",
    json: { code },
    client: getClientInfo(request.headers),
  });

  if (result.status >= 400 || !result.body.data?.accessToken) {
    return backToLogin(request, result.body.errors?.[0]?.message || result.body.message);
  }

  const { user, accessToken, refreshToken } = result.body.data;
  const response = NextResponse.redirect(new URL(getSafeRedirect(searchParams.get("next"), user.role), request.nextUrl.origin));

  setAuthCookies(response.cookies, { accessToken, refreshToken });

  return response;
}
