"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAuth } from "../components/AuthProvider";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";

export function PlansAccessGuard({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const isLoggedSugarDaddy = user?.role?.trim().toUpperCase() === "SUGAR_DADDY";
  const needsLogin = !isAuthLoading && !user;
  const isBlocked = Boolean(user && !isLoggedSugarDaddy);

  useEffect(() => {
    if (needsLogin) {
      router.replace("/login");
    } else if (!isAuthLoading && isBlocked) {
      router.replace("/inicio");
    }
  }, [isAuthLoading, isBlocked, needsLogin, router]);

  if (isAuthLoading || needsLogin || isBlocked) {
    return (
      <PremiumLoadingScreen
        label={
          needsLogin || isBlocked ? "Redirecionando..." : "Carregando planos..."
        }
      />
    );
  }

  return children;
}
