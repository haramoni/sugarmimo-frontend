import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../auth/_cookies";

export async function GET(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page")?.trim() || "1";
  const limit = searchParams.get("limit")?.trim() || "6";
  const response = await fetch(
    `${API_URL}/auth/boosts?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Nao foi possivel carregar os destaques agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  const profiles = Array.isArray(result?.items)
    ? {
        ...result,
        items: result.items.map(
          (profile: { photos?: Array<{ id?: string }> }) => ({
            ...profile,
            photos: Array.isArray(profile.photos)
              ? profile.photos.map((photo: { id?: string }) => ({
                  ...photo,
                  dataUrl: photo.id
                    ? `/api/match-photos/${encodeURIComponent(photo.id)}`
                    : "",
                }))
              : [],
          }),
        ),
      }
    : result;

  return NextResponse.json(profiles, { status: response.status });
}
