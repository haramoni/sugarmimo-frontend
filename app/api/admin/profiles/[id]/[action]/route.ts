import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await context.params;

  if (
    ![
      "approve",
      "reject",
      "wait",
      "priority",
      "standard-priority",
      "ban",
      "activate",
    ].includes(action)
  ) {
    return NextResponse.json({ message: "Ação inválida." }, { status: 400 });
  }

  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/${action}`,
    { method: "PATCH" },
  );
}
