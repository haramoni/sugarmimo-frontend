import { forwardAdminRequest } from "../_proxy";

export function GET(request: Request) {
  return forwardAdminRequest(
    `/admin/contact-tickets${new URL(request.url).search}`,
  );
}
