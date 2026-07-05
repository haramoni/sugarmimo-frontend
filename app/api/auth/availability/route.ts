import { NextResponse } from "next/server";

import { API_URL } from "../_cookies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? "";
  const email = searchParams.get("email") ?? "";

  const response = await fetch(
    `${API_URL}/auth/availability?${new URLSearchParams({
      username,
      email,
    })}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(result, { status: response.status });
  }

  return NextResponse.json(result);
}
