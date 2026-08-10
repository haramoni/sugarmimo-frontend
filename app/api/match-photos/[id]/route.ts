import { NextResponse } from "next/server";

import { API_URL, clearSessionCookie, getSessionToken } from "../../auth/_cookies";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getSessionToken();

  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await context.params;
  const variant = new URL(request.url).searchParams.get("variant");
  const backendParams = new URLSearchParams();

  if (variant === "card") {
    backendParams.set("variant", variant);
  }

  const response = await fetch(
    `${API_URL}/auth/match-photos/${encodeURIComponent(id)}${backendParams.size ? `?${backendParams}` : ""}`,
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

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",
      ...(response.headers.get("content-length")
        ? { "Content-Length": response.headers.get("content-length")! }
        : {}),
      "Cache-Control": "private, max-age=3600, immutable",
    },
  });
}
