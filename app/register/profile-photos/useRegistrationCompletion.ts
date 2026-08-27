"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "@/app/perfil/ProfileApprovalGuard";
import { saveAuthUser } from "@/app/lib/auth-storage";
import { clearRegisterFlow } from "../register-flow";
import { useRegistrationSecret } from "../RegistrationSecretProvider";

type RegistrationResult = {
  requiresApproval?: boolean;
  user?: unknown;
} | null;

export function useRegistrationCompletion() {
  const router = useRouter();
  const { clearPassword } = useRegistrationSecret();

  return useCallback(
    async (result: RegistrationResult) => {
      clearPassword();
      clearRegisterFlow();

      if (isRegistrationUser(result?.user)) {
        saveAuthUser(result.user);

        if (result?.requiresApproval || isSugarBabyUser(result.user)) {
          window.location.replace(PENDING_APPROVAL_ROUTE);
          return;
        }

        window.dispatchEvent(new Event("sugarmimo-auth"));

        const sessionUser = await getCurrentSessionUser();

        if (shouldShowPendingApproval(sessionUser ?? result.user)) {
          router.replace(PENDING_APPROVAL_ROUTE);
          return;
        }

        router.push("/perfil");
        return;
      }

      router.push("/login");
    },
    [clearPassword, router],
  );
}

async function getCurrentSessionUser() {
  const response = await fetch("/api/auth/me").catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const user = (await response.json().catch(() => null)) as unknown;

  return isRegistrationUser(user) ? user : null;
}

function isRegistrationUser(user: unknown): user is Record<string, unknown> {
  return Boolean(user && typeof user === "object");
}

function isSugarBabyUser(user: Record<string, unknown>) {
  return (
    typeof user.role === "string" &&
    user.role.trim().toUpperCase() === "SUGAR_BABY"
  );
}
