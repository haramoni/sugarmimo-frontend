import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const limit = new URL(request.url).searchParams.get("limit") ?? "100";
  const safeLimit = /^\d{1,3}$/.test(limit) ? limit : "100";

  return forwardAdminRequest(`/admin/activity-logs?limit=${safeLimit}`);
}
