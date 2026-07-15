import { NextResponse } from "next/server";

import { API_URL } from "../auth/_cookies";
import { clearAdminSessionCookie, getAdminSessionToken } from "./_session";

export async function forwardAdminRequest(
  path: string,
  init: RequestInit = {},
) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível acessar o painel administrativo." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    await clearAdminSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
