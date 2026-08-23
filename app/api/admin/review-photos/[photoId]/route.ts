import { forwardAdminAssetRequest } from "../../_proxy";

export async function GET(
  request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await context.params;
  const variant = new URL(request.url).searchParams.get("variant");
  const query = variant === "card" ? "?variant=card" : "";

  return forwardAdminAssetRequest(
    `/admin/review-photos/${encodeURIComponent(photoId)}${query}`,
  );
}
