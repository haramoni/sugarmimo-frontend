import { NextResponse } from "next/server";

import { API_URL, getSessionToken } from "../_cookies";

export async function POST() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ online: false }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/presence`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({ online: false }, { status: 503 });
  }

  const result = await response.json().catch(() => null);
  return NextResponse.json(result, { status: response.status });
}
