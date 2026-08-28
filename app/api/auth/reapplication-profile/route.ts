import { NextResponse } from "next/server";

import {
  API_URL,
  clearApprovalSessionCookie,
  getApprovalSessionToken,
} from "../_cookies";
import { rejectBodyLargerThan } from "../../_request-security";

export async function GET() {
  return forwardReapplicationRequest({ method: "GET" });
}

export async function PATCH(request: Request) {
  const oversized = rejectBodyLargerThan(request, 64 * 1024 * 1024);
  if (oversized) return oversized;

  return forwardReapplicationRequest({
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
}

async function forwardReapplicationRequest(init: RequestInit) {
  const token = await getApprovalSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/reapplication-profile`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível acessar seu perfil agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearApprovalSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
