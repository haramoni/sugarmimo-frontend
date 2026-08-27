import { NextResponse } from "next/server";

import { API_URL, getSessionToken } from "../../../_cookies";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json(
      { message: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const response = await fetch(
    `${API_URL}/auth/security-incident-notices/${encodeURIComponent(id)}/acknowledge`,
    {
      method: "POST",
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
