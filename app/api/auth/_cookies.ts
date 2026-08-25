import { cookies } from "next/headers";

export { API_URL, SESSION_COOKIE } from "@/app/lib/auth";
import { SESSION_COOKIE } from "@/app/lib/auth";

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
