import { NextResponse } from "next/server";

import {
  API_URL,
  clearSessionCookie,
  getSessionToken,
} from "../auth/_cookies";

export async function GET(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const search = new URL(request.url).searchParams.get("search")?.trim() ?? "";
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search.slice(0, 50));
  }

  const response = await fetch(
    `${API_URL}/auth/contact-viewers${params.size ? `?${params}` : ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível buscar Sugar Daddies ativos." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
