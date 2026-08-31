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

export function isSugarMommyProfile(
  role?: string | null,
  profileType?: string | null,
) {
  return (
    role?.trim().toUpperCase() === "SUGAR_DADDY" &&
    MOMMY_PROFILE_TYPES.has(profileType?.trim().toLowerCase() ?? "")
  );
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
