import { forwardAdminRequest } from "../_proxy";

export function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  return forwardAdminRequest(
    `/admin/chat-reports${status ? `?status=${encodeURIComponent(status)}` : ""}`,
  );
}
