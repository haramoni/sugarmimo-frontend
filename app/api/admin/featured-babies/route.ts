import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "12";
  const search = searchParams.get("search")?.trim() ?? "";
  const backendParams = new URLSearchParams({ page, pageSize });

  if (search) {
    backendParams.set("search", search);
  }

  return forwardAdminRequest(
    `/admin/featured-babies?${backendParams.toString()}`,
  );
}
