import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../../_proxy";

const MEMBERSHIP_TIERS = new Set(["free", "basic", "premium", "elite"]);

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string; tier: string }> },
) {
  const { id, tier } = await context.params;
  const normalizedTier = tier.trim().toLowerCase();

  if (!MEMBERSHIP_TIERS.has(normalizedTier)) {
    return NextResponse.json(
      { message: "Nível de membro inválido." },
      { status: 400 },
    );
  }

  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/membership/${encodeURIComponent(normalizedTier)}`,
    { method: "PATCH" },
  );
}
