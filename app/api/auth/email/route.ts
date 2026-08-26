import { NextResponse } from "next/server";

import { API_URL, getSessionToken } from "../_cookies";

export async function PATCH(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${API_URL}/auth/email`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível alterar o e-mail agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
