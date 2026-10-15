import { NextResponse, type NextRequest } from "next/server";
import { readJson } from "@/lib/server/auth-response";
import { callBackend, getClientInfo } from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const { email } = await readJson(request);
  const result = await callBackend("/auth/forgot-password", {
    method: "POST",
    json: { email },
    client: getClientInfo(request.headers),
  });

  return NextResponse.json(result.body, { status: result.status });
}
