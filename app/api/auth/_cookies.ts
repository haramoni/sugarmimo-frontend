import { cookies } from "next/headers";

import {
  API_URL as PUBLIC_API_URL,
  SESSION_COOKIE,
} from "@/app/lib/auth";

export { SESSION_COOKIE };

const configuredInternalApiUrl = process.env.INTERNAL_API_URL?.trim();

// Every consumer of this module is a server-side BFF route. In production the
// API lives on the same EC2 instance, so avoid a paid/public network round trip.
export const API_URL = (
  configuredInternalApiUrl ||
  (process.env.NODE_ENV === "production"
    ? "http://127.0.0.1:3001"
    : PUBLIC_API_URL)
).replace(/\/$/, "");

export const APPROVAL_SESSION_COOKIE = "sugarmimo_approval_session";

const isProduction = process.env.NODE_ENV === "production";
const configuredSessionMaxAge = Number(
  process.env.AUTH_SESSION_MAX_AGE_SECONDS ?? 86_400,
);
const sessionMaxAge =
  Number.isSafeInteger(configuredSessionMaxAge) && configuredSessionMaxAge > 0
    ? configuredSessionMaxAge
    : 86_400;

export async function setSessionCookie(accessToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function setApprovalSessionCookie(accessToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(APPROVAL_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function getApprovalSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(APPROVAL_SESSION_COOKIE)?.value;
}

export async function clearApprovalSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(APPROVAL_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
