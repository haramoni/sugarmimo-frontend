import { NextResponse } from "next/server";

import {
  clearApprovalSessionCookie,
  clearSessionCookie,
} from "../_cookies";

export async function POST() {
  await clearSessionCookie();
  await clearApprovalSessionCookie();
  return NextResponse.json({ ok: true });
}
