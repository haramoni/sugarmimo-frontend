import { NextResponse } from "next/server";

import { API_URL } from "../_cookies";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Dados de recuperação inválidos." },
      { status: 400 },
    );
  }

  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(
    result ?? { message: "Não foi possível redefinir a senha." },
    { status: response.status },
  );
}
