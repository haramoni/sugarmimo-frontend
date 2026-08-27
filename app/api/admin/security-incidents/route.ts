import { forwardAdminRequest } from "../_proxy";

export function GET(request: Request) {
  const query = new URL(request.url).search;
  return forwardAdminRequest(`/admin/security-incidents${query}`);
}

export async function POST(request: Request) {
  const body = await request.text();
  return forwardAdminRequest("/admin/security-incidents", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });
}
