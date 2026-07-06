"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "@/app/perfil/ProfileApprovalGuard";
import { clearRegisterFlow } from "../register-flow";

type RegistrationResult = {
  user?: unknown;
} | null;

export function useRegistrationCompletion() {
  const router = useRouter();

  return useCallback(
    async (result: RegistrationResult) => {
      clearRegisterFlow();

      if (isRegistrationUser(result?.user)) {
        localStorage.setItem("sugarmimo:user", JSON.stringify(result.user));
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
    [router],
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
