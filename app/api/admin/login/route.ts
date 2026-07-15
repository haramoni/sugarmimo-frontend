import { NextResponse } from "next/server";

import { API_URL } from "../../auth/_cookies";
import { setAdminSessionCookie } from "../_session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(result, { status: response.status });
  }

  if (!result?.accessToken) {
    return NextResponse.json(
      { message: "Resposta administrativa inválida." },
      { status: 502 },
    );
  }

  await setAdminSessionCookie(result.accessToken);
  return NextResponse.json({ user: result.user });
}
