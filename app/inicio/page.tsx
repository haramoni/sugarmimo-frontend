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
import { PremiumLoadingScreen } from "../components/ui/PremiumLoadingScreen";
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
  const providerTargetLabel =
    user?.lookingFor?.trim().toLowerCase() === "women"
      ? "Sugar Mommies mais ativas"
      : user?.lookingFor?.trim().toLowerCase() === "men"
        ? "Sugar Daddies mais ativos"
        : "Sugar Daddies e Mommies mais ativos";
  const targetLabel =
    user?.role?.trim().toUpperCase() === "SUGAR_DADDY"
      ? "Sugar Babies mais ativas"
      : providerTargetLabel;

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

  if (isAuthLoading) {
    return <PremiumLoadingScreen label="Carregando os perfis em destaque..." />;
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  return (
    <ProfileApprovalGuard user={user}>
      <main className="relative min-h-screen overflow-hidden bg-luxury-black text-luxury-ivory">
        <Navbar />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_-12%,color-mix(in_srgb,var(--luxury-gold)_15%,transparent),transparent_36%),radial-gradient(circle_at_94%_38%,color-mix(in_srgb,var(--luxury-gold)_8%,transparent),transparent_25%),radial-gradient(circle_at_8%_78%,color-mix(in_srgb,var(--luxury-gold-deep)_7%,transparent),transparent_28%)]"
        />

        <section className="relative z-10 mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <header className="relative mb-7 overflow-hidden rounded-xl border border-luxury-gold/65 bg-[linear-gradient(135deg,var(--luxury-surface-raised)_0%,var(--luxury-night)_58%,var(--luxury-surface)_100%)] p-5 shadow-[0_0_24px_rgba(213,166,78,0.13),0_24px_64px_rgba(0,0,0,0.34)] sm:p-7">
            <div
              aria-hidden="true"
              className="absolute -right-8 top-0 h-full w-52 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--luxury-gold)_18%,transparent),transparent_62%)] opacity-60"
            />
            <Sparkles
              aria-hidden="true"
              className="absolute right-12 top-8 h-8 w-8 text-luxury-gold/20"
            />
            <div className="relative flex items-start gap-4 sm:gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-luxury-champagne/80 bg-[linear-gradient(145deg,var(--luxury-gold),var(--luxury-gold-deep))] text-luxury-ivory shadow-[0_0_24px_rgba(213,166,78,0.38)] sm:h-14 sm:w-14">
                <Activity className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-luxury-gold">
                  Comunidade ativa
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-luxury-champagne sm:text-4xl">
                  {targetLabel}
                </h1>
                <div className="mt-2 max-w-2xl text-sm font-medium leading-6 text-luxury-muted">
                  <p>
                    Até 20 perfis compatíveis que estiveram ativos nos últimos
                    7 dias.
                  </p>
                  <p>A ordem muda regularmente para todos ganharem visibilidade.</p>
                </div>
              </div>
            </div>
          </header>

          {!canView ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfis ativos indisponíveis"
              description="Esta área está disponível para perfis Sugar Baby e Sugar Daddy."
              variant="luxuryDark"
            />
          ) : isLoading ? (
            <StatePanel
              icon={Loader2}
              title="Carregando perfis ativos"
              description="Buscando as pessoas mais ativas para você."
              spin
              variant="luxuryDark"
            />
          ) : error && profiles?.length === 0 ? (
            <StatePanel
              icon={ShieldCheck}
              title="Perfis ativos indisponíveis"
              description={error}
              variant="luxuryDark"
            />
          ) : profiles?.length === 0 ? (
            <StatePanel
              icon={Sparkles}
              title="Novas pessoas em breve"
              description="Nenhum perfil compatível esteve ativo nos últimos 7 dias."
              variant="luxuryDark"
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {profiles.map((profile, index) => (
                  <div
                    key={profile.id}
                    className="w-full max-w-72 justify-self-center"
                  >
                    <ProfileCard
                      profile={profile}
                      variant="active"
                      eager={index < 5}
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
                  </div>
                ))}
              </div>

              {error ? (
                <p className="text-center text-sm font-bold text-[#ff9eae]">
                  {error}
                </p>
              ) : null}

              <div
                ref={loadMoreSentinelRef}
                className="flex min-h-16 items-center justify-center"
                aria-live="polite"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-luxury-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-luxury-gold" />
                    Carregando mais perfis
                  </div>
                ) : error && hasMore ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadMore()}
                    className="rounded-full border-luxury-gold/60 bg-luxury-surface font-extrabold text-luxury-champagne hover:bg-luxury-gold hover:text-luxury-ink"
                  >
                    Tentar carregar novamente
                  </Button>
                ) : !hasMore ? (
                  <p className="flex items-center gap-3 text-center text-sm font-medium text-luxury-muted">
                    <Sparkles
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-luxury-gold"
                    />
                    Todos os perfis ativos foram carregados.
                    <Sparkles
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-luxury-gold"
                    />
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
