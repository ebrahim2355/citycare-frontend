import type { NextRequest } from "next/server";
import { readJson, type SessionPayload, sessionResponse } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const { email, password, redirect } = await readJson(request);
  const result = await callBackend<SessionPayload>("/auth/login", {
    method: "POST",
    json: { email, password },
    client: getClientInfo(request.headers),
  });

  return sessionResponse(result, typeof redirect === "string" ? redirect : null);
}
