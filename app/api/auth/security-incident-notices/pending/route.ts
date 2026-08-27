import { NextResponse } from "next/server";

import { API_URL, getSessionToken } from "../../_cookies";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json(
      { message: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${API_URL}/auth/security-incident-notices/pending`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
