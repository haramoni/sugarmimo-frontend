import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../auth/_cookies";

export async function GET(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const backendParams = new URLSearchParams();

  if (search) {
    backendParams.set("search", search);
  }

  const response = await fetch(
    `${API_URL}/auth/matches${backendParams.size ? `?${backendParams}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível carregar a busca agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
