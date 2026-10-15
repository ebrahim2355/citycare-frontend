import { NextResponse, type NextRequest } from "next/server";
import { readJson } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { ACCESS_COOKIE, setAuthCookies, type TokenPair } from "@/lib/server/tokens";

export async function POST(request: NextRequest) {
  const { currentPassword, newPassword } = await readJson(request);
  const result = await callBackend<TokenPair>("/auth/change-password", {
    method: "POST",
    json: { currentPassword: currentPassword || undefined, newPassword },
    token: request.cookies.get(ACCESS_COOKIE)?.value,
    client: getClientInfo(request.headers),
  });

  if (result.status >= 400 || !result.body.data?.accessToken) {
    return NextResponse.json(result.body, { status: result.status >= 400 ? result.status : 502 });
  }

  const response = NextResponse.json({ success: true, message: "Password changed. Other devices were signed out.", data: null });

  setAuthCookies(response.cookies, result.body.data);

  return response;
}
