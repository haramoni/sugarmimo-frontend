import "server-only";

import { API_URL } from "./_cookies";

export const SERVER_API_URL = API_URL;

export function forwardedClientHeaders(request: Request) {
  const ipAddress = normalizeIpHeader(
    request.headers.get("x-real-ip") ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for"),
  );
  const userAgent = request.headers.get("user-agent")?.trim().slice(0, 500);

  return {
    ...(ipAddress
      ? {
          "X-Real-IP": ipAddress,
          "X-Forwarded-For": ipAddress,
        }
      : {}),
    ...(userAgent ? { "User-Agent": userAgent } : {}),
  };
}

function normalizeIpHeader(value: string | null) {
  const candidate = value?.split(",")[0]?.trim();

  return candidate && /^[0-9a-f:.]+$/i.test(candidate)
    ? candidate.slice(0, 45)
    : undefined;
}
