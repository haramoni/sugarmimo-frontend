import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return forwardAdminRequest(
    `/admin/boost-users/${encodeURIComponent(id)}/activate`,
    { method: "PATCH" },
  );
}
