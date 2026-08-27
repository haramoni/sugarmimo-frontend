import { forwardAdminRequest } from "../../_proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardAdminRequest(
    `/admin/contact-tickets/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body,
      headers: { "Content-Type": "application/json" },
    },
  );
}
