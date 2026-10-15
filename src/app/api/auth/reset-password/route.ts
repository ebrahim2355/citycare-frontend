import { NextResponse, type NextRequest } from "next/server";
import { readJson } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const { token, newPassword } = await readJson(request);
  const result = await callBackend("/auth/reset-password", {
    method: "POST",
    json: { token, newPassword },
    client: getClientInfo(request.headers),
  });

  return NextResponse.json(result.body, { status: result.status });
}
