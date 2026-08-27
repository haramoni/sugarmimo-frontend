import { forwardAdminRequest } from "../../../_proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forwardAdminRequest(
    `/admin/chat-reports/${encodeURIComponent(id)}/evidence`,
  );
}
