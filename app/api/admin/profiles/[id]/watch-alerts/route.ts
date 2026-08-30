import { forwardAdminRequest } from "../../../_proxy";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardAdminRequest(
    `/admin/profiles/${encodeURIComponent(id)}/watch-alerts`,
    { method: "DELETE" },
  );
}
