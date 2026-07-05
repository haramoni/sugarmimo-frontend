import { cookies } from "next/headers";

export const SESSION_COOKIE = "sugarmimo_session";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type AuthUser = {
  id?: string;
  username?: string;
  email?: string;
  role?: string | null;
  gender?: string | null;
  lookingFor?: string | null;
  birthDate?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  approvalStatus?: string;
  createdAt?: string | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
