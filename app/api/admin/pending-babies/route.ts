import { forwardAdminRequest } from "../_proxy";

export async function GET() {
  return forwardAdminRequest("/admin/pending-babies");
}
