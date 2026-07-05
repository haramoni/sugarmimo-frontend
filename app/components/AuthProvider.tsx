"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser } from "@/app/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  async function refreshUser() {
    const response = await fetch("/api/auth/me").catch(() => null);

    if (!response?.ok) {
      setUser(null);
      window.localStorage.removeItem("sugarmimo:user");
      return;
    }

    const nextUser = (await response.json()) as AuthUser;
    setUser(nextUser);
    window.localStorage.setItem("sugarmimo:user", JSON.stringify(nextUser));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    window.localStorage.removeItem("sugarmimo:user");
    window.dispatchEvent(new Event("sugarmimo-auth"));
  }

  useEffect(() => {
    if (initialUser) {
      window.localStorage.setItem("sugarmimo:user", JSON.stringify(initialUser));
    }

    function handleAuthChange() {
      void refreshUser();
    }

    window.addEventListener("sugarmimo-auth", handleAuthChange);
    return () => window.removeEventListener("sugarmimo-auth", handleAuthChange);
  }, [initialUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      refreshUser,
      logout,
    }),
    [user],
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
