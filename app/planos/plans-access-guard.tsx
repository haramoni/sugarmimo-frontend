"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAuth } from "../components/AuthProvider";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";

export function PlansAccessGuard({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const isLoggedSugarDaddy = user?.role?.trim().toUpperCase() === "SUGAR_DADDY";
  const isBlocked = Boolean(user && !isLoggedSugarDaddy);

  useEffect(() => {
    if (!isAuthLoading && isBlocked) {
      router.replace("/inicio");
    }
  }, [isAuthLoading, isBlocked, router]);

  if (isAuthLoading || isBlocked) {
    return (
      <PremiumLoadingScreen
        label={isBlocked ? "Redirecionando..." : "Carregando planos..."}
      />
    );
  }

  return children;
}
