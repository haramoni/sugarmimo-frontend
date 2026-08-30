import { NextResponse } from "next/server";

import {
  clearApprovalSessionCookie,
  clearSessionCookie,
  setApprovalSessionCookie,
  setSessionCookie,
} from "../_cookies";
import { forwardedClientHeaders, SERVER_API_URL } from "../_client-ip";
import { rejectBodyLargerThan } from "../../_request-security";

export async function POST(request: Request) {
  const oversized = rejectBodyLargerThan(request, 64 * 1024 * 1024);
  if (oversized) return oversized;

  const body = await request.json();

  const response = await fetch(`${SERVER_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...forwardedClientHeaders(request),
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor de cadastro." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(result, { status: response.status });
  }

  if (result?.accessToken) {
    await setSessionCookie(result.accessToken);
    await clearApprovalSessionCookie();
    const safeResult = { ...result };
    delete safeResult.accessToken;
    return NextResponse.json(safeResult);
  }

  if (result?.requiresApproval && result?.approvalAccessToken) {
    await clearSessionCookie();
    await setApprovalSessionCookie(result.approvalAccessToken);
    const safeResult = { ...result };
    delete safeResult.approvalAccessToken;
    return NextResponse.json(safeResult);
  }

  return NextResponse.json(result);
}
