import { NextResponse } from "next/server";

import { API_URL } from "../_cookies";

export async function GET() {
  const response = await fetch(`${API_URL}/auth/registration-policies`, {
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível consultar as versões das políticas." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
