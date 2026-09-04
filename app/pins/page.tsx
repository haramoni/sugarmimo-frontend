"use client";

import { Loader2, Pin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfileCard from "../buscar/components/ProfileCard";
import type { PublicProfile } from "../buscar/types";
import { useAuth } from "../components/AuthProvider";
import { Navbar } from "../components/ui/Navbar";
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

export default function PinsPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isApprovalPending = shouldShowPendingApproval(user);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isApprovalPending) {
      return;
    }

    const controller = new AbortController();
    fetch("/api/pins", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ?? "Não foi possível carregar seus Pins.",
          );
        }

        return Array.isArray(result?.items)
          ? (result.items as PublicProfile[])
          : [];
      })
      .then((items) => {
        if (!controller.signal.aborted) {
          setProfiles(items);
        }
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar seus Pins.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isApprovalPending, isAuthLoading, router, user]);

  if (isAuthLoading) {
    return <PremiumLoadingScreen label="Carregando seus Pins..." />;
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="premium-page-shell">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <header className="premium-page-hero rounded-xl px-5 py-8 sm:px-8 sm:py-10">
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-gold/24 bg-gold/10 blur-sm" />
            <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-emerald/30 blur-2xl" />
            <div className="relative flex max-w-3xl items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/55 bg-white/10 text-gold-soft shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                <Pin className="h-6 w-6" fill="currentColor" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold-soft">
                  Sua seleção particular
                </p>
                <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">
                  Meus Pins
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-luxury-muted sm:text-base">
                  Um lugar reservado para reencontrar rapidamente os perfis que
                  mais chamaram sua atenção.
                </p>
              </div>
            </div>
          </header>

          <div className="mt-7">
            {isLoading ? (
              <div className="premium-surface-card flex min-h-72 items-center justify-center gap-3 rounded-xl text-sm font-extrabold text-luxury-muted">
                <Loader2 className="h-5 w-5 animate-spin text-luxury-champagne" />
                Preparando seus Pins...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-ruby/60 bg-ruby/10 p-6 text-center shadow-[0_20px_52px_rgba(0,0,0,0.28)]">
                <p className="font-bold text-[#f0a5b3]">{error}</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="premium-surface-card mx-auto flex min-h-80 max-w-2xl flex-col items-center justify-center rounded-xl p-8 text-center">
                <span className="premium-icon-medallion h-16 w-16 rounded-full">
                  <Sparkles className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-serif text-3xl font-semibold">
                  Sua coleção começa aqui
                </h2>
                <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-luxury-muted">
                  Ao encontrar alguém especial, toque no ícone de Pin. O perfil
                  ficará guardado nesta página.
                </p>
                <Link
                  href="/buscar"
                  className="premium-primary-action mt-6 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold transition"
                >
                  <Search className="h-4 w-4" />
                  Encontrar perfis
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-luxury-muted">
                    {profiles.length}{" "}
                    {profiles.length === 1 ? "perfil salvo" : "perfis salvos"}
                  </p>
                  <Link
                    href="/buscar"
                    className="premium-secondary-action inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition"
                  >
                    <Search className="h-4 w-4" />
                    Buscar mais
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      viewerRole={user.role}
                      viewerIsPremium={Boolean(user.isPremium)}
                      onPinChange={(pinned) => {
                        if (!pinned) {
                          setProfiles((current) =>
                            current.filter((item) => item.id !== profile.id),
                          );
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}
