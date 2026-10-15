import { NextResponse, type NextRequest } from "next/server";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/server/tokens";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await callBackend("/auth/logout", { method: "POST", json: { refreshToken }, client: getClientInfo(request.headers) });
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully", data: null });

  clearAuthCookies(response.cookies);

  return response;
}
