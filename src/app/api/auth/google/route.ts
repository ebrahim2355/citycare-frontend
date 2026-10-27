import { NextResponse, type NextRequest } from "next/server";
import { toLocalPath } from "@/lib/roles";
import { API_URL } from "@/lib/server/backend";

export function GET(request: NextRequest) {
  const next = toLocalPath(request.nextUrl.searchParams.get("redirect"));
  const callback = new URL("/api/auth/google/callback", request.nextUrl.origin);

  if (next) {
    callback.searchParams.set("next", next);
  }

  const target = new URL(`${API_URL}/auth/google`);

  target.searchParams.set("redirect", callback.toString());

  return NextResponse.redirect(target);
}
