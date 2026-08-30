import { forwardAdminRequest } from "../_proxy";

export async function DELETE() {
  return forwardAdminRequest("/admin/watch-alerts", {
    method: "DELETE",
  });
}
