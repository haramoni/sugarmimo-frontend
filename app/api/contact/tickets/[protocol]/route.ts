import { NextResponse } from "next/server";

import { API_URL } from "../../../auth/_cookies";

export async function GET(
  request: Request,
  context: { params: Promise<{ protocol: string }> },
) {
  const { protocol } = await context.params;
  const email = new URL(request.url).searchParams.get("email") ?? "";
  const response = await fetch(
    `${API_URL}/contact/tickets/${encodeURIComponent(protocol)}?email=${encodeURIComponent(email)}`,
    { cache: "no-store" },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "A consulta está temporariamente indisponível." },
      { status: 503 },
    );
  }
  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
