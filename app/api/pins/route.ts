import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../auth/_cookies";

export async function GET() {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/pins`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível carregar seus Pins agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  const pins = Array.isArray(result?.items)
    ? {
        ...result,
        items: result.items.map(
          (profile: { photos?: Array<{ id?: string }> }) => ({
            ...profile,
            photos: Array.isArray(profile.photos)
              ? profile.photos.map((photo: { id?: string }) => ({
                  ...photo,
                  dataUrl: photo.id
                    ? `/api/match-photos/${encodeURIComponent(photo.id)}?variant=card&v=3`
                    : "",
                }))
              : [],
          }),
        ),
      }
    : result;

  return NextResponse.json(pins, { status: response.status });
}
