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

import type { AuthUser } from "@/app/lib/auth";
import { removeAuthUser, saveAuthUser } from "@/app/lib/auth-storage";
import {
  PENDING_APPROVAL_ROUTE,
  shouldShowPendingApproval,
} from "@/app/perfil/ProfileApprovalGuard";

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const response = await fetch("/api/auth/me").catch(() => null);

    if (!response?.ok) {
      setUser(null);
      removeAuthUser();
      setIsAuthLoading(false);
      return;
    }

    const nextUser = (await response.json()) as AuthUser;
    setUser(nextUser);
    saveAuthUser(nextUser);

    setIsAuthLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    removeAuthUser();
    window.dispatchEvent(new Event("sugarmimo-auth"));
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
      shouldShowPendingApproval(user) &&
      pathname !== PENDING_APPROVAL_ROUTE
    ) {
      router.replace(PENDING_APPROVAL_ROUTE);
    }
  }, [isAuthLoading, pathname, router, user]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }

  return context;
}
