import { forwardAdminRequest } from "../_proxy";
import { adminPhotoUrl } from "@/app/lib/photo-delivery";

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
    {},
    attachFeaturedCardUrls,
  );
}

function attachFeaturedCardUrls(result: unknown) {
  if (!result || typeof result !== "object" || !("items" in result)) {
    return result;
  }

  const page = result as { items?: unknown };
  if (!Array.isArray(page.items)) return result;

  return {
    ...result,
    items: page.items.map((candidate) => {
      if (!candidate || typeof candidate !== "object") return candidate;
      const profile = candidate as { photos?: unknown };

      return {
        ...profile,
        photos: Array.isArray(profile.photos)
          ? profile.photos.map((item) => {
              if (!item || typeof item !== "object") return item;
              const photo = item as { id?: string };
              return {
                ...photo,
                dataUrl: photo.id ? adminPhotoUrl(photo.id, "card") : "",
              };
            })
          : [],
      };
    }),
  };
}
