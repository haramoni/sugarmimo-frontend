export const SESSION_COOKIE = "sugarmimo_session";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";

export type ModerationNotice = {
  action: string;
  reason: string;
  appliedAt: string | null;
  suspendedUntil: string | null;
  referenceId: string | null;
  appealUrl: string;
};

export type SecurityIncidentNotice = {
  incidentId: string;
  reference: string;
  controllerAwareAt: string;
  natureAndCategories: string;
  likelyConsequences: string | null;
  securityMeasures: string | null;
  mitigationMeasures: string | null;
  delayReason: string | null;
  contactChannel: string;
  notifiedAt: string;
};

export type AuthUser = {
  id?: string;
  username?: string;
  email?: string;
  role?: string | null;
  gender?: string | null;
  lookingFor?: string | null;
  relationshipIntent?: string | null;
  birthDate?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  approvalStatus?: string;
  accountStatus?: string;
  suspendedUntil?: string | null;
  moderationAction?: string | null;
  moderationReason?: string | null;
  moderationAppliedAt?: string | null;
  moderationReferenceId?: string | null;
  moderationNoticeAcknowledgedAt?: string | null;
  isPremium?: boolean;
  premiumUntil?: string | null;
  isPremiere?: boolean;
  boostCredits?: number;
  boostedUntil?: string | null;
  privacyPolicyVersion?: string | null;
  privacyPolicyAcceptedAt?: string | null;
  photos?: Array<{
    id?: string;
    dataUrl: string;
    sortOrder?: number;
    isPrivate?: boolean;
    moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    moderationReason?: string | null;
    moderatedAt?: string | null;
    replacesPhotoId?: string | null;
  }>;
  createdAt?: string | null;
};

export function pendingModerationNotice(
  user: AuthUser | null,
): ModerationNotice | null {
  if (!user?.moderationAction || !user.moderationAppliedAt) {
    return null;
  }

  const appliedAt = new Date(user.moderationAppliedAt).getTime();
  const acknowledgedAt = user.moderationNoticeAcknowledgedAt
    ? new Date(user.moderationNoticeAcknowledgedAt).getTime()
    : 0;

  if (Number.isFinite(appliedAt) && acknowledgedAt >= appliedAt) {
    return null;
  }

  return {
    action: user.moderationAction,
    reason:
      user.moderationReason?.trim() ||
      "Uma medida de moderação foi aplicada à sua conta.",
    appliedAt: user.moderationAppliedAt,
    suspendedUntil: user.suspendedUntil ?? null,
    referenceId: user.moderationReferenceId ?? null,
    appealUrl: "/contato",
  };
}
