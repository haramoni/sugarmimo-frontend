import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../_cookies";
import { attachOwnPhotoUrls } from "../_profile-photo-urls";

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
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível validar sua sessão." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      await clearSessionCookie();
    }
    return NextResponse.json(result, { status: response.status });
  }

  if (!result || typeof result !== "object" || typeof result.id !== "string") {
    return NextResponse.json(
      { message: "Não foi possível carregar sua conta agora." },
      { status: 502 },
    );
  }

  return NextResponse.json(attachOwnPhotoUrls(result));
}
