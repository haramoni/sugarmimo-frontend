import { NextResponse } from "next/server";

import {
  API_URL,
  clearSessionCookie,
  getSessionToken,
} from "../../auth/_cookies";

async function updatePin(
  method: "POST" | "DELETE",
  context: { params: Promise<{ profileId: string }> },
) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { profileId } = await context.params;
  const response = await fetch(
    `${API_URL}/auth/pins/${encodeURIComponent(profileId)}`,
    {
      method,
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível atualizar este Pin agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);
  if (response.status === 401) {
    await clearSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  return updatePin("POST", context);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  return updatePin("DELETE", context);
}
