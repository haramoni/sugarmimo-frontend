import { NextResponse } from "next/server";

import { API_URL, getSessionToken } from "../../_cookies";

export async function POST(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json(
      { message: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const response = await fetch(`${API_URL}/auth/privacy-policy/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
