import { NextResponse } from "next/server";

import {
  API_URL,
  clearApprovalSessionCookie,
  clearSessionCookie,
  getSessionToken,
} from "../_cookies";

export async function DELETE(request: Request) {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const response = await fetch(`${API_URL}/auth/account`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível excluir a conta agora." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.ok) {
    await clearSessionCookie();
    await clearApprovalSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}
