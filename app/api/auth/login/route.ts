import { NextResponse } from "next/server";

import { API_URL, setSessionCookie } from "../_cookies";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor de autenticacao." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(result, { status: response.status });
  }

  if (!result?.accessToken || !result?.user) {
    return NextResponse.json(
      { message: "Resposta de login invalida." },
      { status: 502 },
    );
  }

  await setSessionCookie(result.accessToken);

  return NextResponse.json({ user: result.user });
}
