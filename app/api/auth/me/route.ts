import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../_cookies";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    await clearSessionCookie();
    return NextResponse.json(result, { status: response.status });
  }

  return NextResponse.json(result);
}
