import "server-only";
import { decodeJwt, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { callBackend, type ClientInfo } from "@/lib/server/backend";
import type { Role } from "@/types";

type CookieWriter = Pick<NextResponse["cookies"], "set">;

export const ACCESS_COOKIE = "cc_access";
export const REFRESH_COOKIE = "cc_refresh";

const REFRESH_DAYS = 30;
const EARLY_REFRESH_SECONDS = 30;
const roles: Role[] = ["CITIZEN", "STAFF", "ADMIN"];

export interface SessionClaims {
  id: string;
  email: string;
  role: Role;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let secretKey: Uint8Array | null = null;

const getSecret = () => {
  if (!secretKey) {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not set. It must match the secret of the CityCare API.");
    }

    secretKey = new TextEncoder().encode(secret);
  }

  return secretKey;
};

export const verifyAccessToken = async (token: string | undefined | null): Promise<SessionClaims | null> => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { id, email, role, exp } = payload as Partial<SessionClaims>;

    if (typeof id !== "string" || typeof email !== "string" || !role || !roles.includes(role) || typeof exp !== "number") {
      return null;
    }

    return { id, email, role, exp };
  } catch {
    return null;
  }
};

export const expiresSoon = (claims: SessionClaims) => claims.exp * 1000 - Date.now() < EARLY_REFRESH_SECONDS * 1000;

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const setAuthCookies = (cookies: CookieWriter, tokens: TokenPair) => {
  const exp = decodeJwt(tokens.accessToken).exp ?? Math.floor(Date.now() / 1000) + 3600;

  cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...cookieBase, maxAge: Math.max(exp - Math.floor(Date.now() / 1000), 60) });
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...cookieBase, maxAge: REFRESH_DAYS * 24 * 60 * 60 });
};

export const clearAuthCookies = (cookies: CookieWriter) => {
  cookies.set(ACCESS_COOKIE, "", { ...cookieBase, maxAge: 0 });
  cookies.set(REFRESH_COOKIE, "", { ...cookieBase, maxAge: 0 });
};

export type RefreshOutcome = { status: "ok"; tokens: TokenPair } | { status: "invalid" } | { status: "unavailable" };

export const refreshTokens = async (refreshToken: string, client: ClientInfo): Promise<RefreshOutcome> => {
  const result = await callBackend<TokenPair>("/auth/refresh-token", { method: "POST", json: { refreshToken }, client });

  if (result.status === 200 && result.body.data?.accessToken) {
    return { status: "ok", tokens: result.body.data };
  }

  return result.status === 401 || result.status === 403 || result.status === 400 ? { status: "invalid" } : { status: "unavailable" };
};
