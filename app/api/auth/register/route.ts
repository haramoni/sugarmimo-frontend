import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, setSessionCookie } from "../_cookies";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    const safeResult = { ...result };
    delete safeResult.accessToken;
    return NextResponse.json(safeResult);
  }

  if (result?.requiresApproval) {
    await clearSessionCookie();
  }

  return NextResponse.json(result);
}
