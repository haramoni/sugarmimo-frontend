import { forwardAdminRequest } from "../../_proxy";

export async function PATCH() {
  return forwardAdminRequest("/admin/watch-alerts/review-all", {
    method: "PATCH",
  });
}
