import { forwardAdminRequest } from "../../../_proxy";
import { adminPhotoUrl } from "@/app/lib/photo-delivery";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return forwardAdminRequest(
    `/admin/featured-babies/${encodeURIComponent(id)}/photos`,
    {},
    attachGalleryPhotoUrls,
  );
}

function attachGalleryPhotoUrls(result: unknown) {
  if (!result || typeof result !== "object" || !("photos" in result)) {
    return result;
  }

  const profile = result as { photos?: unknown };
  if (!Array.isArray(profile.photos)) return result;

  return {
    ...result,
    photos: profile.photos.map((item) => {
      if (!item || typeof item !== "object") return item;
      const photo = item as { id?: string };
      return {
        ...photo,
        dataUrl: photo.id ? adminPhotoUrl(photo.id, "profile") : "",
        cardDataUrl: photo.id ? adminPhotoUrl(photo.id, "card") : "",
      };
    }),
  };
}
