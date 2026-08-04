import { forwardAdminRequest } from "../_proxy";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "6";

  return forwardAdminRequest(
    `/admin/pending-babies?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`,
  );
}
