import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../../auth/_cookies";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const response = await fetch(
    `${API_URL}/auth/matches/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível carregar este perfil agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
