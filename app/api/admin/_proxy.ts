import { NextResponse } from "next/server";

import { API_URL } from "../auth/_cookies";
import { clearAdminSessionCookie, getAdminSessionToken } from "./_session";

export async function forwardAdminRequest(
  path: string,
  init: RequestInit = {},
) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível acessar o painel administrativo." },
      { status: 503 },
    );
  }

  const result = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    await clearAdminSessionCookie();
  }

  return NextResponse.json(result, { status: response.status });
}

export async function forwardAdminAssetRequest(path: string) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const requestAsset = () =>
    fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);

  let response = await requestAsset();

  if (!response || [502, 503, 504].includes(response.status)) {
    await response?.body?.cancel().catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 300));
    response = await requestAsset();
  }

  if (!response) {
    return NextResponse.json(
      { message: "Não foi possível carregar a foto." },
      { status: 503 },
    );
  }

  if (response.status === 401 || response.status === 403) {
    await clearAdminSessionCookie();
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "cache-control", "etag"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
