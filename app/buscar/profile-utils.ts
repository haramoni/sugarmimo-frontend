import type { ProfilePhoto, PublicProfile } from "./types";

export type ContactChannel = "whatsapp" | "telegram" | "instagram";

export function getAge(birthDate?: string | null) {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function getLocation(profile: PublicProfile) {
  return [profile.city, profile.state].filter(Boolean).join(", ");
}

export function getProfilePhoto(profile: PublicProfile) {
  return [...(profile.photos ?? [])]
    .filter((photo) => !photo.isPrivate)
    .sort(sortPhotos)[0] ?? null;
}

export function getGalleryPhotos(profile: PublicProfile) {
  return [...(profile.photos ?? [])]
    .filter((photo) => !photo.isPrivate)
    .sort(sortPhotos);
}

export function getPrivatePhotos(profile: PublicProfile) {
  return [...(profile.photos ?? [])]
    .filter((photo) => photo.isPrivate)
    .sort(sortPhotos);
}

export function getCustomInterests(profile: PublicProfile) {
  const interests = profile.preferences?.preferences?.customInterests;

  if (!Array.isArray(interests)) {
    return [];
  }

  return interests.filter(
    (interest): interest is string =>
      typeof interest === "string" && Boolean(interest.trim()),
  );
}

export function formatContactValue(channel: ContactChannel, value: string) {
  if (channel === "instagram" || channel === "telegram") {
    return value.startsWith("@") ? value : `@${value}`;
  }

  return value;
}

export function getContactHref(channel: ContactChannel, value: string) {
  if (channel === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "https://wa.me/";
  }

  const username = value.replace(/^@+/, "");

  if (channel === "telegram") {
    return `https://t.me/${username}`;
  }

  return `https://instagram.com/${username}`;
}

function sortPhotos(first: ProfilePhoto, second: ProfilePhoto) {
  return first.sortOrder - second.sortOrder;
}
