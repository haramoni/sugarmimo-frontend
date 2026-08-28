import { NextResponse } from "next/server";

import {
  API_URL,
  clearApprovalSessionCookie,
  clearSessionCookie,
  setApprovalSessionCookie,
  setSessionCookie,
} from "../_cookies";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor de autenticação." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (result?.code === "ACCOUNT_RESTRICTED") {
      await clearSessionCookie();
      await clearApprovalSessionCookie();
    }
    return NextResponse.json(result, { status: response.status });
  }

  if (!result?.user) {
    return NextResponse.json(
      { message: "Resposta de login inválida." },
      { status: 502 },
    );
  }

  if (result.accessToken) {
    await setSessionCookie(result.accessToken);
    await clearApprovalSessionCookie();
    return NextResponse.json({ user: result.user });
  }

  if (result.requiresApproval && result.approvalAccessToken) {
    await clearSessionCookie();
    await setApprovalSessionCookie(result.approvalAccessToken);
    return NextResponse.json({ user: result.user });
  }

  if (result.requiresReapplication && result.reapplicationAccessToken) {
    await clearSessionCookie();
    await setApprovalSessionCookie(result.reapplicationAccessToken);
    return NextResponse.json({
      user: result.user,
      requiresReapplication: true,
      moderationNotice: result.moderationNotice,
    });
  }

  return NextResponse.json(
    { message: "Resposta de login inválida." },
    { status: 502 },
  );
}
