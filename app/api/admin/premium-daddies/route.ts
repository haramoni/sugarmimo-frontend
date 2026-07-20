import { forwardAdminRequest } from "../_proxy";

export async function GET() {
  return forwardAdminRequest("/admin/premium-daddies");
}
