import { NextResponse } from "next/server";

import { API_URL } from "../auth/_cookies";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Não foi possível ler a mensagem." },
      { status: 400 },
    );
  }

  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "O atendimento está indisponível. Tente novamente em instantes." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => ({
    message: response.ok
      ? "Mensagem enviada com sucesso."
      : "Não foi possível enviar a mensagem.",
  }));

  return NextResponse.json(result, { status: response.status });
}
