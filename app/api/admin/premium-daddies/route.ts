import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of [
    "page",
    "pageSize",
    "search",
    "profileType",
    "membershipTier",
  ]) {
    const value = incoming.get(key)?.trim();
    if (value) params.set(key, value);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";
  return forwardAdminRequest(`/admin/premium-daddies${query}`);
}
