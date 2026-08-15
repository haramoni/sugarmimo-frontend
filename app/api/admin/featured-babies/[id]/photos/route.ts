import { forwardAdminRequest } from "../../../_proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return forwardAdminRequest(
    `/admin/featured-babies/${encodeURIComponent(id)}/photos`,
  );
}
