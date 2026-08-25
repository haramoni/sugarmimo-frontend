"use client";

import { Loader2, Pin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfileCard from "../buscar/components/ProfileCard";
import type { PublicProfile } from "../buscar/types";
import { useAuth } from "../components/AuthProvider";
import { Navbar } from "../components/ui/Navbar";
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

  if (isAuthLoading || !user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,color-mix(in_srgb,var(--gold)_18%,transparent),transparent_30%),radial-gradient(circle_at_88%_16%,color-mix(in_srgb,var(--emerald)_14%,transparent),transparent_28%),url('/wallpaper-marble.webp')] bg-cover bg-center text-black-jewel md:bg-fixed">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-xl border border-gold/38 bg-[linear-gradient(132deg,color-mix(in_srgb,var(--black)_94%,var(--emerald)),color-mix(in_srgb,var(--emerald)_68%,var(--black)))] px-5 py-8 text-white shadow-[0_28px_72px_rgba(20,17,14,0.2)] sm:px-8 sm:py-10">
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
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72 sm:text-base">
                  Um lugar reservado para reencontrar rapidamente os perfis que
                  mais chamaram sua atenção.
                </p>
              </div>
            </div>
          </header>

          <div className="mt-7">
            {isLoading ? (
              <div className="flex min-h-72 items-center justify-center gap-3 rounded-xl border border-emerald/20 bg-white/82 text-sm font-extrabold text-black-jewel/62 shadow-[0_20px_52px_rgba(20,17,14,0.1)]">
                <Loader2 className="h-5 w-5 animate-spin text-emerald" />
                Preparando seus Pins...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-ruby/25 bg-white/86 p-6 text-center shadow-[0_20px_52px_rgba(20,17,14,0.1)]">
                <p className="font-bold text-ruby">{error}</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="mx-auto flex min-h-80 max-w-2xl flex-col items-center justify-center rounded-xl border border-gold/30 bg-[color-mix(in_srgb,var(--surface)_92%,white)] p-8 text-center shadow-[0_24px_60px_rgba(20,17,14,0.12)]">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)] text-gold">
                  <Sparkles className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-serif text-3xl font-semibold">
                  Sua coleção começa aqui
                </h2>
                <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-black-jewel/62">
                  Ao encontrar alguém especial, toque no ícone de Pin. O perfil
                  ficará guardado nesta página.
                </p>
                <Link
                  href="/buscar"
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-emerald px-6 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(0,108,88,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald/88"
                >
                  <Search className="h-4 w-4" />
                  Encontrar perfis
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-black-jewel/64">
                    {profiles.length} {profiles.length === 1 ? "perfil salvo" : "perfis salvos"}
                  </p>
                  <Link
                    href="/buscar"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-white/82 px-4 py-2 text-sm font-extrabold text-emerald transition hover:bg-emerald hover:text-white"
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
                      viewerIsPremiere={Boolean(user.isPremiere)}
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
