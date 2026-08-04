import { forwardAdminRequest } from "../../../_proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardAdminRequest(
    `/admin/chat-reports/${encodeURIComponent(id)}/resolve`,
    {
      method: "PATCH",
      body,
      headers: { "Content-Type": "application/json" },
    },
  );
}
