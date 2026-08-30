import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const backendParams = new URLSearchParams();

  for (const key of [
    "page",
    "pageSize",
    "search",
    "role",
    "approvalStatus",
    "accountStatus",
    "watchStatus",
  ]) {
    const value = searchParams.get(key);
    if (value) backendParams.set(key, value);
  }

  return forwardAdminRequest(`/admin/profiles?${backendParams.toString()}`);
}
