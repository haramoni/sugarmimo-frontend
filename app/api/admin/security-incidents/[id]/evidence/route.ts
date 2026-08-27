import { forwardAdminRequest } from "../../../_proxy";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return forwardAdminRequest(
    `/admin/security-incidents/${encodeURIComponent(id)}/evidence`,
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
  );
}
