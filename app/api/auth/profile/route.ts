import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../_cookies";
import { rejectBodyLargerThan } from "../../_request-security";

export async function PATCH(request: Request) {
  const oversized = rejectBodyLargerThan(request, 64 * 1024 * 1024);
  if (oversized) return oversized;

  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    await clearSessionCookie();
    return NextResponse.json(
      { message: "Não foi possível salvar o perfil agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
