"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  pendingModerationNotice,
  type AuthUser,
  type SecurityIncidentNotice,
} from "@/app/lib/auth";
import { removeAuthUser, saveAuthUser } from "@/app/lib/auth-storage";
import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "@/app/perfil/ProfileApprovalGuard";
import { PrivacyPolicyAcceptanceDialog } from "@/app/components/PrivacyPolicyAcceptanceDialog";
import { CURRENT_PRIVACY_POLICY_VERSION } from "@/app/privacy/privacy-policy";
import { AccountModerationDialog } from "@/app/components/AccountModerationDialog";
import { SecurityIncidentNoticeDialog } from "@/app/components/SecurityIncidentNoticeDialog";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [securityIncidentNotices, setSecurityIncidentNotices] = useState<
    SecurityIncidentNotice[]
  >([]);
  const [areSecurityNoticesLoading, setAreSecurityNoticesLoading] =
    useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isMaintenancePage = pathname === "/manutencao";
  const isAdminPage = pathname.startsWith("/admin");

  const loadSecurityIncidentNotices = useCallback(async () => {
    setAreSecurityNoticesLoading(true);
    const response = await fetch(
      "/api/auth/security-incident-notices/pending",
    ).catch(() => null);

    if (!response?.ok) {
      setSecurityIncidentNotices([]);
      setAreSecurityNoticesLoading(false);
      return;
    }

    const notices = (await response.json().catch(() => [])) as
      | SecurityIncidentNotice[]
      | null;
    setSecurityIncidentNotices(Array.isArray(notices) ? notices : []);
    setAreSecurityNoticesLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await fetch("/api/auth/me").catch(() => null);

    if (!response?.ok) {
      setUser(null);
      setSecurityIncidentNotices([]);
      removeAuthUser();
      setIsAuthLoading(false);
      return;
    }

    const nextUser = (await response.json()) as AuthUser;
    setUser(nextUser);
    saveAuthUser(nextUser);

    if (nextUser.role?.trim().toUpperCase() !== "ADMIN") {
      await loadSecurityIncidentNotices();
    } else {
      setSecurityIncidentNotices([]);
    }

    setIsAuthLoading(false);
  }, [loadSecurityIncidentNotices]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    setSecurityIncidentNotices([]);
    removeAuthUser();
    window.dispatchEvent(new Event("sugarmimo-auth"));
  }, []);

  const acknowledgeSecurityIncidentNotice = useCallback(async () => {
    const notice = securityIncidentNotices[0];
    if (!notice) return;

    const response = await fetch(
      `/api/auth/security-incident-notices/${encodeURIComponent(notice.incidentId)}/acknowledge`,
      { method: "POST" },
    ).catch(() => null);

    if (!response) {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    const result = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    if (!response.ok) {
      throw new Error(result?.message || "Não foi possível confirmar a leitura.");
    }

    setSecurityIncidentNotices((current) => current.slice(1));
  }, [securityIncidentNotices]);

  const acceptPrivacyPolicy = useCallback(async () => {
    const response = await fetch("/api/auth/privacy-policy/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: CURRENT_PRIVACY_POLICY_VERSION }),
    }).catch(() => null);

    if (!response) {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    const acceptance = (await response.json().catch(() => null)) as
      | Pick<AuthUser, "privacyPolicyVersion" | "privacyPolicyAcceptedAt">
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(
        acceptance && "message" in acceptance && acceptance.message
          ? acceptance.message
          : "Não foi possível registrar o aceite.",
      );
    }

    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextUser = { ...currentUser, ...acceptance } as AuthUser;
      saveAuthUser(nextUser);
      return nextUser;
    });
  }, []);

  const acknowledgeModerationNotice = useCallback(async () => {
    const response = await fetch("/api/auth/moderation-notice/acknowledge", {
      method: "POST",
    }).catch(() => null);

    if (!response) {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    const result = (await response.json().catch(() => null)) as
      | Pick<AuthUser, "moderationNoticeAcknowledgedAt">
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(
        result && "message" in result && result.message
          ? result.message
          : "Não foi possível confirmar a leitura.",
      );
    }

    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextUser = { ...currentUser, ...result } as AuthUser;
      saveAuthUser(nextUser);
      return nextUser;
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshUser(), 0);

    function handleAuthChange() {
      void refreshUser();
    }

    window.addEventListener("sugarmimo-auth", handleAuthChange);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("sugarmimo-auth", handleAuthChange);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (
      !isAuthLoading &&
      !isMaintenancePage &&
      shouldShowPendingApproval(user) &&
      pathname !== PENDING_APPROVAL_ROUTE
    ) {
      router.replace(PENDING_APPROVAL_ROUTE);
    }
  }, [isAuthLoading, isMaintenancePage, pathname, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    function sendPresence() {
      if (document.visibilityState === "visible") {
        void fetch("/api/auth/presence", { method: "POST" }).catch(() => null);
      }
    }

    sendPresence();
    const interval = window.setInterval(sendPresence, 90_000);
    document.addEventListener("visibilitychange", sendPresence);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sendPresence);
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      refreshUser,
      logout,
    }),
    [isAuthLoading, logout, refreshUser, user],
  );

  const needsPrivacyPolicyAcceptance = Boolean(
    user &&
      !isMaintenancePage &&
      !isAdminPage &&
      !pathname.startsWith("/register") &&
      user.role?.trim().toUpperCase() !== "ADMIN" &&
    user.privacyPolicyVersion !== CURRENT_PRIVACY_POLICY_VERSION,
  );
  const moderationNotice = pendingModerationNotice(user);
  const needsModerationAcknowledgement = Boolean(
    moderationNotice && !isMaintenancePage && !isAdminPage,
  );
  const securityIncidentNotice = securityIncidentNotices[0] ?? null;
  const needsSecurityIncidentAcknowledgement = Boolean(
    securityIncidentNotice && !isMaintenancePage && !isAdminPage,
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AccountModerationDialog
        key={moderationNotice?.appliedAt ?? "no-moderation-notice"}
        open={needsModerationAcknowledgement}
        notice={moderationNotice}
        onConfirm={acknowledgeModerationNotice}
        onLogout={async () => {
          await logout();
          router.replace("/login");
        }}
      />
      <SecurityIncidentNoticeDialog
        key={securityIncidentNotice?.incidentId ?? "no-security-incident"}
        open={
          needsSecurityIncidentAcknowledgement &&
          !needsModerationAcknowledgement
        }
        notice={securityIncidentNotice}
        onConfirm={acknowledgeSecurityIncidentNotice}
        onLogout={async () => {
          await logout();
          router.replace("/login");
        }}
      />
      <PrivacyPolicyAcceptanceDialog
        open={
          needsPrivacyPolicyAcceptance &&
          !needsModerationAcknowledgement &&
          !needsSecurityIncidentAcknowledgement &&
          !areSecurityNoticesLoading
        }
        onAccept={acceptPrivacyPolicy}
        secondaryLabel="Sair da conta"
        onSecondary={async () => {
          await logout();
          router.replace("/login");
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }

  return context;
}
