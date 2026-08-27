import { NextResponse } from "next/server";

export function rejectBodyLargerThan(request: Request, maxBytes: number) {
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength <= maxBytes) return null;

  return NextResponse.json(
    { message: "A requisição excede o tamanho permitido." },
    { status: 413 },
  );
}
