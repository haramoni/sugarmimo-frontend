import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ photoId: string; action: string }> },
) {
  const { photoId, action } = await context.params;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ message: "Ação inválida." }, { status: 400 });
  }

  const body = action === "reject" ? await request.text() : undefined;

  return forwardAdminRequest(
    `/admin/photo-moderation/${encodeURIComponent(photoId)}/${action}`,
    {
      method: "PATCH",
      ...(body
        ? { body, headers: { "Content-Type": "application/json" } }
        : {}),
    },
  );
}
