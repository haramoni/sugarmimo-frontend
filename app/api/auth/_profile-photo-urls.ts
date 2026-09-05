import { ownPhotoUrl } from "@/app/lib/photo-delivery";

type ProfilePhotoMetadata = {
  id?: string;
  [key: string]: unknown;
};

export function attachOwnPhotoUrls(
  result: unknown,
  reapplication = false,
) {
  if (!result || typeof result !== "object" || !("photos" in result)) {
    return result;
  }

  const profile = result as { photos?: unknown };
  if (!Array.isArray(profile.photos)) {
    return result;
  }

  return {
    ...result,
    photos: profile.photos.map((photo: ProfilePhotoMetadata) => ({
      ...photo,
      dataUrl: photo.id
        ? ownPhotoUrl(photo.id, "profile", reapplication)
        : "",
      cardDataUrl: photo.id
        ? ownPhotoUrl(photo.id, "card", reapplication)
        : "",
    })),
  };
}
