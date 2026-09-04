const MOMMY_PROFILE_TYPES = new Set([
  "sugar-mommy",
  "sugarmommy",
  "mommy",
  "mulher",
  "feminino",
  "female",
  "woman",
  "women",
]);

const LGBTQIA_PROVIDER_PROFILE_TYPES = new Set([
  "sugar-provider-lgbtqia",
  "provider-lgbtqia",
]);

const EXPLICIT_PROVIDER_PROFILE_TYPES = new Set([
  "sugar-daddy",
  "sugardaddy",
  "daddy",
  "sugar-mommy",
  "sugarmommy",
  "mommy",
  ...LGBTQIA_PROVIDER_PROFILE_TYPES,
]);

export const DADDY_PROFILE_PLACEHOLDER =
  "/brand/profile-placeholder-daddy-v2.webp";
export const MOMMY_PROFILE_PLACEHOLDER =
  "/brand/profile-placeholder-mommy-v2.webp";

export function isSugarMommyProfile(
  role?: string | null,
  profileType?: string | null,
) {
  return (
    role?.trim().toUpperCase() === "SUGAR_DADDY" &&
    MOMMY_PROFILE_TYPES.has(profileType?.trim().toLowerCase() ?? "")
  );
}

export function getProviderProfilePlaceholder(
  role?: string | null,
  profileType?: string | null,
) {
  const normalizedRole = role?.trim().toUpperCase() ?? "";
  const normalizedProfileType = profileType?.trim().toLowerCase() ?? "";
  const isProvider =
    normalizedRole === "SUGAR_DADDY" ||
    EXPLICIT_PROVIDER_PROFILE_TYPES.has(normalizedProfileType);

  if (!isProvider) return null;

  return MOMMY_PROFILE_TYPES.has(normalizedProfileType)
    ? MOMMY_PROFILE_PLACEHOLDER
    : DADDY_PROFILE_PLACEHOLDER;
}

export function profileIdentityLabel(
  role?: string | null,
  profileType?: string | null,
) {
  const normalizedRole = role?.trim().toUpperCase();
  const normalizedProfileType = profileType?.trim().toLowerCase() ?? "";

  if (normalizedRole === "SUGAR_BABY") return "Sugar Baby";
  if (
    normalizedRole === "SUGAR_DADDY" &&
    LGBTQIA_PROVIDER_PROFILE_TYPES.has(normalizedProfileType)
  ) {
    return "Sugar Daddy / Mommy";
  }
  if (isSugarMommyProfile(normalizedRole, profileType)) return "Sugar Mommy";
  if (normalizedRole === "SUGAR_DADDY") return "Sugar Daddy";
  return "—";
}
