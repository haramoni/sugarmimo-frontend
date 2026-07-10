import { NextResponse } from "next/server";

import {
  API_URL,
  clearSessionCookie,
  getSessionToken,
} from "../../auth/_cookies";

export async function GET() {
  return forwardChatRequest("/chat/conversations");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return forwardChatRequest("/chat/conversations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function forwardChatRequest(
  path: string,
  init: RequestInit = {},
) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Nao foi possivel acessar o chat agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
