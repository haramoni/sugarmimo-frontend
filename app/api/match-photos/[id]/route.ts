import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../../auth/_cookies";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getSessionToken();

  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await context.params;
  const response = await fetch(
    `${API_URL}/auth/match-photos/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return new NextResponse(null, { status: 503 });
  }

  if (response.status === 401) {
    await clearSessionCookie();
  }

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  return new NextResponse(await response.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600, immutable",
    },
  });
}
