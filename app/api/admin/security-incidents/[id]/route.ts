import { forwardAdminRequest } from "../../_proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardAdminRequest(
    `/admin/security-incidents/${encodeURIComponent(id)}`,
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardAdminRequest(
    `/admin/security-incidents/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body,
      headers: { "Content-Type": "application/json" },
    },
  );
}
