import { NextResponse } from "next/server";

import {
  API_URL,
  clearApprovalSessionCookie,
  getApprovalSessionToken,
} from "../../auth/_cookies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeQr = searchParams.get("includeQr") === "false" ? "false" : "true";

  return forwardPaymentRequest(
    `${API_URL}/payments/approval-priority?includeQr=${includeQr}`,
    { method: "GET" },
  );
}

export async function POST(request: Request) {
  const body = await request.text();

  return forwardPaymentRequest(`${API_URL}/payments/approval-priority`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

async function forwardPaymentRequest(url: string, init: RequestInit) {
  const token = await getApprovalSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao serviço de pagamento." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearApprovalSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
