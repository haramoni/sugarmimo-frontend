import { type NextRequest, NextResponse } from "next/server";

const MAINTENANCE_ROUTE = "/manutencao";

export function proxy(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE !== "false";

  if (maintenanceMode && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(MAINTENANCE_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
