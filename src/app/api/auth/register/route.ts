import type { NextRequest } from "next/server";
import { readJson, type SessionPayload, sessionResponse } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const { name, email, password, phone, address } = await readJson(request);
  const result = await callBackend<SessionPayload>("/auth/register", {
    method: "POST",
    json: { name, email, password, phone: phone || undefined, address: address || undefined },
    client: getClientInfo(request.headers),
  });

  return sessionResponse(result);
}
