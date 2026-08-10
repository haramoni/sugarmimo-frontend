import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../auth/_cookies";

export async function GET(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const page = searchParams.get("page")?.trim() || "1";
  const limit = searchParams.get("limit")?.trim() || "6";
  const backendParams = new URLSearchParams();

  backendParams.set("page", page);
  backendParams.set("limit", limit);

  if (search) {
    backendParams.set("search", search);
  }

  const response = await fetch(
    `${API_URL}/auth/matches${backendParams.size ? `?${backendParams}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível carregar a busca agora." },
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
            photos: Array.isArray(profile?.photos)
              ? profile.photos.map((photo: { id?: string }) => ({
                  ...photo,
                  dataUrl: photo.id
                    ? `/api/match-photos/${encodeURIComponent(photo.id)}?variant=card`
                    : "",
                }))
              : [],
          }),
        ),
      }
    : result;

  return NextResponse.json(profiles, { status: response.status });
}
