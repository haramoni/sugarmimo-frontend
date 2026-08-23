import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const backendParams = new URLSearchParams({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "12",
  });
  const search = searchParams.get("search")?.trim();
  const role = searchParams.get("role")?.trim();

  if (search) backendParams.set("search", search);
  if (role) backendParams.set("role", role);

  return forwardAdminRequest(
    `/admin/boost-users?${backendParams.toString()}`,
  );
}
