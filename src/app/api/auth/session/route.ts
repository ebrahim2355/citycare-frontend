import { NextResponse, type NextRequest } from "next/server";
import { callBackend, getClientInfo } from "@/lib/server/backend";
import { ACCESS_COOKIE, clearAuthCookies } from "@/lib/server/tokens";
import type { User } from "@/types";

const noSession = (message: string) => NextResponse.json({ success: true, message, data: null }, { headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return noSession("No active session");
  }

  const result = await callBackend<User>("/users/me", { token, client: getClientInfo(request.headers) });

  if (result.status === 401 || result.status === 403) {
    const response = noSession(result.body.message);

    clearAuthCookies(response.cookies);

    return response;
  }

  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
