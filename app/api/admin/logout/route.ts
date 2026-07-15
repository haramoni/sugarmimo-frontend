import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "../_session";

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
