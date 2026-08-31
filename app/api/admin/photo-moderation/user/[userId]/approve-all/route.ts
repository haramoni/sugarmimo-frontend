import { NextResponse } from "next/server";

import { forwardAdminRequest } from "../../../../_proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const photoIds = Array.isArray(body?.photoIds)
    ? body.photoIds.filter(
        (photoId: unknown): photoId is string =>
          typeof photoId === "string" && photoId.length > 0,
      )
    : [];

  if (photoIds.length === 0 || photoIds.length > 20) {
    return NextResponse.json(
      { message: "Informe de 1 a 20 fotos pendentes para aprovação." },
      { status: 400 },
    );
  }

  const bulkResponse = await forwardAdminRequest(
    `/admin/photo-moderation/user/${encodeURIComponent(userId)}/approve-all`,
    { method: "PATCH" },
  );

  if (bulkResponse.status !== 404) return bulkResponse;

  let approvedCount = 0;
  for (const photoId of photoIds) {
    const response = await forwardAdminRequest(
      `/admin/photo-moderation/${encodeURIComponent(photoId)}/approve`,
      { method: "PATCH" },
    );

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      return NextResponse.json(
        {
          message:
            result?.message ??
            `Não foi possível concluir a aprovação de todas as fotos. ${approvedCount} foto(s) foram aprovadas.`,
          approvedCount,
        },
        { status: response.status },
      );
    }
    approvedCount += 1;
  }

  return NextResponse.json({ userId, approvedCount });
}
