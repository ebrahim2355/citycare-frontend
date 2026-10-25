import "server-only";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/roles";
import type { BackendResult } from "@/lib/server/backend";
import { setAuthCookies, type TokenPair } from "@/lib/server/tokens";
import type { User } from "@/types";

export type SessionPayload = TokenPair & { user: User };

export const sessionResponse = (result: BackendResult<SessionPayload>, redirect?: string | null) => {
  if (result.status >= 400 || !result.body.success || !result.body.data?.accessToken) {
    return NextResponse.json(result.body, {
      status: result.status >= 400 ? result.status : 502,
      headers: { "X-Request-Id": result.requestId },
    });
  }

  const { user, accessToken, refreshToken } = result.body.data;
  const response = NextResponse.json(
    {
      success: true,
      message: result.body.message,
      data: { user, redirectTo: getSafeRedirect(redirect, user.role) },
    },
    { status: result.status, headers: { "X-Request-Id": result.requestId } }
  );

  setAuthCookies(response.cookies, { accessToken, refreshToken });

  return response;
};

export const readJson = async (request: Request): Promise<Record<string, unknown>> => {
  const body = await request.json().catch(() => null);

  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
};
