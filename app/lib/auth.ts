export const SESSION_COOKIE = "sugarmimo_session";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.sugarmimo.com";

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
  isPremium?: boolean;
  isPremiere?: boolean;
  privacyPolicyVersion?: string | null;
  privacyPolicyAcceptedAt?: string | null;
  photos?: Array<{
    id?: string;
    dataUrl: string;
    sortOrder?: number;
    isPrivate?: boolean;
  }>;
  createdAt?: string | null;
};
