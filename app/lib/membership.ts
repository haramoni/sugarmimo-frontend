export type MembershipTier = "BASIC" | "PREMIUM" | "ELITE";
export type ProfileFrame =
  "STANDARD" | "BASIC" | "PREMIUM" | "ELITE" | "PREMIERE";

const MEMBERSHIP_TIERS = new Set<MembershipTier>(["BASIC", "PREMIUM", "ELITE"]);

const PROFILE_FRAMES = new Set<ProfileFrame>([
  "STANDARD",
  "BASIC",
  "PREMIUM",
  "ELITE",
  "PREMIERE",
]);

export const MEMBERSHIP_DETAILS: Record<
  MembershipTier,
  { label: string; rank: number }
> = {
  BASIC: { label: "Membro", rank: 1 },
  PREMIUM: { label: "Premium", rank: 2 },
  ELITE: { label: "Elite", rank: 3 },
};

export const PROFILE_FRAME_DETAILS: Record<
  ProfileFrame,
  { label: string; description: string }
> = {
  STANDARD: {
    label: "Clássica",
    description: "Visual discreto do perfil SugarMimo.",
  },
  BASIC: {
    label: "Membro",
    description: "Moldura da assinatura Básica ativa.",
  },
  PREMIUM: {
    label: "Premium",
    description: "Acabamento dourado da assinatura Premium.",
  },
  ELITE: {
    label: "Elite",
    description: "Moldura diamante da assinatura Elite.",
  },
  PREMIERE: {
    label: "Premiere",
    description: "Moldura vitalícia exclusiva Premiere.",
  },
};

type MembershipProfile = {
  membershipTier?: string | null;
  membershipUntil?: string | null;
  premiumUntil?: string | null;
  isPremium?: boolean;
  isPremiere?: boolean;
  profileFrame?: string | null;
};

function dateIsActive(value?: string | null, now = Date.now()) {
  if (!value) return null;
  const expiresAt = Date.parse(value);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export function resolveMembershipTier(
  profile: MembershipProfile,
  now = Date.now(),
): MembershipTier | null {
  const explicitTier = profile.membershipTier?.trim().toUpperCase();

  if (MEMBERSHIP_TIERS.has(explicitTier as MembershipTier)) {
    const hasActiveDate = dateIsActive(profile.membershipUntil, now);
    if (hasActiveDate !== false && (hasActiveDate || profile.isPremium)) {
      return explicitTier as MembershipTier;
    }
  }

  const premiumDateIsActive = dateIsActive(profile.premiumUntil, now);
  if (
    profile.isPremium &&
    (premiumDateIsActive === null || premiumDateIsActive)
  ) {
    return "PREMIUM";
  }

  return null;
}

export function availableProfileFrames(
  profile: MembershipProfile,
  now = Date.now(),
): ProfileFrame[] {
  const frames: ProfileFrame[] = ["STANDARD"];
  if (profile.isPremiere) frames.push("PREMIERE");

  const membershipTier = resolveMembershipTier(profile, now);
  if (membershipTier) frames.push(membershipTier);

  return Array.from(new Set(frames));
}

export function resolveProfileFrame(
  profile: MembershipProfile,
  now = Date.now(),
): ProfileFrame {
  const explicitFrame = profile.profileFrame?.trim().toUpperCase();
  const available = availableProfileFrames(profile, now);

  if (
    PROFILE_FRAMES.has(explicitFrame as ProfileFrame) &&
    available.includes(explicitFrame as ProfileFrame)
  ) {
    return explicitFrame as ProfileFrame;
  }

  if (profile.isPremiere) return "PREMIERE";

  const membershipTier = resolveMembershipTier(profile, now);
  return membershipTier ?? "STANDARD";
}

export function membershipDaysRemaining(
  membershipUntil?: string | null,
  now = Date.now(),
) {
  if (!membershipUntil) return null;
  const expiresAt = Date.parse(membershipUntil);
  if (!Number.isFinite(expiresAt)) return null;
  return Math.max(0, Math.ceil((expiresAt - now) / 86_400_000));
}

export function membershipRemainingLabel(days: number | null) {
  if (days === null) return "Sem vencimento automático";
  if (days <= 0) return "Assinatura expirada";
  if (days === 1) return "1 dia restante";
  return `${days} dias restantes`;
}

export function formatMembershipExpiry(membershipUntil?: string | null) {
  if (!membershipUntil) return "Sem data de vencimento";
  const date = new Date(membershipUntil);
  if (Number.isNaN(date.getTime())) return "Data de vencimento inválida";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
