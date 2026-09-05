import { NextResponse } from "next/server";

import {
  API_URL,
  clearApprovalSessionCookie,
  clearSessionCookie,
  getApprovalSessionToken,
  getSessionToken,
} from "../../_cookies";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const searchParams = new URL(request.url).searchParams;
  const isReapplication = searchParams.get("scope") === "reapplication";
  const token = isReapplication
    ? await getApprovalSessionToken()
    : await getSessionToken();

  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await context.params;
  const requestedVariant = searchParams.get("variant");
  const variant = requestedVariant === "card" ? "card" : "profile";
  const backendPath = isReapplication
    ? "reapplication-profile-photos"
    : "profile-photos";
  const response = await fetch(
    `${API_URL}/auth/${backendPath}/${encodeURIComponent(id)}?variant=${variant}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return new NextResponse(null, { status: 503 });
  }

  if (response.status === 401) {
    if (isReapplication) await clearApprovalSessionCookie();
    else await clearSessionCookie();
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
      "Cache-Control": "private, max-age=31536000, immutable",
      ...(response.headers.get("etag")
        ? { ETag: response.headers.get("etag")! }
        : {}),
    },
  });
}
