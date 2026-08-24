"use client";

import { Activity, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

const PAGE_SIZE = 20;
const HOME_STATE_KEY = "sugarmimo:inicio-active-state";

type SavedHomeState = {
  page: number;
  scrollY: number;
  anchorProfileId: string | null;
  anchorOffset: number | null;
};

export default function InicioPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const [isScrollRestored, setIsScrollRestored] = useState(false);
  const [scrollToRestore, setScrollToRestore] = useState<number | null>(null);
  const [anchorToRestore, setAnchorToRestore] = useState<{
    profileId: string;
    offset: number;
  } | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const restoredPageRef = useRef(1);
  const navigationAnchorRef = useRef<{
    profileId: string;
    offset: number;
  } | null>(null);
  const isApprovalPending = shouldShowPendingApproval(user);
  const canView = ["SUGAR_BABY", "SUGAR_DADDY"].includes(
    user?.role?.trim().toUpperCase() ?? "",
  );
  const targetLabel =
    user?.role?.trim().toUpperCase() === "SUGAR_DADDY"
      ? "Sugar Babies mais ativas"
      : "Sugar Daddies mais ativos";

  useEffect(() => {
    const savedState = readSavedHomeState();
    const frame = window.requestAnimationFrame(() => {
      if (savedState) {
        setPage(savedState.page);
        restoredPageRef.current = savedState.page;
        setScrollToRestore(savedState.scrollY);
        if (savedState.anchorProfileId && savedState.anchorOffset !== null) {
          setAnchorToRestore({
            profileId: savedState.anchorProfileId,
            offset: savedState.anchorOffset,
          });
        }
      } else {
        setIsScrollRestored(true);
      }

      setHasRestoredState(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasRestoredState || !isScrollRestored) {
      return;
    }

    function saveCurrentState() {
      saveHomeState({
        page,
        scrollY: window.scrollY,
        anchorProfileId: navigationAnchorRef.current?.profileId ?? null,
        anchorOffset: navigationAnchorRef.current?.offset ?? null,
      });
    }

    saveCurrentState();
    window.addEventListener("scroll", saveCurrentState, { passive: true });

    return () => {
      window.removeEventListener("scroll", saveCurrentState);
      saveCurrentState();
    };
  }, [hasRestoredState, isScrollRestored, page]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!hasRestoredState || isApprovalPending || !canView) {
      return;
    }

    const controller = new AbortController();
    const pagesToLoad = Array.from(
      { length: Math.max(1, restoredPageRef.current) },
      (_, index) => index + 1,
    );
    restoredPageRef.current = 1;

    Promise.all(
      pagesToLoad.map((pageNumber) =>
        fetchActiveProfilePage(pageNumber, controller.signal),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) {
          return;
        }

        const validResults = results.filter(
          (result): result is PublicProfilePage => result !== null,
        );
        const lastResult = validResults.at(-1);

        if (!lastResult) {
          router.replace("/login");
          return;
        }

        setProfiles(
          deduplicateProfiles(validResults.flatMap((result) => result.items)),
        );
        setPage(Number(lastResult.page) || 1);
        setHasMore(Boolean(lastResult.hasMore));
        setError("");
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os perfis ativos.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    canView,
    hasRestoredState,
    isApprovalPending,
    isAuthLoading,
    router,
    user,
  ]);

  useEffect(() => {
    if (isLoading || isScrollRestored || scrollToRestore === null) {
      return;
    }

    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        restoreListPosition(scrollToRestore, anchorToRestore);
        setScrollToRestore(null);
        setAnchorToRestore(null);
        setIsScrollRestored(true);
      });

      navigationAnchorRef.current = null;
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [anchorToRestore, isLoading, isScrollRestored, scrollToRestore]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const result = await fetchActiveProfilePage(nextPage);

      if (!result) {
        router.replace("/login");
        return;
      }

      setProfiles((current) =>
        deduplicateProfiles([...current, ...result.items]),
      );
      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar mais perfis ativos.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, router]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;

    if (
      !sentinel ||
      !isScrollRestored ||
      isLoading ||
      isLoadingMore ||
      error ||
      !hasMore
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, isLoading, isLoadingMore, isScrollRestored, loadMore]);

  if (isAuthLoading || !user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--gold)_14%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--emerald)_12%,transparent),transparent_28%),url('/wallpaper-marble.webp')] bg-cover bg-center text-black-jewel md:bg-fixed">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <header className="mb-6 overflow-hidden rounded-lg border border-gold/35 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gold-soft)_30%,white),color-mix(in_srgb,var(--surface)_92%,white),color-mix(in_srgb,var(--emerald)_10%,white))] p-5 shadow-[0_22px_58px_rgba(20,17,14,0.12)] sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-white shadow-[0_12px_28px_rgba(185,138,56,0.25)]">
                <Activity className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
                  Comunidade ativa
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-black-jewel sm:text-4xl">
                  {targetLabel}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-black-jewel/68">
                  Até 20 perfis compatíveis que estiveram ativos nos últimos 7
                  dias. A ordem muda regularmente para todos ganharem
                  visibilidade.
                </p>
              </div>
            </div>
          </header>

          {!canView ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfis ativos indisponíveis"
              description="Esta área está disponível para perfis Sugar Baby e Sugar Daddy."
            />
          ) : isLoading ? (
            <StatePanel
              icon={Loader2}
              title="Carregando perfis ativos"
              description="Buscando as pessoas mais ativas para você."
              spin
            />
          ) : error && profiles?.length === 0 ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfis ativos indisponíveis"
              description={error}
            />
          ) : profiles?.length === 0 ? (
            <StatePanel
              icon={Sparkles}
              title="Novas pessoas em breve"
              description="Nenhum perfil compatível esteve ativo nos últimos 7 dias."
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onNavigate={() => {
                      navigationAnchorRef.current = getProfileAnchor(
                        profile.id,
                      );
                      saveHomeState({
                        page,
                        scrollY: window.scrollY,
                        anchorProfileId:
                          navigationAnchorRef.current?.profileId ?? null,
                        anchorOffset:
                          navigationAnchorRef.current?.offset ?? null,
                      });
                    }}
                  />
                ))}
              </div>

              {error ? (
                <p className="text-center text-sm font-bold text-ruby">
                  {error}
                </p>
              ) : null}

              <div
                ref={loadMoreSentinelRef}
                className="flex min-h-16 items-center justify-center"
                aria-live="polite"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-black-jewel/62">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald" />
                    Carregando mais perfis
                  </div>
                ) : error && hasMore ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadMore()}
                    className="rounded-full border-emerald/30 bg-white/82 font-extrabold text-emerald hover:bg-emerald hover:text-white"
                  >
                    Tentar carregar novamente
                  </Button>
                ) : !hasMore ? (
                  <p className="text-center text-sm font-bold text-black-jewel/48">
                    Todos os perfis ativos foram carregados.
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

async function fetchActiveProfilePage(
  page: number,
  signal?: AbortSignal,
): Promise<PublicProfilePage | null> {
  const response = await fetch(
    `/api/active-profiles?page=${page}&limit=${PAGE_SIZE}`,
    { signal },
  );
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      result?.message ?? "Não foi possível carregar os perfis ativos.",
    );
  }

  return result as PublicProfilePage;
}

function deduplicateProfiles(profiles: PublicProfile[]) {
  return Array.from(
    new Map(profiles.map((profile) => [profile.id, profile])).values(),
  );
}

function readSavedHomeState(): SavedHomeState | null {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(HOME_STATE_KEY) ?? "null",
    ) as Partial<SavedHomeState> | null;

    if (!parsed || !Number.isInteger(parsed.page) || Number(parsed.page) < 1) {
      return null;
    }

    return {
      page: Number(parsed.page),
      scrollY:
        typeof parsed.scrollY === "number" && parsed.scrollY >= 0
          ? parsed.scrollY
          : 0,
      anchorProfileId:
        typeof parsed.anchorProfileId === "string"
          ? parsed.anchorProfileId
          : null,
      anchorOffset:
        typeof parsed.anchorOffset === "number" ? parsed.anchorOffset : null,
    };
  } catch {
    return null;
  }
}

function saveHomeState(state: SavedHomeState) {
  try {
    window.sessionStorage.setItem(HOME_STATE_KEY, JSON.stringify(state));
  } catch {
    // The home list still works if session storage is unavailable.
  }
}

function getProfileAnchor(profileId: string) {
  const card = document.getElementById(`profile-card-${profileId}`);

  return card ? { profileId, offset: card.getBoundingClientRect().top } : null;
}

function restoreListPosition(
  scrollY: number,
  anchor: { profileId: string; offset: number } | null,
) {
  const card = anchor
    ? document.getElementById(`profile-card-${anchor.profileId}`)
    : null;

  if (card && anchor) {
    window.scrollTo({
      top: Math.max(
        0,
        window.scrollY + card.getBoundingClientRect().top - anchor.offset,
      ),
      behavior: "auto",
    });
    return;
  }

  window.scrollTo({ top: scrollY, behavior: "auto" });
}
