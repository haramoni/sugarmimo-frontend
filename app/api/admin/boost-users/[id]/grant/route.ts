import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!Number.isInteger(body?.quantity)) {
    return NextResponse.json(
      { message: "Informe uma quantidade válida." },
      { status: 400 },
    );
  }

  return forwardAdminRequest(
    `/admin/boost-users/${encodeURIComponent(id)}/grant`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: body.quantity }),
    },
  );
}
