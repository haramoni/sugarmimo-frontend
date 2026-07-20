"use client";

import { Loader2, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import ProfileCard from "../buscar/components/ProfileCard";
import StatePanel from "../buscar/components/StatePanel";
import type { PublicProfile, PublicProfilePage } from "../buscar/types";
import { useAuth } from "../components/AuthProvider";
import { Navbar } from "../components/ui/Navbar";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "../perfil/ProfileApprovalGuard";

const PAGE_SIZE = 6;

export default function InicioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const isApprovalPending = shouldShowPendingApproval(user);
  const canView = ["SUGAR_BABY", "SUGAR_DADDY"].includes(
    user?.role?.trim().toUpperCase() ?? "",
  );
  const targetLabel =
    user?.role?.trim().toUpperCase() === "SUGAR_DADDY"
      ? "Sugar Babies em destaque"
      : "Sugar Daddies em destaque";

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (isApprovalPending || !canView) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/boosts?page=1&limit=${PAGE_SIZE}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);

        if (response.status === 401) {
          router.replace("/login");
          return null;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ?? "Nao foi possivel carregar os destaques.",
          );
        }

        return result as PublicProfilePage;
      })
      .then((result) => {
        if (!controller.signal.aborted && result) {
          setProfiles(Array.isArray(result.items) ? result.items : []);
          setPage(Number(result.page) || 1);
          setHasMore(Boolean(result.hasMore));
          setError("");
        }
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nao foi possivel carregar os destaques.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, isApprovalPending, router, user]);

  async function loadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/boosts?page=${nextPage}&limit=${PAGE_SIZE}`,
      );
      const result = (await response.json().catch(() => null)) as
        | (PublicProfilePage & { message?: string })
        | null;

      if (!response.ok || !result) {
        throw new Error(
          result?.message ?? "Nao foi possivel carregar mais destaques.",
        );
      }

      setProfiles((current) => [
        ...current,
        ...result.items.filter(
          (profile) => !current.some((item) => item.id === profile.id),
        ),
      ]);
      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar mais destaques.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--gold)_14%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),url('/wallpaper-marble.png')] bg-cover bg-fixed bg-center text-black-jewel">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <header className="mb-6 overflow-hidden rounded-lg border border-gold/35 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gold-soft)_30%,white),color-mix(in_srgb,var(--surface)_92%,white),color-mix(in_srgb,var(--emerald)_10%,white))] p-5 shadow-[0_22px_58px_rgba(20,17,14,0.12)] sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-white shadow-[0_12px_28px_rgba(185,138,56,0.25)]">
                <Rocket className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
                  Boosts ativos
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-black-jewel sm:text-4xl">
                  {targetLabel}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-black-jewel/68">
                  Perfis impulsionados aparecem aqui durante o período ativo do
                  boost.
                </p>
              </div>
            </div>
          </header>

          {!canView ? (
            <StatePanel
              icon={ShieldCheck}
              title="Destaques indisponiveis"
              description="Esta area esta disponivel para perfis Sugar Baby e Sugar Daddy."
            />
          ) : isLoading ? (
            <StatePanel
              icon={Loader2}
              title="Carregando destaques"
              description="Buscando os perfis com boost ativo para voce."
              spin
            />
          ) : error && profiles.length === 0 ? (
            <StatePanel
              icon={ShieldCheck}
              title="Destaques indisponiveis"
              description={error}
            />
          ) : profiles.length === 0 ? (
            <StatePanel
              icon={Sparkles}
              title="Novos destaques em breve"
              description="Nenhum perfil compativel esta com boost ativo neste momento."
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>

              {error ? (
                <p className="text-center text-sm font-bold text-ruby">
                  {error}
                </p>
              ) : null}

              {hasMore ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                    className="h-11 rounded-full bg-emerald px-6 font-extrabold text-white hover:bg-emerald/84"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isLoadingMore ? "Carregando" : "Carregar mais"}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}
