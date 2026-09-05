export type PhotoDeliveryVariant = "card" | "profile";

export const PHOTO_CARD_CACHE_VERSION = 4;
export const PHOTO_PROFILE_CACHE_VERSION = 1;

function versionFor(variant: PhotoDeliveryVariant) {
  return variant === "card"
    ? PHOTO_CARD_CACHE_VERSION
    : PHOTO_PROFILE_CACHE_VERSION;
}

export function matchPhotoUrl(
  photoId: string,
  variant: PhotoDeliveryVariant,
) {
  return `/api/match-photos/${encodeURIComponent(photoId)}?variant=${variant}&v=${versionFor(variant)}`;
}

export function ownPhotoUrl(
  photoId: string,
  variant: PhotoDeliveryVariant,
  reapplication = false,
) {
  const scope = reapplication ? "&scope=reapplication" : "";
  return `/api/auth/profile-photos/${encodeURIComponent(photoId)}?variant=${variant}&v=${versionFor(variant)}${scope}`;
}

export function adminPhotoUrl(
  photoId: string,
  variant: PhotoDeliveryVariant,
) {
  return `/api/admin/review-photos/${encodeURIComponent(photoId)}?variant=${variant}&v=${versionFor(variant)}`;
}
