import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string; status: string }> },
) {
  const { id, status } = await context.params;

  if (!["feature", "unfeature"].includes(status)) {
    return NextResponse.json({ message: "Status inválido." }, { status: 400 });
  }

  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/${status}`,
    { method: "PATCH" },
  );
}
